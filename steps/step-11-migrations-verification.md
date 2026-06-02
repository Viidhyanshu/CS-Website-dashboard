# Step 11: Schema Migrations & Integration Testing

> [!IMPORTANT]
> Before writing any code, check the [AGENTS.md](file:///d:/projects/CS-Dashboard/cs-dashboard/AGENTS.md) file for critical instructions regarding this project's custom Next.js conventions, APIs, and file structure rules.

This is the final step, involving pushing database migrations to Supabase, running the Next.js development server, and verifying all modules function cohesively.

## 1. Drizzle Schema Migration

Before running the server, synchronize the local schema definitions with the live Supabase PostgreSQL database. Run the following command in the project root:

```bash
npx drizzle-kit push
```

Verify that Drizzle CLI connects successfully and applies the `homepage_gallery_items`, `homepage_hero`, `homepage_hero_images`, and `events` tables (along with their indices) without errors.

## 2. Boot Local Development Server

Run the local Next.js development environment:

```bash
npm run dev
```

The application should be accessible on `http://localhost:3000` (or `http://localhost:3001` if port 3000 is occupied). Navigate to `/admin`.

## 3. Integration Validation Plan

Perform these manual tests to ensure full correctness of the build:

### Task A: Cloudflare R2 Uploads
1. Go to the **Media library** page.
2. Select **Upload File** and pick an image (PNG or JPG).
3. Verify that the loading indicator triggers, followed by an "Asset uploaded to Cloudflare R2!" alert.
4. Verify that the image card appears in the grid with a copy-url link and a delete option.
5. Click **Copy URL** and test loading the image directly in another browser tab.

### Task B: Hero Settings & Live Sync
1. Go to the **Hero settings** page.
2. Fill out Heading, Subheading, Description, and CTA text/links.
3. Click **Pick from Media Library** next to "Background image", select the image uploaded in Task A, and save.
4. Verify that the database registers the changes and a fetch call gets triggered to clear cache pages on the club main website.

### Task C: Drag & Drop Ordering
1. Go to the **Horizontal gallery** or **Hero overlay** page.
2. Create/add multiple images.
3. Drag items to adjust positions.
4. Click **Save Layout** (or **Save Order**).
5. Verify that refreshing the page maintains the new order index values.

### Task D: Events List & Form CRUD
1. Go to the **Events manager** page.
2. Click **Add Event** and complete the form. Test **Generate Slug**.
3. Choose a cover image using the media picker and click **Create Event**.
4. Edit the event to test status updates from "draft" to "published".
5. Delete the event and confirm that the grid refreshes immediately.

---

## Completion Checklist
- [x] Database schema pushed successfully using Drizzle Kit.
- [x] Next.js server boots without compile errors.
- [x] Media Library file uploads working on Cloudflare R2.
- [x] CRUD operations and drag-and-drop order updates succeed in Supabase database.
- [x] Revalidation tags ping main website without throwing errors.
