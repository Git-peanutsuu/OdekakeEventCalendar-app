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
    // 🚨 修正: onSuccess を async に変更し、setTimeout で遅延を挿入
    onSuccess: async () => { 
      // サーバーがセッションを確実にコミットする時間を確保するため、100ミリ秒待機する
      await new Promise(resolve => setTimeout(resolve, 100)); 

      // 遅延後に、最新のセッション情報を取りに行く
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