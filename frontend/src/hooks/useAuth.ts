import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { logout } from '../features/auth/authSlice';

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, status, error } = useSelector((state: RootState) => state.auth);

  return {
    user,
    token,
    isAuthenticated: !!token,
    isLoading: status === 'loading',
    error,
    logout: () => dispatch(logout()),
  };
}
