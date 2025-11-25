import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTimezones, createTimezone } from '../api/timezoneApi';

export const useTimezones = () => {
  return useQuery({
    queryKey: ['timezones'],
    queryFn: fetchTimezones,
  });
};

export const useCreateTimezone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTimezone,
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['timezones'] });
    },
  });
};
