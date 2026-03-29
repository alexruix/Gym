import { User, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoleIconProps {
  role: "profesor" | "alumno";
  className?: string;
}

export const RoleIcon = ({ role, className }: RoleIconProps) => {
  if (role === "profesor") {
    return <GraduationCap className={cn("w-5 h-5 text-primary", className)} aria-hidden="true" />;
  }
  return <User className={cn("w-5 h-5 text-muted-foreground", className)} aria-hidden="true" />;
};

RoleIcon.displayName = "RoleIcon";
