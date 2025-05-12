import { prisma } from "@/db";

export const search = async (q: string) => {
  return prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { id: { contains: q } },
      ],
    },
    select: {
      id: true,
      name: true,
      email: true,
      // profileImage: true,
    },
    take: 10,
  });
};