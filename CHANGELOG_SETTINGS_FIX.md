# Changelog: Settings Persistence Fix

## Version: 2.0.0

### Summary
Fixed critical bug where settings would disappear/reappear on Vercel. Implemented secure, persistent storage with encryption and proper merge logic.

## Changes

### 1. Storage Layer
- **Removed:** Filesystem storage (not compatible with serverless)
- **Added:** Vercel KV as primary storage (Redis-based)
- **Added:** Safe fallback when DB fails
- **Migration:** Existing settings automatically migrated to Vercel KV

### 2. Encryption
- **Added:** AES-256-GCM encryption for sensitive fields
- **Encrypted fields:**
  - `paypalClientSecret`
  - `telegramBotToken`
  - `apiKey`
- **Environment:** Requires `MASTER_KEY` env variable (32+ bytes)

### 3. API Changes

#### GET `/api/settings`
- **Changed:** No longer returns plaintext secrets
- **Added:** Flags `has_paypal_secret`, `has_telegram_token`
- **Added:** Safe fallback on DB error
- **Response:** Sanitized settings object

#### POST `/api/settings`
- **Changed:** Merge logic with priority: localStorage > payload > server
- **Added:** Protected fields preservation
- **Added:** Rate limiting (10 req/min)
- **Added:** Admin authentication check
- **Added:** Metadata (`updated_at`, `updated_by`)
- **Added:** On-demand revalidation trigger

#### NEW GET `/api/admin/secret`
- **Purpose:** Admin-only endpoint to retrieve decrypted secrets
- **Auth:** Requires admin session/API key
- **Response:** Only secret fields (decrypted)

### 4. Merge Logic
- **Priority:** localStorage (client) > incoming payload > server (DB)
- **Protected fields:** Never overwritten if payload is empty
- **Explicit removal:** Use `{ fieldName_remove: true }` to delete
- **Protected fields list:**
  - `paypalClientId`
  - `paypalClientSecret`
  - `telegramBotToken`
  - `telegramChatId`
  - `contactEmail`
  - `contactPhone`
  - `address`
  - `businessHours`
  - `currency`
  - `cryptoEnabled`

### 5. Client-Side
- **PaymentModal:** Already uses `useSettings()` hook (runtime fetch)
- **No SSG:** Settings are always fetched at runtime
- **Caching:** localStorage used as cache, not source of truth

### 6. Robustness
- **Fallback:** Returns safe defaults on DB error
- **Rate limiting:** 10 requests per minute per IP
- **Auth:** Admin-only for POST endpoints
- **Logging:** Added `updated_at` and `updated_by` metadata

## Migration Guide

### For Vercel KV (Current Implementation)
1. Set environment variables in Vercel:
   - `KV_REST_API_URL` (auto-configured)
   - `KV_REST_API_TOKEN` (auto-configured)
   - `MASTER_KEY` (generate with `openssl rand -base64 32`)

2. Settings will automatically migrate on first save

### For Postgres/Supabase (Future)
1. Run migration SQL: `migrations/001_settings_table.sql`
2. Update `src/app/api/settings/route.ts` to use Postgres client
3. Keep same merge logic and encryption

## Testing

### Unit Tests
- `src/lib/__tests__/settings-merge.test.ts`
- Tests merge logic with various scenarios

### Manual Testing
1. **Save settings** → Check Vercel KV has encrypted data
2. **Fetch settings** → Verify secrets are not in response
3. **Update partial** → Verify protected fields preserved
4. **DB error** → Verify fallback works

## Breaking Changes
- **GET `/api/settings`:** No longer returns `paypalClientSecret` or `telegramBotToken` in plaintext
- **Storage:** No longer uses filesystem (Vercel KV only)

## Security Improvements
- Secrets encrypted at rest
- Secrets not exposed in API responses
- Admin-only secret endpoint
- Rate limiting on POST
- Auth checks on write operations

## Files Changed
- `src/app/api/settings/route.ts` - Complete rewrite
- `src/lib/encryption.ts` - New encryption utility
- `src/lib/settings-merge.ts` - New merge utility
- `src/app/api/admin/secret/route.ts` - New admin endpoint
- `src/components/admin/SettingsManagement.tsx` - Updated merge priority
- `src/lib/useSettings.ts` - Updated comments

## Dependencies
- No new dependencies (uses Node.js `crypto` for encryption)
- `@vercel/kv` already installed

