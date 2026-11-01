# ASGARD-IRI — Cloudinary Implementation TODO
> Tick every box in order. Reference file: `04_ASGARD_Cloudinary_Implementation.md`

---

## STEP 1 — Cloudinary Account Setup
- [x] Sign up at cloudinary.com (free tier)
- [x] Copy Cloud Name, API Key, API Secret from dashboard
- [x] Go to Settings → Upload → Upload Presets → Create preset named `asgard_iri`
  - Signing mode: Signed
  - Folder: `asgard-iri`
  - Allowed formats: `pdf, jpg, jpeg, png, webp`
- [x] Go to Settings → Security → Enable Strict transformations

---

## STEP 2 — Install Packages
- [x] Run `cd server && npm install cloudinary multer-storage-cloudinary`
- [x] Verify `cloudinary@^2.4.0` and `multer-storage-cloudinary@^4.0.0` in `server/package.json`

---

## STEP 3 — Environment Variables
- [x] Add `CLOUDINARY_CLOUD_NAME` to `server/.env`
- [x] Add `CLOUDINARY_API_KEY` to `server/.env`
- [x] Add `CLOUDINARY_API_SECRET` to `server/.env`
- [x] Add all three keys (empty values) to `server/.env.example`
- [x] Remove `UPLOAD_DIR=uploads` from `.env` (no longer needed)

---

## STEP 4 — Cloudinary Config File
- [x] Create `server/src/config/cloudinary.js`
- [x] Configure `cloudinary.v2` with `cloud_name`, `api_key`, `api_secret` from env vars
- [x] Export the configured cloudinary instance

---

## STEP 5 — Replace Upload Middleware
- [x] Open `server/src/middleware/upload.middleware.js`
- [x] Remove all existing multer disk storage code
- [x] Import `CloudinaryStorage` from `multer-storage-cloudinary`
- [x] Import cloudinary from `../config/cloudinary`
- [x] Create `makeStorage(folder, resourceType)` factory function
  - Sets `folder` to `asgard-iri/${folder}`
  - Sets `resource_type` to given resourceType
  - Sets `public_id` to `${Date.now()}-${random}`
  - Adds `flags: 'attachment'` for `raw` resource type
- [x] Create `makeFilter(allowedMime)` factory function
- [x] Create `uploadResume` — folder: `resumes`, resourceType: `raw`, PDF only
- [x] Create `uploadPaper` — folder: `papers`, resourceType: `raw`, PDF only
- [x] Create `uploadBrief` — folder: `briefs`, resourceType: `raw`, PDF only
- [x] Create `uploadCertificate` — folder: `certificates`, resourceType: `raw`, PDF only
- [x] Create `uploadPhoto` — folder: `photos`, resourceType: `image`, images only
- [x] Create `uploadGallery` — folder: `gallery`, resourceType: `image`, images only
- [x] Create `uploadCover` — folder: `covers`, resourceType: `image`, images only
- [x] Create `uploadAny` — folder: `misc`, resourceType: `raw`, PDF + images
- [x] Export all 8 named instances

---

## STEP 6 — Update Route Files
- [x] Open `server/src/routes/opportunity.routes.js`
  - [x] Import `uploadResume` from upload middleware
  - [x] Replace `upload.single('resume')` with `uploadResume.single('resume')`
- [x] Open `server/src/routes/conference.routes.js`
  - [x] Import `uploadPaper` from upload middleware
  - [x] Replace `upload.single('file')` with `uploadPaper.single('file')`
- [x] Open `server/src/routes/innovation.routes.js`
  - [x] Import `uploadBrief` from upload middleware
  - [x] Replace `upload.single('brief')` with `uploadBrief.single('brief')`
- [x] Open `server/src/routes/certificate.routes.js`
  - [x] Import `uploadCertificate` from upload middleware
  - [x] Replace `upload.single('pdf')` with `uploadCertificate.single('pdf')`
- [x] Open `server/src/routes/researcher.routes.js`
  - [x] Import `uploadPhoto` from upload middleware
  - [x] Replace `upload.single('profilePhoto')` with `uploadPhoto.single('profilePhoto')`
- [x] Open `server/src/routes/admin.routes.js`
  - [x] Import `uploadGallery` and `uploadCover` from upload middleware
  - [x] Replace gallery upload with `uploadGallery.single('media')`
  - [x] Replace publication cover upload with `uploadCover.single('cover')`
  - [x] Replace conference cover upload with `uploadCover.single('cover')`
  - [x] Replace academy cover upload with `uploadCover.single('cover')`

---

## STEP 7 — Update Controllers
- [x] Open `server/src/controllers/opportunity.controller.js`
  - [x] Change `applyToOpportunity` — read `req.file.path` as `resumeUrl`
  - [x] Read `req.file.filename` as `resumePublicId`
  - [x] Save both `resume_url` and `resume_public_id` to DB
- [x] Open `server/src/controllers/conference.controller.js`
  - [x] Change `submitPaper` — read `req.file.path` as `fileUrl`
  - [x] Read `req.file.filename` as `filePublicId`
  - [x] Save both `file_url` and `file_public_id` to DB
- [x] Open `server/src/controllers/innovation.controller.js`
  - [x] Change `applyToProgram` — read `req.file.path` as `briefUrl`
  - [x] Read `req.file.filename` as `briefPublicId`
  - [x] Save both `brief_url` and `brief_public_id` to DB
- [x] Open `server/src/controllers/certificate.controller.js`
  - [x] Change `issueCertificate` — read `req.file.path` as `pdfUrl`
  - [x] Read `req.file.filename` as `pdfPublicId`
  - [x] Save both `pdf_url` and `pdf_public_id` to DB
- [x] Open `server/src/controllers/researcher.controller.js`
  - [x] Change `updateResearcherProfile` — read `req.file?.path` as `photoUrl` (optional)
  - [x] Read `req.file?.filename` as `photoPublicId`
  - [x] Only update photo columns if `req.file` exists
  - [x] Save both `profile_photo` and `photo_public_id` to DB
- [x] Open `server/src/controllers/admin.controller.js`
  - [x] Change `uploadGalleryItem` — read `req.file.path` as `mediaUrl`
  - [x] Read `req.file.filename` as `mediaPublicId`
  - [x] Save both `media_url` and `media_public_id` to DB
  - [x] Change `createPublication` — read `req.file?.path` as `coverUrl`
  - [x] Read `req.file?.filename` as `coverPublicId`
  - [x] Save both `cover_url` and `cover_public_id` to DB
  - [x] Repeat same pattern for `createConference` and `createProgram`

---

## STEP 8 — Database Migration
- [x] Create `server/migrations/015_add_cloudinary_public_ids.sql`
  - [x] Add `resume_public_id VARCHAR` to `opportunity_applications`
  - [x] Add `file_public_id VARCHAR` to `conference_submissions`
  - [x] Add `brief_public_id VARCHAR` to `innovation_applications`
  - [x] Add `pdf_public_id VARCHAR` to `certificates`
  - [x] Add `photo_public_id VARCHAR` to `researcher_profiles`
  - [x] Add `media_public_id VARCHAR` to `gallery`
  - [x] Add `cover_public_id VARCHAR` to `publications`
  - [x] Add `cover_public_id VARCHAR` to `conferences`
  - [x] Add `cover_public_id VARCHAR` to `academy_programs`
- [x] Run migration: `psql -U asgard_user -d asgard_db -f server/migrations/015_add_cloudinary_public_ids.sql`
- [x] Verify all `*_public_id` columns exist in DB via `\d table_name`

---

## STEP 9 — Cloudinary Delete Utility
- [x] Create `server/src/utils/cloudinaryDelete.js`
- [x] Implement `deleteFromCloudinary(publicId, resourceType)` function
  - Accepts `publicId` and `resourceType` (`raw` or `image`)
  - Returns early if `publicId` is null/undefined
  - Calls `cloudinary.uploader.destroy(publicId, { resource_type: resourceType })`
  - Catches and logs errors without throwing (delete failure must not break main operation)
- [x] Open `server/src/controllers/admin.controller.js`
  - [x] Import `deleteFromCloudinary`
  - [x] Update `deleteGalleryItem` — call `deleteFromCloudinary(media_public_id, resourceType)` before DB delete
  - [x] Update `deletePublication` — call `deleteFromCloudinary(cover_public_id, 'image')` before DB delete
  - [x] Update `deleteConference` — call `deleteFromCloudinary(cover_public_id, 'image')` before DB delete
- [x] Open `server/src/controllers/opportunity.controller.js`
  - [x] Update `deleteApplication` — call `deleteFromCloudinary(resume_public_id, 'raw')` before DB delete

---

## STEP 10 — Auto-Generated Certificates (Phase 5)
- [x] Run `npm install pdfkit qrcode` in server
- [x] Open `server/src/utils/generateCertificate.js`
- [x] Implement `generateAndUploadCertificate({ recipientName, eventLabel, issuedDate, certificateUid })`
  - [x] Generate QR code buffer from `${CLIENT_URL}/verify/${certificateUid}` using `qrcode`
  - [x] Create `PDFDocument` (A4, landscape, margin 60)
  - [x] Write certificate content: foundation name, "This is to certify that", recipient name, event label, issued date, certificate UID, QR code image
  - [x] Collect PDF chunks into a buffer
  - [x] Upload buffer to Cloudinary using `upload_stream` with folder `asgard-iri/certificates`, resource_type `raw`, public_id `cert_${certificateUid}`, flags `attachment`
  - [x] Return `{ pdfUrl: result.secure_url, pdfPublicId: result.public_id }`
- [x] Open `server/src/controllers/certificate.controller.js`
  - [x] Implement `autoIssueCertificate(userId, issuedForType, issuedForId, issuedForLabel)`
  - [x] Fetch `full_name` from users table
  - [x] Call `generateAndUploadCertificate` with recipient name, event label, today's date, new UUID
  - [x] INSERT into certificates with returned `pdfUrl` and `pdfPublicId`, status `active`
- [x] Call `autoIssueCertificate` from `POST /payments/verify` (conference registration paid)
- [x] Call `autoIssueCertificate` when academy registration status is set to `completed`

---

## STEP 11 — Remove Local Static File Serving
- [x] Open `server/src/app.js`
- [x] Remove the line: `app.use('/uploads', express.static(path.join(__dirname, '../uploads')))`
- [x] Remove `path` import from `app.js` if it was only used for the uploads line
- [x] Delete or empty the `server/uploads/` folder
- [x] Remove `uploads/*` and `!uploads/.gitkeep` from `.gitignore`

---

## STEP 12 — Frontend Changes
- [x] Open `client/src/utils/buildImageUrl.js` (if it exists)
  - [x] Delete the file entirely — Cloudinary URLs are full HTTPS URLs, no construction needed
- [x] Search entire `client/src/` for `buildImageUrl(` usages
  - [x] Replace every `buildImageUrl(someUrl)` with just `someUrl`
- [x] Create `client/src/utils/cloudinaryTransform.js`
  - [x] Implement `thumb(url, width = 400)` — inserts `w_${width},c_fill,f_auto,q_auto` into Cloudinary URL; returns original URL if not a Cloudinary URL
  - [x] Implement `cover(url, width = 800, height = 400)` — inserts `w_${width},h_${height},c_fill,f_auto,q_auto` into Cloudinary URL
- [x] Update `Research/ResearcherProfile.jsx` — use `thumb(photo, 200)` on profile photo
- [x] Update researcher directory cards — use `thumb(photo, 200)` on all researcher photos
- [x] Update `Dashboard/ProfileTab.jsx` — use `thumb(avatar, 200)` on user avatar
- [x] Update `Conferences/index.jsx` — use `cover(coverImageUrl, 800, 400)` on conference cards
- [x] Update `Conferences/ConferenceDetail.jsx` — use `cover(coverImageUrl, 1200, 500)` on hero image
- [x] Update `Academy/index.jsx` — use `cover(coverImageUrl, 800, 400)` on programme cards
- [x] Update `Publications/index.jsx` — use `thumb(coverUrl, 300)` on publication covers
- [x] Update `News/Gallery.jsx` — use `thumb(mediaUrl, 400)` on gallery images

---

## STEP 13 — Error Handling
- [x] Open `server/src/middleware/error.middleware.js`
- [x] Add handler for `err.message?.includes('Invalid file type')` → 400 with `err.message`
- [x] Add handler for `err.code === 'LIMIT_FILE_SIZE'` → 400 with "File too large. Maximum size is X MB."
- [x] Test: upload a non-PDF to resume field → correct 400 error returned
- [x] Test: upload a file > 5MB → correct 400 error returned

---

## VERIFICATION CHECKLIST
- [x] Upload a CV via opportunity apply → file visible in Cloudinary dashboard under `asgard-iri/resumes/`
- [x] Upload a conference paper → file visible under `asgard-iri/papers/`
- [x] Upload an innovation brief → file visible under `asgard-iri/briefs/`
- [x] Upload a profile photo → file visible under `asgard-iri/photos/`
- [x] Upload a gallery image → file visible under `asgard-iri/gallery/`
- [x] Upload a publication cover → file visible under `asgard-iri/covers/`
- [x] Delete a gallery item → file removed from Cloudinary dashboard
- [x] Delete an application → resume removed from Cloudinary dashboard
- [x] Gallery image `<img>` tag renders with `f_auto` (WebP) in browser network tab
- [x] Profile photo thumbnail renders correctly with `thumb()` transformation
- [x] Conference cover renders correctly with `cover()` transformation
- [x] Auto-generated certificate PDF uploads to `asgard-iri/certificates/`; QR code embedded; download link works
- [x] File larger than 5MB → rejected with correct error message
- [x] Non-PDF uploaded to resume field → rejected with correct error message
- [x] Old local `/uploads/` static route returns 404 (static serving removed)
- [x] No references to `buildImageUrl` remain in client code
