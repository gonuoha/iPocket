type Rgb = { red: number; green: number; blue: number; alpha: number };

function clampByte(value: number): number {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function toHexPair(value: number): string {
  return clampByte(value).toString(16).padStart(2, "0");
}

function parseNumber(value: string, percentageBase: number): number {
  if (value.endsWith("%")) {
    return (Number.parseFloat(value) / 100) * percentageBase;
  }

  return Number.parseFloat(value);
}

function parseAlpha(value: string | undefined): number {
  if (value === undefined || value === "none") {
    return 1;
  }

  const alpha = parseNumber(value, 1);

  return Number.isFinite(alpha) ? alpha : 1;
}

function splitComponents(body: string): string[] {
  return body
    .replace(/\//g, " ")
    .split(/[,\s]+/)
    .filter(Boolean);
}

function parseHex(value: string): Rgb | null {
  const digits = value.slice(1);
  const expand = (hex: string) =>
    hex.length === 3 || hex.length === 4
      ? hex
          .split("")
          .map((char) => char + char)
          .join("")
      : hex;
  const normalized = expand(digits);

  if (normalized.length !== 6 && normalized.length !== 8) {
    return null;
  }

  const channel = (index: number) =>
    Number.parseInt(normalized.slice(index * 2, index * 2 + 2), 16);

  return {
    red: channel(0),
    green: channel(1),
    blue: channel(2),
    alpha: normalized.length === 8 ? channel(3) / 255 : 1,
  };
}

function parseRgb(body: string): Rgb | null {
  const parts = splitComponents(body);

  if (parts.length < 3) {
    return null;
  }

  return {
    red: parseNumber(parts[0], 255),
    green: parseNumber(parts[1], 255),
    blue: parseNumber(parts[2], 255),
    alpha: parseAlpha(parts[3]),
  };
}

function gammaEncode(channel: number): number {
  return channel <= 0.0031308
    ? 12.92 * channel
    : 1.055 * Math.pow(channel, 1 / 2.4) - 0.055;
}

function parseOklch(body: string): Rgb | null {
  const parts = splitComponents(body);

  if (parts.length < 3) {
    return null;
  }

  const lightness = parseNumber(parts[0], 1);
  const chroma = parseNumber(parts[1], 0.4);
  const hue = parts[2] === "none" ? 0 : Number.parseFloat(parts[2]);

  if (![lightness, chroma, hue].every(Number.isFinite)) {
    return null;
  }

  const hueRadians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(hueRadians);
  const b = chroma * Math.sin(hueRadians);
  const long = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return {
    red:
      gammaEncode(
        4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
      ) * 255,
    green:
      gammaEncode(
        -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
      ) * 255,
    blue:
      gammaEncode(
        -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
      ) * 255,
    alpha: parseAlpha(parts[3]),
  };
}

/**
 * Converts the color formats a browser can hand back from `getComputedStyle`
 * for our design tokens (`rgb()` for hex/named tokens, `oklch()` for the rest)
 * into the plain `#rrggbb` Monaco expects. Returns null for anything
 * unparseable or fully transparent so callers can fall back.
 */
export function cssColorToHex(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim().toLowerCase();

  if (trimmed === "transparent" || trimmed === "none") {
    return null;
  }

  const functional = trimmed.match(/^([a-z]+)\((.*)\)$/);
  let parsed: Rgb | null = null;

  if (trimmed.startsWith("#")) {
    parsed = parseHex(trimmed);
  } else if (functional) {
    const [, name, body] = functional;

    if (name === "rgb" || name === "rgba") {
      parsed = parseRgb(body);
    } else if (name === "oklch") {
      parsed = parseOklch(body);
    }
  }

  if (!parsed || parsed.alpha === 0) {
    return null;
  }

  return `#${toHexPair(parsed.red)}${toHexPair(parsed.green)}${toHexPair(parsed.blue)}`;
}

export function withAlpha(hexColor: string, alpha: number): string {
  return `${hexColor}${toHexPair(alpha * 255)}`;
}
