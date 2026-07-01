# 🚀 Deployment Guide: GitHub Pages

Follow this guide to deploy your portfolio live at:
**`https://kabilanm1409.github.io/me/`**

---

## 🔹 Option 1: Drag & Drop (Easiest - No Commands Needed)

1. Open your web browser and go to: **[https://github.com/new](https://github.com/new)** (Log in if prompted).
2. Create a new repository:
   * **Repository name**: `me`
   * **Public/Private**: Select **Public**
   * **Initialize**: Leave all checkboxes (Readme, .gitignore, license) **unchecked**.
   * Click **Create repository**.
3. On the setup screen, click the link that says: **"uploading an existing file"** (near the top).
4. Drag and drop the following files and folders from `C:\Users\ELCOT\portfolio` into the browser box:
   * 📂 `assets/` (make sure all subfolders: `resume`, `my photo`, `projects`, `publications` are uploaded)
   * 📂 `pages/`
   * 📄 `index.html`
   * 📄 `script.js`
   * 📄 `style.css`
5. Click **Commit changes** (this will upload all files).
6. Go to **Settings** (tab at the top of your repository page) ➔ **Pages** (in the left sidebar).
7. Under **Build and deployment** ➔ **Branch**:
   * Change "None" to **`main`** (or `master`).
   * Click **Save**.
8. Wait 1-2 minutes. Refresh the settings page, and your live URL will appear at the top:
   👉 **`https://kabilanm1409.github.io/me/`**

---

## 🔹 Option 2: Using Git Terminal (Command Line)

If you have Git installed on your laptop's main command prompt, open your terminal inside the `C:\Users\ELCOT\portfolio` directory and run these commands:

```bash
# 1. Initialize git repository
git init

# 2. Add all portfolio files
git add .

# 3. Create initial commit
git commit -m "Deploy portfolio version 1.0"

# 4. Rename default branch to main
git branch -M main

# 5. Create the repository named 'me' on GitHub first, then run:
git remote add origin https://github.com/kabilanm1409/me.git

# 6. Push files to GitHub
git push -u origin main
```

### Enable GitHub Pages:
1. Go to your repository on GitHub: `https://github.com/kabilanm1409/me`
2. Go to **Settings** ➔ **Pages**.
3. Set source branch to **`main`** and click **Save**.
4. Your site will go live at: **`https://kabilanm1409.github.io/me/`**
