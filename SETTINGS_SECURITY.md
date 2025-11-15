# Settings Security & Persistence Guide

## Overview

Settings are now stored securely in Vercel KV (Redis) with encryption for sensitive fields. The system prioritizes client-side (localStorage) changes over server-side data to prevent data loss.

## Environment Variables

### Required for Production

```bash
# Vercel KV Configuration (Auto-configured on Vercel)
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token

# Encryption Master Key (REQUIRED for production)
MASTER_KEY=your-32-character-or-longer-master-key-here
```

### Setting MASTER_KEY

1. **Generate a secure key:**
   ```bash
   # Using OpenSSL
   openssl rand -base64 32
   
   # Or using Node.js
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

2. **Add to Vercel Environment Variables:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `MASTER_KEY` with your generated key
   - **IMPORTANT:** Never commit this key to Git!

3. **For Local Development:**
   Create `.env.local`:
   ```bash
   MASTER_KEY=your-generated-key-here
   ```

## Architecture

### Storage Strategy

- **Production (Vercel):** Vercel KV only (no filesystem)
- **Development:** Falls back to in-memory storage if KV not configured
- **Client-side:** localStorage as backup and cache

### Merge Priority

When admin saves settings:
1. **Client (localStorage)** - Highest priority
2. **Server (Vercel KV)** - Used to fill missing fields
3. **Defaults** - Fallback values

### Protected Fields

These fields are preserved if client sends empty values:
- `paypalClientId`
- `paypalClientSecret` (encrypted)
- `telegramBotToken` (encrypted)
- `telegramChatId`
- `contactEmail`
- `contactPhone`
- `address`
- `businessHours`

### Encryption

Sensitive fields are encrypted using AES-256-GCM:
- `paypalClientSecret`
- `telegramBotToken`
- `apiKey` (if used)

Encryption happens automatically before saving to Vercel KV.

## Runtime Fetching

### PaymentModal

The `PaymentModal` component uses `useSettings()` hook which:
- Fetches settings from `/api/settings` at runtime (client-side)
- Caches in localStorage for offline access
- Polls every 60 seconds for updates
- Listens for `settingsUpdated` events

### No SSG for Dynamic Settings

Settings are **never** statically generated. All settings are fetched at runtime to ensure:
- Real-time updates
- No stale data
- Proper encryption/decryption

## Error Handling

### Safe Fallbacks

If Vercel KV fails:
- GET `/api/settings` returns safe defaults:
  ```json
  {
    "paypalEnabled": false,
    "cryptoEnabled": false,
    "websiteName": "US Mobile Networks",
    "paypalMode": "sandbox",
    "cryptoGateway": "manual"
  }
  ```
- Client-side localStorage is preserved
- No errors thrown to user

### Migration

If you have existing settings in filesystem:
1. Settings will be automatically migrated to Vercel KV on first save
2. Old filesystem data is ignored
3. All new saves go to Vercel KV only

## Testing

### Local Development

1. Set up Vercel KV locally (optional):
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Link to your project
   vercel link
   
   # Pull environment variables
   vercel env pull
   ```

2. Or use in-memory storage (data lost on restart):
   - Just run `npm run dev`
   - Settings will work but won't persist

### Production

1. Ensure `MASTER_KEY` is set in Vercel
2. Ensure Vercel KV is configured
3. Settings will be encrypted and persisted

## Troubleshooting

### Settings Not Saving

1. Check Vercel KV is configured:
   - `KV_REST_API_URL` and `KV_REST_API_TOKEN` must be set
2. Check `MASTER_KEY` is set (for encryption)
3. Check browser console for errors
4. Check Vercel logs for API errors

### Settings Disappearing

1. Check merge logic: localStorage should have priority
2. Check protected fields are not being overwritten
3. Check encryption/decryption is working
4. Verify Vercel KV connection

### Encryption Errors

1. Ensure `MASTER_KEY` is set
2. Ensure `MASTER_KEY` is at least 32 characters
3. Check encryption/decryption functions in `src/lib/encryption.ts`

## Security Notes

- **Never commit `MASTER_KEY` to Git**
- **Never log encrypted values**
- **Use HTTPS in production**
- **Rotate `MASTER_KEY` periodically**
- **Monitor Vercel KV access logs**

