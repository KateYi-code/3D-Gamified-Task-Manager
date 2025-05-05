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
