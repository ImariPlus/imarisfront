/*
  Warnings:

  - You are about to drop the column `staffId` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `staffId` on the `StaffPayroll` table. All the data in the column will be lost.
  - Made the column `employeeId` on table `StaffPayroll` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Employee" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "roles" TEXT NOT NULL DEFAULT 'RECEPTIONIST',
    "department" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Employee" ("createdAt", "department", "id", "name", "roles", "updatedAt", "userId") SELECT "createdAt", "department", "id", "name", "roles", "updatedAt", "userId" FROM "Employee";
DROP TABLE "Employee";
ALTER TABLE "new_Employee" RENAME TO "Employee";
CREATE TABLE "new_Expense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeeId" TEXT,
    "recordedById" TEXT NOT NULL,
    CONSTRAINT "Expense_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Expense_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Expense" ("amount", "category", "createdAt", "id", "notes", "recordedById", "title") SELECT "amount", "category", "createdAt", "id", "notes", "recordedById", "title" FROM "Expense";
DROP TABLE "Expense";
ALTER TABLE "new_Expense" RENAME TO "Expense";
CREATE INDEX "Expense_createdAt_idx" ON "Expense"("createdAt");
CREATE TABLE "new_Physician" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'DOCTOR',
    "payType" TEXT NOT NULL DEFAULT 'FIXED',
    "commissionRate" REAL NOT NULL DEFAULT 0,
    "basePay" REAL NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "employeeId" TEXT,
    CONSTRAINT "Physician_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Physician" ("active", "basePay", "commissionRate", "createdAt", "id", "name", "payType", "role") SELECT "active", "basePay", "commissionRate", "createdAt", "id", "name", "payType", "role" FROM "Physician";
DROP TABLE "Physician";
ALTER TABLE "new_Physician" RENAME TO "Physician";
CREATE UNIQUE INDEX "Physician_name_key" ON "Physician"("name");
CREATE UNIQUE INDEX "Physician_employeeId_key" ON "Physician"("employeeId");
CREATE TABLE "new_StaffPayroll" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "employeeId" TEXT NOT NULL,
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
    CONSTRAINT "StaffPayroll_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_StaffPayroll" ("advancesTaken", "createdAt", "employeeId", "grossPay", "id", "month", "netPayable", "remainingAmount", "savedAmount", "status", "updatedAt", "year") SELECT "advancesTaken", "createdAt", "employeeId", "grossPay", "id", "month", "netPayable", "remainingAmount", "savedAmount", "status", "updatedAt", "year" FROM "StaffPayroll";
DROP TABLE "StaffPayroll";
ALTER TABLE "new_StaffPayroll" RENAME TO "StaffPayroll";
CREATE INDEX "StaffPayroll_createdAt_idx" ON "StaffPayroll"("createdAt");
CREATE UNIQUE INDEX "StaffPayroll_employeeId_month_year_key" ON "StaffPayroll"("employeeId", "month", "year");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
