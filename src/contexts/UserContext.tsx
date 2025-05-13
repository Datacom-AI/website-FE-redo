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
  verifyEmail: (email: string, verificationCode: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  updateProfile: (profileData: any) => Promise<void>;
}

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
      // Sử dụng authApi.login thay vì dữ liệu mẫu
      const response = await authApi.login({ email, password });
      
      // Lưu token nhận được từ backend
      localStorage.setItem("auth_token", response.data.accessToken);
      localStorage.setItem("refresh_token", response.data.refreshToken);
      
      // Nếu backend không trả về role, sử dụng selectedRole mặc định
      const userData = {
        ...response.data.user,
        role: response.data.user.role || selectedRole || "manufacturer"
      };
      
      // Lưu thông tin user vào localStorage
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Cập nhật state
      setUser(userData);
      setRole(userData.role);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login error:", error);
      // Xử lý lỗi đăng nhập
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (userData: Omit<UserData, "id" | "profileComplete" | "createdAt" | "lastLogin" | "notifications"> & { password: string }): Promise<void> => {
    try {
      // Sử dụng authApi.register thay vì dữ liệu mẫu
      const response = await authApi.register({
        email: userData.email,
        password: userData.password,
        name: userData.name,
        companyName: userData.companyName,
        role: userData.role
      });
      
      // Nếu đăng ký thành công và backend trả về thông tin user
      // -> Đăng nhập tự động sau khi đăng ký
      if (response.data) {
        // Không đăng nhập tự động vì có thể yêu cầu xác nhận email trước
        // Điều hướng đến trang xác nhận email hoặc đăng nhập
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const logout = (): void => {
    // Xóa token và thông tin user khỏi localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    
    // Cập nhật state
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
    if (user) {
      let updatedUser;
      
      // Update appropriate settings based on role
      if (role === "manufacturer" && user.manufacturerSettings) {
        updatedUser = {
          ...user,
          manufacturerSettings: {
            ...user.manufacturerSettings,
            ...settings
          }
        };
      } else if (role === "brand" && user.brandSettings) {
        updatedUser = {
          ...user,
          brandSettings: {
            ...user.brandSettings,
            ...settings
          }
        };
      } else if (role === "retailer" && user.retailerSettings) {
        updatedUser = {
          ...user,
          retailerSettings: {
            ...user.retailerSettings,
            ...settings
          }
        };
      } else {
        // If settings don't exist yet, create them
        const settingsKey = `${role}Settings` as keyof UserData;
        updatedUser = {
          ...user,
          [settingsKey]: settings
        };
      }
      
      // Save to localStorage
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
    }
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

  const verifyEmail = async (email: string, verificationCode: string): Promise<void> => {
    try {
      // Sử dụng authApi.verifyEmail thay vì dữ liệu mẫu
      await authApi.verifyEmail({
        email,
        token: verificationCode
      });
      
      // Nếu xác minh email thành công, có thể tiến hành đăng nhập
      // hoặc chuyển đến trang xác nhận thành công
    } catch (error) {
      console.error("Email verification error:", error);
      throw new Error(error.response?.data?.message || "Email verification failed");
    }
  };

  const resendVerificationEmail = async (email: string): Promise<void> => {
    try {
      // Sử dụng authApi.resendVerification thay vì dữ liệu mẫu
      await authApi.resendVerification(email);
      
      // Nếu gửi lại email xác minh thành công
    } catch (error) {
      console.error("Resend verification email error:", error);
      throw new Error(error.response?.data?.message || "Failed to resend verification email");
    }
  };

  const updateProfile = async (profileData: any): Promise<void> => {
    try {
      // Sử dụng authApi.updateProfile thay vì cập nhật trực tiếp
      const response = await authApi.updateProfile(profileData);
      
      if (user) {
        // Cập nhật user trong state và localStorage
        const updatedUser = { ...user, ...response.data };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error("Profile update error:", error);
      throw new Error(error.response?.data?.message || "Failed to update profile");
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
