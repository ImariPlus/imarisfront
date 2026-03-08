import { PrismaClient, TimelineType, TimelineAction, ReferenceType } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Adds a structured timeline entry.
 * 
 * @param params.type - TRANSACTION | EXPENSE | PAYROLL | NOTE
 * @param params.action - CREATED | UPDATED | DELETED | APPROVED | PAID
 * @param params.performedById - User who performed the action
 * @param params.referenceId - ID of the entity (transaction/expense/payroll)
 * @param params.referenceType - ReferenceType (TRANSACTION | EXPENSE | PAYROLL)
 * @param params.metadata - JSON object with extra info
 * @param params.approvedById - optional user who approved this action
 */
export const addTimelineEntry = async (params: {
  type: TimelineType;
  action: TimelineAction;
  performedById: string;
  referenceId?: string;
  referenceType?: ReferenceType;
  metadata?: any;
  approvedById?: string | null;
}) => {
  const entry = await prisma.timelineEntry.create({
    data: {
      type: params.type,
      action: params.action,
      performedById: params.performedById,
      approvedById: params.approvedById || null,
      referenceId: params.referenceId || null,
      referenceType: params.referenceType || null,
      metadata: params.metadata || null,
    },
  });

  return entry;
};