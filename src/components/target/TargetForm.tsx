import { Input } from "@/components/ui/input";
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

const FormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, {
    message: "Title should not be empty",
  }),
});

export type TargetFormType = z.infer<typeof FormSchema>;

type Props = {
  initialValues: TargetFormType;
  onChange?: (data: TargetFormType) => void;
};

export const TargetForm: FC<Props> = ({ initialValues, onChange }) => {
  const form = useForm<TargetFormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialValues,
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: TargetFormType) => {
    setSubmitting(true);

    try {
      if (onChange) await onChange(data);

      toast.success("Target and tasks updated successfully!");
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
        <Button type="submit" variant="default" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          {submitting ? "Creating..." : "DONE"}
        </Button>
      </form>
    </Form>
  );
};
