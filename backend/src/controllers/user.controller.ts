import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Admin: get all users
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true },
    });
    res.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Logged-in user: get self
export const getMe = async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth) return res.status(401).json({ message: "Unauthorized" });

    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: { id: true, email: true, name: true, role: true },
    });

    res.json(user);
  } catch (err) {
    console.error("GET ME ERROR:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// Admin: create user
export const createUser = async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { email, name, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, name, password: hashed, role },
    });

    res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error("CREATE USER ERROR:", err);
    res.status(500).json({ message: "Failed to create user" });
  }
};

// User updates self
export const updateMe = async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth) return res.status(401).json({ message: "Unauthorized" });

    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: auth.id },
      data: { name },
      select: { id: true, email: true, name: true, role: true },
    });

    res.json(user);
  } catch (err) {
    console.error("UPDATE ME ERROR:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// Admin: delete user by id
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const auth = req.auth;
    if (!auth || auth.role !== "ADMIN") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;

    await prisma.user.delete({
      where: { id },
    });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};
