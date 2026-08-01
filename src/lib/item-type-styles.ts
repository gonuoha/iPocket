import type { CSSProperties } from "react";
import {
  Code,
  File,
  Image,
  Link as LinkIcon,
  Sparkles,
  StickyNote,
  Terminal,
  type LucideIcon,
} from "lucide-react";

const itemTypeIcons: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

const mutedTypeStyle = {
  textClassName: "text-muted-foreground",
  bgClassName: "bg-muted",
} as const;

type ItemTypeStyle = {
  textClassName?: string;
  bgClassName?: string;
  textStyle?: CSSProperties;
  bgStyle?: CSSProperties;
};

export function getItemTypeIcon(icon: string | null): LucideIcon {
  if (!icon) {
    return File;
  }

  return itemTypeIcons[icon] ?? File;
}

export function getItemTypeStyles(color: string | null): ItemTypeStyle {
  if (!color?.startsWith("#")) {
    return mutedTypeStyle;
  }

  return {
    textStyle: { color },
    bgStyle: { backgroundColor: `${color}1a` },
  };
}
