import { Task , RepeatRule } from "@prisma/client";

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type rRule = "daily" | "weekly" | "monthly" |"none";

export type TaskDraft = { 
  id: string;
  targetId: string;
  title: string; 
  status: TaskStatus;
  startAt? : Task["startAt"];
  finishAt?:  Task["finishAt"];
  repeatKey?  : RepeatRule  | null;
};