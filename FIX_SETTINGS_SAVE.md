# Fix: Settings Không Lưu Lên Server

## Vấn Đề
Khi lưu settings, bạn thấy cảnh báo: "Đã lưu vào cache local, nhưng không thể lưu lên server."

## Nguyên Nhân
Code mới yêu cầu **Vercel KV** (Redis database) để lưu settings. Nếu chưa cấu hình, settings chỉ lưu vào localStorage (mất khi refresh).

## Giải Pháp

### 1. Trên Vercel (Production) - BẮT BUỘC

1. **Vào Vercel Dashboard** → Project của bạn → **Settings** → **Storage**
2. **Tạo Vercel KV Database:**
   - Click **Create Database**
   - Chọn **KV** (Redis)
   - Chọn region gần nhất
   - Click **Create**

3. **Vercel sẽ tự động set environment variables:**
   - `KV_REST_API_URL`
   - `KV_REST_API_TOKEN`

4. **Thêm MASTER_KEY:**
   - Vào **Settings** → **Environment Variables**
   - Thêm biến mới:
     - **Name:** `MASTER_KEY`
     - **Value:** Generate key bằng lệnh:
       ```bash
       openssl rand -base64 32
       ```
       hoặc
       ```bash
       node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
       ```
   - **IMPORTANT:** Không commit key này vào Git!

5. **Redeploy** project để áp dụng environment variables

### 2. Local Development - TẠM THỜI

Nếu đang chạy local (`npm run dev`), code sẽ tự động dùng **in-memory storage**:
- ✅ Settings sẽ lưu được (trong memory)
- ⚠️ **Mất khi restart server**
- ℹ️ Chỉ để test, không dùng cho production

### 3. Kiểm Tra

Sau khi cấu hình xong:

1. **Lưu settings** trong admin panel
2. **Kiểm tra console** (F12):
   - Nếu thấy: `✅ Settings saved to Vercel KV (persistent, encrypted)` → **Thành công!**
   - Nếu thấy: `⚠️ Vercel KV not configured...` → Chưa cấu hình đúng

3. **Refresh trang** → Settings vẫn còn → **OK!**

## Troubleshooting

### Lỗi: "Vercel KV not configured"
- ✅ Kiểm tra đã tạo KV database trong Vercel chưa
- ✅ Kiểm tra environment variables có `KV_REST_API_URL` và `KV_REST_API_TOKEN` chưa
- ✅ Redeploy project sau khi thêm env vars

### Lỗi: "MASTER_KEY not set"
- ✅ Thêm `MASTER_KEY` vào Vercel Environment Variables
- ✅ Generate key mới (32+ bytes)
- ✅ Redeploy

### Settings vẫn mất sau refresh
- ✅ Kiểm tra Vercel KV đã được tạo và connected chưa
- ✅ Kiểm tra logs trong Vercel Dashboard → Functions → `/api/settings`
- ✅ Thử lưu lại settings

## Lưu Ý

- **Production:** PHẢI cấu hình Vercel KV, không có fallback
- **Development:** Có thể dùng in-memory (tạm thời)
- **MASTER_KEY:** BẮT BUỘC cho encryption, không được commit vào Git

