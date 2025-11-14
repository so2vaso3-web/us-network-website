# Hướng Dẫn Test Build

## 📋 Bước 1: Kiểm Tra Node.js

### Cài đặt Node.js (nếu chưa có):

1. Tải Node.js: https://nodejs.org/
   - Chọn phiên bản LTS (khuyến nghị: v18.x hoặc v20.x)
   - Tải và cài đặt

2. Kiểm tra cài đặt:
   ```bash
   node --version
   npm --version
   ```

## 📋 Bước 2: Cài Đặt Dependencies

Mở terminal/PowerShell tại thư mục project và chạy:

```bash
cd C:\Users\so2va\us-network-nextjs
npm install
```

**Lưu ý:** Nếu gặp lỗi, thử:
```bash
npm install --legacy-peer-deps
```

## 📋 Bước 3: Test Build

### Build Production:

```bash
npm run build
```

### Kết quả mong đợi:
- ✅ Build thành công không có lỗi
- ✅ Thư mục `.next` được tạo
- ✅ Các file static được generate

### Nếu có lỗi:
- Kiểm tra lỗi trong console
- Đảm bảo tất cả dependencies đã được cài đặt
- Kiểm tra TypeScript errors

## 📋 Bước 4: Test Production Build Local

Sau khi build thành công, test production build:

```bash
npm start
```

- Mở browser: http://localhost:3000
- Kiểm tra website hoạt động
- Test tất cả tính năng

## 📋 Bước 5: Test Development Mode

Nếu muốn test development mode:

```bash
npm run dev
```

- Mở browser: http://localhost:3000
- Code sẽ tự động reload khi thay đổi

## 🔍 Kiểm Tra Các Lỗi Thường Gặp

### 1. Lỗi TypeScript:
```
Error: Type 'X' is not assignable to type 'Y'
```
**Giải pháp:** Kiểm tra types trong file đó

### 2. Lỗi Module not found:
```
Error: Cannot find module 'X'
```
**Giải pháp:** Chạy `npm install` lại

### 3. Lỗi Build timeout:
**Giải pháp:** Tăng timeout trong `next.config.js` hoặc kiểm tra internet

### 4. Lỗi Memory:
```
FATAL ERROR: Ineffective mark-compacts near heap limit
```
**Giải pháp:** Tăng Node.js memory: `NODE_OPTIONS=--max_old_space_size=4096 npm run build`

## ✅ Checklist Trước Khi Deploy

Sau khi build thành công, kiểm tra:

- [ ] Build không có lỗi
- [ ] Build không có warnings quan trọng
- [ ] Test production build local hoạt động
- [ ] Test homepage
- [ ] Test payment modal
- [ ] Test admin panel
- [ ] Test trên mobile (responsive)
- [ ] Test trên các browser khác nhau

## 📝 Scripts Có Sẵn

```bash
# Development mode
npm run dev

# Build production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🚀 Sau Khi Build Thành Công

Nếu build thành công, bạn có thể:

1. **Deploy lên Vercel:**
   - Push code lên GitHub
   - Import vào Vercel
   - Deploy tự động

2. **Deploy lên Netlify:**
   - Push code lên GitHub
   - Import vào Netlify
   - Configure build command: `npm run build`
   - Publish directory: `.next`

3. **Self-hosted:**
   - Upload `.next` folder
   - Chạy `npm start`
   - Configure reverse proxy (nginx)

---

**Lưu ý:** Nếu gặp bất kỳ lỗi nào, kiểm tra file `DEPLOYMENT_CHECKLIST.md` để xem hướng dẫn chi tiết hơn.

