# Hướng Dẫn Setup Vercel KV (Redis) cho Persistent Storage

## Tại sao cần Vercel KV?

Trên Vercel (serverless), data lưu trong memory sẽ **mất khi server restart**. Để đảm bảo settings thanh toán (PayPal, Crypto) **luôn tồn tại** và người khác vào web có thể thanh toán được, bạn cần setup **Vercel KV** (Redis database).

## Cách Setup Vercel KV:

### Bước 1: Tạo Vercel KV Database

1. Vào Vercel Dashboard: https://vercel.com/dashboard
2. Chọn project của bạn
3. Vào tab **Storage**
4. Click **Create Database** → Chọn **KV** (Redis)
5. Đặt tên database (ví dụ: `us-network-kv`)
6. Chọn region gần nhất
7. Click **Create**

### Bước 2: Kết nối với Project

1. Sau khi tạo KV, Vercel sẽ tự động:
   - Thêm environment variables: `KV_REST_API_URL` và `KV_REST_API_TOKEN`
   - Kết nối với project của bạn

2. **Redeploy** project để áp dụng environment variables:
   - Vào tab **Deployments**
   - Click **Redeploy** trên deployment mới nhất

### Bước 3: Kiểm tra

Sau khi redeploy, vào Admin Panel → Settings và:
1. Nhập thông tin thanh toán (PayPal Client ID, Crypto addresses)
2. Click **Lưu Cài Đặt**
3. Mở browser khác (hoặc incognito) và vào web
4. Thử mua gói cước → Kiểm tra xem có thấy PayPal button và crypto addresses không

## Nếu không setup Vercel KV:

- Code vẫn hoạt động nhưng settings sẽ **mất khi server restart**
- User vẫn có thể thanh toán vì có **fallback localStorage**
- Nhưng settings mới sẽ không sync giữa các user khác nhau

## Lưu ý:

- **Vercel KV có free tier**: 256MB storage, đủ cho settings và orders
- **Nếu hết free tier**: Có thể upgrade hoặc dùng database khác (PostgreSQL, MongoDB)

---

**Sau khi setup xong, settings sẽ được lưu persistent và tất cả user đều thấy được!**

