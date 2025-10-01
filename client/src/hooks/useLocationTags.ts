import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { locationTagsApi, LocationTag, CreateLocationTagRequest } from '@/lib/api';

// Get all location tags
export function useLocationTags() {
  return useQuery({
    queryKey: ['/api/location-tags'],
    queryFn: locationTagsApi.getAll,
    staleTime: 20 * 60 * 1000, 
    gcTime: Infinity, 
  });
}

// Create location tag mutation
export function useCreateLocationTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: locationTagsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/location-tags'] });
    },
  });
}

// Update location tag mutation  
export function useUpdateLocationTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateLocationTagRequest> }) => 
      locationTagsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/location-tags'] });
    },
  });
}

// Delete location tag mutation
export function useDeleteLocationTag() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: locationTagsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/location-tags'] });
    },
  });
}