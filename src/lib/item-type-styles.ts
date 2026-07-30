import {
  Code2,
  File,
  FileText,
  Image,
  Link as LinkIcon,
  Sparkles,
  Terminal,
  type LucideIcon,
} from "lucide-react";

import type { ItemType } from "@/lib/mock-data";

export const itemTypeIcons: Record<ItemType["icon"], LucideIcon> = {
  code: Code2,
  sparkles: Sparkles,
  terminal: Terminal,
  "file-text": FileText,
  file: File,
  image: Image,
  link: LinkIcon,
};

export const itemTypeColors: Record<ItemType["color"], string> = {
  blue: "text-blue-400",
  purple: "text-purple-400",
  orange: "text-orange-400",
  yellow: "text-yellow-400",
  gray: "text-muted-foreground",
  pink: "text-pink-400",
  cyan: "text-cyan-400",
};

export const itemTypeBgColors: Record<ItemType["color"], string> = {
  blue: "bg-blue-500/10",
  purple: "bg-purple-500/10",
  orange: "bg-orange-500/10",
  yellow: "bg-yellow-500/10",
  gray: "bg-muted",
  pink: "bg-pink-500/10",
  cyan: "bg-cyan-500/10",
};
