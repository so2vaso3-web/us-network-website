# ✅ VERCEL DEPLOYMENT CHECKLIST

## 📦 Files & Assets
- [x] **Logo**: Embedded as base64 SVG in `layout.tsx` (không cần file riêng)
- [x] **Images**: Font Awesome icons từ CDN (không cần file local)
- [x] **QR Code Library**: Từ CDN (qrcode.min.js)
- [x] **All Source Code**: Đã commit đầy đủ

## 🔧 Configuration Files
- [x] `package.json` - Dependencies đầy đủ
- [x] `next.config.js` - Cấu hình đúng
- [x] `tsconfig.json` - TypeScript config
- [x] `tailwind.config.ts` - Tailwind config
- [x] `.npmrc` - npm config để suppress warnings
- [x] `.gitignore` - Đã ignore đúng files

## 💰 Payment Settings (CẦN SETUP LẠI SAU KHI DEPLOY)

### ⚠️ QUAN TRỌNG: Settings trong localStorage sẽ MẤT sau khi deploy!

Bạn cần setup lại các settings sau khi deploy:

### 1. PayPal Settings
- Vào `/admin` → Settings
- Nhập PayPal Client ID
- Nhập PayPal Client Secret
- Chọn Mode (Sandbox/Live)
- Lưu settings

### 2. Cryptocurrency Wallet Addresses
- Vào `/admin` → Settings → Cài Đặt Tiền Điện Tử
- Nhập địa chỉ ví cho từng crypto:
  - **BTC**: Bitcoin address (bắt đầu bằng `bc1`, `1`, hoặc `3`)
  - **ETH**: Ethereum address (bắt đầu bằng `0x`)
    - Network: ETH - Ethereum (ERC20) hoặc BSC - Binance Smart Chain (BEP20)
  - **USDT**: Tron address (bắt đầu bằng `T`)
    - Network: TRX - Tron (TRC20)
  - **BNB**: BSC address (bắt đầu bằng `0x`)
    - Network: BSC - BNB Smart Chain (BEP20)

### 3. Admin Credentials
- Username mặc định: `admin`
- Password mặc định: `admin123`
- **⚠️ ĐỔI NGAY** sau lần đăng nhập đầu tiên!

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git push origin main
```

### Step 2: Deploy to Vercel

#### Option A: Từ GitHub (Khuyến nghị)
1. Vào https://vercel.com
2. Đăng nhập với GitHub
3. Click "Add New Project"
4. Import repository từ GitHub
5. Vercel sẽ tự động detect Next.js
6. Click "Deploy"

#### Option B: Từ Vercel CLI
```bash
npm i -g vercel
vercel login
vercel
```

### Step 3: Sau khi Deploy
1. ✅ Vào website đã deploy
2. ✅ Vào `/admin` và đăng nhập
3. ✅ Setup lại PayPal settings
4. ✅ Setup lại crypto wallet addresses
5. ✅ Đổi admin username/password
6. ✅ Test thanh toán PayPal
7. ✅ Test thanh toán Crypto

## 📝 Notes

- **LocalStorage**: Settings lưu trong browser localStorage, sẽ mất khi clear cache. Cần setup lại sau mỗi lần clear.
- **Environment Variables**: Không cần env variables vì dùng localStorage
- **Build**: Vercel sẽ tự động build khi push code lên GitHub
- **Domain**: Có thể setup custom domain trong Vercel dashboard

## 🔍 Verify After Deployment

- [ ] Homepage loads correctly
- [ ] Admin page accessible at `/admin`
- [ ] Can login to admin
- [ ] PayPal settings can be saved
- [ ] Crypto addresses can be saved
- [ ] Payment modal works
- [ ] QR code generates correctly
- [ ] Network selection works
- [ ] All images/icons display correctly

## 🆘 Troubleshooting

### Build fails
- Check `package.json` dependencies
- Check Next.js version compatibility
- Check TypeScript errors

### Settings not saving
- Check browser console for errors
- Verify localStorage is enabled
- Check admin authentication

### Payment not working
- Verify PayPal credentials are correct
- Check crypto addresses are valid
- Verify network selection matches address

