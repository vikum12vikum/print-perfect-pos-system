import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getOrderById, getOrderItems } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Order, OrderItem } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarIcon, Receipt } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { printReceipt } from "@/lib/utils";

interface OrderResponse {
  code: number;
  data: Order[];
}

interface OrderItemResponse {
  code: number;
  data: OrderItem[];
}

interface SingleOrderResponse {
  code: number;
  data: Order;
}

const OrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders() as Promise<OrderResponse>,
  });

  const viewOrderDetails = async (orderId: number) => {
    try {
      const orderResponse = await getOrderById(orderId) as Promise<SingleOrderResponse>;
      const itemsResponse = await getOrderItems(orderId) as Promise<OrderItemResponse>;
      
      setSelectedOrder(orderResponse.data);
      setOrderItems(itemsResponse.data);
      setIsDetailsOpen(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to fetch order details");
    }
  };

  const handlePrintReceipt = () => {
    if (selectedOrder) {
      printReceipt();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-muted-foreground">View and manage your orders</p>
      </div>

      {isLoadingOrders ? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/4" />
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Order ID</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(5)].map((_, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium"><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell className="text-right"><Skeleton /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : ordersData?.data && ordersData.data.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Order ID</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>User ID</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {ordersData.data.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.reference}</TableCell>
                <TableCell>{order.user_id}</TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  {format(new Date(order.created_at), "PPP")}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => viewOrderDetails(order.id)}
                  >
                    Details
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      )}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>

          {selectedOrder ? (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium leading-none">Order ID</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Reference</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.reference}</p>
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">User ID</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.user_id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Total</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(selectedOrder.total)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Created At</p>
                  <p className="text-sm text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(new Date(selectedOrder.created_at), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">Updated At</p>
                  <p className="text-sm text-muted-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(new Date(selectedOrder.updated_at), "PPP")}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2">Order Items</h3>
                {orderItems.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product ID</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.product_id}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{formatCurrency(item.price)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">No items found for this order.</p>
                )}
              </div>

              <Button onClick={handlePrintReceipt}>
                Print Receipt <Receipt className="ml-2 h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Loading order details...</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
