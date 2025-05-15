import React, { FC, useState } from "react";
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
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { DateSelect } from "@/components/calendar/DateSelect";
import { Slider } from "../ui/slider";
import { useQuery } from "@/hooks/useQuery";
import { Input } from "@/components/ui/input";

const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Title should not be empty",
  }),
  date: z.date(),
  taskDuration: z.number(),
  targetId: z.string(),
});

export type TaskFormType = z.infer<typeof FormSchema>;

type Props = {
  initial: {
    date: Date;
    duration: number;
    title?: string;
    targetId?: string;
  };
  onSubmit?: (data: TaskFormType) => Promise<void>;
};

export const TaskForm: FC<Props> = ({ initial: { date, duration, title, targetId }, onSubmit }) => {
  const form = useForm<TaskFormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      date: date,
      taskDuration: duration,
      title,
      targetId,
    },
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: TaskFormType) => {
    setSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
    } catch {
      toast.error("Failed to update tasks. Please try again.");
    } finally {
      //setSubmitting(false);
    }
  };

  const { data: targets } = useQuery("getMyTargets");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title</FormLabel>
              <Input {...field} />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="targetId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a Target" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {targets?.map((target) => (
                    <SelectItem key={target.id} value={target.id}>
                      {target.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Task Date</FormLabel>
                <FormControl>
                  <DateSelect {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />
        <FormField
          control={form.control}
          name="taskDuration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Duration</FormLabel>
              <FormControl>
                <div className={"flex items-center"}>
                  <span className="text-sm text-muted-foreground">{field.value} mins</span>
                  <Slider
                    defaultValue={[20]}
                    max={100}
                    step={5}
                    value={[field.value]}
                    onValueChange={(v) => field.onChange(v[0])}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="default" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          {submitting ? "Creating..." : "DONE"}
        </Button>
      </form>
    </Form>
  );
};
