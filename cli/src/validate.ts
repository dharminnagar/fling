export const RESERVED_NAMES = ["www", "mail", "html", "api", "ftp", "smtp"] as const;

// Lowercase alphanumeric, hyphens allowed in middle, no leading/trailing hyphen
const VALID_NAME = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;

export function validateName(name: string): { ok: true } | { ok: false; error: string } {
  if (!name) return { ok: false, error: "Name cannot be empty" };
  if (name.length > 63) return { ok: false, error: "Name cannot exceed 63 characters" };
  if ((RESERVED_NAMES as readonly string[]).includes(name)) {
    return { ok: false, error: `"${name}" is a reserved name` };
  }
  if (!VALID_NAME.test(name)) {
    return { ok: false, error: "Name must be lowercase alphanumeric with hyphens only (e.g. my-page)" };
  }
  return { ok: true };
}
