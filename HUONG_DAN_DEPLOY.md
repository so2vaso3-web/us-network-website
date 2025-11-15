# 🚀 HƯỚNG DẪN DEPLOY LÊN VERCEL

## Cách 1: Từ Vercel Dashboard (DỄ NHẤT) ✅

### Bước 1: Truy cập Vercel
1. Mở trình duyệt
2. Vào: **https://vercel.com**
3. Click **"Sign Up"** hoặc **"Log In"**

### Bước 2: Đăng nhập với GitHub
1. Chọn **"Continue with GitHub"**
2. Authorize Vercel truy cập GitHub của bạn
3. Đăng nhập xong sẽ vào Vercel Dashboard

### Bước 3: Import Project
1. Trong Vercel Dashboard, click **"Add New..."** → **"Project"**
2. Tìm repository: **`us-network-website`** (hoặc `so2vaso3-web/us-network-website`)
3. Click vào repository đó

### Bước 4: Configure Project
- **Project Name**: Tự động (hoặc đổi tên nếu muốn)
- **Framework Preset**: Vercel sẽ tự detect **Next.js** ✅
- **Root Directory**: Để mặc định `./`
- **Build Command**: Tự động (không cần sửa)
- **Output Directory**: Tự động (không cần sửa)

### Bước 5: Deploy
1. Click nút **"Deploy"** (màu xanh)
2. Đợi Vercel build project (2-3 phút)
3. Xong! Website của bạn sẽ có URL như: `https://us-network-website.vercel.app`

---

## Cách 2: Từ Vercel CLI (Nhanh hơn)

### Bước 1: Cài đặt Vercel CLI
```bash
npm i -g vercel
```

### Bước 2: Đăng nhập Vercel
```bash
vercel login
```
- Sẽ mở browser để đăng nhập

### Bước 3: Deploy
```bash
cd c:\Users\so2va\us-network-nextjs
vercel
```

### Bước 4: Trả lời các câu hỏi
- **Set up and deploy?** → Y
- **Which scope?** → Chọn account của bạn
- **Link to existing project?** → N (lần đầu tiên)
- **What's your project's name?** → `us-network-website` (hoặc tên khác)
- **In which directory is your code located?** → `./` (Enter)
- Đợi build xong!

---

## ✅ SAU KHI DEPLOY XONG

### 1. Truy cập Website
- URL: `https://your-project-name.vercel.app`
- Vào `/admin` để setup

### 2. Setup Admin
- URL: `https://your-project-name.vercel.app/admin`
- Username: `admin`
- Password: `admin123`
- **⚠️ ĐỔI PASSWORD NGAY!**

### 3. Setup PayPal
- Vào Admin → Settings → Cài Đặt PayPal
- Nhập PayPal Client ID & Secret
- Chọn Mode (Sandbox/Live)
- Lưu

### 4. Setup Crypto Addresses
- Vào Admin → Settings → Cài Đặt Tiền Điện Tử
- Nhập địa chỉ ví cho BTC, ETH, USDT, BNB
- Chọn network đúng
- Lưu

---

## 🔄 AUTO DEPLOY

**Vercel tự động deploy khi:**
- Bạn push code lên GitHub
- Có commit mới trên branch `main`
- Không cần làm gì thêm!

---

## 🌐 CUSTOM DOMAIN

Muốn dùng domain riêng?
1. Vào Vercel Dashboard
2. Chọn project
3. Settings → Domains
4. Add domain của bạn
5. Follow instructions để setup DNS

---

## ❓ VẤN ĐỀ GẶP PHẢI?

### Build fails?
- Kiểm tra console log trong Vercel
- Check `package.json` dependencies
- Đảm bảo build thành công local trước (`npm run build`)

### Settings không lưu được?
- Check browser console
- Verify localStorage enabled
- Đảm bảo đã login admin

### Website không load?
- Check URL đúng chưa
- Clear browser cache
- Check Vercel deployment status

