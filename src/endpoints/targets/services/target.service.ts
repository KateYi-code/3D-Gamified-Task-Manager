import { getSession } from "@/endpoints/handler";
import { prisma } from "@/db";

export const getMyTargets = async () => {
  const user = getSession().user;
  if (!user) {
    throw new Error("login required");
  }
  return prisma.target.findMany({
    where: { userId: user.id },
    include: {
      tasks: true,
    },
  });
};

export const getMyTasksOfWeek = async (startDate: Date, endDate: Date) => {
  const user = getSession().user;
  if (!user) {
    throw new Error("login required");
  }
  return prisma.task.findMany({
    where: {
      userId: user.id,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      target: true,
    },
  });
};

export const getMyTargetById = async (id: string) => {
  const user = getSession().user;
  if (!user) {
    throw new Error("login required");
  }
  return prisma.target.findFirst({
    where: { id, userId: user.id },
    include: {
      tasks: true,
    },
  });
};

export const updateMyTarget = async (id: string, title: string) => {
  const user = getSession().user;
  if (!user) {
    throw new Error("login required");
  }
  return prisma.target.update({
    where: { id, userId: user.id },
    data: {
      title,
    },
  });
};
export const createMyTarget = async (title: string) => {
  const user = getSession().user;
  if (!user) {
    throw new Error("login required");
  }
  return prisma.target.create({
    data: {
      title,
      userId: user.id,
    },
  });
};

export const deleteMyTarget = async (id: string) => {
  const user = getSession().user;
  if (!user) {
    throw new Error("login required");
  }
  return prisma.target.delete({
    where: { id, userId: user.id },
  });
};
