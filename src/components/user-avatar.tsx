import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserInitials } from "@/lib/get-user-initials";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  name: string;
  image?: string | null;
  size?: "default" | "sm" | "lg";
  className?: string;
};

export function UserAvatar({
  name,
  image,
  size = "default",
  className,
}: UserAvatarProps) {
  return (
    <Avatar size={size} className={cn(className)}>
      {image ? <AvatarImage src={image} alt={name} /> : null}
      <AvatarFallback>{getUserInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
