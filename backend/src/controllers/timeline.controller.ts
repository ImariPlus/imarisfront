import { Request, Response } from "express";
import { PrismaClient, TimelineType, TimelineAction, ReferenceType } from "@prisma/client";

const prisma = new PrismaClient();

// GET /timeline?date=yyyy-mm-dd
export const getDailyTimeline = async (
  req: Request & { auth?: { id: string; role: string } },
  res: Response
) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const timelineEntries = await prisma.timelineEntry.findMany({
      where: { createdAt: { gte: startOfDay, lte: endOfDay } },
      include: {
        performedBy: { select: { id: true, name: true } },
        approvedBy: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(timelineEntries);
  } catch (err) {
    console.error("Timeline fetch error:", err);
    res.status(500).json({ message: "Failed to fetch timeline" });
  }
};

// POST /timeline
export const addTimelineEntry = async (
  req: Request & { auth?: { id: string; role: string } },
  res: Response
) => {
  try {
    const {
      type,
      action,
      referenceId,
      referenceType,
      metadata,
      approvedById,
    } = req.body;

    if (!type || !action) {
      return res.status(400).json({ message: "type and action are required" });
    }

    const entry = await prisma.timelineEntry.create({
      data: {
        type,
        action,
        performedById: req.auth!.id,
        approvedById: approvedById || null,
        referenceId: referenceId || null,
        referenceType: referenceType || null,
        metadata: metadata || null,
      },
    });

    res.status(201).json(entry);
  } catch (err) {
    console.error("Timeline create error:", err);
    res.status(500).json({ message: "Failed to add timeline entry" });
  }
};

// PUT /timeline/:id
export const updateTimelineEntry = async (
  req: Request & { auth?: { id: string; role: string } },
  res: Response
) => {
  try {
    const { id } = req.params;
    const {
      type,
      action,
      referenceId,
      referenceType,
      metadata,
      approvedById,
    } = req.body;

    const updated = await prisma.timelineEntry.update({
      where: { id },
      data: {
        type,
        action,
        referenceId: referenceId || null,
        referenceType: referenceType || null,
        metadata: metadata || null,
        approvedById: approvedById || null,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Timeline update error:", err);
    res.status(500).json({ message: "Failed to update timeline entry" });
  }
};

// DELETE /timeline/:id
export const deleteTimelineEntry = async (
  req: Request & { auth?: { id: string; role: string } },
  res: Response
) => {
  try {
    const { id } = req.params;
    await prisma.timelineEntry.delete({ where: { id } });
    res.json({ message: "Entry deleted" });
  } catch (err) {
    console.error("Timeline delete error:", err);
    res.status(500).json({ message: "Failed to delete timeline entry" });
  }
};