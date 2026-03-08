-- CreateTable
CREATE TABLE "Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "roles" TEXT NOT NULL,
    "department" TEXT,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_StaffPayroll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "staffId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "grossPay" REAL NOT NULL,
    "advancesTaken" REAL NOT NULL DEFAULT 0,
    "savedAmount" REAL NOT NULL DEFAULT 0,
    "remainingAmount" REAL NOT NULL DEFAULT 0,
    "netPayable" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "employeeId" TEXT,
    CONSTRAINT "StaffPayroll_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StaffPayroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_StaffPayroll" ("advancesTaken", "createdAt", "grossPay", "id", "month", "netPayable", "remainingAmount", "savedAmount", "staffId", "status", "updatedAt", "year") SELECT "advancesTaken", "createdAt", "grossPay", "id", "month", "netPayable", "remainingAmount", "savedAmount", "staffId", "status", "updatedAt", "year" FROM "StaffPayroll";
DROP TABLE "StaffPayroll";
ALTER TABLE "new_StaffPayroll" RENAME TO "StaffPayroll";
CREATE INDEX "StaffPayroll_createdAt_idx" ON "StaffPayroll"("createdAt");
CREATE UNIQUE INDEX "StaffPayroll_staffId_month_year_key" ON "StaffPayroll"("staffId", "month", "year");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
