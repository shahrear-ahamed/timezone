import React from "react";
import { useTimezones } from "../../hooks/useTimezones";

// Format date with date and time
const formatDateTime = (date, timezone = undefined) => {
  if (!date) return "—";
  return date.toLocaleString(undefined, {
    timeZone: timezone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Format UTC offset from minutes to ±H:MM format
const formatOffset = (offsetMinutes) => {
  if (offsetMinutes === undefined || offsetMinutes === null) return "—";
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absMinutes = Math.abs(offsetMinutes);
  const hours = Math.floor(absMinutes / 60);
  const minutes = absMinutes % 60;
  return `${sign}${hours}:${minutes.toString().padStart(2, "0")}`;
};

// Calculate time difference between two offsets
const calculateTimeDifference = (viewerOffset, userOffset) => {
  if (
    viewerOffset === undefined ||
    viewerOffset === null ||
    userOffset === undefined ||
    userOffset === null
  )
    return "—";
  const diff = viewerOffset - userOffset;
  const sign = diff >= 0 ? "+" : "";
  const hours = diff / 60;
  return `${sign}${hours.toFixed(1)}h`;
};

// Truncate text to max length
const truncate = (text, maxLength) => {
  if (!text) return "N/A";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "…";
};

const TimezoneTable = () => {
  const { data: timezones, isLoading, isError, error } = useTimezones();

  // Get viewer's current timezone offset
  const viewerOffset = -new Date().getTimezoneOffset();

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-10 h-10 rounded-full border-b-2 border-violet-500 animate-spin" />
      </div>
    );

  if (isError)
    return (
      <div className="p-6 text-red-700 rounded-2xl border border-red-200 bg-red-50/80">
        Error loading timezones: {error.message}
      </div>
    );

  if (!timezones || !timezones.length)
    return (
      <div className="p-10 text-sm text-center rounded-2xl border border-dashed border-slate-300/60 bg-white/40 text-slate-500 dark:bg-slate-900/50 dark:text-slate-300">
        No snapshots yet. Add one above to get started.
      </div>
    );

  return (
    <div className="overflow-x-auto rounded-2xl border ring-1 shadow-xl border-white/10 bg-white/80 ring-black/5 dark:bg-slate-900/60">
      <table className="min-w-full text-sm text-left text-slate-600 dark:text-slate-200">
        <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
          <tr>
            <th className="px-4 py-4 whitespace-nowrap">Name</th>
            <th className="px-4 py-4 whitespace-nowrap">Title</th>
            <th className="px-4 py-4 whitespace-nowrap">User's Time</th>
            <th className="px-4 py-4 whitespace-nowrap">Upload Time</th>
            <th className="px-4 py-4 whitespace-nowrap">User Timezone</th>
            <th className="px-4 py-4 whitespace-nowrap">Server Time (UTC)</th>
            <th className="px-4 py-4 whitespace-nowrap">User UTC Gap</th>
            <th className="px-4 py-4 whitespace-nowrap">My Gap from User</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/70 dark:divide-slate-800/60">
          {timezones.map((entry) => {
            const uploadDate = entry.uploadTime
              ? new Date(entry.uploadTime)
              : null;
            const serverDate = entry.createdAt
              ? new Date(entry.createdAt)
              : null;

            const uploadTimeFormatted = formatDateTime(uploadDate);
            const serverTimeFormatted = formatDateTime(serverDate, "UTC");
            const userUtcGap = formatOffset(entry.timezoneOffset);
            const myGapFromUser = calculateTimeDifference(
              viewerOffset,
              entry.timezoneOffset
            );

            return (
              <tr
                key={entry._id}
                className="transition hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
              >
                <td className="px-4 py-4 truncate max-w-[140px] text-slate-900 dark:text-white">
                  {entry.userName || "N/A"}
                </td>
                <td
                  className="px-4 py-4 truncate max-w-[180px] text-slate-900 dark:text-white"
                  title={entry.title}
                >
                  {truncate(entry.title, 20)}
                </td>
                <td className="px-4 py-4 font-medium text-violet-600 whitespace-nowrap dark:text-violet-400">
                  {entry.userTime || "N/A"}
                </td>
                <td className="px-4 py-4 font-mono whitespace-nowrap min-w-[160px]">
                  {uploadTimeFormatted}
                </td>
                <td className="px-4 py-4 truncate max-w-[200px]">
                  {entry.timezone || "N/A"}
                </td>
                <td className="px-4 py-4 font-mono whitespace-nowrap min-w-[160px]">
                  {serverTimeFormatted}
                </td>
                <td className="px-4 py-4 font-mono font-semibold text-blue-600 whitespace-nowrap dark:text-blue-400">
                  {userUtcGap}
                </td>
                <td className="px-4 py-4 font-mono font-semibold text-emerald-600 whitespace-nowrap dark:text-emerald-400">
                  {myGapFromUser}
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
