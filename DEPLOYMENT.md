# Zero-Cost Free-Tier Deployment Guide

This guide details how to deploy the **NOC Approval & Quotation Management System** entirely on free-tier services without server management or custom domain requirements.

---

## ☁️ 1. Free-Tier Architecture & Limits

| Service | Tier | Limits | Purpose |
| :--- | :--- | :--- | :--- |
| **Cloudflare Pages** | Free | Unlimited bandwidth, 500 builds/month, free `*.pages.dev` domain | Frontend Hosting & CDN |
| **Supabase** | Free | 500 MB database, 1 GB private file storage, 50,000 monthly active users | PostgreSQL DB, Auth, Storage |
| **GitHub** | Free | Unlimited public/private repositories, GitHub Actions | Source control & auto-deploy |

> ⚠️ **Free-Tier Inactivity Notice (Supabase):** Free-tier Supabase projects may pause if there are 7 consecutive days of zero database activity. To prevent this, active NOC staff usage or a periodic health query keeps the database awake.

---

## 🛠️ 2. Step-by-Step Supabase Cloud Setup

1. Go to [https://supabase.com](https://supabase.com) and create a free account.
2. Click **New Project**, choose a region close to your users (e.g. *Central India (Mumbai) / ap-south-1*), and set a secure database password.
3. Once the database is provisioned:
   - Navigate to **SQL Editor**.
   - Copy and execute the contents of `supabase/migrations/20261004000001_noc_schema.sql`.
   - Copy and execute `supabase/migrations/20261004000002_noc_seed_data.sql`.
   - Copy and execute `supabase/migrations/20261004000003_storage_buckets.sql`.
4. Go to **Project Settings -> API** and copy:
   - `Project URL` (e.g., `https://xyzcompany.supabase.co`)
   - `anon public key` (e.g., `eyJhbGciOi...`)
5. In **Authentication -> URL Configuration**:
   - Add your Cloudflare Pages domain (e.g., `https://noc-management.pages.dev`) to **Redirect URLs**.

---

## 🚀 3. Step-by-Step Cloudflare Pages Deployment

1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of NOC system"
   git remote add origin https://github.com/your-username/noc-system.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) -> **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**.
3. Select your repository `noc-system`.
4. Configure Build Settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js version:** `20` or `22` (Set environment variable `NODE_VERSION=22`)
5. Add Environment Variables:
   - `VITE_SUPABASE_URL` = `https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `your-anon-key`
6. Click **Save and Deploy**. Cloudflare Pages will build the app and give you a free production URL (e.g. `https://noc-system.pages.dev`).

---

## 💾 4. Database Backup & Export Procedure

- In Supabase Dashboard, go to **Database -> Backups** for automated daily backups.
- To export a portable SQL dump locally:
  ```bash
  supabase db dump --project-ref your-project-ref -f backup_$(date +%F).sql
  ```
- Alternatively, use the **Reports & Import/Export** page within the application to export all requests, approvals, and agency records as standard CSV files anytime.
