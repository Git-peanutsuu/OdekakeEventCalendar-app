import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { referenceWebsitesApi, CreateReferenceWebsiteRequest } from '@/lib/api';

export function useReferenceWebsites() {
  return useQuery({
    queryKey: ['/api/reference-websites'],
    queryFn: referenceWebsitesApi.getAll,
  });
}

export function useCreateReferenceWebsite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: referenceWebsitesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reference-websites'] });
    },
  });
}

export function useUpdateReferenceWebsite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, website }: { id: string; website: Partial<CreateReferenceWebsiteRequest> }) => 
      referenceWebsitesApi.update(id, website),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reference-websites'] });
    },
  });
}

export function useDeleteReferenceWebsite() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: referenceWebsitesApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reference-websites'] });
    },
  });
}