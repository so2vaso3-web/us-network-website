# Debug: Settings Không Lưu Lên Redis

## Cách Kiểm Tra

### 1. Check Logs trong Vercel
1. Vào **Vercel Dashboard** → Project → **Logs** tab
2. Filter: Chọn **"Functions"** hoặc **"/api/settings"**
3. Tìm lỗi khi lưu settings:
   - `❌ Error saving settings to Redis`
   - `Redis connection failed`
   - `REDIS_URL not set`

### 2. Check Environment Variables
1. Vào **Settings** → **Environment Variables**
2. Kiểm tra có `REDIS_URL` không:
   - ✅ Có → Copy value (click "Show secret")
   - ❌ Không → Cần connect Redis lại

### 3. Test Redis Connection
1. Vào **Storage** → **Redis** → `redis-green-garden`
2. Click **"Open in Redis"** để test connection
3. Hoặc dùng **redis-cli** tab trong Quickstart

### 4. Common Issues

#### Issue 1: REDIS_URL không đúng format
- **Format đúng:** `redis://default:password@host:port`
- **Check:** Copy REDIS_URL từ Vercel và verify

#### Issue 2: Redis chưa được connect với project
- **Fix:** Vào Redis dashboard → Click **"Connect Project"** lại
- Đảm bảo chọn đúng project

#### Issue 3: Redis connection timeout
- **Fix:** Code đã có timeout 5s, nhưng có thể cần tăng
- Hoặc Redis instance đang down

#### Issue 4: Environment variables chưa được load
- **Fix:** Redeploy lại project sau khi thêm REDIS_URL

## Quick Fix

1. **Redeploy lại:**
   - Deployments → Click "..." → Redeploy

2. **Check console trong browser:**
   - F12 → Console tab
   - Lưu settings → Xem error message

3. **Check Vercel logs:**
   - Logs tab → Xem runtime errors

## Nếu Vẫn Không Được

1. **Tạm thời dùng localStorage:**
   - Settings vẫn lưu trong localStorage
   - Không mất khi refresh (trong cùng browser)

2. **Contact support:**
   - Vercel Support → Report issue với Redis connection

