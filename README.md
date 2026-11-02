# ☕ U Sousedů – Loyalty PWA & Coffee Shop Management System

A production-grade Progressive Web Application (PWA) powered by **Supabase** for the neighbourhood family coffee shop **„U Sousedů“**. It seamlessly combines a customer loyalty rewards card, a barista QR code camera scanner, and a full-featured coffee shop administration dashboard within a single responsive repository.

The application follows a strict **Mobile-First** architectural design while adapting gracefully to tablets and widescreen desktop displays (`max-w-6xl mx-auto`).

---

## 📱 Application Modules & Routing

| Module | Route | Access Role | Description |
| :--- | :--- | :--- | :--- |
| **Unified Login** | `/login` | Public | Single sign-in portal with automated role-based routing. |
| **Customer Home** | `/app/home` | `customer` | Loyalty card status (10 coffees cycle), upcoming events, and branch locations. |
| **Menu Catalog** | `/app/menu` | `customer` | Full coffee & food menu with dotted guide lines and prices in CZK. |
| **Digital QR Card** | `/app/card` | `customer` | High-contrast QR code and unique card number for order scanning. |
| **Account Profile** | `/app/account` | `customer` | Profile management, password change, account deletion, and logout. |
| **About & Settings** | `/app/more` | `customer` | Coffee shop story, notification preferences, GDPR toggles, and language selector. |
| **Barista Scanner** | `/scanner` | `staff`, `admin` | Real-time camera QR reader + tap-to-simulate scan button for instant testing. |
| **Admin Dashboard**| `/admin/dashboard`| `admin` | Coffee shop metrics, quick navigation cards (Menu, Events, Staff, Announcements).|
| **Menu Editor** | `/admin/menu` | `admin` | Real-time category and menu item manager with instant price updates. |

---

## 👥 User Roles & Permissions

The system operates with 3 distinct access levels enforced by PostgreSQL Row Level Security (RLS):

1. **`customer` (Customer):** Default role upon standard registration. Earns stamps for coffee purchases (every 10th coffee is free).
2. **`staff` (Barista / Employee):** Authorized to access the cashier scanner (`/scanner`). Scans customer QR codes and credits points via a secure PostgreSQL RPC function.
3. **`admin` (Manager / Owner):** Full access to the administration dashboard (`/admin/dashboard` and `/admin/menu`). Can edit menu items, prices, cafe events, and manage team members.

---

## 🔑 How to Create Staff (`staff`) and Admin (`admin`) Accounts

For security reasons, any standard self-registration in the app automatically assigns the `customer` role. Elevating an account to an employee or administrator must be performed by a database administrator in Supabase.

### Method 1: Via Supabase Dashboard UI (Recommended)

1. Log in to your project at **[supabase.com](https://supabase.com)**.
2. In the left navigation menu, go to **Authentication → Users**.
3. Click **Add user → Create user**:
   - Enter the email address (e.g., `barista@usousedu.cz` or `admin@usousedu.cz`).
   - Enter a secure password.
   - Check **Auto Confirm User?** (bypasses email confirmation requirement).
   - Click **Create user**.  
   *(Note: The user can also simply register themselves first via the `/login` page in the app).*
4. In the left sidebar, navigate to **Table Editor → `profiles` table**.
5. Locate the row corresponding to the user's email address and double-click the cell in the **`role`** column.
6. Change the value:
   - For Baristas: enter **`staff`**
   - For Administrators: enter **`admin`**
7. Save the change. When this user logs in at `/login`, the system will automatically redirect them to their dedicated interface (`/scanner` for staff or `/admin/dashboard` for admins).

---

### Method 2: Via Supabase SQL Editor

Open the **SQL Editor** in your Supabase project dashboard, paste the relevant query, and click **Run**:

#### Promote an existing user to Administrator (`admin`):
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@yourcoffeeshop.cz';
```

#### Promote an existing user to Barista (`staff`):
```sql
UPDATE public.profiles
SET role = 'staff'
WHERE email = 'barista@yourcoffeeshop.cz';
```

#### View all registered users and their assigned roles:
```sql
SELECT email, full_name, role, card_number, coffee_count 
FROM public.profiles 
ORDER BY created_at DESC;
```

---

## 🌍 Multi-Language Support (i18n)

The application features full internationalization with **automatic phone system language detection**:

- 🇨🇿 **Czech (`cs`)** – Default for Czech and Slovak systems (`cs`, `sk`).
- 🇬🇧 **English (`en`)** – International default for all foreign systems.
- 🇰🇷 **South Korean (`ko` / 한국어)** – Native Korean translation designed for international tourists.

### How language switching works:
1. **Automatic Detection:** The app detects the device system language (`navigator.languages`) on initial load and listens to real-time system changes (`languagechange` event).
2. **One-Tap Header Pill:** Toggle quickly between `CZ | EN | KO` via the language button in the header bar or on the login screen.
3. **Settings Card:** In the *More* section (`/app/more`), users can select a permanent language preference or revert to automatic system detection.

---

## 📲 Mobile App Installation (PWA)

The app is built as a Progressive Web App with custom branding, dark theme styling, offline support, and WebAPK integration.

### Android:
1. Open the website in **Google Chrome**.
2. Tap the **„Install“** button in the top navigation bar, or open the Chrome menu by tapping the **three dots (⋮) → „Install app“** (or „Add to Home screen“).
3. The app is installed onto your home screen with its own coffee bean icon, running in full-screen standalone mode without any browser URL bars.

> **Troubleshooting tip for Android:** If your phone reports that the app is already installed, open *Android Settings → Apps → U Sousedů* and uninstall any legacy versions or previous web shortcuts.

### iPhone (iOS Safari):
1. Open the site in the native **Safari** browser (Apple restricts home screen PWA installation to Safari).
2. Tap the **Share** icon at the bottom of the screen (square with an upward arrow).
3. Scroll down, select **„Add to Home Screen“**, and confirm by tapping **„Add“** in the top-right corner.

---

## 🛠️ Technology Stack

- **Frontend Framework:** React 19 (TypeScript), Vite 7
- **Styling:** Tailwind CSS v4 (Mobile-First responsive breakpoints)
- **Icons:** Lucide React (`lucide-react`)
- **PWA Integration:** `vite-plugin-pwa` (Service Worker, Web App Manifest, auto-update)
- **QR Code Engine:** `qrcode.react` (card generation), `html5-qrcode` (camera reader)
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Auth, RPC functions, Realtime)

---

## 🚀 Local Development & Setup

### Prerequisites
- Node.js 20.19.0 or newer
- npm 10 or newer

### Installation Steps:
```bash
# 1. Clone the repository
git clone https://github.com/endurovojta173/Coffe_shop.git
cd Coffe_shop

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env and supply your Supabase URL and Anon Key

# 4. Start the local development server
npm run dev
```

### Build & Verification Commands:
```bash
# Run strict TypeScript compiler verification
npm run typecheck

# Production build (creates optimized bundle in /dist)
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 GitHub Pages Deployment

The repository is configured for automated deployment via **GitHub Actions** (`.github/workflows/deploy.yml`):
- Pushing to the `main` branch automatically triggers the build workflow and deploys the output to the `gh-pages` branch.
- For production authentication to work properly, configure the following secrets in your repository settings (*Settings → Secrets and variables → Actions*):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
