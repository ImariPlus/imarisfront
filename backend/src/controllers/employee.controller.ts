import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/employees
// Returns every employee, with their linked physician (pay type/commission info)
// and linked user (name/role) attached, so the frontend can render one unified list.
export const listEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { active: true },
      include: {
        physician: true,
        user: { select: { id: true, name: true, role: true } },
      },
      orderBy: { name: "asc" },
    });

    res.json(employees);
  } catch (err) {
    console.error("List employees error:", err);
    res.status(500).json({ message: "Failed to fetch employees" });
  }
};

// POST /api/employees
export const createEmployee = async (req: Request, res: Response) => {
  try {
    const { name, roles, department, userId, physicianId } = req.body;

    if (!name || !roles) {
      return res.status(400).json({ message: "Name and role are required" });
    }

    // If linking to a user, make sure that user isn't already linked to
    // another employee, and isn't an ADMIN (admins are handled separately).
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) return res.status(400).json({ message: "User not found" });
      if (user.role === "ADMIN") {
        return res.status(400).json({ message: "Admin accounts aren't managed through payroll" });
      }
      const existingLink = await prisma.employee.findFirst({ where: { userId } });
      if (existingLink) {
        return res.status(400).json({ message: "That user is already linked to an employee" });
      }
    }

    // If linking to a physician, make sure it isn't already linked elsewhere.
    if (physicianId) {
      const physician = await prisma.physician.findUnique({ where: { id: physicianId } });
      if (!physician) return res.status(400).json({ message: "Physician not found" });
      if (physician.employeeId) {
        return res.status(400).json({ message: "That physician is already linked to an employee" });
      }
    }

    const employee = await prisma.employee.create({
      data: {
        name,
        roles,
        department: department || null,
        userId: userId || null,
      },
      include: { physician: true, user: { select: { id: true, name: true, role: true } } },
    });

    if (physicianId) {
      await prisma.physician.update({
        where: { id: physicianId },
        data: { employeeId: employee.id },
      });
    }

    const result = await prisma.employee.findUnique({
      where: { id: employee.id },
      include: { physician: true, user: { select: { id: true, name: true, role: true } } },
    });

    res.status(201).json(result);
  } catch (err) {
    console.error("Create employee error:", err);
    res.status(500).json({ message: "Failed to create employee" });
  }
};