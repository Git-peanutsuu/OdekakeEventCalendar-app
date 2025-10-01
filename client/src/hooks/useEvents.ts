import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventsApi, Event, CreateEventRequest } from '@/lib/api';

export function useEvents() {
  return useQuery<Event[]>({
    queryKey: ['/api/events'],
    queryFn: eventsApi.getAll,
  });
}

export function useEventsByDate(date: string) {
  return useQuery({
    queryKey: ['/api/events', 'date', date],
    queryFn: () => eventsApi.getByDate(date),
    enabled: !!date,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, event }: { id: string; event: Partial<CreateEventRequest> }) => 
      eventsApi.update(id, event),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: eventsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
  });
}