/**
 * portfolio-cms.js — Dynamic Client-Side Content Synchronizer
 * Fetches portfolio content from Firebase Realtime Database (/portfolioData)
 * and dynamically updates DOM elements while preserving static HTML fallback.
 */

import { db, ref, onValue, firestore, doc, onSnapshot } from "./firebase-config.js";

(function initPortfolioCMS() {
  'use strict';

  // Helper to safely set text content
  function setText(el, text) {
    if (el && text !== undefined && text !== null) el.textContent = text;
  }

  // Helper to safely set attribute
  function setAttr(el, attr, val) {
    if (el && val) el.setAttribute(attr, val);
  }

  // ── Sync Hero Section ──
  function syncHero(hero) {
    if (!hero) return;
    const heroCopy = document.querySelector('.hero-copy');
    if (heroCopy) {
      if (hero.eyebrow) setText(heroCopy.querySelector('.eyebrow'), hero.eyebrow);
      if (hero.name) setText(heroCopy.querySelector('h1'), hero.name);
      if (hero.subtitle) setText(heroCopy.querySelector('.hero-subtitle'), hero.subtitle);
    }

    if (hero.resumeUrl) {
      setAttr(document.getElementById('downloadResumeBtn'), 'href', hero.resumeUrl);
      setAttr(document.getElementById('viewResumeBtn'), 'href', hero.resumeUrl);
    }

    if (hero.socials) {
      if (hero.socials.github) setAttr(document.getElementById('heroGithubLink'), 'href', hero.socials.github);
      if (hero.socials.linkedin) setAttr(document.getElementById('heroLinkedinLink'), 'href', hero.socials.linkedin);
      if (hero.socials.email) setAttr(document.getElementById('heroEmailLink'), 'href', `mailto:${hero.socials.email}`);
    }

    if (hero.stats) {
      const cgpaEl = document.getElementById('stat-cgpa');
      if (cgpaEl && hero.stats.cgpa) {
        cgpaEl.textContent = hero.stats.cgpa;
        cgpaEl.closest('.stat-pill')?.setAttribute('data-counter', hero.stats.cgpa);
      }
      const projEl = document.getElementById('stat-projects');
      if (projEl && hero.stats.projects) {
        projEl.textContent = `${hero.stats.projects}+`;
        projEl.closest('.stat-pill')?.setAttribute('data-counter', hero.stats.projects);
      }
      const achEl = document.getElementById('stat-achievements');
      if (achEl && hero.stats.achievements) {
        achEl.textContent = `${hero.stats.achievements}+`;
        achEl.closest('.stat-pill')?.setAttribute('data-counter', hero.stats.achievements);
      }
    }

    // Profile card on hero
    const profileCard = document.querySelector('.hero-panel .profile-card');
    if (profileCard) {
      if (hero.profilePhoto) setAttr(profileCard.querySelector('.profile-photo'), 'src', hero.profilePhoto);
      if (hero.profileTitle) setText(profileCard.querySelector('h2'), hero.profileTitle);
      if (hero.profileBio) setText(profileCard.querySelector('p:not(.card-label)'), hero.profileBio);
    }
  }

  // ── Sync About Section ──
  function syncAbout(about) {
    if (!about) return;
    const cards = document.querySelectorAll('#about .overview-card');
    if (cards.length >= 4) {
      if (about.whoIAm) setText(cards[0].querySelector('p'), about.whoIAm);
      if (about.careerObjective) setText(cards[1].querySelector('p'), about.careerObjective);
      if (about.workStyle) setText(cards[2].querySelector('p'), about.workStyle);

      if (about.internship) {
        const internP = cards[3].querySelector('p');
        if (internP) {
          const certHtml = about.internship.certUrl
            ? ` <a class="cert-link" href="${about.internship.certUrl}" target="_blank" rel="noopener noreferrer" style="color: var(--primary); font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; margin-top: 4px;"><i class="fa-solid fa-image"></i> View Certificate</a>`
            : '';
          internP.innerHTML = `${about.internship.desc || ''}${certHtml}`;
        }
      }
    }
  }

  // ── Sync Skills Section ──
  function syncSkills(skillsCategories) {
    if (!Array.isArray(skillsCategories) || skillsCategories.length === 0) return;
    const skillsGrid = document.querySelector('#skills .skills-grid');
    if (!skillsGrid) return;

    let html = '';
    skillsCategories.forEach(cat => {
      const tagsHtml = (cat.tags || []).map(tag => {
        const icon = tag.icon ? `<i class="${tag.icon}" aria-hidden="true"></i> ` : '';
        return `<span>${icon}${tag.name || tag}</span>`;
      }).join('\n');

      html += `
        <article class="skill-list card">
          <h3>${cat.category || cat.title || 'Skills'}</h3>
          <div class="tag-row">
            ${tagsHtml}
          </div>
        </article>
      `;
    });
    skillsGrid.innerHTML = html;
  }

  // ── Sync Projects Section ──
  function syncProjects(projectsList) {
    if (!Array.isArray(projectsList) || projectsList.length === 0) return;
    const projectGrid = document.querySelector('#projects .project-grid');
    if (!projectGrid) return;

    let html = '';
    projectsList.forEach((proj, idx) => {
      // Image or SVG / Carousel
      let imageContent = '';
      if (Array.isArray(proj.images) && proj.images.length > 1) {
        const imgTags = proj.images.map((img, i) => `
          <img class="carousel-img ${i === 0 ? 'active' : ''} fit-contain" alt="${proj.title} screenshot" loading="lazy" src="${img}" />
        `).join('');
        const dots = proj.images.map((_, i) => `<span class="carousel-dot ${i === 0 ? 'active' : ''}" data-slide="${i}"></span>`).join('');
        imageContent = `
          <div class="project-carousel" id="carousel_${idx}">
            <div class="carousel-track">${imgTags}</div>
            <button class="carousel-control prev" type="button" aria-label="Previous slide"><i class="fa-solid fa-chevron-left"></i></button>
            <button class="carousel-control next" type="button" aria-label="Next slide"><i class="fa-solid fa-chevron-right"></i></button>
            <div class="carousel-indicators">${dots}</div>
          </div>
        `;
      } else {
        const imgSrc = (Array.isArray(proj.images) ? proj.images[0] : proj.image) || 'assets/my photo/kabilan m.png';
        imageContent = `<img alt="${proj.title} screenshot" loading="lazy" src="${imgSrc}" />`;
      }

      const bulletsHtml = (proj.bullets || []).map(b => `<li>${b}</li>`).join('');

      html += `
        <article class="project-card card" data-category="${proj.category || 'all'}">
          <div class="project-image-wrap">
            ${imageContent}
          </div>
          <div class="project-content">
            <h3>${proj.title || 'Project'}</h3>
            <p>${proj.description || ''}</p>
            <div class="project-meta"><span>Technologies: ${proj.technologies || ''}</span></div>
            <ul>${bulletsHtml}</ul>
            <div class="project-actions">
              ${proj.detailsUrl ? `<a class="btn btn-secondary" href="${proj.detailsUrl}"><i class="fa-solid fa-arrow-up-right-from-square"></i> View Details</a>` : ''}
              ${proj.liveUrl ? `<a class="btn btn-secondary" href="${proj.liveUrl}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-globe"></i> Live Demo</a>` : ''}
              <a class="btn btn-primary" href="#" data-target="contact"><i class="fa-solid fa-paper-plane"></i> Ask About It</a>
            </div>
          </div>
        </article>
      `;
    });

    projectGrid.innerHTML = html;
  }

  // ── Sync Education Section ──
  function syncEducation(eduList) {
    if (!Array.isArray(eduList) || eduList.length === 0) return;
    const timeline = document.querySelector('#education .timeline');
    if (!timeline) return;

    let html = '';
    eduList.forEach(item => {
      html += `
        <article class="timeline-item card">
          <span class="timeline-dot" aria-hidden="true"></span>
          <div>
            <p class="timeline-year">${item.year || ''}</p>
            <h3>${item.degree || ''}</h3>
            <p class="timeline-institution">${item.institution || ''}</p>
            <p>${item.description || ''}</p>
          </div>
        </article>
      `;
    });
    timeline.innerHTML = html;
  }

  // ── Sync Achievements & Publications ──
  function syncAchievements(data) {
    if (!data) return;
    const grid = document.querySelector('#achievements .achievement-grid');
    if (grid && Array.isArray(data.achievements) && data.achievements.length > 0) {
      let html = '';
      data.achievements.forEach(ach => {
        const certLink = ach.certUrl
          ? `<a class="cert-link" href="${ach.certUrl}" target="_blank" rel="noopener noreferrer" style="margin-top: 8px; font-size: 0.85rem; color: var(--primary); display: inline-flex; align-items: center; gap: 6px; font-weight: 600;"><i class="fa-solid fa-image"></i> View Certificate</a>`
          : '';
        html += `
          <article class="achievement-card card" role="listitem">
            <i class="${ach.icon || 'fa-solid fa-trophy'}" aria-hidden="true"></i>
            <h3>${ach.title || ''}</h3>
            <p>${ach.subtitle || ''}</p>
            ${certLink}
          </article>
        `;
      });
      grid.innerHTML = html;
    }

    const pubGrid = document.querySelector('#achievements .publications-grid');
    if (pubGrid && Array.isArray(data.publications) && data.publications.length > 0) {
      let html = '';
      data.publications.forEach(pub => {
        html += `
          <article class="publication-card card">
            <div class="publication-tag">
              <i class="fa-solid fa-file-pdf"></i>
              <span>${pub.tag || 'Publication'}</span>
            </div>
            <h4>${pub.title || ''}</h4>
            <p>${pub.description || ''}</p>
            ${pub.pdfUrl ? `<a class="btn btn-secondary" href="${pub.pdfUrl}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square"></i> Read Publication</a>` : ''}
          </article>
        `;
      });
      pubGrid.innerHTML = html;
    }
  }

  // ── Sync Contact Section ──
  function syncContact(contact) {
    if (!contact) return;
    if (contact.email) {
      const emailEl = document.getElementById('contactEmail');
      if (emailEl) {
        emailEl.href = `mailto:${contact.email}`;
        emailEl.innerHTML = `<i class="fa-solid fa-envelope"></i> ${contact.email}`;
      }
    }
    if (contact.phone) {
      const phoneEl = document.getElementById('contactPhone');
      if (phoneEl) {
        phoneEl.href = `tel:${contact.phone.replace(/\s+/g, '')}`;
        phoneEl.innerHTML = `<i class="fa-solid fa-phone"></i> ${contact.phone}`;
      }
    }
    if (contact.linkedin) {
      const linkEl = document.getElementById('contactLinkedin');
      if (linkEl) linkEl.href = contact.linkedin;
    }
    if (contact.github) {
      const gitEl = document.getElementById('contactGithub');
      if (gitEl) gitEl.href = contact.github;
    }
  }

  function applyPortfolioData(data) {
    if (!data) return;
    if (data.hero) syncHero(data.hero);
    if (data.about) syncAbout(data.about);
    if (data.skills) syncSkills(data.skills);
    if (data.projects) syncProjects(data.projects);
    if (data.education) syncEducation(data.education);
    if (data.achievements || data.publications) syncAchievements(data);
    if (data.contact) syncContact(data.contact);
  }

  // Expose applyPortfolioData globally for terminal live synchronization
  if (typeof window !== 'undefined') {
    window.__applyPortfolioData = applyPortfolioData;
  }

  // 0. Check local overrides saved from terminal (km_custom_portfolio_data)
  try {
    const localData = localStorage.getItem('km_custom_portfolio_data');
    if (localData) {
      applyPortfolioData(JSON.parse(localData));
    }
  } catch (e) {}

  // 1. Listen to Realtime Database /portfolioData
  try {
    const portfolioRef = ref(db, "portfolioData");
    onValue(portfolioRef, (snapshot) => {
      if (!snapshot.exists()) return;
      applyPortfolioData(snapshot.val());
    }, () => {});
  } catch (e) {
    console.warn('[CMS RTDB] Sync skipped or offline:', e.message);
  }

  // 2. Dual-listen to Cloud Firestore portfolioData/content document
  try {
    if (firestore && doc && onSnapshot) {
      const contentDocRef = doc(firestore, "portfolioData", "content");
      onSnapshot(contentDocRef, (docSnap) => {
        if (!docSnap.exists()) return;
        applyPortfolioData(docSnap.data());
      }, () => {});
    }
  } catch (e) {
    console.warn('[CMS Firestore] Sync skipped or offline:', e.message);
  }
})();
