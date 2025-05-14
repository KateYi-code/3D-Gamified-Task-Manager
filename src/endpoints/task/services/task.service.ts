import { getSession } from "@/endpoints/handler";
import { prisma } from "@/db";
import { Task, TaskStatus } from "@prisma/client";
import { Target } from "@prisma/client";
import { RepeatRule } from "@prisma/client";



export const createMyTask = async (
  targetId: string,
  title: string,
  description = ""
): Promise<Task> => {
  const session = getSession();
  const user = session?.user;
  if (!user) {
    throw new Error("Login required");
  }

  return prisma.task.create({
    data: {
      title,
      description,
      target: { connect: { id: targetId } },
      user: { connect: { id: user.id } },
    },
  });
};


export const deleteMyTask = async (taskId: string): Promise<Task> => {
  const session = getSession();
  const user = session?.user;
  if (!user) {
    throw new Error("Login required");
  }

  //Need to check if the task belongs to the user

  return prisma.task.delete({
    where: { id: taskId },
  });
};

export const updateMyTaskTitle = async (
  taskId: string,
  title: string
): Promise<Task> => {
  const session = getSession();
  const user = session?.user;
  if (!user) {
    throw new Error("Login required");
  }

  //Need to check if the task belongs to the user

  return prisma.task.update({
    where: { id: taskId },
    data: { title },
  });
};

export const updateMyTaskStatus = async (
  taskId: string,
  status: TaskStatus
): Promise<Task> => {
  const session = getSession();
  const user = session?.user;
  if (!user) {
    throw new Error("Login required");
  }

  //Need to check if the task belongs to the user

  return prisma.task.update({
    where: { id: taskId },
    data: { status },
  });
}

//get tasks by Id
export const getMyTaskById = async (
  taskId: string
): Promise<Task> => {
  const session = getSession();
  const user = session?.user;
  if (!user) throw new Error("Login required");

  return prisma.task.findUniqueOrThrow({
    where: {
      id: taskId,
      userId: user.id,
    },
  });
};

export const getTaskById = async (
  taskId: string
): Promise<Task> => {
  const session = getSession();
  const user = session?.user;
  if (!user) throw new Error("Login required");

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return task;
};

export const getTaskAndTargetByTaskId = async (
  taskId: string
): Promise<Task & { target: Target }> => {
  const session = getSession();
  const user = session?.user;
  if (!user) throw new Error("Login required");

  const task = await prisma.task.findUnique({
    where: {
      id: taskId,
    },
    include: {
      target: true
    }
  });

  if (!task) {
    throw new Error("Task not found");
  }

  return task;
};

export const UpdateMyTaskAdvanced = async (
  taskId: string,
  startAt?: Date,
  finishAt?: Date,
  repeatKey?: RepeatRule | null
): Promise<Task> => {
  const session = getSession();
  const user = session?.user;
  if (!user) {
    throw new Error("Login required");
  }

  const existingTask = await prisma.task.findUnique({
    where: { id: taskId },
  });

  if (!existingTask || existingTask.userId !== user.id) {
    throw new Error("Task not found or unauthorized");
  }

  const updateData: any = {};

  if (startAt != null && finishAt != null) {
    updateData.startAt = startAt;
    updateData.finishAt = finishAt;
  }

  updateData.repeatKey = repeatKey;

  return prisma.task.update({
    where: { id: taskId },
    data: updateData,
  });
};

