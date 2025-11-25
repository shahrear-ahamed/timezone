import React from "react";
import { useForm } from "react-hook-form";
import { useCreateTimezone } from "../../hooks/useTimezones";

const TimezoneForm = ({ onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      title: "",
      username: "",
      currentTime: "",
    },
  });

  const createTimezoneMutation = useCreateTimezone();

  const onSubmit = (data) => {
    createTimezoneMutation.mutate(
      {
        title: data.title.trim(),
        username: data.username.trim(),
        currentTime: data.currentTime.trim(),
      },
      {
        onSuccess: () => {
          reset({ title: "", username: "", currentTime: "" });
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
          htmlFor="username"
          className="text-sm font-semibold text-slate-700 dark:text-slate-100"
        >
          Teammate name
        </label>
        <input
          id="username"
          type="text"
          {...register("username", { required: "Please enter a name" })}
          className="px-4 py-3 w-full text-sm bg-white rounded-2xl border shadow-sm border-slate-200 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          placeholder="e.g., Aisha Rahman"
        />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label
          htmlFor="currentTime"
          className="text-sm font-semibold text-slate-700 dark:text-slate-100"
        >
          Current time (e.g., 01:30 PM)
        </label>
        <input
          id="currentTime"
          type="text"
          {...register("currentTime", {
            required: "Provide the teammate’s current time",
            minLength: {
              value: 4,
              message: "Time string feels too short",
            },
          })}
          className="px-4 py-3 w-full text-sm bg-white rounded-2xl border shadow-sm border-slate-200 text-slate-900 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
          placeholder="01:30 PM"
        />
        <p className="text-xs text-slate-500">
          Use any readable format. Examples: 09:15 AM, 18:45 CET,
          2025-11-25T09:00.
        </p>
        {errors.currentTime && (
          <p className="text-sm text-red-500">{errors.currentTime.message}</p>
        )}
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
