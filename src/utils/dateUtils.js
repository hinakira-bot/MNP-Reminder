const JST_OFFSET = 9 * 60; // minutes

export function toJST(date) {
  const d = new Date(date);
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc + JST_OFFSET * 60000);
}

export function formatJST(date) {
  const jst = toJST(date);
  const y = jst.getFullYear();
  const m = String(jst.getMonth() + 1).padStart(2, '0');
  const d = String(jst.getDate()).padStart(2, '0');
  const h = String(jst.getHours()).padStart(2, '0');
  const min = String(jst.getMinutes()).padStart(2, '0');
  return `${y}/${m}/${d} ${h}:${min}`;
}

export function daysSince(dateString) {
  const then = new Date(dateString);
  const now = new Date();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

export function nowUTC() {
  return new Date().toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
}
