import React, { useEffect, useRef, useState } from "react";
import { useTimezones } from "../../hooks/useTimezones";
import AnimatedBorder from "../ui/AnimatedBorder";

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
  const {
    data: timezones,
    isLoading,
    isError,
    error,
    refetch,
  } = useTimezones();
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const containerRef = useRef(null);
  const ITEMS_PER_PAGE = 10;

  // Get viewer's current timezone offset
  const viewerOffset = -new Date().getTimezoneOffset();

  // Measure container dimensions
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Auto-refetch every 60 seconds with progress animation
  useEffect(() => {
    const REFETCH_INTERVAL = 60000; // 60 seconds
    const ANIMATION_FRAME = 50; // Update every 50ms for smooth animation
    const totalFrames = REFETCH_INTERVAL / ANIMATION_FRAME;

    let frameCount = 0;

    // Progress animation interval
    const progressInterval = setInterval(() => {
      frameCount++;
      const newProgress = (frameCount / totalFrames) * 100;
      setProgress(newProgress);

      // Refetch when progress reaches 100%
      if (frameCount >= totalFrames) {
        refetch();
        frameCount = 0;
        setProgress(0);
      }
    }, ANIMATION_FRAME);

    return () => clearInterval(progressInterval);
  }, [refetch]);

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

  // Pagination Logic
  const totalItems = timezones.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentItems = timezones.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        ref={containerRef}
        className="relative rounded-2xl ring-1 shadow-xl bg-white/80 ring-black/5 dark:bg-slate-900/60"
      >
        {/* Animated border overlay */}
        <AnimatedBorder
          progress={progress}
          width={dimensions.width}
          height={dimensions.height}
        />

        <div className="overflow-x-auto rounded-2xl">
          <table className="relative min-w-full text-sm text-left text-slate-600 dark:text-slate-200">
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
            {currentItems.map((entry) => {
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
                  <td className="px-4 py-4 truncate min-w-[140px] text-slate-900 dark:text-white">
                    {entry.userName || "N/A"}
                  </td>
                  <td
                    className="px-4 py-4 truncate min-w-[180px] text-slate-900 dark:text-white"
                    title={entry.title}
                  >
                    {truncate(entry.title, 20)}
                  </td>
                  <td className="px-4 py-4 text-center font-medium text-violet-600 whitespace-nowrap dark:text-violet-400">
                    {entry.userTime || "N/A"}
                  </td>
                  <td className="px-4 py-4 font-mono whitespace-nowrap min-w-[160px]">
                    {uploadTimeFormatted}
                  </td>
                  <td className="px-4 py-4 truncate min-w-[200px]">
                    {entry.timezone || "N/A"}
                  </td>
                  <td className="px-4 py-4 font-mono whitespace-nowrap min-w-[160px]">
                    {serverTimeFormatted}
                  </td>
                  <td className="px-4 py-4 text-center font-mono font-semibold text-blue-600 whitespace-nowrap dark:text-blue-400">
                    {userUtcGap}
                  </td>
                  <td className="px-4 py-4 text-center font-mono font-semibold text-emerald-600 whitespace-nowrap dark:text-emerald-400">
                    {myGapFromUser}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-4 py-3 bg-white/5 rounded-xl border border-white/10">
          <div className="text-sm text-slate-400">
            Showing{" "}
            <span className="font-medium text-white">{startIndex + 1}</span> to{" "}
            <span className="font-medium text-white">
              {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}
            </span>{" "}
            of <span className="font-medium text-white">{totalItems}</span>{" "}
            results
          </div>
          <div className="flex gap-2">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm font-medium text-white bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm font-medium text-white bg-slate-800 rounded-lg border border-slate-700 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimezoneTable;
