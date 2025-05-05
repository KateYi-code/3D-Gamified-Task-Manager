import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FC, useState } from "react";
import type { ModalProps } from "@/components/modals";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Form,
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { client } from "@/endpoints/client";
import { useInvalidateQuery } from "@/hooks/useQuery";

const FormSchema = z.object({
  title: z.string().min(1, {
    message: "Title should not be empty",
  }),
});

type Props = ModalProps;

export const TargetCreateModal: FC<Props> = ({ open, onOpenChange }) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: "",
    },
  });
  const [submitting, setSubmitting] = useState(false);

  const invalidate = useInvalidateQuery();
  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setSubmitting(true);
    await client.authed.createMyTarget(data.title).finally(() => setSubmitting(false));
    onOpenChange(false);
    await invalidate("getMyTargets");
    toast("Target created successfully");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Target</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-6">
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
      </DialogContent>
    </Dialog>
  );
};
