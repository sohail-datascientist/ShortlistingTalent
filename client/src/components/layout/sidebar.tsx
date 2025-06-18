import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Upload, 
  Table, 
  BarChart3, 
  LogOut,
  Brain
} from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload Files", href: "/upload", icon: Upload },
    { name: "Results", href: "/results", icon: Table },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  const isActive = (href: string) => location === href;

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl border-r border-gray-200">
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-primary to-secondary">
          <div className="flex items-center space-x-2">
            <Brain className="text-white text-2xl" size={24} />
            <span className="text-xl font-bold text-white">ResumeAI</span>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group cursor-pointer ${
                    isActive(item.href)
                      ? "text-white bg-primary shadow-md"
                      : "text-gray-700 hover:bg-indigo-50 hover:text-primary"
                  }`}
                >
                  <Icon className="mr-3 text-lg" size={20} />
                  <span className="font-medium">{item.name}</span>
                </div>
              </Link>
            );
          })}
        </nav>
        
        {/* User Profile Section */}
        <div className="px-4 py-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start text-gray-700 hover:bg-gray-100"
            size="sm"
          >
            <LogOut className="mr-2" size={16} />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
