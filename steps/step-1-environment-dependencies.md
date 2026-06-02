# Step 1: Environment Setup & Package Dependencies

> [!IMPORTANT]
> Before writing any code, check the [AGENTS.md](file:///d:/projects/CS-Dashboard/cs-dashboard/AGENTS.md) file for critical instructions regarding this project's custom Next.js conventions, APIs, and file structure rules.

This step involves setting up the development environment, installing core libraries, and configuring the basic project environment variables and database config.

## 1. Package Installation

Run the following commands in the root of the project to install the required client libraries and developer dependencies:

```bash
npm install drizzle-orm postgres @aws-sdk/client-s3 lucide-react
npm install -D drizzle-kit typescript @types/node
```

## 2. Configuration Files

### File: [.env.local](file:///d:/projects/CS-Dashboard/cs-dashboard/.env.local)

Create this file in the root of the dashboard project to store secrets and database endpoints.

```env
# Database connection (Use pooler URL on port 6543)
DATABASE_URL="postgresql://postgres.dltxlwquwfjhqghirnal:[YOUR-PASSWORD]@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?sslmode=require&pgbouncer=true"

# Cloudflare R2 Credentials
R2_ACCOUNT_ID="your_cloudflare_account_id"
R2_ACCESS_KEY_ID="your_r2_access_key_id"
R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
R2_BUCKET_NAME="club-cms"
R2_PUBLIC_DOMAIN="https://media.ieee-cs-muj.com" # E.g., custom domain or pub-xxx.r2.dev

# Revalidation Webhook Integration (Website details)
NEXT_PUBLIC_WEBSITE_URL="http://localhost:3000" # Update in production
REVALIDATION_TOKEN="cfc9e29a8a7de86f1e847c234a5d429a"
```

### File: [drizzle.config.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/drizzle.config.ts)

Create this file in the root of the dashboard project to define the Drizzle schemas location and build output for migrations:

```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
```

---

## Completion Checklist
- [x] Packages installed successfully without peer conflict warnings.
- [x] [.env.local](file:///d:/projects/CS-Dashboard/cs-dashboard/.env.local) file exists with credentials populated.
- [x] [drizzle.config.ts](file:///d:/projects/CS-Dashboard/cs-dashboard/drizzle.config.ts) exists in project root.
