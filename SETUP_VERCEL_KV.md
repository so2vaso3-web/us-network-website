# Hướng Dẫn Setup Vercel KV

## Cách 1: Tạo từ Storage (Khuyến nghị)

1. **Vào Vercel Dashboard** → Project của bạn
2. **Click tab "Storage"** (bên cạnh Settings, Deployments, etc.)
3. **Click "Create Database"**
4. **Chọn "KV"** (Redis database)
5. **Chọn region** (gần nhất với users của bạn)
6. **Click "Create"**
7. Vercel sẽ tự động set environment variables:
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

## Cách 2: Tạo từ Marketplace

1. **Vào Vercel Dashboard** → Project → **Storage**
2. **Click "Create Database"**
3. Nếu thấy **"Marketplace Database Providers"**, chọn:
   - **"Redis"** (Serverless Redis) - Khuyến nghị
   - Hoặc **"Upstash"** → Chọn Redis khi setup
4. **Follow setup wizard**
5. Environment variables sẽ được set tự động

## Sau Khi Tạo KV

### 1. Thêm MASTER_KEY

1. **Vào Settings** → **Environment Variables**
2. **Add new variable:**
   - **Name:** `MASTER_KEY`
   - **Value:** Generate bằng một trong các cách:

   **Cách 1: OpenSSL**
   ```bash
   openssl rand -base64 32
   ```

   **Cách 2: Node.js**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

   **Cách 3: Online**
   - Vào: https://generate-secret.vercel.app/32
   - Copy key được generate

3. **IMPORTANT:** 
   - ✅ Chọn **"Production"**, **"Preview"**, và **"Development"**
   - ❌ **KHÔNG commit key này vào Git!**

### 2. Redeploy

1. **Vào Deployments**
2. **Click "..."** trên deployment mới nhất
3. **Click "Redeploy"**
4. Hoặc push code mới lên Git (auto-deploy)

### 3. Kiểm Tra

1. **Vào admin panel** → Settings
2. **Lưu settings** (ví dụ: thay đổi tên website)
3. **Mở Console** (F12):
   - ✅ Thấy: `✅ Settings saved to Vercel KV (persistent, encrypted)` → **Thành công!**
   - ❌ Thấy: `⚠️ Vercel KV not configured` → Chưa setup đúng

4. **Refresh trang** → Settings vẫn còn → **OK!**

## Troubleshooting

### Không thấy "KV" trong Storage?
- Vercel KV có thể đã được đổi tên thành "Redis" trong Marketplace
- Tìm "Redis" hoặc "Serverless Redis" trong Marketplace

### Environment variables không tự động set?
- Kiểm tra trong **Settings** → **Environment Variables**
- Nếu không có `KV_REST_API_URL` và `KV_REST_API_TOKEN`, thêm thủ công:
  - Lấy từ Vercel KV dashboard
  - Hoặc từ Upstash dashboard (nếu dùng Upstash)

### Settings vẫn không lưu?
1. Kiểm tra logs: **Vercel Dashboard** → **Functions** → `/api/settings`
2. Kiểm tra console (F12) khi lưu settings
3. Đảm bảo đã redeploy sau khi thêm env vars

## Lưu Ý

- **Vercel KV** = Redis database được Vercel quản lý
- **Upstash Redis** = Alternative, cũng hoạt động tốt
- **MASTER_KEY** = Bắt buộc cho encryption, phải 32+ bytes
- **Free tier:** Vercel KV có free tier với giới hạn requests

