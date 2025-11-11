export const toKstDate = (iso: string) => {
  const d = new Date(iso)
  // KST 보정
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000)
  const m = kst.getMonth() + 1
  const day = kst.getDate()
  return `${m}월 ${day}일`
}

export const toKstTime = (iso: string) => {
  const d = new Date(iso)
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000)
  const hh = String(kst.getHours()).padStart(2, '0')
  const mm = String(kst.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}