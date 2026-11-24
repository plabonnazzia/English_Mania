// Shared helpers — Phase 1 placeholder.
export function cn(...classes: Array<string | false | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
