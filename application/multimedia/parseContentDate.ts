export function parseContentDate(date: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  if (!match) {
    return null;
  }
  const contentDate = new Date(
    parseInt(match[1], 10),
    parseInt(match[2], 10) - 1,
    parseInt(match[3], 10),
    0,
    0,
    0,
    0
  );
  if (Number.isNaN(contentDate.getTime())) {
    return null;
  }
  return contentDate;
}

export function formatContentDate(contentDate: Date): string {
  const y = contentDate.getFullYear();
  const m = String(contentDate.getMonth() + 1).padStart(2, "0");
  const d = String(contentDate.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
