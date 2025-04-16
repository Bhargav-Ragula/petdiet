
import { Home, Activity, BarChart3, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const BottomNavbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navigationItems = [
    { icon: Home, label: "Discover", path: "/" },
    { icon: Activity, label: "Tracker", path: "/tracker" },
    { icon: BarChart3, label: "Insights", path: "/insights" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background z-50">
      <div className="container max-w-lg mx-auto">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-3 px-4 transition-colors ${
                isActive(item.path)
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon size={24} className={`mb-1 ${isActive(item.path) ? "fill-primary/10" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default BottomNavbar;
