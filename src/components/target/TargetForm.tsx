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

const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Title should not be empty",
  }),
});

export type TargetFormType = z.infer<typeof FormSchema>;

type Props = {
  initialValues: TargetFormType;
  onSubmit: (data: TargetFormType) => Promise<void>;
};

export const TargetForm: FC<Props> = ({ onSubmit, initialValues }) => {
  const form = useForm<TargetFormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: initialValues,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (data: TargetFormType) => {
    setSubmitting(true);
    await onSubmit(data).finally(() => setSubmitting(false));
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
                <Input placeholder="Input your goal" {...field} />
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
