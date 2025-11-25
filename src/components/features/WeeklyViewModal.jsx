import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { fetchDailySubmissions } from "../../api/timezoneApi";

const WeeklyViewModal = ({ isOpen, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data } = useQuery({
    queryKey: ["dailySubmissions"],
    queryFn: fetchDailySubmissions,
    enabled: isOpen,
  });

  if (!isOpen) return null;

  // Helper to get start of the week (Monday)
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const formatDate = (date) => {
    return date.toISOString().split("T")[0];
  };

  const formatDayName = (date) => {
    return date.toLocaleString("default", { weekday: "long" }).toUpperCase();
  };

  const handlePrevWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  // Group submissions by date
  // Data structure: [{ _id: "2025-11-12", submissions: [...] }]
  const submissionsByDate =
    data?.reduce((acc, item) => {
      acc[item._id] = item.submissions;
      return acc;
    }, {}) || {};

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-slate-900 rounded-3xl border border-white/10 shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden text-slate-50">
        {/* Close Button - Absolute positioned */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors bg-slate-900/80 backdrop-blur-sm"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={handlePrevWeek}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium text-sm sm:text-base"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Previous Week</span>
              <span className="sm:hidden">Prev</span>
            </button>
            
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight text-center">
              {startOfWeek.getDate()}{" "}
              {startOfWeek
                .toLocaleString("default", { month: "short" })
                .toUpperCase()}{" "}
              - {weekDays[6].getDate()}{" "}
              {weekDays[6]
                .toLocaleString("default", { month: "short" })
                .toUpperCase()}{" "}
              {weekDays[6].getFullYear()}
            </h2>
            
            <button
              onClick={handleNextWeek}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-medium text-sm sm:text-base"
            >
              <span className="hidden sm:inline">Next Week</span>
              <span className="sm:hidden">Next</span>
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto bg-slate-950 p-6">
          <div className="grid grid-cols-7 gap-4 min-w-[1000px] h-full">
            {weekDays.map((day, index) => {
              const dateKey = formatDate(day);
              const daySubmissions = submissionsByDate[dateKey] || [];
              const isToday = formatDate(new Date()) === dateKey;

              const headerClass = isToday
                ? "bg-violet-600 text-white shadow-lg shadow-violet-500/20"
                : "bg-slate-800/50 text-slate-400 border border-white/5";

              return (
                <div key={index} className="flex flex-col gap-4">
                  {/* Day Header */}
                  <div
                    className={`rounded-2xl p-4 text-center transition-all ${headerClass}`}
                  >
                    <div className="text-xs font-bold uppercase tracking-[0.2em] opacity-80 mb-1">
                      {formatDayName(day).slice(0, 3)}
                    </div>
                    <div className="text-3xl font-bold">{day.getDate()}</div>
                  </div>

                  {/* Submissions List */}
                  <div className="flex flex-col gap-3 h-full">
                    {daySubmissions.map((sub, subIndex) => (
                      <div
                        key={subIndex}
                        className="group relative bg-slate-900 p-4 rounded-2xl border border-white/10 hover:border-violet-500/50 hover:bg-slate-800/80 transition-all duration-300 shadow-lg"
                      >
                        <div className="flex flex-col gap-2">
                          <div>
                            <h4 className="font-semibold text-white group-hover:text-violet-200 transition-colors">
                              {sub.userName || "Unknown User"}
                            </h4>
                            <div className="flex justify-between mt-3 items-start gap-2">
                              <p className="text-xs text-slate-400 mt-0.5">
                                {sub.timezone?.split(" ")[0] || "Timezone"}
                              </p>
                              <p className="text-xs font-mono text-slate-300">
                                {new Date(sub.uploadTime).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Empty State / Placeholder Slots */}
                    {daySubmissions.length === 0 && (
                      <div className="h-32 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-slate-600 text-sm bg-white/5">
                        <span className="opacity-50">No entries</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeeklyViewModal;
