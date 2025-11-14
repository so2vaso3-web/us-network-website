# Sửa Lỗi Build

## ✅ Đã Sửa Lỗi TypeScript

### Lỗi:
```
Type error: Argument of type 'string | 100 | 0' is not assignable to parameter of type 'string'.
Type 'number' is not assignable to type 'string'.
```

### Nguyên nhân:
Function `calculateGrowth` trả về cả `number` (100 hoặc 0) và `string`, gây lỗi type khi dùng `parseFloat()`.

### Đã sửa:
Đảm bảo function `calculateGrowth` luôn trả về `string`:
- Thay `100` → `'100.0'`
- Thay `0` → `'0.0'`
- Thêm type annotation `: string`

## 🔄 Bước Tiếp Theo

### 1. Test Build Lại:
```bash
npm run build
```

### 2. Nếu Build Thành Công:
```bash
npm start
```

### 3. Nếu Port 3000 Đã Được Sử Dụng:

**Cách 1: Dùng port khác**
```bash
PORT=3001 npm start
```

**Cách 2: Kill process đang dùng port 3000**

Trên Windows:
```bash
# Tìm process
netstat -ano | findstr :3000

# Kill process (thay PID bằng số từ lệnh trên)
taskkill /PID <PID> /F
```

Hoặc đơn giản hơn, dùng dev mode:
```bash
npm run dev
```
Dev mode sẽ tự động dùng port khác nếu 3000 đã bị chiếm.

---

## ✅ Checklist Sau Khi Sửa

- [x] Lỗi TypeScript đã được sửa
- [ ] Build thành công (`npm run build`)
- [ ] Test production build (`npm start`)
- [ ] Test development build (`npm run dev`)
- [ ] Website hoạt động đúng

