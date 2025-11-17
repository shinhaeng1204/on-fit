export const toKstDate = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";

  const m = d.toLocaleString("ko-KR", { month: "numeric", timeZone: "Asia/Seoul" });
  const day = d.toLocaleString("ko-KR", { day: "numeric", timeZone: "Asia/Seoul" });

  return `${m} ${day}`;
}

export const toKstTime = (iso?: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";

  const hh = String(d.toLocaleString("en-US", { hour: "2-digit", hour12: false, timeZone: "Asia/Seoul" })).padStart(2, "0");
  const mm = String(d.toLocaleString("en-US", { minute: "2-digit", timeZone: "Asia/Seoul" })).padStart(2, "0");

  return `${hh}:${mm}`;
}
