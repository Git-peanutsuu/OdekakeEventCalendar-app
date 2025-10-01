import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, AdminLoginRequest } from '@/lib/api';

export function useAdminStatus() {
  return useQuery({
    queryKey: ['/api/admin/status'],
    queryFn: adminApi.getStatus,
    select: (data) => data.isAdmin,
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.login,
    onSuccess: async () => { 
      // データベースへのセッション書き込みが完全に完了するのを待つため、100ミリ秒の遅延を入れる
      await new Promise(resolve => setTimeout(resolve, 100)); 

      // 遅延後にステータスを再確認
      queryClient.invalidateQueries({ queryKey: ['/api/admin/status'] });
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/status'] });
    },
  });
}