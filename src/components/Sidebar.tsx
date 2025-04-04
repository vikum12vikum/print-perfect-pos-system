
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ShoppingBasket, 
  Tag, 
  ClipboardList, 
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarItemProps {
  icon: React.ReactNode;
  title: string;
  path: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  title,
  path,
  isActive,
  isCollapsed
}) => {
  return (
    <Link to={path}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start gap-2 px-3",
          isActive ? "bg-secondary" : "hover:bg-secondary/50",
          isCollapsed ? "py-3 justify-center" : "py-2"
        )}
      >
        {icon}
        {!isCollapsed && <span>{title}</span>}
      </Button>
    </Link>
  );
};

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const sidebarItems = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      title: "Dashboard",
      path: "/dashboard",
    },
    {
      icon: <ShoppingBasket className="w-5 h-5" />,
      title: "Products",
      path: "/products",
    },
    {
      icon: <Tag className="w-5 h-5" />,
      title: "Categories",
      path: "/categories",
    },
    {
      icon: <ClipboardList className="w-5 h-5" />,
      title: "Orders",
      path: "/orders",
    },
  ];

  const toggleCollapsed = () => setCollapsed(!collapsed);

  return (
    <aside
      className={cn(
        "bg-white border-r border-gray-200 h-full flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200">
        {!collapsed && (
          <div className="font-bold text-xl text-primary">Print POS</div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="space-y-1 px-2">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.path}
              icon={item.icon}
              title={item.title}
              path={item.path}
              isActive={location.pathname === item.path}
              isCollapsed={collapsed}
            />
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
