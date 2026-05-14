export function formatDuration(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms)) return "--";
  const seconds = Math.max(0, Math.round(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  if (minutes === 0) return `${remaining}s`;
  return `${minutes}m ${String(remaining).padStart(2, "0")}s`;
}
