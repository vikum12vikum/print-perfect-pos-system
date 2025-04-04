
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getOrders, getCategories } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBasket, Tag, ClipboardList, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const DashboardPage = () => {
  const productsQuery = useQuery({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });
  
  const ordersQuery = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });

  const categoriesQuery = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  // Calculate total sales
  const totalSales = ordersQuery.data
    ? ordersQuery.data.data.reduce((sum, order) => sum + order.total, 0)
    : 0;

  const isLoading = 
    productsQuery.isLoading || 
    ordersQuery.isLoading || 
    categoriesQuery.isLoading;

  const StatCard = ({ 
    title, 
    value, 
    icon, 
    loading, 
    link 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ReactNode; 
    loading: boolean;
    link: string;
  }) => (
    <Link to={link}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-7 w-1/2" />
          ) : (
            <div className="text-2xl font-bold">{value}</div>
          )}
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your POS system dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Products"
          value={productsQuery.data?.data.length || 0}
          icon={<ShoppingBasket className="h-5 w-5 text-muted-foreground" />}
          loading={productsQuery.isLoading}
          link="/products"
        />
        <StatCard
          title="Categories"
          value={categoriesQuery.data?.data.length || 0}
          icon={<Tag className="h-5 w-5 text-muted-foreground" />}
          loading={categoriesQuery.isLoading}
          link="/categories"
        />
        <StatCard
          title="Total Orders"
          value={ordersQuery.data?.data.length || 0}
          icon={<ClipboardList className="h-5 w-5 text-muted-foreground" />}
          loading={ordersQuery.isLoading}
          link="/orders"
        />
        <StatCard
          title="Total Sales"
          value={formatCurrency(totalSales)}
          icon={<DollarSign className="h-5 w-5 text-muted-foreground" />}
          loading={ordersQuery.isLoading}
          link="/orders"
        />
      </div>
      
      {/* Recent orders would go here */}
      
    </div>
  );
};

export default DashboardPage;
