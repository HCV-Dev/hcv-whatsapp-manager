# HCV WhatsApp Manager

Static web app for managing the Meta WhatsApp Cloud API. Calls the Graph API directly from the browser -- no backend server needed. Can be deployed to GitHub Pages, Netlify, or any static host.

## Features

- **Dashboard** -- Account overview with WABA info and phone number summary
- **Business Profile** -- View and edit profile (about, description, address, email, websites, photo)
- **Phone Numbers** -- Table of registered numbers with quality ratings and verification status
- **Templates** -- List, create, and delete message templates with live WhatsApp-style preview
- **Send Message** -- Send text, template, image, or document messages to individual recipients
- **Settings** -- Enter and manage your Meta API credentials (stored in browser localStorage)

## How credentials work

Your access token, phone number ID, and WABA ID are stored in your browser's `localStorage`. They are sent directly to `graph.facebook.com` from your browser and never pass through any intermediate server. Use this on a trusted device only.

On first visit you'll be redirected to the Settings page to enter your credentials.

## Prerequisites

- A Meta WhatsApp Business Account
- A system user access token with `whatsapp_business_messaging` and `whatsapp_business_management` permissions
- Your Phone Number ID and WABA ID (from WhatsApp Manager or the Meta Business Suite)

## Development

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5174, go to Settings, and enter your credentials.

## Build & Deploy

```bash
cd frontend
npm run build
```

The `dist/` folder is a fully static site. Deploy it anywhere:

**GitHub Pages:**
```bash
npm run build
npx gh-pages -d dist
```

**Serve locally:**
```bash
npx serve dist
```

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   ├── client.js              # Meta Graph API client + localStorage settings
│   │   └── endpoints.js           # Endpoint functions
│   ├── hooks/
│   │   └── useApi.js              # Generic data-fetching hook
│   ├── components/
│   │   ├── Layout.jsx             # Sidebar + main content shell
│   │   ├── Sidebar.jsx            # Navigation
│   │   ├── StatusBadge.jsx        # Color-coded status pills
│   │   ├── ConfirmModal.jsx       # Delete confirmation dialog
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorCard.jsx
│   │   └── template/
│   │       ├── TemplateForm.jsx   # Template creation form
│   │       └── TemplatePreview.jsx# Live WhatsApp-style chat bubble preview
│   └── pages/
│       ├── DashboardPage.jsx
│       ├── ProfilePage.jsx
│       ├── PhoneNumbersPage.jsx
│       ├── TemplatesPage.jsx
│       ├── MessagesPage.jsx
│       └── SettingsPage.jsx
├── vite.config.js
├── index.html
└── package.json
```
