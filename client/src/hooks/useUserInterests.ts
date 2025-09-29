import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userInterestsApi } from '@/lib/api';

export function useUserInterests() {
  return useQuery({
    queryKey: ['/api/user-interests'],
    queryFn: userInterestsApi.get,
    select: (data) => data.interests,
  });
}

export function useToggleUserInterest() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: userInterestsApi.toggle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user-interests'] });
    },
  });
}