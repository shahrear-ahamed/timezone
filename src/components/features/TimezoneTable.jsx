import React from "react";
import { useTimezones } from "../../hooks/useTimezones";

const resolveDisplayTime = (value) => {
  if (!value) {
    return "—";
  }

  const attempt = new Date(Number(value) || value);
  if (Number.isNaN(attempt.getTime())) {
    return value;
  }

  return attempt.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const TimezoneTable = () => {
  const { data: timezones, isLoading, isError, error } = useTimezones();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-10 h-10 rounded-full border-b-2 border-violet-500 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-700 rounded-3xl border border-red-200 bg-red-50/80">
        Error loading timezones: {error.message}
      </div>
    );
  }

  if (!timezones || timezones.length === 0) {
    return (
      <div className="p-10 text-sm text-center rounded-3xl border border-dashed border-slate-300/60 bg-white/40 text-slate-500 dark:bg-slate-900/50 dark:text-slate-300">
        No snapshots yet. Add one above to get started.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border ring-1 shadow-xl border-white/10 bg-white/80 ring-black/5 dark:bg-slate-900/60">
      <table className="min-w-full text-sm text-left text-slate-600 dark:text-slate-200">
        <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
          <tr>
            <th className="px-6 py-4">Title</th>
            <th className="px-6 py-4">Teammate</th>
            <th className="px-6 py-4">Current time</th>
            <th className="px-6 py-4">Timezone</th>
            <th className="px-6 py-4">Uploaded</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/70 dark:divide-slate-800/60">
          {timezones.map((entry) => {
            const title = entry.title || "Untitled snapshot";
            const username = entry.username || "Unknown teammate";
            const userTime = resolveDisplayTime(entry?.userTime);
            const uploadTime = resolveDisplayTime(entry.uploadTime);
            const timezone = entry.timezone || entry.timezoneLabel || "—";

            return (
              <tr
                key={entry.id || `${title}-${username}-${uploadTime}`}
                className="transition hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
              >
                <td className="px-6 py-4 text-slate-900 dark:text-white">
                  <p className="text-sm font-semibold">{title}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                    Timeline snapshot
                  </p>
                </td>
                <td className="px-6 py-4 text-base font-medium text-slate-700 dark:text-slate-100">
                  {username}
                </td>
                <td className="px-6 py-4 font-mono text-sm text-slate-800 dark:text-slate-100">
                  {userTime}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-200">
                  {timezone}
                </td>
                <td className="px-6 py-4 font-mono text-sm text-slate-500 dark:text-slate-300">
                  {uploadTime}
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
