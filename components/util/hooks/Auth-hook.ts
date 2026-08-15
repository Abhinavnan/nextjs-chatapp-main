import { useEffect, useRef } from 'react';
import cookies from 'universal-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const useAuth = (checkLoging: boolean) => {
  const router = useRouter();
  const isRefreshing = useRef(false);
  const cookie = new cookies();
  const isLogin = cookie.get('login');
  const isRefresh = cookie.get('authId');

  const handleLogout = () => {
    fetch('/api/user/authentication/logout', { method: 'DELETE' }).then(() => {
      if (isLogin) {
        toast.success('Logout successful');
      } else {
        toast.error('User session expired.\n Please login again.');
      }
    }).catch((err) => {
      console.error('Logout failed:', err);
    });
    router.push('/');
  }

  const handleRefreshSession = () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    fetch('/api/user/authentication/refresh').catch((err) => console.error(err)).finally(() => isRefreshing.current = false);
  }

  useEffect(() => {
    if (!isLogin && checkLoging) {
      handleLogout();
    }
  }, [isLogin]);

  useEffect(() => {
    if (!isRefresh && isLogin) {
      handleRefreshSession();
    }
  }, [isRefresh]);

  return { isLogin, handleLogout, handleRefreshSession };
};

export default useAuth;