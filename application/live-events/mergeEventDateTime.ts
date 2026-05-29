export function mergeEventDateTime(date: string, time: string): Date | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date.trim());
  const timeMatch = /^(\d{2}):(\d{2})$/.exec(time.trim());
  if (!dateMatch || !timeMatch) {
    return null;
  }
  const eventDate = new Date(
    parseInt(dateMatch[1], 10),
    parseInt(dateMatch[2], 10) - 1,
    parseInt(dateMatch[3], 10),
    parseInt(timeMatch[1], 10),
    parseInt(timeMatch[2], 10),
    0,
    0
  );
  if (Number.isNaN(eventDate.getTime())) {
    return null;
  }
  return eventDate;
}

export function splitEventDateTime(eventDate: Date): { date: string; time: string } {
  const y = eventDate.getFullYear();
  const m = String(eventDate.getMonth() + 1).padStart(2, "0");
  const d = String(eventDate.getDate()).padStart(2, "0");
  const h = String(eventDate.getHours()).padStart(2, "0");
  const min = String(eventDate.getMinutes()).padStart(2, "0");
  return { date: `${y}-${m}-${d}`, time: `${h}:${min}` };
}
