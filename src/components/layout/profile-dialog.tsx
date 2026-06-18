"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/providers/auth-provider";
import { UserProfileForm } from "./user-profile-form";

function getInitials(firstName: string, lastName: string, email: string) {
  if (firstName && lastName) {
    return `${lastName[0]}${firstName[0]}`.toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function ProfileDialog() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <Button
        variant="ghost"
        className="h-9 w-9 rounded-full p-0"
        onClick={() => setOpen(true)}
        aria-label="Профиль"
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback className="text-xs">
            {getInitials(user.firstName, user.lastName, user.email)}
          </AvatarFallback>
        </Avatar>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Профиль</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <Separator />
          <UserProfileForm />
          <DialogFooter className="sm:justify-start">
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => {
                setOpen(false);
                signOut();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
