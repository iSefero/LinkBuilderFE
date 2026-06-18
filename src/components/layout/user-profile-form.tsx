"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/providers/auth-provider";
import { useUpdateUser } from "@/hooks/use-api";

const schema = z.object({
  firstName: z.string().min(1, "Обязательное поле"),
  lastName: z.string().min(1, "Обязательное поле"),
});

type FormData = z.infer<typeof schema>;

export function UserProfileForm() {
  const { user, refreshUser } = useAuth();
  const updateUser = useUpdateUser();

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    },
  });

  if (!user) return null;

  const onSubmit = async (data: FormData) => {
    await updateUser.mutateAsync({ id: user.id, data });
    await refreshUser();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1">
        <Label htmlFor="lastName">Фамилия</Label>
        <Input id="lastName" {...register("lastName")} />
        {errors.lastName && (
          <p className="text-xs text-destructive">{errors.lastName.message}</p>
        )}
      </div>
      <div className="space-y-1">
        <Label htmlFor="firstName">Имя</Label>
        <Input id="firstName" {...register("firstName")} />
        {errors.firstName && (
          <p className="text-xs text-destructive">{errors.firstName.message}</p>
        )}
      </div>
      {isDirty && (
        <Button
          type="submit"
          size="sm"
          className="w-full"
          disabled={updateUser.isPending}
        >
          {updateUser.isPending ? "Сохранение..." : "Сохранить"}
        </Button>
      )}
    </form>
  );
}
