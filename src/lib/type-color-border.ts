import type { CSSProperties } from "react";

import type { TypeColorPosition } from "@/lib/user-preferences";

const BORDER_POSITION_CLASS: Record<
  Exclude<TypeColorPosition, "none">,
  string
> = {
  top: "border-t-4",
  bottom: "border-b-4",
  left: "border-l-4",
  right: "border-r-4",
};

const BORDER_COLOR_PROPERTY: Record<
  Exclude<TypeColorPosition, "none">,
  keyof Pick<
    CSSProperties,
    "borderTopColor" | "borderBottomColor" | "borderLeftColor" | "borderRightColor"
  >
> = {
  top: "borderTopColor",
  bottom: "borderBottomColor",
  left: "borderLeftColor",
  right: "borderRightColor",
};

export function getTypeColorBorderProps(
  color: string | null | undefined,
  position: TypeColorPosition,
): { className: string; style?: CSSProperties } {
  if (position === "none") {
    return { className: "" };
  }

  const className = BORDER_POSITION_CLASS[position];

  if (color?.startsWith("#")) {
    return {
      className,
      style: { [BORDER_COLOR_PROPERTY[position]]: color },
    };
  }

  return { className };
}
