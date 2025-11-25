import React, { useState } from "react";
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

// Extract IANA timezone from string like "GMT+6 (Asia/Dhaka)"
function extractIanaTimezone(tzString) {
  if (!tzString) return null;
  const match = tzString.match(/\(([^)]+)\)/);
  return match ? match[1] : null;
}

// Parse user's upload time and format it in their timezone
function parseUserTime(uploadTime, userTimezone) {
  try {
    if (!uploadTime) return "—";
    
    const iana = extractIanaTimezone(userTimezone);
    if (!iana) return "—";

    const date = new Date(uploadTime);
    if (isNaN(date.getTime())) return "—";

    // Format the date in user's timezone
    return date.toLocaleString(undefined, {
      timeZone: iana,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("Error parsing user time:", error);
    return "—";
  }
}

const TimezoneTable = () => {
  const {
    data: timezones,
    isLoading,
    isError,
    error,
  } = useTimezones();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // Column order state with localStorage persistence
  const defaultColumns = [
    { id: 'name', label: 'Name' },
    { id: 'title', label: 'Title' },
    { id: 'userTime', label: "User's Time" },
    { id: 'userUploadedTime', label: 'User Uploaded Time' },
    { id: 'uploadTime', label: 'Upload Time Our Zone' },
    { id: 'timezone', label: 'User Timezone' },
    { id: 'serverTime', label: 'Server Time (UTC)' },
    { id: 'userUtcGap', label: 'User UTC Gap' },
    { id: 'myGap', label: 'My Gap from User' },
  ];
  
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem("columnOrder");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultColumns;
      }
    }
    return defaultColumns;
  });
  
  const [draggedColumn, setDraggedColumn] = useState(null);

  // Get viewer's current timezone offset
  const viewerOffset = -new Date().getTimezoneOffset();



  // Column drag handlers
  const handleDragStart = (e, columnId) => {
    console.log('Drag started:', columnId);
    setDraggedColumn(columnId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetColumnId) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Drop triggered. Dragged:', draggedColumn, 'Target:', targetColumnId);
    
    if (!draggedColumn || draggedColumn === targetColumnId) {
      console.log('Same column or no dragged column, skipping');
      setDraggedColumn(null);
      return;
    }

    const draggedIndex = columns.findIndex(col => col.id === draggedColumn);
    const targetIndex = columns.findIndex(col => col.id === targetColumnId);

    console.log('Indices - Dragged:', draggedIndex, 'Target:', targetIndex);

    const newColumns = [...columns];
    const [removed] = newColumns.splice(draggedIndex, 1);
    newColumns.splice(targetIndex, 0, removed);

    console.log('New column order:', newColumns);
    setColumns(newColumns);
    localStorage.setItem('columnOrder', JSON.stringify(newColumns));
    console.log('Column order saved to localStorage');
    setDraggedColumn(null);
  };

  const handleDragEnd = () => {
    console.log('Drag ended');
    setDraggedColumn(null);
  };

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

  // Render cell content based on column id
  const renderCellContent = (columnId, entry) => {
    const uploadDate = entry.uploadTime ? new Date(entry.uploadTime) : null;
    const serverDate = entry.createdAt ? new Date(entry.createdAt) : null;
    const uploadTimeFormatted = formatDateTime(uploadDate);
    const serverTimeFormatted = formatDateTime(serverDate, "UTC");
    const userUtcGap = formatOffset(entry.timezoneOffset);
    const myGapFromUser = calculateTimeDifference(viewerOffset, entry.timezoneOffset);
    const userUploadedTimeFormatted = parseUserTime(entry.uploadTime, entry.timezone);

    switch (columnId) {
      case 'name':
        return <span className="text-slate-900 dark:text-white">{entry.userName || "N/A"}</span>;
      case 'title':
        return <span className="text-slate-900 dark:text-white" title={entry.title}>{truncate(entry.title, 20)}</span>;
      case 'userTime':
        return <span className="font-medium text-violet-600 dark:text-violet-400">{entry.userTime || "N/A"}</span>;
      case 'userUploadedTime':
        return <span className="font-mono">{userUploadedTimeFormatted}</span>;
      case 'uploadTime':
        return <span className="font-mono">{uploadTimeFormatted}</span>;
      case 'timezone':
        return entry.timezone || "N/A";
      case 'serverTime':
        return <span className="font-mono">{serverTimeFormatted}</span>;
      case 'userUtcGap':
        return <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{userUtcGap}</span>;
      case 'myGap':
        return <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">{myGapFromUser}</span>;
      default:
        return "—";
    }
  };

  // Get cell className based on column id
  const getCellClassName = (columnId) => {
    const base = "px-4 py-4";
    switch (columnId) {
      case 'name':
        return `${base} truncate min-w-[140px]`;
      case 'title':
        return `${base} truncate min-w-[180px]`;
      case 'userTime':
        return `${base} text-center whitespace-nowrap`;
      case 'userUploadedTime':
      case 'uploadTime':
      case 'serverTime':
        return `${base} whitespace-nowrap min-w-[160px]`;
      case 'timezone':
        return `${base} truncate min-w-[200px]`;
      case 'userUtcGap':
      case 'myGap':
        return `${base} text-center whitespace-nowrap`;
      default:
        return base;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative rounded-2xl ring-1 shadow-xl bg-white/80 ring-black/5 dark:bg-slate-900/60 border border-white/10">

        <div className="overflow-x-auto rounded-2xl">
          <table className="relative min-w-full text-sm text-left text-slate-600 dark:text-slate-200">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:bg-slate-900/40 dark:text-slate-400">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, column.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, column.id)}
                    onDragEnd={handleDragEnd}
                    className={`px-4 py-4 whitespace-nowrap cursor-grab active:cursor-grabbing select-none transition-colors ${
                      draggedColumn === column.id ? 'opacity-50 bg-violet-100 dark:bg-violet-900/30' : ''
                    }`}
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70 dark:divide-slate-800/60">
              {currentItems.map((entry) => (
                <tr
                  key={entry._id}
                  className="transition hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                >
                  {columns.map((column) => (
                    <td key={column.id} className={getCellClassName(column.id)}>
                      {renderCellContent(column.id, entry)}
                    </td>
                  ))}
                </tr>
              ))}
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
