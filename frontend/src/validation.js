export function academicYear(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "numeric",
  }).formatToParts(now);
  const year = Number(parts.find((p) => p.type === "year").value);
  const month = Number(parts.find((p) => p.type === "month").value);
  return year - 1911 - (month < 8 ? 1 : 0);
}

export function studentIdError(value, now = new Date()) {
  if (!/^[0-9]{9}$/.test(value)) return "請輸入 9 碼數字的中央大學學號。";
  const year = Number(value.slice(0, 3));
  const latest = academicYear(now);
  if (year < 100 || year > latest)
    return `學號前 3 碼（入學學年度）須介於 100 到 ${latest}。`;
  if (!/[1-8]/.test(value[3])) return "學號第 4 碼（學院代碼）必須是 1 到 8。";
  if (!/[0235]/.test(value[4]))
    return "學號第 5 碼（學制）必須是 0、2、3 或 5。";
  return "";
}

// API 未帶時區的時間依校園系統的台灣時間解讀，不受訪客電腦時區影響。
export function apiDate(value) {
  return new Date(
    value && !/(Z|[+-]\d{2}:\d{2})$/i.test(value) ? `${value}+08:00` : value,
  );
}
