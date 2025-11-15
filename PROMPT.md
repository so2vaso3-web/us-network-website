# US Mobile Networks Website - Technical Documentation & Prompt

## Project Overview

**US Mobile Networks** is a Next.js 14 e-commerce website for selling mobile plan packages from major US carriers (Verizon, AT&T, T-Mobile, US Cellular, Mint Mobile, Cricket). The website includes a full admin panel for managing packages, orders, settings, and customer chat.

**Live URL:** `zenith5g.com`  
**Admin Panel:** `zenith5g.com/admin`  
**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Vercel KV/Redis

---

## Core Features

### 1. **Public Website (Customer-Facing)**
- **Homepage:** Hero section, featured packages, carrier comparison
- **Package Display:** Grid/list view of mobile plans with filtering by carrier
- **Package Comparison:** Side-by-side comparison modal for multiple packages
- **Payment Flow:** PayPal and cryptocurrency payment options
- **Chat Widget:** Real-time customer support chat with auto-reply
- **Contact Section:** Business information display

### 2. **Admin Panel** (`/admin`)
- **Dashboard:** Statistics, recent orders, visitor analytics
- **Package Management:** CRUD operations for mobile plan packages
- **Order Management:** View, filter, update order status, mark as read/unread
- **Chat Management:** View customer messages, send replies, mark as read/delete
- **Settings Management:** Configure PayPal, cryptocurrency, Telegram, contact info
- **Content Management:** Edit website content (hero, about, contact sections)

### 3. **Payment Integration**
- **PayPal:** Sandbox and Live modes, Smart Buttons integration
- **Cryptocurrency:** Bitcoin, Ethereum, USDT, BNB with QR code generation
- **Payment Verification:** Order status tracking, payment confirmation

### 4. **Data Persistence**
- **Primary Storage:** Vercel KV or Redis (via `REDIS_URL` environment variable)
- **Fallback:** localStorage for client-side caching
- **Encryption:** AES-256-GCM for sensitive fields (PayPal secrets, Telegram tokens)
- **Settings Priority:** localStorage (client) > server (Vercel KV/Redis)

---

## Technology Stack

### Frontend
- **Framework:** Next.js 14.2.33 (App Router)
- **UI Library:** React 18.2.0
- **Language:** TypeScript 5.3.3
- **Styling:** Tailwind CSS 3.4.0
- **Icons:** Font Awesome (via CDN)

### Backend/Storage
- **Database:** Vercel KV or Redis 5.9.0
- **Payment:** PayPal React SDK 8.1.3
- **QR Code:** qrcode 1.5.3

### Deployment
- **Platform:** Vercel
- **Environment:** Production, Preview, Development
- **Domain:** zenith5g.com

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── admin/secret/route.ts      # Admin-only endpoint for decrypted secrets
│   │   ├── chat/route.ts               # Chat messages CRUD (GET, POST)
│   │   ├── orders/route.ts             # Order management (GET, POST)
│   │   ├── packages/route.ts          # Package management (GET, POST)
│   │   ├── revalidate/route.ts        # Next.js on-demand revalidation
│   │   ├── settings/route.ts          # Settings CRUD (GET, POST) - sanitized
│   │   └── telegram/route.ts          # Telegram bot notifications
│   ├── admin/                          # Admin panel pages
│   ├── payment/                         # Payment success/cancel pages
│   ├── globals.css                     # Global styles, animations
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Homepage
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx          # Admin dashboard with stats
│   │   ├── AdminLogin.tsx              # Admin authentication
│   │   ├── ChatManagement.tsx          # Chat message management
│   │   ├── OrderManagement.tsx         # Order management
│   │   ├── PackageManagement.tsx       # Package CRUD
│   │   └── SettingsManagement.tsx      # Settings configuration
│   ├── ChatWidget.tsx                  # Customer chat widget
│   ├── CompareModal.tsx                # Package comparison modal
│   ├── ContactSection.tsx              # Contact information display
│   ├── Footer.tsx                      # Website footer
│   ├── Header.tsx                      # Website header/navigation
│   ├── Hero.tsx                        # Homepage hero section
│   ├── PaymentModal.tsx                # Payment flow (PayPal + Crypto)
│   ├── PlanCard.tsx                    # Individual package card
│   ├── PlansSection.tsx                # Packages grid/list display
│   └── Toast.tsx                       # Toast notification component
├── lib/
│   ├── data.ts                        # Default package data
│   ├── encryption.ts                  # AES-256-GCM encryption/decryption
│   ├── settings-merge.ts              # Settings merge logic with priority
│   ├── settings-storage.ts             # Vercel KV/Redis storage utilities
│   ├── storage.ts                      # Legacy storage adapter (deprecated)
│   ├── useOrders.ts                    # Order management hooks
│   └── useSettings.ts                  # Settings management hooks
└── types/
    └── index.ts                        # TypeScript interfaces
```

---

## Key Components & Features

### Settings Management
- **Storage:** Vercel KV (primary) or Redis (fallback)
- **Encryption:** Sensitive fields encrypted with `MASTER_KEY`:
  - `paypalClientSecret`
  - `telegramBotToken`
  - `apiKey`
- **Priority Logic:** localStorage (client) > server (Vercel KV/Redis)
- **Sanitization:** Server responses exclude sensitive fields (security)
- **Auto-save:** Debounced auto-save (1.5s) to prevent data loss
- **Merge Strategy:** Protects sensitive fields from being overwritten

### Chat System
- **Client-side:** ChatWidget component with localStorage persistence
- **Server-side:** `/api/chat` endpoint for persistent storage
- **Telegram Integration:** Auto-notifications to Telegram when customer sends message
- **Visitor ID:** Unique identifier per visitor (`visitor-{timestamp}-{random}`)
- **Auto-reply:** Welcome message and thank you message
- **Admin Replies:** Admin can reply from admin panel, customer receives in real-time

### Payment Flow
- **PayPal:**
  - Smart Buttons integration
  - Sandbox and Live modes
  - Client ID and Secret (encrypted)
  - Return/Cancel URLs
- **Cryptocurrency:**
  - Bitcoin, Ethereum, USDT, BNB
  - QR code generation for addresses
  - Network selection (Ethereum, BSC, Tron)
  - Manual verification

### Order Management
- **Status:** pending, completed, cancelled
- **Payment Methods:** PayPal, crypto
- **Customer Info:** Name, email, phone, notes
- **Verification:** Payment ID, transaction hash
- **Filtering:** By status, date, carrier
- **Pagination:** Configurable orders per page

### Package Management
- **Carriers:** Verizon, AT&T, T-Mobile, US Cellular, Mint Mobile, Cricket
- **Fields:** Name, price, data, speed, hotspot, features, badge
- **Pricing:** Monthly or yearly
- **Comparison:** Side-by-side feature comparison
- **Storage:** Vercel KV/Redis with fallback to `data.ts`

---

## Environment Variables

### Required
- `REDIS_URL` - Redis connection string (format: `redis://default:password@host:port`)
- `MASTER_KEY` - 32-byte key for AES-256-GCM encryption (hex or string)

### Optional
- `KV_REST_API_URL` - Vercel KV REST API URL
- `KV_REST_API_TOKEN` - Vercel KV REST API token
- `ADMIN_API_KEY` - API key for admin endpoints
- `REVALIDATE_SECRET` - Secret for on-demand revalidation
- `NEXT_PUBLIC_BASE_URL` - Base URL for revalidation

---

## API Endpoints

### Public
- `GET /api/packages` - Get all packages
- `GET /api/chat` - Get chat messages (filtered by visitorId)
- `POST /api/chat` - Create chat message
- `POST /api/orders` - Create order
- `POST /api/telegram` - Send Telegram notification

### Admin (Protected)
- `GET /api/settings` - Get settings (sanitized, no sensitive fields)
- `POST /api/settings` - Save settings (encrypted)
- `GET /api/admin/secret` - Get decrypted sensitive fields (admin only)
- `GET /api/orders` - Get all orders (admin)
- `POST /api/orders` - Update order status (admin)
- `GET /api/chat` - Get all chat messages (admin)
- `POST /api/chat` - Update chat (mark read, delete, reply)
- `POST /api/packages` - Save packages (admin)
- `POST /api/revalidate` - Trigger Next.js revalidation

---

## Security Features

1. **Encryption:** AES-256-GCM for sensitive data
2. **Sanitization:** Server responses exclude secrets
3. **Authentication:** Basic admin check (session cookie, API key, origin check)
4. **Rate Limiting:** In-memory rate limiting (10 requests/minute)
5. **Protected Fields:** Cannot be overwritten by empty values

---

## Data Flow

### Settings Save Flow
1. User inputs settings in admin panel
2. Settings saved to localStorage immediately
3. Auto-save debounced (1.5s) → POST to `/api/settings`
4. Server merges: localStorage (highest) > client payload > server settings
5. Encrypt sensitive fields
6. Save to Vercel KV/Redis
7. Return sanitized response (no sensitive fields)

### Settings Load Flow
1. Component mounts → `useSettings()` hook
2. Fetch from `/api/settings` (sanitized)
3. Load from localStorage (has sensitive fields)
4. Merge: localStorage (priority) > server settings
5. Display merged settings

### Chat Message Flow
1. Customer sends message → ChatWidget
2. Save to localStorage
3. POST to `/api/chat` → Save to Vercel KV/Redis
4. POST to `/api/telegram` → Send notification to Telegram
5. Admin receives in Telegram and admin panel
6. Admin replies → Updates in Vercel KV/Redis
7. Customer receives via polling (2s interval)

---

## Important Notes

### Settings Persistence
- **Critical:** Sensitive fields (`paypalClientSecret`, `telegramBotToken`) are NEVER returned by server (sanitized)
- **Solution:** Always prioritize localStorage when merging settings
- **Storage:** Settings saved to Vercel KV/Redis for persistence across devices
- **Fallback:** localStorage used if server unavailable

### Redis Connection
- **Format:** Must start with `redis://` or `rediss://`
- **Auto-fix:** Code automatically adds `redis://` prefix if missing
- **Error Handling:** Clear error messages for connection/auth failures

### Payment Integration
- **PayPal:** Requires Client ID and Secret (encrypted)
- **Crypto:** Requires wallet addresses for each cryptocurrency
- **Verification:** Manual verification for crypto payments

### Telegram Integration
- **Bot Token:** Get from @BotFather on Telegram
- **Chat ID:** Get from @userinfobot or group settings
- **Notifications:** Sent when customer sends message or admin replies

---

## Development Commands

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

---

## Deployment

- **Platform:** Vercel
- **Auto-deploy:** On push to main branch
- **Environment Variables:** Set in Vercel dashboard
- **Redis:** Connect via Vercel Marketplace or external Redis service
- **Domain:** Configured in Vercel project settings

---

## Common Issues & Solutions

### Settings Disappearing
- **Cause:** Server overwrites localStorage with sanitized settings
- **Fix:** Code now prioritizes localStorage for sensitive fields

### Redis Connection Failed
- **Cause:** Invalid REDIS_URL format or wrong credentials
- **Fix:** Check REDIS_URL starts with `redis://` and has correct password

### Telegram Not Working
- **Cause:** API not reading from Vercel KV/Redis correctly
- **Fix:** Updated to use `readSettingsFromKV()` instead of old storage utility

### PayPal Not Showing
- **Cause:** PaymentModal reading from server (no sensitive fields)
- **Fix:** PaymentModal now prioritizes localStorage for PayPal settings

---

## Future Improvements

- [ ] Implement proper authentication (JWT, sessions)
- [ ] Add email notifications for orders
- [ ] Implement payment webhooks for automatic verification
- [ ] Add analytics tracking
- [ ] Implement multi-language support (i18n)
- [ ] Add unit tests
- [ ] Improve error handling and logging
- [ ] Add rate limiting with Redis
- [ ] Implement proper session management

---

## Contact & Support

- **Website:** zenith5g.com
- **Admin Panel:** zenith5g.com/admin
- **Repository:** Private GitHub repository

---

*Last Updated: 2025-01-15*

