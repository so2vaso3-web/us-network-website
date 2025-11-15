# PR Patch: Fix Settings Persistence on Vercel

## Summary
Fixed critical bug where settings would disappear/reappear on Vercel serverless environment. Implemented secure, persistent storage with encryption, proper merge logic, and safe fallbacks.

## Changes

### 1. Storage Layer (`src/lib/settings-storage.ts` - NEW)
- **Removed:** Filesystem storage (not compatible with serverless)
- **Added:** Vercel KV as primary storage (Redis-based)
- **Added:** Safe fallback when DB fails
- **Exports:** `readSettingsFromKV()`, `saveSettingsToKV()`

### 2. Encryption (`src/lib/encryption.ts` - NEW)
- **Algorithm:** AES-256-GCM
- **Key:** From `MASTER_KEY` env (32 bytes hex or string)
- **Encrypted fields:**
  - `paypalClientSecret`
  - `telegramBotToken`
  - `apiKey`
- **Functions:** `encrypt()`, `decrypt()`, `encryptSettings()`, `decryptSettings()`

### 3. Merge Logic (`src/lib/settings-merge.ts` - NEW)
- **Priority:** localStorage (client) > incoming payload > server (DB)
- **Protected fields:** Never overwritten if payload is empty
- **Explicit removal:** Use `{ fieldName_remove: true }`
- **Sanitization:** Removes encrypted secrets from client responses

### 4. API Routes

#### `src/app/api/settings/route.ts` (UPDATED)
- **GET:** Returns sanitized settings (no plaintext secrets, adds `has_paypal_secret` flag)
- **POST:** 
  - Merge logic: localStorage > payload > server
  - Rate limiting: 10 req/min
  - Auth check: Admin only
  - Metadata: `updated_at`, `updated_by`
  - Revalidation: Triggers on-demand revalidation for SSG/ISR
- **Storage:** Vercel KV only (no filesystem)
- **Fallback:** Safe defaults on DB error

#### `src/app/api/admin/secret/route.ts` (NEW)
- **GET:** Admin-only endpoint to retrieve decrypted secrets
- **Auth:** Requires admin session/API key
- **Response:** Only secret fields (decrypted)

#### `src/app/api/revalidate/route.ts` (NEW)
- **POST:** On-demand revalidation for SSG/ISR pages
- **Usage:** Called after settings update

### 5. Client Components

#### `src/components/admin/SettingsManagement.tsx` (UPDATED)
- **Auto-save:** Sends both `settings` and `localStorageData` to server
- **Priority:** localStorage data has highest priority in merge

#### `src/lib/useSettings.ts` (UPDATED)
- **saveSettingsToServer:** Accepts optional `localStorageData` parameter
- **Sends:** Both settings and localStorage data to server

### 6. PaymentModal (`src/components/PaymentModal.tsx`)
- **Already uses:** `useSettings()` hook (runtime fetch)
- **No changes needed:** Already fetches at runtime

## Migration

### For Vercel KV (Current)
1. Set environment variables:
   ```bash
   KV_REST_API_URL=your_kv_url
   KV_REST_API_TOKEN=your_kv_token
   MASTER_KEY=your-32-byte-hex-key
   ```

2. Settings automatically migrate on first save

### For Postgres/Supabase (Future)
1. Run SQL migration: `migrations/001_settings_table.sql`
2. Update `src/lib/settings-storage.ts` to use Postgres client
3. Keep same merge logic and encryption

## Testing

### Unit Tests
- `src/lib/__tests__/settings-merge.test.ts`
- Tests merge with empty strings, undefined, null, explicit removal

### Manual Testing Checklist
- [ ] Save settings → Check Vercel KV has encrypted data
- [ ] Fetch settings → Verify secrets not in response
- [ ] Update partial → Verify protected fields preserved
- [ ] DB error → Verify fallback works
- [ ] Rate limit → Verify 429 response
- [ ] Auth check → Verify 401 for non-admin

## Files Changed

### New Files
- `src/lib/encryption.ts` - Encryption utility
- `src/lib/settings-merge.ts` - Merge logic utility
- `src/lib/settings-storage.ts` - Storage utility (Vercel KV)
- `src/lib/__tests__/settings-merge.test.ts` - Unit tests
- `src/app/api/admin/secret/route.ts` - Admin secret endpoint
- `src/app/api/revalidate/route.ts` - Revalidation endpoint
- `migrations/001_settings_table.sql` - Postgres migration (optional)
- `CHANGELOG_SETTINGS_FIX.md` - Changelog
- `SETTINGS_SECURITY.md` - Security guide

### Updated Files
- `src/app/api/settings/route.ts` - Complete rewrite
- `src/components/admin/SettingsManagement.tsx` - Updated merge priority
- `src/lib/useSettings.ts` - Added localStorageData parameter

## Environment Variables Required

```bash
# Vercel KV (auto-configured on Vercel)
KV_REST_API_URL=...
KV_REST_API_TOKEN=...

# Encryption (REQUIRED for production)
MASTER_KEY=your-32-byte-hex-key-or-string

# Optional
ADMIN_API_KEY=... # For API key auth
ADMIN_JWT_SECRET=... # For JWT auth
REVALIDATE_SECRET=... # For revalidation endpoint
```

## Breaking Changes
- **GET `/api/settings`:** No longer returns `paypalClientSecret` or `telegramBotToken` in plaintext
- **Storage:** No longer uses filesystem (Vercel KV only)

## Security Improvements
- Secrets encrypted at rest (AES-256-GCM)
- Secrets not exposed in API responses
- Admin-only secret endpoint
- Rate limiting on POST
- Auth checks on write operations

