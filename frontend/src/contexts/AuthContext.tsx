import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '@/lib/api';
import { toast } from 'sonner';

interface User {
  _id?: string;
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  role?: string;
  status?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Clean up any localStorage tokens on mount (we use HttpOnly cookies, not localStorage)
  useEffect(() => {
    // Remove any auth-related tokens from localStorage
    const authKeys = ['auth-token', 'authToken', 'accessToken', 'refreshToken', 'token'];
    authKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await authAPI.getMe();
      // Backend returns: { success: true, data: { user: {...} } }
      const userData = response.data?.data?.user || response.data?.user;
      if (userData) {
        // Combine firstName and lastName into name for display
        if (userData.firstName || userData.lastName) {
          userData.name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
        }
        setUser(userData);
      }
    } catch (error: any) {
      // Only set user to null, don't redirect here
      // Redirects are handled by the API interceptor for protected routes only
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await authAPI.login({ email, password, rememberMe });
      // Backend returns: { success: true, data: { user: {...} } }
      const userData = response.data?.data?.user || response.data?.user;
      if (userData) {
        // Combine firstName and lastName into name for display
        if (userData.firstName || userData.lastName) {
          userData.name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
        }
        setUser(userData);
        toast.success('Welcome back!');
        return { success: true };
      } else {
        throw new Error('User data not found in response');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Split name into firstName and lastName
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || nameParts[0] || '';
      
      const response = await authAPI.register({ 
        firstName, 
        lastName, 
        email, 
        password 
      });
      
      // Backend returns: { success: true, data: { user: {...} } }
      // So we need: response.data.data.user
      const userData = response.data?.data?.user || response.data?.user;
      
      if (!userData) {
        throw new Error('User data not found in response');
      }
      // Combine firstName and lastName into name for display
      if (userData.firstName || userData.lastName) {
        userData.name = `${userData.firstName || ''} ${userData.lastName || ''}`.trim();
      }
      setUser(userData);
      toast.success('Account created successfully!');
      
      return { success: true };
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
      
      // Clean up any localStorage tokens (we use HttpOnly cookies, but clear localStorage as well)
      const authKeys = ['auth-token', 'authToken', 'accessToken', 'refreshToken', 'token'];
      authKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });
      
      toast.success('Logged out successfully');
      // Navigate to home page after logout
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      
      // Clean up localStorage even if API call fails
      const authKeys = ['auth-token', 'authToken', 'accessToken', 'refreshToken', 'token'];
      authKeys.forEach(key => {
        if (localStorage.getItem(key)) {
          localStorage.removeItem(key);
        }
      });
      
      // Navigate to home page even if logout API call fails
      window.location.href = '/';
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

