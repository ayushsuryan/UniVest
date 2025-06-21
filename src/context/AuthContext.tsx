import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AuthService from '../graphql/auth';

// Types
interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isEmailVerified: boolean;
  profilePicture?: string;
  createdAt: string;
  lastLogin?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<AuthResult>;
  signup: (userData: SignupData) => Promise<AuthResult>;
  verifyOTP: (email: string, otp: string) => Promise<AuthResult>;
  resendOTP: (email: string) => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (email: string, otp: string, newPassword: string) => Promise<AuthResult>;
  logout: () => Promise<void>;
  updateProfile: (profileData: any) => Promise<AuthResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  refreshUserData: () => Promise<void>;
}

interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
  isEmailNotVerified?: boolean;
  isInvalidCredentials?: boolean;
  remainingAttempts?: number;
  isInvalidOTP?: boolean;
}

interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
}

// Action Types
type AuthAction =
  | { type: 'INITIALIZE_START' }
  | { type: 'INITIALIZE_SUCCESS'; payload: { user: User | null; token: string | null } }
  | { type: 'INITIALIZE_FAILURE' }
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'SIGNUP_START' }
  | { type: 'SIGNUP_SUCCESS' }
  | { type: 'SIGNUP_FAILURE' }
  | { type: 'VERIFY_OTP_START' }
  | { type: 'VERIFY_OTP_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'VERIFY_OTP_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: { user: User } }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial State
const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'INITIALIZE_START':
      return {
        ...state,
        isLoading: true,
        isInitialized: false,
      };

    case 'INITIALIZE_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.user && !!action.payload.token,
        isLoading: false,
        isInitialized: true,
      };

    case 'INITIALIZE_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      };

    case 'LOGIN_START':
    case 'SIGNUP_START':
    case 'VERIFY_OTP_START':
      return {
        ...state,
        isLoading: true,
      };

    case 'LOGIN_SUCCESS':
    case 'VERIFY_OTP_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };

    case 'LOGIN_FAILURE':
    case 'SIGNUP_FAILURE':
    case 'VERIFY_OTP_FAILURE':
      return {
        ...state,
        isLoading: false,
      };

    case 'SIGNUP_SUCCESS':
      return {
        ...state,
        isLoading: false,
      };

    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };

    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload.user,
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    default:
      return state;
  }
};

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication state
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      dispatch({ type: 'INITIALIZE_START' });

      // Check if user is logged in
      const isLoggedIn = await AuthService.isLoggedIn();
      
      if (isLoggedIn) {
        // Get stored user data
        const userData = await AuthService.getStoredUserData();
        
        if (userData) {
          // Verify token is still valid by making a profile request
          const profileResult = await AuthService.getProfile();
          
          if (profileResult.success && profileResult.user) {
            dispatch({
              type: 'INITIALIZE_SUCCESS',
              payload: { user: profileResult.user, token: 'valid' }
            });
          } else {
            // Token is invalid, clear storage
            await AuthService.logout();
            dispatch({ type: 'INITIALIZE_FAILURE' });
          }
        } else {
          dispatch({ type: 'INITIALIZE_FAILURE' });
        }
      } else {
        dispatch({ type: 'INITIALIZE_FAILURE' });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      dispatch({ type: 'INITIALIZE_FAILURE' });
    }
  };

  const login = async (email: string, password: string): Promise<AuthResult> => {
    try {
      dispatch({ type: 'LOGIN_START' });

      const result = await AuthService.login(email, password);

      if (result.success && result.user && result.token) {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { user: result.user, token: result.token }
        });
        
        return {
          success: true,
          message: result.message,
          user: result.user,
          token: result.token
        };
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
        
        return {
          success: false,
          message: result.message,
          isEmailNotVerified: result.isEmailNotVerified,
          isInvalidCredentials: result.isInvalidCredentials
        };
      }
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      return {
        success: false,
        message: 'Login failed. Please try again.',
      };
    }
  };

  const signup = async (userData: SignupData): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SIGNUP_START' });

      const result = await AuthService.signup(userData);

      if (result.success) {
        dispatch({ type: 'SIGNUP_SUCCESS' });
        
        return {
          success: true,
          message: result.message,
          user: result.user
        };
      } else {
        dispatch({ type: 'SIGNUP_FAILURE' });
        
        return {
          success: false,
          message: result.message
        };
      }
    } catch (error) {
      dispatch({ type: 'SIGNUP_FAILURE' });
      return {
        success: false,
        message: 'Signup failed. Please try again.',
      };
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<AuthResult> => {
    try {
      dispatch({ type: 'VERIFY_OTP_START' });

      const result = await AuthService.verifyOTP(email, otp);

      if (result.success && result.user && result.token) {
        dispatch({
          type: 'VERIFY_OTP_SUCCESS',
          payload: { user: result.user, token: result.token }
        });
        
        return {
          success: true,
          message: result.message,
          user: result.user,
          token: result.token
        };
      } else {
        dispatch({ type: 'VERIFY_OTP_FAILURE' });
        
        return {
          success: false,
          message: result.message,
          remainingAttempts: result.remainingAttempts
        };
      }
    } catch (error) {
      dispatch({ type: 'VERIFY_OTP_FAILURE' });
      return {
        success: false,
        message: 'OTP verification failed. Please try again.',
      };
    }
  };

  const resendOTP = async (email: string): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const result = await AuthService.resendOTP(email);

      dispatch({ type: 'SET_LOADING', payload: false });

      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return {
        success: false,
        message: 'Failed to resend OTP. Please try again.',
      };
    }
  };

  const forgotPassword = async (email: string): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const result = await AuthService.forgotPassword(email);

      dispatch({ type: 'SET_LOADING', payload: false });

      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return {
        success: false,
        message: 'Failed to send reset code. Please try again.',
      };
    }
  };

  const resetPassword = async (email: string, otp: string, newPassword: string): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const result = await AuthService.resetPassword(email, otp, newPassword);

      dispatch({ type: 'SET_LOADING', payload: false });

      return {
        success: result.success,
        message: result.message,
        isInvalidOTP: result.isInvalidOTP
      };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return {
        success: false,
        message: 'Password reset failed. Please try again.',
      };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AuthService.logout();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      dispatch({ type: 'LOGOUT' });
    }
  };

  const updateProfile = async (profileData: any): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const result = await AuthService.updateProfile(profileData);

      if (result.success && result.user) {
        dispatch({
          type: 'UPDATE_USER',
          payload: { user: result.user }
        });
      }

      dispatch({ type: 'SET_LOADING', payload: false });

      return {
        success: result.success,
        message: result.message,
        user: result.user
      };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return {
        success: false,
        message: 'Failed to update profile. Please try again.',
      };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<AuthResult> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const result = await AuthService.changePassword(currentPassword, newPassword);

      dispatch({ type: 'SET_LOADING', payload: false });

      return {
        success: result.success,
        message: result.message
      };
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return {
        success: false,
        message: 'Failed to change password. Please try again.',
      };
    }
  };

  const refreshUserData = async (): Promise<void> => {
    try {
      const result = await AuthService.getProfile();
      
      if (result.success && result.user) {
        dispatch({
          type: 'UPDATE_USER',
          payload: { user: result.user }
        });
      }
    } catch (error) {
      console.error('Failed to refresh user data:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    login,
    signup,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    logout,
    updateProfile,
    changePassword,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext; 