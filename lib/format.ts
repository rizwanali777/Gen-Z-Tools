export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  const digits = index === 0 ? 0 : value >= 10 ? 0 : 1;
  return `${value.toFixed(digits)} ${units[index]}`;
}

export function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const minutes = Math.floor(total / 60);
  const remain = total % 60;
  return `${minutes}:${remain.toString().padStart(2, "0")}`;
}

export function formatMinutes(minutes: number, words: number): string {
  if (words === 0) return "0 min";
  if (minutes < 1) return "< 1 min";
  return `${Math.round(minutes)} min`;
}

export function formatQuantity(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs !== 0 && (abs < 0.000001 || abs >= 1e12)) {
    return value.toExponential(6);
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 8 }).format(value);
}
