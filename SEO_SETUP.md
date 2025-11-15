# SEO Setup Guide

## ✅ Đã cấu hình:

### 1. **Metadata (layout.tsx)**
- ✅ Title với template
- ✅ Description
- ✅ Keywords
- ✅ Open Graph tags (Facebook, LinkedIn)
- ✅ Twitter Card tags
- ✅ Structured Data (JSON-LD) - Schema.org
- ✅ Canonical URL
- ✅ Robots meta

### 2. **Cần làm thêm:**

#### A. Tạo ảnh OG Image:
1. Tạo file `public/og-image.png` (1200x630px)
   - Dùng file `public/og-image.html` để preview
   - Hoặc dùng Canva/Figma để thiết kế
   - Nội dung: Logo + "US Mobile Networks - Best Mobile Plans USA"

#### B. Cập nhật Environment Variables:
1. Trên Vercel:
   - Vào Settings → Environment Variables
   - Thêm `NEXT_PUBLIC_BASE_URL` = `https://zenith5g.com`

2. Local development:
   - File `.env.local`:
   ```
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

#### C. Tạo Logo (tùy chọn):
- Tạo file `public/logo.png` (180x180px hoặc lớn hơn)
- Sẽ được dùng trong structured data

### 3. **Kiểm tra SEO:**

#### A. Facebook Sharing Debugger:
1. Truy cập: https://developers.facebook.com/tools/debug/
2. Nhập URL website
3. Click "Scrape Again" để refresh cache
4. Kiểm tra preview

#### B. Google Rich Results Test:
1. Truy cập: https://search.google.com/test/rich-results
2. Nhập URL hoặc code HTML
3. Kiểm tra structured data

#### C. Twitter Card Validator:
1. Truy cập: https://cards-dev.twitter.com/validator
2. Nhập URL website
3. Kiểm tra preview

#### D. LinkedIn Post Inspector:
1. Truy cập: https://www.linkedin.com/post-inspector/
2. Nhập URL website
3. Kiểm tra preview

### 4. **Sitemap (Tùy chọn):**

Tạo file `src/app/sitemap.ts`:
```typescript
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://us-network-website.vercel.app'
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ]
}
```

### 5. **Robots.txt (Tùy chọn):**

Tạo file `src/app/robots.ts`:
```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://us-network-website.vercel.app'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/api'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
```

## 📊 Kết quả mong đợi:

Khi tìm kiếm trên Google, website sẽ hiển thị:
- **Tiêu đề:** "US Mobile Networks - Best Mobile Plans USA | Cell Phone Plans 2025"
- **Mô tả:** "Compare and buy the best cell phone plans from Verizon, T-Mobile, AT&T, and more..."
- **URL:** https://zenith5g.com
- **Ảnh preview:** og-image.png (nếu đã tạo)

Khi chia sẻ trên Facebook/Twitter:
- Hiển thị ảnh preview đẹp
- Tiêu đề và mô tả rõ ràng
- Logo và branding nhất quán

## 🔍 Lưu ý:

1. **Cache:** Facebook và các mạng xã hội cache metadata. Sau khi cập nhật, cần dùng debugger tools để refresh.

2. **Thời gian:** Google có thể mất vài ngày đến vài tuần để index và hiển thị đầy đủ metadata.

3. **SSL:** Đảm bảo website có HTTPS (Vercel tự động cung cấp).

4. **Performance:** Metadata đã được tối ưu, không ảnh hưởng đến tốc độ load trang.

