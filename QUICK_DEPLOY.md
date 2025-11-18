# ⚡ Hướng Dẫn Deploy Nhanh Lên Vercel

## 🚀 3 Bước Deploy

### Bước 1: Push Code Lên Git
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Bước 2: Deploy Lên Vercel
1. Vào https://vercel.com → Login
2. Click **"Add New Project"**
3. Chọn repo `us-network-website`
4. Click **"Deploy"** (Vercel tự động detect Next.js)

### Bước 3: Cấu Hình Redis
1. Vào Project → **Storage** tab
2. Click **"Create Database"** → Chọn **"Upstash Redis"**
3. Đặt tên: `us-network-redis`
4. Chọn region: `us-east-1` (hoặc gần nhất)
5. Click **"Create"**

**✅ Xong!** Vercel tự động inject `KV_REST_API_URL` và `KV_REST_API_TOKEN`

---

## 🔑 Set Master Key (Quan Trọng!)

1. Vào **Project Settings** → **Environment Variables**
2. Thêm biến:
   ```
   MASTER_KEY = (tạo key bằng lệnh bên dưới)
   ```
3. Tạo key:
   ```bash
   node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
   ```
4. Copy key và paste vào Vercel
5. Click **"Save"**
6. **Redeploy** project để áp dụng

---

## ✅ Test Sau Khi Deploy

1. Vào URL: `https://your-project.vercel.app`
2. Vào Admin Settings
3. Lưu một setting → Refresh → Kiểm tra còn không
4. Nếu còn → Redis hoạt động ✅

---

## 🐛 Lỗi Thường Gặp

**Lỗi: "Settings not saving"**
→ Kiểm tra `MASTER_KEY` đã set chưa và redeploy

**Lỗi: "KV_REST_API_URL not found"**
→ Kiểm tra Redis database đã tạo chưa

**Lỗi: "Build failed"**
→ Xem log trong Vercel Dashboard → Deployments

---

**Xem hướng dẫn chi tiết trong file `DEPLOYMENT.md`**





























