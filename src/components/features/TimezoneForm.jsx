import { Clock8 } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useCreateTimezone } from "../../hooks/useTimezones";

const TimezoneForm = ({ onSuccess }) => {
  const detectTimezone = useMemo(() => {
    return () => {
      try {
        const tzId = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        if (!tzId) return { id: "", label: "", offset: 0 };

        const timeZoneParts = new Intl.DateTimeFormat("en-US", {
          timeZone: tzId,
          timeZoneName: "longGeneric",
        })
          .formatToParts(new Date())
          .find((part) => part.type === "timeZoneName");

        const label = timeZoneParts?.value
          ? `${timeZoneParts.value} (${tzId})`
          : tzId;

        // Get UTC offset in minutes
        const offset = -new Date().getTimezoneOffset();

        return { id: tzId, label, offset };
      } catch (error) {
        console.error("Failed to detect timezone:", error);
        return { id: "", label: "", offset: 0 };
      }
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      title: "",
      userName: "",
      userTime: "",
      timezone: "",
    },
  });

  const [timezoneInfo, setTimezoneInfo] = useState(() => detectTimezone());

  useEffect(() => {
    setValue("timezone", timezoneInfo.label || timezoneInfo.id || "");
  }, [timezoneInfo, setValue]);

  const createTimezoneMutation = useCreateTimezone();

  const onSubmit = (data) => {
    const now = new Date();
    const uploadTimeUTC = new Date(now.toISOString());
    const uploadTime = new Date(now.toString());

    createTimezoneMutation.mutate(
      {
        title: data.title.trim(),
        userName: data.userName.trim(),
        userTime: data.userTime.trim(),
        timezone: data.timezone.trim() || timezoneInfo.label || timezoneInfo.id,
        timezoneOffset: timezoneInfo.offset,
        uploadTime: uploadTime.toISOString(),
        uploadTimeUTC: uploadTimeUTC.toISOString(),
      },
      {
        onSuccess: () => {
          setTimezoneInfo(detectTimezone());
          reset({
            title: "",
            userName: "",
            userTime: "",
            timezone: timezoneInfo.label || timezoneInfo.id || "",
          });
          onSuccess?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <label
          htmlFor="title"
          className="text-sm font-semibold text-slate-700 dark:text-slate-100"
        >
          Timezone title
        </label>
        <input
          id="title"
          type="text"
          {...register("title", { required: "Give this entry a title" })}
          className="px-4 py-3 w-full text-sm bg-white rounded-2xl border shadow-sm border-slate-200 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          placeholder="Product launch stand-up"
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="userName"
          className="text-sm font-semibold text-slate-700 dark:text-slate-100"
        >
          Teammate name
        </label>
        <input
          id="userName"
          type="text"
          {...register("userName", { required: "Please enter a name" })}
          className="px-4 py-3 w-full text-sm bg-white rounded-2xl border shadow-sm border-slate-200 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          placeholder="e.g., Aisha Rahman"
        />
        {errors.userName && (
          <p className="text-sm text-red-500">{errors.userName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="userTime"
          className="text-sm font-semibold text-slate-700 dark:text-slate-100"
        >
          Current time (e.g., 01:30 PM)
        </label>
        <div className="flex flex-row gap-1 items-stretch">
          <input
            id="userTime"
            type="text"
            {...register("userTime", {
              required: "Provide the teammate's current time",
              minLength: {
                value: 4,
                message: "Time string feels too short",
              },
            })}
            className="inline-block px-4 py-3 pr-12 w-full text-sm bg-white rounded-2xl border shadow-sm border-slate-200 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            placeholder="01:30 PM"
          />
          <div className="inline-block">
            <button
              type="button"
              aria-label="Use current browser time"
              onClick={() => {
                const formatted = new Intl.DateTimeFormat("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                }).format(new Date());
                setValue("userTime", formatted, { shouldValidate: true });
              }}
              className="inline-block px-3 h-full rounded-xl transition hover:cursor-pointer bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <Clock8 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-slate-500">
          Use any readable format. e.g., 09:15 AM or 18:45 CET
        </p>
        {errors.userTime && (
          <p className="text-sm text-red-500">{errors.userTime.message}</p>
        )}
      </div>

      <div className="p-4 space-y-2 text-sm rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Browser timezone
            </p>
            <p className="font-medium text-slate-900 dark:text-white">
              {timezoneInfo.label || "Detecting…"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const next = detectTimezone();
              setTimezoneInfo(next);
            }}
            className="inline-flex justify-center items-center px-4 py-2 text-xs font-semibold rounded-xl border transition hover:cursor-pointer border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-800"
          >
            Refresh timezone
          </button>
        </div>
        <input
          type="hidden"
          {...register("timezone")}
          value={timezoneInfo.label || timezoneInfo.id}
        />
      </div>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
        {createTimezoneMutation.isError && (
          <p className="text-sm text-red-500">
            Error: {createTimezoneMutation.error.message}
          </p>
        )}
        <button
          type="submit"
          disabled={createTimezoneMutation.isPending}
          className="inline-flex justify-center items-center px-5 py-3 text-sm font-semibold text-white bg-violet-500 rounded-2xl shadow-lg transition shadow-violet-500/30 hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-violet-400"
        >
          {createTimezoneMutation.isPending ? "Posting…" : "Share snapshot"}
        </button>
      </div>
    </form>
  );
};

export default TimezoneForm;
