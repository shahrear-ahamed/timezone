import React from "react";
import { useTimezones } from "../../hooks/useTimezones";

// Format date in local timezone
const formatLocal = (date) =>
  date
    ? date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

// Format date in UTC
const formatUTC = (date) =>
  date
    ? date.toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "UTC",
      })
    : "—";

// Get local timezone offset for a date in UTC+H:MM format
const getLocalOffset = (date) => {
  if (!date) return "—";
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  return `UTC${sign}${hours}:${minutes.toString().padStart(2, "0")}`;
};

const TimezoneTable = () => {
  const { data: timezones, isLoading, isError, error } = useTimezones();

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-10 h-10 rounded-full border-b-2 border-violet-500 animate-spin" />
      </div>
    );

  if (isError)
    return (
      <div className="p-6 text-red-700 border border-red-200 bg-red-50/80">
        Error loading timezones: {error.message}
      </div>
    );

  if (!timezones || !timezones.length)
    return (
      <div className="p-10 text-sm text-center border border-dashed border-slate-300/60 bg-white/40 text-slate-500 dark:bg-slate-900/50 dark:text-slate-300">
        No snapshots yet. Add one above to get started.
      </div>
    );

  return (
    <div className="overflow-x-auto rounded-2xl border ring-1 shadow-xl border-white/10 bg-white/80 ring-black/5 dark:bg-slate-900/60">
      <table className="min-w-full text-sm text-left whitespace-nowrap text-slate-600 dark:text-slate-200">
        <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
          <tr>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Teammate</th>
            <th className="px-6 py-4">Upload Time (Local)</th>
            <th className="px-6 py-4">Timezone</th>
            <th className="px-6 py-4">DB Time (UTC)</th>
            <th className="px-6 py-4">Offset</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/70 dark:divide-slate-800/60">
          {timezones.map((entry) => {
            const uploadDate = entry.uploadTime
              ? new Date(entry.uploadTime)
              : null;
            const dbDate = entry.createdAt ? new Date(entry.createdAt) : null;

            const uploadTimeFormatted = formatLocal(uploadDate);
            const dbTimeFormatted = formatUTC(dbDate);
            const offset = getLocalOffset(uploadDate); // Use local timezone offset

            return (
              <tr
                key={entry._id}
                className="transition hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
              >
                <td className="px-6 py-4 truncate max-w-[180px] text-slate-900 dark:text-white">
                  {entry.title || "N/A"}
                </td>
                <td className="px-6 py-4 truncate max-w-[140px]">
                  {entry.userName || "N/A"}
                </td>
                <td className="px-6 py-4 font-mono truncate min-w-[140px]">
                  {uploadTimeFormatted}
                </td>
                <td className="px-6 py-4 whitespace-normal max-w-[180px]">
                  {entry.timezone || "N/A"}
                </td>
                <td className="px-6 py-4 font-mono truncate min-w-[140px]">
                  {dbTimeFormatted}
                </td>
                <td className="px-6 py-4 font-mono truncate min-w-[80px]">
                  {offset}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TimezoneTable;
