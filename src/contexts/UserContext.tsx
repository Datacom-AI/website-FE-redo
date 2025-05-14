import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { authApi } from "../lib/api";

export type UserRole = "manufacturer" | "brand" | "retailer";

// Role-specific settings interfaces
interface ManufacturerSettings {
  productionCapacity: number;
  certifications: string[];
  preferredCategories: string[];
  minimumOrderValue: number;
}

interface BrandSettings {
  marketSegments: string[];
  brandValues: string[];
  targetDemographics: string[];
  productCategories: string[];
}

interface RetailerSettings {
  storeLocations: number;
  averageOrderValue: number;
  customerBase: string[];
  preferredCategories: string[];
}

// User profile interface
interface UserData {
  id: string;
  name: string;
  email: string;
  companyName: string;
  role: UserRole;
  profileComplete: boolean;
  createdAt: string;
  lastLogin: string;
  notifications: number;
  avatar?: string; // URL to avatar image
  image?: string; // Alternative URL to user image
  profilePic?: string; // URL to profile picture
  status: "online" | "away" | "busy"; // User's online status
  // Additional profile information
  phone?: string;
  website?: string;
  address?: string;
  description?: string;
  // Role-specific settings based on user role
  manufacturerSettings?: ManufacturerSettings;
  brandSettings?: BrandSettings;
  retailerSettings?: RetailerSettings;
}

interface UserContextType {
  role: UserRole;
  isAuthenticated: boolean;
  user: UserData | null;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  register: (userData: Omit<UserData, "id" | "profileComplete" | "createdAt" | "lastLogin" | "notifications"> & { password: string }) => Promise<void>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
  updateUserProfile: (updatedData: Partial<UserData>) => void;
  updateRoleSettings: <T extends ManufacturerSettings | BrandSettings | RetailerSettings>(settings: Partial<T>) => void;
  updateUserStatus: (status: "online" | "away" | "busy") => void;
  updateUserAvatar: (avatarUrl: string) => void;
  verifyEmail: (email: string, token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [role, setRole] = useState<UserRole>("manufacturer");

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setRole(userData.role);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string, selectedRole?: UserRole): Promise<void> => {
    try {
      const response = await authApi.login({ email, password });
      const userData = response.data;
      
      // Save token to localStorage
      if (userData.token) {
        localStorage.setItem('auth_token', userData.token);
      }
      
      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(userData.user));
      
      // Update state
      setUser(userData.user);
      setRole(userData.user.role);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (userData: Omit<UserData, "id" | "profileComplete" | "createdAt" | "lastLogin" | "notifications"> & { password: string }): Promise<void> => {
    try {
      const response = await authApi.register({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        companyName: userData.companyName,
        role: userData.role,
        confirmPassword: userData.password
      });
      
      const { user, token } = response.data;
      
      // Save token to localStorage
      if (token) {
        localStorage.setItem('auth_token', token);
      }
      
      // Save user data to localStorage
      localStorage.setItem("user", JSON.stringify(user));
      
      // Update state
      setUser(user);
      setRole(user.role);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = (): void => {
    // Clear auth data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("auth_token");
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
  };

  const switchRole = (newRole: UserRole): void => {
    if (user) {
      // Update user with new role
      const updatedUser = {
        ...user,
        role: newRole
      };
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      setRole(newRole);
    }
  };

  const updateUserProfile = (updatedData: Partial<UserData>): void => {
    if (user) {
      // Update user with new profile data
      const updatedUser = {
        ...user,
        ...updatedData,
        lastLogin: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
    }
  };

  const updateRoleSettings = <T extends ManufacturerSettings | BrandSettings | RetailerSettings>(settings: Partial<T>): void => {
    if (!user) return;
    
    authApi.updateRoleSettings(user.role, settings as Record<string, unknown>)
      .then(response => {
        const updatedUser = response.data;
        
        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Update state
        setUser(updatedUser);
      })
      .catch(error => {
        console.error('Failed to update role settings:', error);
      });
  };

  const updateUserStatus = (status: "online" | "away" | "busy"): void => {
    if (user) {
      // Update user status
      const updatedUser = {
        ...user,
        status: status
      };
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
    }
  };

  const updateUserAvatar = (avatarUrl: string): void => {
    if (user) {
      // Update user avatar
      const updatedUser = {
        ...user,
        avatar: avatarUrl
      };
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
    }
  };

  const verifyEmail = async (email: string, token: string): Promise<void> => {
    try {
      await authApi.verifyEmail({ email, token });
      
      // If verification successful, update user data
      if (user) {
        const updatedUser = {
          ...user,
          emailVerified: true,
        };
        
        // Save to localStorage
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Update state
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Email verification failed:', error);
      throw error;
    }
  };

  const resendVerificationEmail = async (email: string): Promise<void> => {
    try {
      await authApi.resendVerification(email);
    } catch (error) {
      console.error('Resend verification failed:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData: any): Promise<void> => {
    try {
      const response = await authApi.updateProfile(profileData);
      const updatedUser = response.data;
      
      // Save updated user data to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      
      // If role was updated, update the role state as well
      if (updatedUser.role && (!user || updatedUser.role !== user.role)) {
        setRole(updatedUser.role);
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        role,
        isAuthenticated, 
        user, 
        login, 
        register, 
        logout,
        switchRole,
        updateUserProfile,
        updateRoleSettings,
        updateUserStatus,
        updateUserAvatar,
        verifyEmail,
        resendVerificationEmail,
        updateProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
