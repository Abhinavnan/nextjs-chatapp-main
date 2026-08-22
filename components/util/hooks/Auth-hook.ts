import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import cookies from 'universal-cookie';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

const useAuth = (checkLoging: boolean) => {
  const router = useRouter();
  const isRefreshing = useRef(false);
  const cookie = new cookies();
  const [refreshTimeout, setRefreshTimeout] = useState(cookie.get('refreshTimeout'));
  const sessionTimeout = cookie.get('sessionTimeout');
  const isLogin = !!sessionTimeout;

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

  const handleRefreshSession = async () => {
    if (isRefreshing.current) return;
    isRefreshing.current = true;
    try {
      await fetch('/api/user/authentication/refresh', { method: 'GET' });
      setRefreshTimeout(cookie.get('refreshTimeout'));
    } catch (err) {
      console.error('Refresh session failed:', err);
      setRefreshTimeout(dayjs().add(250, 'milliseconds').toISOString());
    } finally {
      isRefreshing.current = false;
    }
  }

  useEffect(() => {
    if (!sessionTimeout && checkLoging) {
      handleLogout();
    }
    if (sessionTimeout && checkLoging) {
      const duration = Date.parse(sessionTimeout) - Date.now();
      const timeout = setTimeout(() => handleLogout(), duration);
      return () => clearTimeout(timeout);
    }
  }, [sessionTimeout, checkLoging]);

  useEffect(() => {
    if (refreshTimeout && isLogin) {
      const duration = dayjs(refreshTimeout).valueOf() - dayjs().valueOf();
      const timeout = setTimeout(() => handleRefreshSession(), duration);
      return () => clearTimeout(timeout);
    }
  }, [refreshTimeout, isLogin]);

  return { isLogin, handleLogout, handleRefreshSession };
};

export default useAuth;