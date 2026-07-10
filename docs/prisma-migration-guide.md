# Prisma Migration Guide for Backend Developers

This guide outlines the standard workflow for modifying the database schema and handling migrations in the VibeU project.

## 1. Local Development Workflow

When you need to change the database structure (add tables, fields, or indexes):

1.  **Modify the Schema**: Open `prisma/schema.prisma` and make your changes.
2.  **Generate Migration**: Run the following command to create a new migration SQL file:
    ```bash
    npx prisma migrate dev --name <describe_your_change>
    ```
    *   This command will:
        *   Generate a new SQL migration in the `migrations/` folder.
        *   Apply the migration to your local database.
        *   Regenerate the Prisma Client.
3.  **Commit Changes**: Commit both `prisma/schema.prisma` and the new folder created in `migrations/`.

## 2. Handling Merge Conflicts

If another developer has pushed a migration while you were working on yours, you will encounter a conflict when pulling or merging.

### Strategy: Merge & Resolve

1.  **Merge the target branch** (e.g., `develop`) into your feature branch.
2.  **Resolve Schema Conflicts**: If `schema.prisma` has conflicts, resolve them manually to include both sets of changes.
3.  **Handle Migration Conflicts**:
    *   Prisma will detect that the database state is out of sync.
    *   Run:
        ```bash
        npx prisma migrate dev
        ```
    *   If Prisma asks to reset the database, **accept it** (this is why we use seed data for local development).
    *   Prisma will create a new "merge" migration if necessary or simply apply the missing ones in order.
4.  **Push again**: Once resolved and tested locally, push your changes.

## 3. Production Deployment (CI/CD)

**NEVER** use `prisma migrate dev` in production or staging environments. It is interactive and can reset the database.

### The Correct Way: `migrate deploy`

In our CI/CD pipeline (AWS/Supabase), we use:
```bash
npx prisma migrate deploy
```

*   **How it works**: It compares the `migrations/` folder in the code with the `_prisma_migrations` table in the database. It applies any missing migrations without asking for confirmation or resetting data.
*   **Safety**: This ensures that production always moves forward to the correct version defined in your merged code.

## 4. Best Practices

*   **Descriptive Names**: Use clear names for migrations (e.g., `add_user_bio` instead of `fix_1`).
*   **No Manual SQL Edits**: Avoid modifying the database directly via SQL clients. Always go through `schema.prisma` to keep the code and DB in sync.
*   **Review Migrations**: Before committing, peek into the generated `migration.sql` to ensure it only contains the changes you intended.
*   **Prewarm Check**: If you add a new high-traffic table, remember to add it to the `TABLES_TO_PREWARM` list in `src/frameworks/database/postgres/database-prewarm.service.ts`.

---
*Note: For Supabase, ensure your `DATABASE_URL` uses port 6543 (Connection Pool) and `DIRECT_URL` uses port 5432 (Direct connection for migrations).*
