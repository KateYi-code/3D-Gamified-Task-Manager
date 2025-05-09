export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";

export type TaskDraft = { 
  id: string;
  targetId: string;
  title: string; 
  status: TaskStatus;
};