import type { CSSProperties } from "react";
import {
  Code,
  Code2,
  File,
  FileText,
  Image,
  Link as LinkIcon,
  Sparkles,
  StickyNote,
  Terminal,
  type LucideIcon,
} from "lucide-react";

import type { ItemType } from "@/lib/mock-data";

const legacyItemTypeIcons: Record<ItemType["icon"], LucideIcon> = {
  code: Code2,
  sparkles: Sparkles,
  terminal: Terminal,
  "file-text": FileText,
  file: File,
  image: Image,
  link: LinkIcon,
};

const dbItemTypeIcons: Record<string, LucideIcon> = {
  Code,
  Sparkles,
  Terminal,
  StickyNote,
  File,
  Image,
  Link: LinkIcon,
};

export const itemTypeIcons = legacyItemTypeIcons;

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

export function getItemTypeIcon(icon: string | null): LucideIcon {
  if (!icon) {
    return File;
  }

  return (
    dbItemTypeIcons[icon] ??
    legacyItemTypeIcons[icon as ItemType["icon"]] ??
    File
  );
}

type ItemTypeStyle = {
  textClassName?: string;
  bgClassName?: string;
  textStyle?: CSSProperties;
  bgStyle?: CSSProperties;
};

export function getItemTypeStyles(color: string | null): ItemTypeStyle {
  if (!color) {
    return {
      textClassName: itemTypeColors.gray,
      bgClassName: itemTypeBgColors.gray,
    };
  }

  if (color.startsWith("#")) {
    return {
      textStyle: { color },
      bgStyle: { backgroundColor: `${color}1a` },
    };
  }

  const namedColor = color as ItemType["color"];

  return {
    textClassName: itemTypeColors[namedColor] ?? itemTypeColors.gray,
    bgClassName: itemTypeBgColors[namedColor] ?? itemTypeBgColors.gray,
  };
}
