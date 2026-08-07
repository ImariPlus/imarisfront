-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Physician" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DOCTOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Physician" ("active", "createdAt", "id", "name") SELECT "active", "createdAt", "id", "name" FROM "Physician";
DROP TABLE "Physician";
ALTER TABLE "new_Physician" RENAME TO "Physician";
CREATE UNIQUE INDEX "Physician_name_key" ON "Physician"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
