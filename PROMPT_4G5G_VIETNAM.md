# Trang Web Bán Gói 4G/5G Việt Nam - Technical Prompt

## 📋 Tổng Quan Dự Án

**Trang Web Bán Gói 4G/5G Việt Nam** là một website thương mại điện tử Next.js 14 để bán các gói cước 4G/5G từ các nhà mạng Việt Nam (Viettel, Vinaphone, Mobifone, Vietnamobile, Gmobile). Website bao gồm admin panel đầy đủ để quản lý gói cước, đơn hàng, cài đặt và chat khách hàng.

**Tech Stack:** Next.js 14, React 18, TypeScript, Tailwind CSS, Vercel KV/Redis

---

## 🎯 Tính Năng Chính

### 1. **Website Công Khai (Dành Cho Khách Hàng)**
- **Trang Chủ:** Hero section, gói cước nổi bật, so sánh nhà mạng
- **Hiển Thị Gói Cước:** Grid/list view các gói cước với lọc theo nhà mạng
- **So Sánh Gói Cước:** Modal so sánh side-by-side nhiều gói
- **Thanh Toán:** PayPal, VNPay, Momo, ZaloPay, USDT (cryptocurrency)
- **Chat Widget:** Chat hỗ trợ khách hàng real-time với auto-reply
- **Liên Hệ:** Thông tin doanh nghiệp, địa chỉ, hotline

### 2. **Admin Panel** (`/admin`)
- **Dashboard:** Thống kê, đơn hàng gần đây, phân tích visitor
- **Quản Lý Gói Cước:** CRUD operations cho các gói cước
- **Quản Lý Đơn Hàng:** Xem, lọc, cập nhật trạng thái đơn hàng, đánh dấu đã đọc/chưa đọc
- **Quản Lý Chat:** Xem tin nhắn khách hàng, trả lời, đánh dấu đã đọc/xóa
- **Quản Lý Cài Đặt:** Cấu hình PayPal, VNPay, Momo, ZaloPay, USDT, Telegram, thông tin liên hệ
- **Quản Lý Nội Dung:** Chỉnh sửa nội dung website (hero, giới thiệu, liên hệ)

### 3. **Tích Hợp Thanh Toán**
- **PayPal:** Sandbox và Live modes, Smart Buttons integration
- **VNPay:** Tích hợp VNPay gateway (phổ biến ở Việt Nam)
- **Momo:** Tích hợp ví điện tử Momo
- **ZaloPay:** Tích hợp ví điện tử ZaloPay
- **Cryptocurrency:** Bitcoin, Ethereum, USDT, BNB với QR code generation
- **Xác Minh Thanh Toán:** Theo dõi trạng thái đơn hàng, xác nhận thanh toán

### 4. **Lưu Trữ Dữ Liệu**
- **Lưu Trữ Chính:** Vercel KV hoặc Redis (qua biến môi trường `REDIS_URL`)
- **Fallback:** localStorage cho client-side caching
- **Mã Hóa:** AES-256-GCM cho các trường nhạy cảm (PayPal secrets, Telegram tokens, API keys)
- **Ưu Tiên Settings:** localStorage (client) > server (Vercel KV/Redis)

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** Next.js 14.2+ (App Router)
- **UI Library:** React 18.2.0
- **Language:** TypeScript 5.3+
- **Styling:** Tailwind CSS 3.4+
- **Icons:** Font Awesome (via CDN) hoặc Lucide React

### Backend/Storage
- **Database:** Vercel KV hoặc Redis 5.9+
- **Payment:** 
  - PayPal React SDK 8.1+
  - VNPay SDK (npm package hoặc custom integration)
  - Momo API
  - ZaloPay API
- **QR Code:** qrcode 1.5+

### Deployment
- **Platform:** Vercel
- **Environment:** Production, Preview, Development
- **Domain:** Tùy chỉnh (ví dụ: `4g5gvietnam.com`)

---

## 📁 Cấu Trúc Dự Án

```
src/
├── app/
│   ├── api/
│   │   ├── admin/secret/route.ts      # Endpoint admin-only cho decrypted secrets
│   │   ├── chat/route.ts               # Chat messages CRUD (GET, POST)
│   │   ├── orders/route.ts             # Quản lý đơn hàng (GET, POST)
│   │   ├── packages/route.ts          # Quản lý gói cước (GET, POST)
│   │   ├── revalidate/route.ts        # Next.js on-demand revalidation
│   │   ├── settings/route.ts          # Settings CRUD (GET, POST) - sanitized
│   │   ├── telegram/route.ts          # Telegram bot notifications
│   │   ├── vnpay/route.ts             # VNPay payment callback
│   │   ├── momo/route.ts               # Momo payment callback
│   │   └── zalopay/route.ts            # ZaloPay payment callback
│   ├── admin/                          # Admin panel pages
│   ├── payment/                         # Payment success/cancel pages
│   ├── globals.css                     # Global styles, animations
│   ├── layout.tsx                      # Root layout
│   └── page.tsx                        # Homepage
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx          # Admin dashboard với stats
│   │   ├── AdminLogin.tsx              # Admin authentication
│   │   ├── ChatManagement.tsx          # Quản lý tin nhắn chat
│   │   ├── OrderManagement.tsx         # Quản lý đơn hàng
│   │   ├── PackageManagement.tsx       # Package CRUD
│   │   └── SettingsManagement.tsx      # Cấu hình settings
│   ├── ChatWidget.tsx                  # Chat widget khách hàng
│   ├── CompareModal.tsx                # Modal so sánh gói cước
│   ├── ContactSection.tsx              # Hiển thị thông tin liên hệ
│   ├── Footer.tsx                      # Footer website
│   ├── Header.tsx                      # Header/navigation
│   ├── Hero.tsx                        # Hero section trang chủ
│   ├── PaymentModal.tsx                # Payment flow (PayPal + VNPay + Momo + ZaloPay + Crypto)
│   ├── PlanCard.tsx                    # Card gói cước đơn lẻ
│   ├── PlansSection.tsx                # Grid/list hiển thị gói cước
│   └── Toast.tsx                       # Toast notification component
├── lib/
│   ├── data.ts                        # Dữ liệu gói cước mặc định (nhà mạng VN)
│   ├── encryption.ts                  # AES-256-GCM encryption/decryption
│   ├── settings-merge.ts              # Logic merge settings với priority
│   ├── settings-storage.ts             # Vercel KV/Redis storage utilities
│   ├── useOrders.ts                   # Order management hooks
│   ├── useSettings.ts                 # Settings management hooks
│   ├── vnpay.ts                       # VNPay integration utilities
│   ├── momo.ts                        # Momo integration utilities
│   └── zalopay.ts                     # ZaloPay integration utilities
└── types/
    └── index.ts                        # TypeScript interfaces
```

---

## 📦 Dữ Liệu Gói Cước (Nhà Mạng Việt Nam)

### Các Nhà Mạng
1. **Viettel** - Nhà mạng lớn nhất Việt Nam
2. **Vinaphone** - Nhà mạng của VNPT
3. **Mobifone** - Nhà mạng của VNPT
4. **Vietnamobile** - Nhà mạng tư nhân
5. **Gmobile** - Nhà mạng tư nhân

### Cấu Trúc Gói Cước
```typescript
interface Package {
  id: string;
  name: string;                    // Tên gói (ví dụ: "Viettel 4G 30GB")
  carrier: 'Viettel' | 'Vinaphone' | 'Mobifone' | 'Vietnamobile' | 'Gmobile';
  price: number;                    // Giá (VND)
  originalPrice?: number;           // Giá gốc (nếu có khuyến mãi)
  data: string;                     // Dung lượng data (ví dụ: "30GB", "Unlimited")
  speed: string;                    // Tốc độ (ví dụ: "4G", "5G", "Cao tốc")
  validity: string;                 // Thời hạn (ví dụ: "30 ngày", "90 ngày")
  callMinutes?: string;            // Phút gọi (ví dụ: "100 phút", "Unlimited")
  sms?: string;                     // SMS (ví dụ: "100 SMS", "Unlimited")
  hotspot?: boolean;                // Có hỗ trợ phát wifi không
  features: string[];               // Tính năng đặc biệt
  badge?: string;                   // Badge (ví dụ: "Hot", "Mới", "Khuyến mãi")
  description?: string;             // Mô tả chi tiết
  image?: string;                   // Hình ảnh gói cước
}
```

### Ví Dụ Dữ Liệu Mặc Định
```typescript
const defaultPackages: Package[] = [
  {
    id: 'viettel-4g-30gb',
    name: 'Viettel 4G 30GB',
    carrier: 'Viettel',
    price: 150000,
    originalPrice: 200000,
    data: '30GB',
    speed: '4G',
    validity: '30 ngày',
    callMinutes: '100 phút',
    sms: '100 SMS',
    hotspot: true,
    features: ['4G tốc độ cao', 'Phát wifi', 'Không giới hạn tốc độ'],
    badge: 'Hot',
    description: 'Gói cước 4G tốc độ cao với 30GB data, phù hợp cho người dùng thường xuyên'
  },
  // ... thêm các gói khác
];
```

---

## 💳 Tích Hợp Thanh Toán

### 1. PayPal
- **SDK:** `@paypal/react-paypal-js`
- **Modes:** Sandbox và Live
- **Cấu hình:** Client ID và Secret (encrypted)
- **Return URLs:** `/payment/success` và `/payment/cancel`

### 2. VNPay
- **API:** VNPay Payment Gateway
- **Cấu hình cần:**
  - `VNPAY_TMN_CODE` - Mã website
  - `VNPAY_HASH_SECRET` - Secret key (encrypted)
  - `VNPAY_URL` - Payment URL
- **Callback:** `/api/vnpay/callback`
- **Return URLs:** `/payment/success` và `/payment/cancel`

### 3. Momo
- **API:** Momo Payment Gateway
- **Cấu hình cần:**
  - `MOMO_PARTNER_CODE` - Partner code
  - `MOMO_ACCESS_KEY` - Access key (encrypted)
  - `MOMO_SECRET_KEY` - Secret key (encrypted)
- **Callback:** `/api/momo/callback`
- **Return URLs:** `/payment/success` và `/payment/cancel`

### 4. ZaloPay
- **API:** ZaloPay Payment Gateway
- **Cấu hình cần:**
  - `ZALOPAY_APP_ID` - App ID
  - `ZALOPAY_KEY1` - Key 1 (encrypted)
  - `ZALOPAY_KEY2` - Key 2 (encrypted)
- **Callback:** `/api/zalopay/callback`
- **Return URLs:** `/payment/success` và `/payment/cancel`

### 5. Cryptocurrency (USDT, BTC, ETH, BNB)
- **QR Code:** Generate QR code cho wallet addresses
- **Networks:** Ethereum, BSC, Tron
- **Verification:** Manual verification
- **Cấu hình:** Wallet addresses cho mỗi cryptocurrency

---

## 🔐 Bảo Mật

### Encryption
- **Algorithm:** AES-256-GCM
- **Key:** `MASTER_KEY` environment variable (32 bytes)
- **Encrypted Fields:**
  - `paypalClientSecret`
  - `vnpayHashSecret`
  - `momoAccessKey`, `momoSecretKey`
  - `zalopayKey1`, `zalopayKey2`
  - `telegramBotToken`
  - `apiKey`

### Sanitization
- Server responses **KHÔNG BAO GIỜ** trả về sensitive fields
- Chỉ admin endpoint `/api/admin/secret` mới trả về decrypted secrets
- Settings merge logic bảo vệ sensitive fields khỏi bị overwrite

### Authentication
- Basic admin check (session cookie, API key, origin check)
- Rate limiting: 10 requests/minute (in-memory)
- Protected fields không thể bị overwrite bởi empty values

---

## 📊 Quản Lý Đơn Hàng

### Trạng Thái Đơn Hàng
- `pending` - Chờ thanh toán
- `processing` - Đang xử lý
- `completed` - Hoàn thành
- `cancelled` - Đã hủy

### Thông Tin Đơn Hàng
```typescript
interface Order {
  id: string;
  packageId: string;
  packageName: string;
  carrier: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;
  paymentMethod: 'paypal' | 'vnpay' | 'momo' | 'zalopay' | 'crypto';
  paymentId?: string;
  transactionHash?: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
}
```

### Tính Năng
- Lọc theo trạng thái, ngày, nhà mạng
- Tìm kiếm theo tên, email, số điện thoại
- Phân trang
- Đánh dấu đã đọc/chưa đọc
- Cập nhật trạng thái
- Export danh sách đơn hàng

---

## 💬 Hệ Thống Chat

### Tính Năng
- **Chat Widget:** Floating chat widget ở góc phải màn hình
- **Auto-reply:** Tin nhắn chào mừng và cảm ơn tự động
- **Visitor ID:** Unique identifier cho mỗi visitor
- **Real-time:** Polling mỗi 2 giây để nhận tin nhắn mới
- **Telegram Integration:** Tự động gửi thông báo đến Telegram khi khách hàng gửi tin nhắn
- **Admin Replies:** Admin có thể trả lời từ admin panel

### Cấu Trúc Tin Nhắn
```typescript
interface ChatMessage {
  id: string;
  visitorId: string;
  message: string;
  sender: 'customer' | 'admin';
  isRead: boolean;
  createdAt: string;
  adminReply?: string;
}
```

---

## 🔔 Telegram Bot Integration

### Cấu Hình
- **Bot Token:** Lấy từ @BotFather trên Telegram (encrypted)
- **Chat ID:** Lấy từ @userinfobot hoặc group settings
- **Notifications:** Gửi khi:
  - Khách hàng gửi tin nhắn chat
  - Admin trả lời tin nhắn
  - Có đơn hàng mới
  - Đơn hàng thay đổi trạng thái

### API Endpoint
- `POST /api/telegram` - Gửi thông báo đến Telegram

---

## 🌐 Environment Variables

### Bắt Buộc
```env
# Redis/Vercel KV
REDIS_URL=redis://default:password@host:port
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...

# Master Key cho encryption
MASTER_KEY=your-32-byte-hex-key

# Base URL
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### Tùy Chọn
```env
# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=... (encrypted)

# VNPay
VNPAY_TMN_CODE=...
VNPAY_HASH_SECRET=... (encrypted)
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# Momo
MOMO_PARTNER_CODE=...
MOMO_ACCESS_KEY=... (encrypted)
MOMO_SECRET_KEY=... (encrypted)
MOMO_ENDPOINT=https://test-payment.momo.vn/v2/gateway/api/create

# ZaloPay
ZALOPAY_APP_ID=...
ZALOPAY_KEY1=... (encrypted)
ZALOPAY_KEY2=... (encrypted)
ZALOPAY_ENDPOINT=https://sandbox.zalopay.com.vn/v001/tpe/createorder

# Telegram
TELEGRAM_BOT_TOKEN=... (encrypted)
TELEGRAM_CHAT_ID=...

# Admin
ADMIN_API_KEY=...
REVALIDATE_SECRET=...
```

---

## 📡 API Endpoints

### Public
- `GET /api/packages` - Lấy tất cả gói cước
- `GET /api/chat` - Lấy tin nhắn chat (filtered by visitorId)
- `POST /api/chat` - Tạo tin nhắn chat
- `POST /api/orders` - Tạo đơn hàng
- `POST /api/telegram` - Gửi thông báo Telegram

### Payment Callbacks
- `POST /api/vnpay/callback` - VNPay payment callback
- `POST /api/momo/callback` - Momo payment callback
- `POST /api/zalopay/callback` - ZaloPay payment callback

### Admin (Protected)
- `GET /api/settings` - Lấy settings (sanitized, không có sensitive fields)
- `POST /api/settings` - Lưu settings (encrypted)
- `GET /api/admin/secret` - Lấy decrypted sensitive fields (admin only)
- `GET /api/orders` - Lấy tất cả đơn hàng (admin)
- `POST /api/orders` - Cập nhật trạng thái đơn hàng (admin)
- `GET /api/chat` - Lấy tất cả tin nhắn chat (admin)
- `POST /api/chat` - Cập nhật chat (đánh dấu đã đọc, xóa, trả lời)
- `POST /api/packages` - Lưu gói cước (admin)
- `POST /api/revalidate` - Trigger Next.js revalidation

---

## 🎨 UI/UX Requirements

### Design
- **Theme:** Modern, clean, professional
- **Colors:** 
  - Primary: Màu xanh dương hoặc đỏ (tùy brand)
  - Secondary: Màu xám nhạt
  - Accent: Màu vàng/cam cho CTA buttons
- **Typography:** Font chữ dễ đọc, hỗ trợ tiếng Việt
- **Responsive:** Mobile-first, hỗ trợ tất cả thiết bị

### Components
- **Hero Section:** Banner lớn với CTA button
- **Package Cards:** Card đẹp với hình ảnh, giá, tính năng
- **Comparison Modal:** So sánh side-by-side dễ đọc
- **Payment Modal:** Tabs cho các phương thức thanh toán
- **Chat Widget:** Floating widget, không che nội dung
- **Admin Panel:** Dashboard với charts, tables, forms

### Animations
- Smooth transitions
- Loading states
- Toast notifications
- Hover effects

---

## 📝 Yêu Cầu Bổ Sung Cho Thị Trường Việt Nam

### 1. Ngôn Ngữ
- **Chính:** Tiếng Việt (100%)
- **Tùy chọn:** Tiếng Anh (có thể thêm sau)

### 2. Đơn Vị Tiền Tệ
- **VND (Việt Nam Đồng)**
- Format: `150.000 ₫` hoặc `150,000 VND`

### 3. Thông Tin Liên Hệ
- **Hotline:** Số điện thoại Việt Nam (ví dụ: 1900xxxx)
- **Địa chỉ:** Địa chỉ tại Việt Nam
- **Email:** Email hỗ trợ
- **Zalo:** Link Zalo (phổ biến ở VN)
- **Facebook:** Link Facebook page

### 4. Phương Thức Thanh Toán Ưu Tiên
- **VNPay** (phổ biến nhất)
- **Momo** (ví điện tử phổ biến)
- **ZaloPay** (ví điện tử phổ biến)
- **PayPal** (cho khách quốc tế)
- **Cryptocurrency** (USDT, BTC)

### 5. SEO & Marketing
- **Meta tags:** Tối ưu cho Google Vietnam
- **Social sharing:** Facebook, Zalo
- **Analytics:** Google Analytics, Facebook Pixel
- **Structured data:** Schema.org markup

### 6. Legal Compliance
- **Privacy Policy:** Chính sách bảo mật
- **Terms of Service:** Điều khoản sử dụng
- **Refund Policy:** Chính sách hoàn tiền
- **Contact Info:** Thông tin doanh nghiệp đầy đủ

---

## 🚀 Development Commands

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

# Generate Master Key
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## 📦 Dependencies Cần Thiết

```json
{
  "dependencies": {
    "@paypal/react-paypal-js": "^8.1.3",
    "@vercel/kv": "^3.0.0",
    "@vercel/speed-insights": "^1.2.0",
    "next": "^14.0.4",
    "qrcode": "^1.5.3",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "redis": "^5.9.0",
    "crypto-js": "^4.2.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/qrcode": "^1.5.5",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "@types/crypto-js": "^4.2.2",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.57.0",
    "eslint-config-next": "^14.2.33",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.3.3"
  }
}
```

---

## ✅ Checklist Phát Triển

### Phase 1: Setup & Core
- [ ] Initialize Next.js 14 project với TypeScript
- [ ] Setup Tailwind CSS
- [ ] Setup Vercel KV/Redis
- [ ] Implement encryption utilities
- [ ] Create base types và interfaces
- [ ] Setup project structure

### Phase 2: Public Website
- [ ] Homepage với Hero section
- [ ] Package display (grid/list view)
- [ ] Package comparison modal
- [ ] Contact section
- [ ] Footer với thông tin liên hệ
- [ ] Responsive design

### Phase 3: Payment Integration
- [ ] PayPal integration
- [ ] VNPay integration
- [ ] Momo integration
- [ ] ZaloPay integration
- [ ] Cryptocurrency (USDT, BTC, ETH, BNB)
- [ ] Payment success/cancel pages

### Phase 4: Admin Panel
- [ ] Admin login
- [ ] Admin dashboard với stats
- [ ] Package management (CRUD)
- [ ] Order management
- [ ] Chat management
- [ ] Settings management

### Phase 5: Chat System
- [ ] Chat widget component
- [ ] Chat API endpoints
- [ ] Real-time messaging
- [ ] Auto-reply
- [ ] Telegram integration

### Phase 6: Polish & Deploy
- [ ] SEO optimization
- [ ] Performance optimization
- [ ] Error handling
- [ ] Testing
- [ ] Deploy to Vercel
- [ ] Setup domain & SSL

---

## 🎯 Lưu Ý Quan Trọng

1. **Settings Persistence:**
   - Sensitive fields KHÔNG BAO GIỜ được trả về từ server (sanitized)
   - Luôn ưu tiên localStorage khi merge settings
   - Settings được lưu vào Vercel KV/Redis để persist across devices

2. **Redis Connection:**
   - Format phải bắt đầu với `redis://` hoặc `rediss://`
   - Code tự động thêm prefix nếu thiếu
   - Error handling rõ ràng cho connection/auth failures

3. **Payment Integration:**
   - Mỗi payment gateway cần callback endpoint riêng
   - Verify payment signatures để tránh fraud
   - Log tất cả payment transactions

4. **Telegram Integration:**
   - Bot token lấy từ @BotFather
   - Chat ID lấy từ @userinfobot hoặc group settings
   - Notifications gửi khi có event quan trọng

5. **Vietnamese Market:**
   - Ưu tiên VNPay, Momo, ZaloPay
   - Hỗ trợ hotline, Zalo, Facebook
   - Format tiền VND đúng chuẩn
   - SEO tối ưu cho Google Vietnam

---

## 📚 Tài Liệu Tham Khảo

- **VNPay:** https://sandbox.vnpayment.vn/apis/
- **Momo:** https://developers.momo.vn/
- **ZaloPay:** https://developers.zalopay.vn/
- **PayPal:** https://developer.paypal.com/
- **Next.js:** https://nextjs.org/docs
- **Vercel KV:** https://vercel.com/docs/storage/vercel-kv
- **Telegram Bot API:** https://core.telegram.org/bots/api

---

**Chúc bạn phát triển thành công! 🚀**

*Prompt này được tạo để xây dựng trang web bán gói 4G/5G Việt Nam với đầy đủ tính năng và phù hợp với thị trường Việt Nam.*



















