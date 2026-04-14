/** Safe filename stem for the save dialog. */
export function pdfFilenameFromTitle(title: string): string {
  const stem = title
    .replace(/[^a-zA-Z0-9\s-]+/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
  return stem || "document";
}

/**
 * Fetches a PDF URL and triggers a browser download. If fetch fails (CORS/network), opens the URL in a new tab.
 */
export async function downloadPdfFromUrl(url: string, filenameBase: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(url, { mode: "cors", credentials: "omit" });
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  if (!res.ok) {
    window.open(url, "_blank", "noopener,noreferrer");
    return;
  }
  const blob = await res.blob();
  const safe = pdfFilenameFromTitle(filenameBase);
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = `${safe}.pdf`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}
