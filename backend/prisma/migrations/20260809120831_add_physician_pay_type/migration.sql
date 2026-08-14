-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Physician" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DOCTOR',
    "payType" TEXT NOT NULL DEFAULT 'FIXED',
    "commissionRate" REAL NOT NULL DEFAULT 0,
    "basePay" REAL NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Physician" ("active", "createdAt", "id", "name", "role") SELECT "active", "createdAt", "id", "name", "role" FROM "Physician";
DROP TABLE "Physician";
ALTER TABLE "new_Physician" RENAME TO "Physician";
CREATE UNIQUE INDEX "Physician_name_key" ON "Physician"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
