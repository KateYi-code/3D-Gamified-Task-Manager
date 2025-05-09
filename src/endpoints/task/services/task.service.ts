import { getSession } from "@/endpoints/handler";
import { prisma } from "@/db";
import { Task , TaskStatus} from "@prisma/client";



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
        user:   { connect: { id: user.id } },
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

