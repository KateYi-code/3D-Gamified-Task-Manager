"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { client } from "@/endpoints/client"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation } from "@tanstack/react-query"
import { useInvalidateQuery } from "@/hooks/useQuery"
import { useParams } from "next/navigation"


const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
})

type FormValues = z.infer<typeof schema>

export function EditProfileDialog({
                                    open,
                                    onOpenChange,
                                    defaultValues,
                                    onSuccess,
                                  }: {
  open: boolean
  onOpenChange: (v: boolean) => void
  defaultValues: FormValues
  onSuccess: (updated: FormValues) => void
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  })
  const { id } = useParams() as { id: string }
  const invalidate = useInvalidateQuery()

  const mutation = useMutation({
    mutationFn: (data: FormValues) => client.authed.updateMe(data),
    onSuccess: async (updatedData) => {
      await invalidate("getProfile", id)
      onSuccess({ name: updatedData.name || "", email: updatedData.email })
      onOpenChange(false)
    },
    onError: (err) => {
      console.error("Update failed", err)
    },
  })

  const handleSubmit = (data: FormValues) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="space-y-4"
        >
          <div>
            <Input {...form.register("name")} placeholder="Name" />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Input
              {...form.register("email")}
              placeholder="Email"
              type="email"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Saving..." : "Save"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}