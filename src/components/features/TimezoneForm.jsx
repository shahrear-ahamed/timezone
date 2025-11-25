import React from 'react';
import { useForm } from 'react-hook-form';
import { useCreateTimezone } from '../../hooks/useTimezones';

const TimezoneForm = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const createTimezoneMutation = useCreateTimezone();

  const onSubmit = (data) => {
    createTimezoneMutation.mutate(data, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          Timezone Title
        </label>
        <input
          id="title"
          type="text"
          {...register('title', { required: 'Title is required' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="e.g. America/New_York"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={createTimezoneMutation.isPending}
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {createTimezoneMutation.isPending ? 'Creating...' : 'Create Timezone'}
        </button>
      </div>
      
      {createTimezoneMutation.isError && (
        <div className="text-red-600 text-sm mt-2">
          Error creating timezone: {createTimezoneMutation.error.message}
        </div>
      )}
    </form>
  );
};

export default TimezoneForm;
