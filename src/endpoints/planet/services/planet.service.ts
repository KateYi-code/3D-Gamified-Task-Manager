import { prisma } from "@/db";
import { getSession } from "@/endpoints/handler";

export interface PlanetObject {
  id: string;
  modelPath: string;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number; w: number };
  scale: { x: number; y: number; z: number };
}

export const savePlanetObject = async (object: Omit<PlanetObject, 'id'>) => {
  const { user } = getSession();
  if (!user) throw new Error("Login required");

  return prisma.planetObject.create({
    data: {
      userId: user.id,
      modelPath: object.modelPath,
      position: object.position,
      rotation: object.rotation,
      scale: object.scale,
    },
  });
};

export const getPlanetObjects = async () => {
  const { user } = getSession();
  if (!user) throw new Error("Login required");

  return prisma.planetObject.findMany({
    where: {
      userId: user.id,
    },
  });
};

export const deletePlanetObject = async (id: string) => {
  const { user } = getSession();
  if (!user) throw new Error("Login required");

  return prisma.planetObject.delete({
    where: {
      id,
      userId: user.id,
    },
  });
}; 