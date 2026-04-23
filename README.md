# JCB & Spalon — Complaint Management System
## Complete Setup Guide

---

## 📁 Files in This Package

| File | Purpose |
|---|---|
| `index.html` | Main dashboard (host on GitHub Pages) |
| `Code.gs` | Google Apps Script backend (paste into Apps Script) |
| `README.md` | This setup guide |

---

## ⚙️ Step 1 — Set Up Google Apps Script

1. Open your Google Sheet:
   👉 https://docs.google.com/spreadsheets/d/1pfcrNp3sRkpYk1KggbM5n9AXYBtdUtbfUjvMpCM57Fo

2. Click **Extensions → Apps Script**

3. Delete all existing code in the editor

4. **Paste the entire contents of `Code.gs`** into the editor

5. Click **Save** (Ctrl+S or ⌘+S)

6. Click **Deploy → New Deployment**

7. Settings:
   - Type: **Web App**
   - Description: `Complaint Manager v1`
   - Execute as: **Me**
   - Who has access: **Anyone** *(for intranet — change to "Anyone in your domain" for Google Workspace)*

8. Click **Deploy**

9. **Copy the Web App URL** — looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

---

## 🔗 Step 2 — Add the API URL to index.html

Open `index.html` and find line ~580:

```javascript
const API_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
```

Replace it with your actual URL:

```javascript
const API_URL = 'https://script.google.com/macros/s/YOUR_ID/exec';
```

Save the file.

---

## 🐙 Step 3 — Push to GitHub Pages

### First time setup:

```bash
# 1. Create a new GitHub repository (e.g., jcb-spalon-complaints)
# 2. Go to the repo on GitHub → Settings → Pages
# 3. Source: Deploy from branch → main → / (root) → Save

# Then push files:
git init
git add .
git commit -m "Initial commit — JCB Spalon Complaint Manager"
git remote add origin https://github.com/YOUR_USERNAME/jcb-spalon-complaints.git
git push -u origin main
```

### Your live URL will be:
```
https://YOUR_USERNAME.github.io/jcb-spalon-complaints/
```

### For updates:
```bash
git add .
git commit -m "Update dashboard"
git push
```

---

## 📤 Step 4 — Upload Existing Data

1. Open the dashboard → click **Bulk Upload** in the sidebar
2. Click **Download CSV Template** to get the correct format
3. Fill in your existing complaint data in the CSV
4. Drag & drop or browse to upload the CSV
5. Map columns if needed
6. Click **Upload All Rows**

### CSV Format:
```
date,brand,salon,manager,client,subject,category,summary,status,remarks
2025-01-15,JCB,Aundh,Puneeth,Client Name,CEO Mail,Haircut,Complaint details,Resolved,Action taken
```

---

## 👥 Google Sheet Columns (Auto-Created)

The script creates these columns in the **Data** sheet automatically:

| Column | Field |
|---|---|
| A | ID (auto-generated: C-0001, C-0002…) |
| B | Date |
| C | Brand |
| D | Salon Name |
| E | Area Manager |
| F | Client Name |
| G | Mail Subject |
| H | Category |
| I | Complaint Summary |
| J | Status |
| K | Remarks (all follow-up history) |
| L | Last Updated |
| M | Submitted By |

An **AdminConfig** sheet is also created to store dropdown values.

---

## 🔐 Access Control

### For Google Workspace (Recommended for intranet):
In Apps Script deploy settings, set:
- **Who has access: Anyone in your domain**

This ensures only your company's Google accounts can access the API.

### For open intranet:
- **Who has access: Anyone**

---

## 🔄 Re-deploying After Code Changes

When you update `Code.gs`:
1. Apps Script → Deploy → **Manage Deployments**
2. Click the pencil (edit) icon
3. Change version to **New Version**
4. Click **Deploy**

> ⚠️ The URL stays the same — no need to update `index.html`

---

## 🛠️ Troubleshooting

| Problem | Solution |
|---|---|
| "Using demo data" toast shows | API_URL not set in index.html |
| CORS error in browser console | Re-deploy Apps Script as new version |
| Data not saving | Check Apps Script execution logs (View → Executions) |
| 403 Forbidden | Re-deploy with correct access setting |
| Columns missing in sheet | Click any Submit — headers auto-create |

---

## 📱 Sharing the Dashboard

Share the GitHub Pages URL with your team:
```
https://YOUR_USERNAME.github.io/jcb-spalon-complaints/
```

Everyone with a company Google account can:
- ✅ Submit new complaints
- ✅ View all complaints
- ✅ Add follow-up remarks
- ✅ Update status
- ✅ Export to CSV

---

## 💡 Tips

- **Bookmark** the URL on all manager devices
- **Star** the GitHub repo to get update notifications
- All data is visible directly in **Google Sheets** too
- Use the **Admin Panel** to add new branches/managers — no code changes needed
- The **Remarks** column stores all follow-up history with timestamps

---

*JCB & Spalon Complaint Manager — Built with Google Apps Script + GitHub Pages*
