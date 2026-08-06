import {
  File,
  FileCode,
  FileJson,
  FileSpreadsheet,
  FileText,
  type LucideIcon,
} from "lucide-react";

import { getFileExtension } from "@/lib/file-upload";

const EXTENSION_ICONS: Record<string, LucideIcon> = {
  ".pdf": FileText,
  ".txt": FileText,
  ".md": FileText,
  ".json": FileJson,
  ".yaml": FileCode,
  ".yml": FileCode,
  ".xml": FileCode,
  ".csv": FileSpreadsheet,
  ".toml": FileCode,
  ".ini": FileCode,
};

export function getFileIconByExtension(fileName: string): LucideIcon {
  return EXTENSION_ICONS[getFileExtension(fileName)] ?? File;
}
