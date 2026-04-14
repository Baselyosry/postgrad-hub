/**
 * Some CMS / copy-paste flows store literal "\n" (backslash + n) instead of newline characters.
 * Real newlines are left unchanged so whitespace-pre-wrap still works.
 */
export function normalizeMultiline(input: string): string {
  if (!input) return input;
  return input.replaceAll("\\r\\n", "\n").replaceAll("\\n", "\n").replaceAll("\\r", "\n");
}
