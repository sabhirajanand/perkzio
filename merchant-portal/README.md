## Merchant Portal

### Local development

1. **Create env file**

- Copy `./.env.example` → `./.env.local`
- Fill in the values (see below)

2. **Install deps**

```bash
npm install
```

3. **Run dev server**

```bash
npm run dev
```

By default it runs on `PORT` (see `.env.local`).

### Environment variables

#### Backend API proxy (required for registration + auth)

- **`API_BASE_URL`**: Base URL of the backend API (e.g. `http://localhost:4000`)

#### Supabase S3-compatible uploads (required for Registration Step 2)

Used by `POST /api/upload` for 3 required image uploads: **Inside View**, **Outside View**, **Logo**.

- **`SUPABASE_PROJECT_ID`**
- **`SUPABASE_REGION`**
- **`SUPABASE_ACCESS_KEY_ID`**
- **`SUPABASE_SECRET_ACCESS_KEY`**
- **`SUPABASE_BUCKET`**: bucket name (must be public for direct image previews)
- **`NEXT_PUBLIC_SUPABASE_URL`**: e.g. `https://<project_id>.supabase.co`

### Merchant registration flow (current implementation)

#### Step 1: Welcome (`RegisterStepBusiness`)

- **Removed fields**: PAN, GSTIN
- **Removed section**: Number of outlets
- **Required indicators**: Required labels use `*`
- **Mobile number input**: UI shows fixed `+91` prefix; stored value is **10 digits only**
- **Category**: uses custom dropdown (`components/ui/Select.tsx`) for consistent UI across the app
- **Email uniqueness check**: `POST /api/onboarding/check-email` (proxied to backend)

#### Step 2: Location & Documents (`RegisterStepLocation`)

- **Navigation**
  - Back button is shown at the top as **Back** + icon
  - Continue button is centered with **Continue** + right arrow (shared via `RegisterStepNav`)
- **Required uploads (must be completed to continue)**
  - Inside View (image)
  - Outside View (image)
  - Logo Upload (image)
  - Uploads are sent to `POST /api/upload` and stored as public URLs in the form state
- **Google Maps Place Link**
  - Updated to the new bordered card UI; stores the value in `mapsUrl`
- **Outlet Operating Hours**
  - Updated to a 2-column layout; time selection uses the custom dropdown component

