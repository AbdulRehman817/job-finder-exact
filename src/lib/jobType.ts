export type CanonicalJobType =
  | "full-time"
  | "part-time"
  | "internship"
  | "remote"
  | "contract";

const TYPE_ALIASES: Record<string, CanonicalJobType> = {
  "full-time": "full-time",
  fulltime: "full-time",
  "full time": "full-time",
  "part-time": "part-time",
  parttime: "part-time",
  "part time": "part-time",
  internship: "internship",
  intership: "internship",
  intern: "internship",
  internee: "internship",
  remote: "remote",
  contract: "contract",
};

const sanitize = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-");

export const parseJobType = (value: unknown): CanonicalJobType | null => {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const sanitized = sanitize(trimmed);

  if (TYPE_ALIASES[sanitized]) {
    return TYPE_ALIASES[sanitized];
  }

  if (sanitized.includes("intern")) {
    return "internship";
  }

  return null;
};

export const normalizeJobType = (value: unknown): CanonicalJobType => {
  return parseJobType(value) ?? "full-time";
};