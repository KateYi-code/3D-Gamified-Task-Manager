import { Input } from "@/components/ui/input";
import { FC, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { TaskComponent } from "../task/TaskComponent";
import { Task } from "@prisma/client";
import { TaskDraft } from "../task/TaskDraft";
import { TaskStatus } from "../task/TaskDraft";
import { client } from "@/endpoints/client";
import React, { useRef } from "react";
import { TaskComponentHandle } from "../task/TaskComponent";
import { toast } from "sonner";

const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Title should not be empty",
  }),
});

export type TargetFormType = z.infer<typeof FormSchema>;

type Props = {
  initialValues: TargetFormType;
  onSubmit: (data: TargetFormType) => Promise<void>;
  Tasks: Task[];
  onAdd: (targetid: string, title: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onUpdateTitle: (taskId: string, title: string) => Promise<void>;
  onUpdateStatus: (taskId: string, status: TaskStatus) => Promise<void>;
  onfinal: () => Promise<void>;
  targetDate?: Date;
  Id?: string;
  setTrigger: React.Dispatch<React.SetStateAction<boolean>>;
};

export const TargetForm: FC<Props> = ({ initialValues, Tasks, onfinal, targetDate, Id }) => {
  const taskCompRef = useRef<TaskComponentHandle>(null);
  const [localTasks, setLocalTasks] = useState<TaskDraft[]>(Tasks);
  const [, setDeletedTasks] = useState<TaskDraft[]>([]);
  const addLocalTask = (title: string) => {
    setLocalTasks((localTasks) => [
      ...localTasks,
      {
        id: `temp-${Date.now()}`,
        targetId: "temp",
        title,
        status: "PENDING",
      },
    ]);
  };

  const updateLocalTaskTitle = (taskId: string, title: string) => {
    setLocalTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, title } : t)));
  };

  const updateLocalTaskStatus = (taskId: string, status: TaskStatus) => {
    setLocalTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
  };

  const deleteLocalTask = (taskId: string) => {
    setLocalTasks((prev) => {
      const isTemp = taskId.startsWith("temp-");

      if (!isTemp) {
        const toDelete = prev.find((t) => t.id === taskId);
        if (toDelete) {
          setDeletedTasks((d) => [...d, toDelete]);
        }
      }

      return prev.filter((t) => t.id !== taskId);
    });
  };

  const form = useForm<TargetFormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialValues,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: TargetFormType) => {
    setSubmitting(true);
    //taskCompRef.current?.submitTaskInput();
    try {
      //await onSubmit(data);

      //submit
      let targetId = Id;
      if (targetDate) {
        const newTarget = await client.authed.createMyTarget(data.title, targetDate);
        targetId = newTarget.id;
      }
      if (!targetId) {
        throw new Error("Missing target ID");
      }

      //delete
      const toDeleteIds = Tasks.filter((orig) => !localTasks.some((t) => t.id === orig.id)).map(
        (t) => t.id,
      );
      await Promise.all(toDeleteIds.map((id) => client.authed.deleteMyTask(id)));

      //add
      const newTasks = localTasks.filter((t) => t.id.startsWith("temp-"));
      await Promise.all(newTasks.map((t) => client.authed.createMyTask(targetId, t.title)));
      const newTask = taskCompRef.current?.submitTaskInput();
      if (newTask) {
        await client.authed.createMyTask(targetId, newTask);
      }
      //update
      const titleUpdates = localTasks.filter((t) => {
        if (!t.id.startsWith("temp-")) {
          const orig = Tasks.find((x) => x.id === t.id)!;
          return orig.title !== t.title;
        }
        return false;
      });
      await Promise.all(titleUpdates.map((t) => client.authed.updateMyTaskTitle(t.id, t.title)));

      // Update statuses
      const statusUpdates = localTasks.filter((t) => {
        if (!t.id.startsWith("temp-")) {
          const orig = Tasks.find((x) => x.id === t.id)!;
          return orig.status !== t.status;
        }
        return false;
      });
      await Promise.all(statusUpdates.map((t) => client.authed.updateMyTaskStatus(t.id, t.status)));

      // Show success toast after successful submission
      toast.success("Target and tasks updated successfully!");

      await onfinal().finally(() => setSubmitting(false));
    } catch {
      // Show error toast if something goes wrong
      toast.error("Failed to update target and tasks. Please try again.");
    } finally {
      //setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Goal Title</FormLabel>
              <FormControl>
                <Input placeholder="Input your goal" {...field} data-testid={"goal-field"} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <TaskComponent
          tasks={localTasks}
          ref={taskCompRef}
          onAdd={addLocalTask}
          onDelete={deleteLocalTask}
          onUpdateTitle={updateLocalTaskTitle}
          onUpdateStatus={updateLocalTaskStatus}
        />
        <Button type="submit" variant="default" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          {submitting ? "Creating..." : "DONE"}
        </Button>
      </form>
    </Form>
  );
};
