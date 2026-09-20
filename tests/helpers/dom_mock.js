/**
 * tests/helpers/dom_mock.js
 * Lightweight DOM & CSS inspection utilities and simulated browser environment.
 * Zero external dependencies.
 */

const fs = require('node:fs');
const path = require('node:path');

// ── HTML Inspection Utilities ──────────────────────────────────────────

function parseAttributes(attrString) {
  const attrs = {};
  if (!attrString) return attrs;

  const regex = /([a-zA-Z0-9_-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
  let match;
  while ((match = regex.exec(attrString)) !== null) {
    const key = match[1];
    const val = match[2] !== undefined ? match[2] : (match[3] !== undefined ? match[3] : (match[4] !== undefined ? match[4] : true));
    attrs[key] = val;
  }
  return attrs;
}

function findTags(html, tagName) {
  const results = [];
  const regex = new RegExp(`<(${tagName})(\\s+[^>]*)?>(.*?)<\\/\\1>`, 'gis');
  let match;
  while ((match = regex.exec(html)) !== null) {
    results.push({
      raw: match[0],
      tag: match[1],
      attrString: match[2] || '',
      attributes: parseAttributes(match[2] || ''),
      innerHtml: match[3],
    });
  }

  // Self-closing / void elements (e.g. img, input)
  const voidRegex = new RegExp(`<(${tagName})(\\s+[^>]*)?\\/?>`, 'gi');
  while ((match = voidRegex.exec(html)) !== null) {
    // Avoid double counting if already captured
    if (!results.some(r => r.raw === match[0])) {
      results.push({
        raw: match[0],
        tag: match[1],
        attrString: match[2] || '',
        attributes: parseAttributes(match[2] || ''),
        innerHtml: '',
      });
    }
  }
  return results;
}

function findTagById(html, id) {
  const idRegex = new RegExp(`<([a-zA-Z0-9]+)(\\s+[^>]*?id=["']${id}["'][^>]*?)>(?:(.*?)(?:<\\/\\1>))?`, 'is');
  const match = idRegex.exec(html);
  if (!match) return null;
  return {
    raw: match[0],
    tag: match[1],
    attrString: match[2] || '',
    attributes: parseAttributes(match[2] || ''),
    innerHtml: match[3] || '',
  };
}

function findTagsWithClass(html, className) {
  const results = [];
  const regex = new RegExp(`<([a-zA-Z0-9]+)(\\s+[^>]*?class=["'][^"']*?\\b${className}\\b[^"']*?["'][^>]*?)>(.*?)<\\/\\1>`, 'gis');
  let match;
  while ((match = regex.exec(html)) !== null) {
    results.push({
      raw: match[0],
      tag: match[1],
      attrString: match[2] || '',
      attributes: parseAttributes(match[2] || ''),
      innerHtml: match[3],
    });
  }
  return results;
}

// ── CSS Inspection Utilities ──────────────────────────────────────────

function extractCssBlock(cssContent, selectorPattern) {
  const regex = new RegExp(`${selectorPattern}\\s*\\{([^}]+)\\}`, 'gi');
  const blocks = [];
  let match;
  while ((match = regex.exec(cssContent)) !== null) {
    blocks.push(match[1]);
  }
  return blocks.join('\n');
}

function getCssVariableValue(cssContent, selectorPattern, varName) {
  const block = extractCssBlock(cssContent, selectorPattern);
  if (!block) return null;
  const varRegex = new RegExp(`${varName}\\s*:\\s*([^;]+);`, 'i');
  const match = varRegex.exec(block);
  return match ? match[1].trim() : null;
}

function hasKeyframeAnimation(cssContent, animationName) {
  const regex = new RegExp(`@keyframes\\s+${animationName}\\s*\\{`, 'i');
  return regex.test(cssContent);
}

function hasMediaQuery(cssContent, mediaCondition) {
  const cleanCond = mediaCondition.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`@media[^{]*?${cleanCond}[^{]*?\\{`, 'i');
  return regex.test(cssContent);
}

// ── Mock Browser Environment ──────────────────────────────────────────

class MockLocalStorage {
  constructor() {
    this.store = new Map();
  }
  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  setItem(key, val) {
    this.store.set(String(key), String(val));
  }
  removeItem(key) {
    this.store.delete(key);
  }
  clear() {
    this.store.clear();
  }
}

class MockElement {
  constructor(tag, id = '', className = '') {
    this.tagName = tag.toUpperCase();
    this.id = id;
    this.className = className;
    this.attributes = new Map();
    this.style = {};
    this.children = [];
    this.parentNode = null;
    this.textContent = '';
    this.innerHTML = '';
    this.hidden = false;
    this.listeners = new Map();

    const self = this;
    const internalDataset = {};
    this.dataset = new Proxy(internalDataset, {
      set(target, prop, val) {
        target[prop] = String(val);
        const attr = 'data-' + String(prop).replace(/([A-Z])/g, '-$1').toLowerCase();
        self.attributes.set(attr, String(val));
        return true;
      },
      deleteProperty(target, prop) {
        delete target[prop];
        const attr = 'data-' + String(prop).replace(/([A-Z])/g, '-$1').toLowerCase();
        self.attributes.delete(attr);
        return true;
      },
      get(target, prop) {
        return target[prop];
      }
    });

    if (id) this.attributes.set('id', id);
    if (className) this.attributes.set('class', className);

    this.classList = {
      contains(cls) {
        return self.className.split(/\s+/).filter(Boolean).includes(cls);
      },
      add(cls) {
        const classes = self.className.split(/\s+/).filter(Boolean);
        if (!classes.includes(cls)) {
          classes.push(cls);
          self.className = classes.join(' ');
          self.attributes.set('class', self.className);
        }
      },
      remove(cls) {
        const classes = self.className.split(/\s+/).filter(Boolean).filter(c => c !== cls);
        self.className = classes.join(' ');
        self.attributes.set('class', self.className);
      },
      toggle(cls, force) {
        const has = this.contains(cls);
        const shouldAdd = force !== undefined ? force : !has;
        if (shouldAdd) this.add(cls);
        else this.remove(cls);
        return shouldAdd;
      },
    };
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  setAttribute(name, val) {
    this.attributes.set(name, String(val));
    if (name === 'class') this.className = String(val);
    if (name === 'id') this.id = String(val);
    if (name.startsWith('data-')) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      this.dataset[key] = String(val);
    }
  }

  removeAttribute(name) {
    this.attributes.delete(name);
    if (name.startsWith('data-')) {
      const key = name.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      delete this.dataset[key];
    }
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  addEventListener(event, handler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(handler);
  }

  dispatchEvent(event) {
    const handlers = this.listeners.get(event.type) || [];
    for (const h of handlers) {
      h(event);
    }
  }

  querySelector(sel) {
    if (sel.startsWith('#')) {
      const targetId = sel.slice(1);
      if (this.id === targetId) return this;
      for (const ch of this.children) {
        const res = ch.querySelector(sel);
        if (res) return res;
      }
    }
    if (sel.startsWith('.')) {
      const targetCls = sel.slice(1);
      if (this.classList.contains(targetCls)) return this;
      for (const ch of this.children) {
        const res = ch.querySelector(sel);
        if (res) return res;
      }
    }
    if (sel.startsWith('[') && sel.endsWith(']')) {
      const inner = sel.slice(1, -1);
      const eqIdx = inner.indexOf('=');
      let attrName = inner;
      let targetVal = null;
      if (eqIdx !== -1) {
        attrName = inner.slice(0, eqIdx).trim();
        targetVal = inner.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      }
      if (this.attributes.has(attrName)) {
        if (targetVal === null || this.attributes.get(attrName) === targetVal) {
          return this;
        }
      }
      for (const ch of this.children) {
        const res = ch.querySelector(sel);
        if (res) return res;
      }
    }
    for (const ch of this.children) {
      if (ch.tagName.toLowerCase() === sel.toLowerCase()) return ch;
      const res = ch.querySelector(sel);
      if (res) return res;
    }
    return null;
  }

  querySelectorAll(sel) {
    const matched = [];
    const walk = (el) => {
      if (sel.startsWith('.')) {
        if (el.classList.contains(sel.slice(1))) matched.push(el);
      } else if (sel.startsWith('#')) {
        if (el.id === sel.slice(1)) matched.push(el);
      } else if (sel.startsWith('[') && sel.endsWith(']')) {
        const inner = sel.slice(1, -1);
        const eqIdx = inner.indexOf('=');
        let attrName = inner;
        let targetVal = null;
        if (eqIdx !== -1) {
          attrName = inner.slice(0, eqIdx).trim();
          targetVal = inner.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        }
        if (el.attributes.has(attrName)) {
          if (targetVal === null || el.attributes.get(attrName) === targetVal) {
            matched.push(el);
          }
        }
      } else if (el.tagName.toLowerCase() === sel.toLowerCase()) {
        matched.push(el);
      }
      for (const ch of el.children) {
        walk(ch);
      }
    };
    for (const ch of this.children) {
      walk(ch);
    }
    return matched;
  }
}

function createBrowserEnvironment() {
  const localStorage = new MockLocalStorage();
  const sessionStorage = new MockLocalStorage();

  const body = new MockElement('body');
  const html = new MockElement('html');
  html.appendChild(body);

  const document = {
    body,
    documentElement: html,
    createElement: (tag) => new MockElement(tag),
    getElementById: (id) => body.querySelector(`#${id}`),
    querySelector: (sel) => body.querySelector(sel),
    querySelectorAll: (sel) => body.querySelectorAll(sel),
    addEventListener: (event, handler) => body.addEventListener(event, handler),
    dispatchEvent: (event) => body.dispatchEvent(event),
  };

  const window = {
    document,
    localStorage,
    sessionStorage,
    location: {
      pathname: '/',
      hash: '',
      href: 'http://localhost/',
    },
    history: {
      pushState: () => {},
      replaceState: () => {},
    },
    scrollTo: () => {},
    addEventListener: () => {},
  };

  return { window, document, localStorage, sessionStorage };
}

module.exports = {
  findTags,
  findTagById,
  findTagsWithClass,
  extractCssBlock,
  getCssVariableValue,
  hasKeyframeAnimation,
  hasMediaQuery,
  createBrowserEnvironment,
  MockElement,
};
