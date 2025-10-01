import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, AdminLoginRequest, AdminLoginResponse } from '@/lib/api';

export function useAdminStatus() {
  return useQuery({
    queryKey: ['/api/admin/status'],
    queryFn: adminApi.getStatus,
    select: (data) => data.isAdmin,
    staleTime: 20 * 60 * 1000, 
    gcTime: Infinity, 
  });
}

export function useAdminLogin() {
  const queryClient = useQueryClient();
  
  // 🚨 修正: <AdminLoginResponse, Error, AdminLoginRequest> のように型を指定
  return useMutation<AdminLoginResponse, Error, AdminLoginRequest>({ 
    mutationFn: adminApi.login,
    onSuccess: (data) => {
      // dataが AdminLoginResponse 型として認識される
      queryClient.setQueryData(['/api/admin/status'], { isAdmin: data.isAdmin }); 
    },
  });
}

export function useAdminLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminApi.logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/status'] });
      // 認証ステータスのキャッシュを強制的に無効化
      queryClient.invalidateQueries({ queryKey: ['/api/events'] }); 
      queryClient.invalidateQueries({ queryKey: ['/api/location-tags'] }); 
    },
  });
}