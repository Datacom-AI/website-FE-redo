import {
  FC,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useCallback,
  KeyboardEvent,
} from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "react-i18next";
import {
  Factory,
  Package,
  Truck,
  BarChart3,
  Settings,
  LogOut,
  Warehouse,
  Users,
  Menu,
  X,
  Home,
  PanelLeft,
  PanelRight,
  Bell,
  MessageSquare,
  HelpCircle,
  Building,
  Shield,
  Moon,
  Sun,
  Languages,
  Search,
  ChevronDown,
  LayoutDashboard,
  User,
  Handshake,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeToggle from "@/components/ThemeToggle";

interface ManufacturerLayoutProps {
  children: ReactNode;
}

const ManufacturerLayout: FC<ManufacturerLayoutProps> = ({ children }) => {
  const { isAuthenticated, user, logout, role, updateUserStatus } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { theme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(true);
  const [hasMessages, setHasMessages] = useState(true);
  const [language, setLanguage] = useState("en");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const { i18n, t } = useTranslation();

  // Check if the current route is active
  const isRouteActive = (path: string) => {
    return location.pathname === path;
  };

  // Get the current page title
  const getCurrentPageTitle = () => {
    const currentPath = location.pathname;
    const item = navigationItems.find((item) => item.path === currentPath);
    return item ? item.name : "Dashboard";
  };

  // Handle resize to detect mobile devices
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/auth?type=signin");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth?type=signin");
    } else if (role !== "manufacturer") {
      navigate("/dashboard");
    }
  }, [isAuthenticated, role, navigate]);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle status change
  const handleStatusChange = (status: "online" | "away" | "busy") => {
    updateUserStatus(status);
    setIsOpen(false);
  };

  // Navigate to specific page
  const navigateTo = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  // Add a useEffect for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }

      // Escape to close search
      if (e.key === "Escape" && searchOpen) {
        e.preventDefault();
        setSearchOpen(false);
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown as any);

    // Clean up
    return () => {
      document.removeEventListener("keydown", handleKeyDown as any);
    };
  }, [searchOpen]);

  // Add a useEffect for detecting clicks outside the search container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchOpen &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchOpen]);

  // Languages available
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
  ];

  // Navigation items for manufacturer
  const navigationItems = [
    {
      name: "Home",
      path: "/",
      icon: <Home className="h-5 w-5" />,
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Production",
      path: "/manufacturer/production",
      icon: <Factory className="h-5 w-5" />,
    },
    {
      name: "Inventory",
      path: "/manufacturer/inventory",
      icon: <Warehouse className="h-5 w-5" />,
    },
    {
      name: "Suppliers",
      path: "/manufacturer/suppliers",
      icon: <Truck className="h-5 w-5" />,
    },
    {
      name: "Matches",
      path: "/manufacturer/matches",
      icon: <Handshake className="h-5 w-5" />,
    },
    {
      name: "Analytics",
      path: "/manufacturer/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
    },
  ];

  // Mock data for search results - in a real app, this would come from an API
  const [searchResults, setSearchResults] = useState<{
    pages: { title: string; path: string; icon: JSX.Element }[];
    products: { name: string; category: string; id: string }[];
    reports: { title: string; type: string; id: string }[];
  }>({
    pages: [],
    products: [],
    reports: [],
  });

  // Define a search handler
  const handleSearch = useCallback(
    (query: string) => {
      if (!query.trim()) {
        setSearchResults({ pages: [], products: [], reports: [] });
        return;
      }

      // In a real app, this would be an API call
      // For now, just simulate some results based on the navigation items
      setTimeout(() => {
        // Filter navigation items that match the query
        const matchingPages = navigationItems
          .filter(
            (item) =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              item.path.toLowerCase().includes(query.toLowerCase())
          )
          .map((item) => ({
            title: item.name,
            path: item.path,
            icon: item.icon,
          }));

        // Mock some product results
        const mockProducts = [
          { name: "Organic Cereal", category: "Food", id: "p1" },
          { name: "Protein Powder", category: "Supplements", id: "p2" },
          { name: "Vitamin Tablets", category: "Health", id: "p3" },
          { name: "Energy Bars", category: "Snacks", id: "p4" },
        ];

        // Mock some report results
        const mockReports = [
          { title: "Production Analytics", type: "Chart", id: "r1" },
          { title: "Sales Report", type: "PDF", id: "r2" },
          { title: "Inventory Status", type: "Dashboard", id: "r3" },
        ];

        // Filter mock data
        const matchingProducts = mockProducts.filter(
          (p) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.category.toLowerCase().includes(query.toLowerCase())
        );

        const matchingReports = mockReports.filter((r) =>
          r.title.toLowerCase().includes(query.toLowerCase())
        );

        setSearchResults({
          pages: matchingPages,
          products: matchingProducts,
          reports: matchingReports,
        });
      }, 300); // Simulate network delay
    },
    [navigationItems]
  );

  // Update search handler when query changes
  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  if (!isAuthenticated || role !== "manufacturer") {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar for desktop */}
      <motion.aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-all duration-300 hidden lg:block",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
        animate={{
          width: sidebarCollapsed ? 64 : 256,
          boxShadow: sidebarCollapsed ? "none" : "0 0 15px rgba(0, 0, 0, 0.05)",
        }}
        transition={{
          duration: 0.3,
          ease: "easeInOut",
        }}
      >
        <div className="h-full px-3 py-4 overflow-y-auto bg-background border-r no-scrollbar">
          <div
            className={cn(
              "flex items-center justify-between mb-8",
              sidebarCollapsed && "justify-center"
            )}
          >
            {!sidebarCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Link
                  to="/dashboard"
                  className="flex items-center text-xl font-semibold"
                >
                  <span className="text-primary">CPG Matchmaker</span>
                </Link>
              </motion.div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="inline-flex lg:flex text-primary hover:bg-primary/10"
            >
              {sidebarCollapsed ? (
                <PanelRight className="h-5 w-5" />
              ) : (
                <PanelLeft className="h-5 w-5" />
              )}
            </Button>
          </div>

          <div className="space-y-1">
            <AnimatePresence>
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: sidebarCollapsed ? 0 : index * 0.05,
                  }}
                >
                  <Link
                    to={item.path}
                    className={cn(
                      "flex items-center p-2 text-base font-normal rounded-lg transition-all duration-200",
                      isRouteActive(item.path)
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                      sidebarCollapsed ? "justify-center px-3" : "pl-3 pr-2"
                    )}
                  >
                    <motion.div
                      className={cn(
                        "flex items-center justify-center",
                        isRouteActive(item.path)
                          ? "text-primary-foreground"
                          : "text-muted-foreground group-hover:text-primary"
                      )}
                      whileHover={{
                        scale: isRouteActive(item.path) ? 1 : 1.15,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.icon}
                    </motion.div>

                    {!sidebarCollapsed && (
                      <motion.div className="ml-3 flex-1 flex items-center justify-between">
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {item.name}
                        </motion.span>

                        {/* Indicator for active item */}
                        {isRouteActive(item.path) && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="h-2 w-2 rounded-full bg-primary-foreground"
                          ></motion.div>
                        )}
                      </motion.div>
                    )}

                    {sidebarCollapsed && (
                      <span className="absolute left-full rounded-md px-2 py-1 ml-6 bg-popover text-popover-foreground text-sm invisible opacity-0 -translate-x-3 group-hover:visible group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 shadow-md z-50">
                        {item.name}
                      </span>
                    )}
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Settings at bottom */}
          <div className="absolute bottom-4 left-0 right-0 px-3">
            <Link
              to="/manufacturer/settings"
              className={cn(
                "flex items-center p-2 text-base font-normal rounded-lg transition-all duration-200",
                isRouteActive("/manufacturer/settings")
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10",
                sidebarCollapsed ? "justify-center px-3" : "pl-3 pr-2"
              )}
            >
              <Settings className="h-5 w-5" />
              {!sidebarCollapsed && <span className="ml-3">Settings</span>}
            </Link>
          </div>
        </div>
      </motion.aside>

      {/* Mobile menu button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="focus:outline-none shadow-sm hover:shadow-md transition-shadow"
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              className="fixed top-0 left-0 z-40 h-screen w-64 bg-background border-r"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-full px-3 py-4 overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between mb-8">
                  <Link
                    to="/dashboard"
                    className="flex items-center text-xl font-semibold"
                  >
                    <span className="text-primary">CPG Matchmaker</span>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-primary hover:bg-primary/10"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <AnimatePresence>
                    {navigationItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.05,
                        }}
                      >
                        <Link
                          to={item.path}
                          className={cn(
                            "flex items-center p-3 text-base font-normal rounded-lg hover:bg-primary/10 group transition-all",
                            isRouteActive(item.path)
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "text-muted-foreground hover:text-primary"
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <div
                            className={
                              isRouteActive(item.path)
                                ? "text-primary-foreground"
                                : "text-muted-foreground group-hover:text-primary"
                            }
                          >
                            {item.icon}
                          </div>
                          <span className="ml-3">{item.name}</span>
                        </Link>
                      </motion.div>
                    ))}

                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: navigationItems.length * 0.05,
                      }}
                    >
                      <Button
                        variant="ghost"
                        className="w-full flex items-center p-3 text-base font-normal rounded-lg hover:bg-destructive/10 hover:text-destructive mt-4"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="ml-3">Log Out</span>
                      </Button>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-64"
        )}
      >
        {/* Enhanced sticky header */}
        <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b shadow-sm transition-all duration-300 ease-in-out">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            {/* Left section - Title and breadcrumb */}
            <div className="flex items-center gap-2">
              <motion.h1
                className="text-xl font-bold hidden sm:block bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                whileHover={{ scale: 1.03 }}
              >
                {getCurrentPageTitle()}
              </motion.h1>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Badge
                  variant="outline"
                  className="hidden md:flex items-center gap-1 text-xs border-primary/40 text-primary"
                >
                  <span className="relative after:absolute after:bottom-0 after:left-0 after:h-[1px] after:w-0 after:bg-primary/60 after:transition-all hover:after:w-full">
                    Manufacturer
                  </span>
                </Badge>
              </motion.div>
            </div>

            {/* Center section - Search */}
            <AnimatePresence mode="wait">
              {searchOpen ? (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-background/95 dark:bg-background/90 px-4 md:px-6 h-16 backdrop-blur-md"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  ref={searchContainerRef}
                >
                  <div className="w-full max-w-md flex items-center relative">
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                    >
                      <Search className="h-4 w-4" />
                    </motion.div>
                    <Input
                      type="text"
                      placeholder="Search dashboards, products, reports..."
                      className="w-full pl-10 pr-4 py-2 bg-background border-input focus:border-ring focus:ring-1 focus:ring-ring transition-colors shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                    {searchQuery && (
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.5, opacity: 0 }}
                        className="absolute right-2 top-1/2 -translate-y-1/2"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-foreground"
                          onClick={() => setSearchQuery("")}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </motion.div>
                    )}

                    {searchQuery && (
                      <motion.div
                        className="absolute top-full left-0 right-0 mt-1 bg-background/95 backdrop-blur-sm rounded-md shadow-lg border border-border/50 overflow-hidden z-50 max-h-[70vh] overflow-y-auto no-scrollbar"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                      >
                        {searchResults.pages.length === 0 &&
                        searchResults.products.length === 0 &&
                        searchResults.reports.length === 0 ? (
                          <div className="p-6 text-center">
                            <motion.div
                              initial={{ scale: 0.9 }}
                              animate={{ scale: 1 }}
                              transition={{ duration: 0.2 }}
                              className="mx-auto rounded-full bg-muted h-12 w-12 flex items-center justify-center mb-3"
                            >
                              <Search className="h-6 w-6 text-muted-foreground" />
                            </motion.div>
                            <p className="text-sm font-medium">
                              No results found
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Try different keywords or browse categories
                            </p>
                          </div>
                        ) : (
                          <>
                            {searchResults.pages.length > 0 && (
                              <div className="px-2 pt-2">
                                <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                                  Pages
                                </div>
                                {searchResults.pages.map((page, i) => (
                                  <motion.div
                                    key={page.path}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.03 }}
                                    whileHover={{ x: 2 }}
                                  >
                                    <Link
                                      to={page.path}
                                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md transition-colors"
                                      onClick={() => {
                                        setSearchOpen(false);
                                        setSearchQuery("");
                                      }}
                                    >
                                      <div className="h-8 w-8 flex items-center justify-center rounded-md bg-primary/10 shrink-0">
                                        {page.icon}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {page.title}
                                        </p>
                                      </div>
                                      <motion.div
                                        className="shrink-0 flex items-center opacity-50"
                                        whileHover={{ x: 2, opacity: 1 }}
                                      >
                                        <ArrowRight className="h-3 w-3" />
                                      </motion.div>
                                    </Link>
                                  </motion.div>
                                ))}
                              </div>
                            )}

                            {searchResults.products.length > 0 && (
                              <div className="px-2 pt-2 mt-1">
                                <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                                  Products
                                </div>
                                {searchResults.products.map((product, i) => (
                                  <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      delay:
                                        searchResults.pages.length * 0.03 +
                                        i * 0.03,
                                    }}
                                  >
                                    <div
                                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer"
                                      onClick={() => {
                                        navigate(
                                          `/manufacturer/production?product=${product.id}`
                                        );
                                        setSearchOpen(false);
                                        setSearchQuery("");
                                      }}
                                    >
                                      <div className="h-8 w-8 flex items-center justify-center rounded-md bg-blue-500/10 shrink-0">
                                        <Package className="h-4 w-4 text-blue-500" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {product.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {product.category}
                                        </p>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="shrink-0 text-xs h-5"
                                      >
                                        Product
                                      </Badge>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}

                            {searchResults.reports.length > 0 && (
                              <div className="px-2 pt-2 pb-2 mt-1">
                                <div className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                                  Reports & Analytics
                                </div>
                                {searchResults.reports.map((report, i) => (
                                  <motion.div
                                    key={report.id}
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                      delay:
                                        searchResults.pages.length * 0.03 +
                                        searchResults.products.length * 0.03 +
                                        i * 0.03,
                                    }}
                                  >
                                    <div
                                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-muted rounded-md transition-colors cursor-pointer"
                                      onClick={() => {
                                        navigate(
                                          `/manufacturer/analytics?report=${report.id}`
                                        );
                                        setSearchOpen(false);
                                        setSearchQuery("");
                                      }}
                                    >
                                      <div className="h-8 w-8 flex items-center justify-center rounded-md bg-green-500/10 shrink-0">
                                        <BarChart3 className="h-4 w-4 text-green-500" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                          {report.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {report.type}
                                        </p>
                                      </div>
                                      <Badge
                                        variant="outline"
                                        className="shrink-0 text-xs h-5"
                                      >
                                        Report
                                      </Badge>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            )}

                            <div className="p-2 bg-muted/30 mt-1">
                              <div className="flex justify-center items-center text-xs text-muted-foreground">
                                <span>
                                  Press{" "}
                                  <kbd className="rounded border px-1 py-0.5 bg-background text-[10px]">
                                    Esc
                                  </kbd>{" "}
                                  to close
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="hidden md:flex relative w-64 lg:w-96">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-muted-foreground border rounded-md shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    <span>Search...</span>
                    <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </Button>
                </div>
              )}
            </AnimatePresence>

            {/* Right section - Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Search button */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button> */}
              </motion.div>

              {/* Language toggle */}
              <EnhancedLanguageSwitcher />

              {/* Theme toggle */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ThemeToggle />
              </motion.div>

              {/* Help with tooltip animation */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-colors relative group"
                >
                  <HelpCircle className="h-5 w-5" />
                  <motion.span
                    className="absolute -bottom-8 right-0 min-w-max px-2 py-1 rounded-md text-xs font-medium bg-popover text-popover-foreground shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all"
                    initial={{ opacity: 0, y: -5 }}
                    whileHover={{ opacity: 1, y: 0 }}
                  >
                    Help Center
                  </motion.span>
                </Button>
              </motion.div>

              {/* Notifications with enhanced animation */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative hover:bg-primary/5 transition-colors"
                    >
                      <Bell className="h-5 w-5 text-muted-foreground" />
                      {hasNotifications && (
                        <motion.span
                          className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"
                          initial={{ scale: 0.5 }}
                          animate={{ scale: [0.8, 1.2, 0.8] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        ></motion.span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between p-2">
                      <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                      <Badge variant="secondary" className="ml-auto">
                        New 3
                      </Badge>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                      <motion.div
                        className="p-3 hover:bg-muted rounded-md cursor-pointer transition-colors"
                        whileHover={{
                          x: 2,
                          backgroundColor: "rgba(var(--muted), 0.5)",
                        }}
                      >
                        <div className="flex gap-3 items-start">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">New match opportunity</p>
                            <p className="text-sm text-muted-foreground">
                              Green Foods Inc wants to connect
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              2 hours ago
                            </p>
                          </div>
                        </div>
                      </motion.div>
                      <motion.div
                        className="p-3 hover:bg-muted rounded-md cursor-pointer transition-colors"
                        whileHover={{
                          x: 2,
                          backgroundColor: "rgba(var(--muted), 0.5)",
                        }}
                      >
                        <div className="flex gap-3 items-start">
                          <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mt-0.5 dark:bg-amber-950">
                            <Warehouse className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                          </div>
                          <div>
                            <p className="font-medium">Inventory alert</p>
                            <p className="text-sm text-muted-foreground">
                              Raw material "Organic Oats" low stock
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Yesterday
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    <DropdownMenuSeparator />
                    <Button
                      variant="ghost"
                      className="w-full justify-center"
                      size="sm"
                    >
                      View all notifications
                    </Button>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              {/* Messages */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                      {hasMessages && (
                        <motion.span
                          className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"
                          animate={{
                            opacity: [1, 0.5, 1],
                            scale: [1, 0.8, 1],
                          }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            ease: "easeInOut",
                          }}
                        ></motion.span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between p-2">
                      <DropdownMenuLabel>Messages</DropdownMenuLabel>
                      <Badge variant="secondary" className="ml-auto">
                        2 unread
                      </Badge>
                    </div>
                    <DropdownMenuSeparator />
                    <div className="max-h-80 overflow-y-auto no-scrollbar">
                      <motion.div
                        className="p-3 hover:bg-muted rounded-md cursor-pointer transition-colors"
                        whileHover={{
                          x: 2,
                          backgroundColor: "rgba(var(--muted), 0.5)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage src="/placeholder.svg" />
                            <AvatarFallback>NF</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">Natural Foods Inc</p>
                              <Badge
                                variant="secondary"
                                className="h-5 px-1 text-xs"
                              >
                                New
                              </Badge>
                            </div>
                            <p className="text-sm line-clamp-1 text-muted-foreground">
                              We'd like to discuss your production capacity for
                              our new organic cereal line...
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              10 min ago
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                    <DropdownMenuSeparator />
                    <Button
                      variant="ghost"
                      className="w-full justify-center"
                      size="sm"
                    >
                      View all messages
                    </Button>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>

              {/* User avatar */}
              <UserMenu />
            </div>
          </div>

          {/* Secondary nav with actions or tabs if needed - kept hidden as in most recent update */}
          <motion.div
            className="hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {/* Secondary navigation content */}
          </motion.div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10 no-scrollbar w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

// User dropdown menu
const UserMenu = () => {
  const { user, logout, updateUserStatus } = useUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle user logout
  const handleLogout = () => {
    logout();
    navigate("/auth?type=signin");
  };

  // Handle status change
  const handleStatusChange = (status: "online" | "away" | "busy") => {
    updateUserStatus(status);
    setIsOpen(false);
  };

  // Navigate to specific page
  const navigateTo = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center space-x-2 rounded-full p-0.5 focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="relative">
          <Avatar className="h-8 w-8 border-2 border-primary/10 transition group-hover:border-primary/30">
            <AvatarImage src={user?.avatar || ""} alt={user?.name || "User"} />
            <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-background ${
              user?.status === "online"
                ? "bg-green-500"
                : user?.status === "away"
                ? "bg-yellow-500"
                : "bg-red-500"
            }`}
          />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-80 z-50 overflow-hidden origin-top-right"
          >
            <div className="rounded-xl border border-border bg-popover text-popover-foreground shadow-lg">
              {/* User info section with darker background */}
              <div className="p-4 border-b border-border bg-muted">
                <div className="flex items-start gap-4">
                  <Avatar className="h-14 w-14 border-2 border-primary/20">
                    <AvatarImage
                      src={user?.avatar || ""}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="text-lg">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-semibold truncate">
                      {user?.name}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {user?.email}
                    </p>

                    <div className="flex items-center mt-1 space-x-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                          >
                            <span
                              className={`h-2 w-2 rounded-full mr-2 ${
                                user?.status === "online"
                                  ? "bg-green-500"
                                  : user?.status === "away"
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            />
                            {user?.status === "online"
                              ? "Online"
                              : user?.status === "away"
                              ? "Away"
                              : "Busy"}
                            <ChevronDown className="h-3.5 w-3.5 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-40 bg-popover text-popover-foreground border-border"
                        >
                          <DropdownMenuItem
                            onClick={() => handleStatusChange("online")}
                          >
                            <div className="flex items-center">
                              <span className="h-2 w-2 rounded-full bg-green-500 mr-2" />
                              <span>Online</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange("away")}
                          >
                            <div className="flex items-center">
                              <span className="h-2 w-2 rounded-full bg-yellow-500 mr-2" />
                              <span>Away</span>
                            </div>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleStatusChange("busy")}
                          >
                            <div className="flex items-center">
                              <span className="h-2 w-2 rounded-full bg-red-500 mr-2" />
                              <span>Busy</span>
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <Badge
                        variant="secondary"
                        className="text-xs px-2 py-0 h-5"
                      >
                        Manufacturer
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Manufacturer-specific stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-lg font-semibold">
                      {user?.manufacturerSettings?.productionCapacity?.toLocaleString() ||
                        "0"}
                    </p>
                    <p className="text-xs text-muted-foreground">Capacity</p>
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-lg font-semibold">
                      {user?.manufacturerSettings?.preferredCategories
                        ?.length || "0"}
                    </p>
                    <p className="text-xs text-muted-foreground">Products</p>
                  </div>
                  <div className="bg-muted rounded-lg p-2">
                    <p className="text-lg font-semibold">15</p>
                    <p className="text-xs text-muted-foreground">Partners</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="p-2">
                <div className="grid grid-cols-1 gap-1">
                  <motion.button
                    className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-primary/10 text-left w-full"
                    onClick={() => navigateTo("/dashboard")}
                    whileHover={{ x: 3 }}
                  >
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    <span className="truncate">Dashboard</span>
                  </motion.button>

                  <motion.button
                    className="flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-primary/10 text-left w-full"
                    onClick={() => navigateTo("/profile")}
                    whileHover={{ x: 3 }}
                  >
                    <User className="h-4 w-4 text-primary" />
                    <span className="truncate">Profile</span>
                  </motion.button>

                  <motion.button
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10 text-left"
                    onClick={() => navigateTo("/manufacturer/settings")}
                    whileHover={{ x: 3 }}
                  >
                    <div className="p-1.5 rounded-md bg-primary/15 dark:bg-primary/20 text-primary dark:text-primary/90">
                      <Settings className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Settings</p>
                      <p className="text-xs text-muted-foreground">
                        Account preferences
                      </p>
                    </div>
                  </motion.button>
                </div>
              </div>

              {/* Logout button with improved contrast */}
              <div className="p-2 border-t border-border">
                <motion.button
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-destructive/10 dark:hover:bg-red-900/20 transition-colors duration-300 text-left"
                  onClick={handleLogout}
                  whileHover={{ x: 3 }}
                >
                  <div className="p-1.5 rounded-md bg-destructive/10 dark:bg-red-500/20 text-destructive dark:text-red-400">
                    <LogOut className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-destructive dark:text-red-400">
                      Log out
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Sign out of your account
                    </p>
                  </div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Enhanced Language Switcher Component
const EnhancedLanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { i18n, t } = useTranslation();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Languages available
  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
  ];

  // Handle language change
  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsOpen(false);
  };

  // Get current language
  const currentLang =
    languages.find((lang) => lang.code === i18n.language) || languages[0];

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          variant="ghost"
          size="icon"
          className="relative hover:bg-primary/5 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="text-base">{currentLang.flag}</span>
        </Button>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 z-50 min-w-[180px] overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg"
          >
            <div className="p-1">
              {languages.map((lang) => (
                <motion.button
                  key={lang.code}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10 ${
                    lang.code === i18n.language ? "bg-primary/5" : ""
                  }`}
                  onClick={() => changeLanguage(lang.code)}
                  whileHover={{ x: 3 }}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                  {lang.code === i18n.language && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 20,
                      }}
                      className="ml-auto h-2 w-2 rounded-full bg-primary"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManufacturerLayout;
