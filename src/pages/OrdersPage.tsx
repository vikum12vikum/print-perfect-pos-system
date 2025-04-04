
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrders, getOrderItems, deleteOrder } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, Trash2, Printer } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Receipt from "@/components/Receipt";
import { printReceipt } from "@/lib/utils";
import { Order, OrderItem } from "@/lib/types";

const OrdersPage = () => {
  const [viewOrderId, setViewOrderId] = useState<number | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<number | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });

  const handleViewOrder = async (orderId: number) => {
    try {
      const orderResponse = await getOrderById(orderId);
      const itemsResponse = await getOrderItems(orderId);
      
      setSelectedOrder(orderResponse.data);
      setOrderItems(itemsResponse.data);
      setViewOrderId(orderId);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Failed to load order details");
    }
  };

  const handlePrintReceipt = () => {
    if (!selectedOrder) return;
    printReceipt();
  };

  const handleDeleteOrder = async () => {
    if (!deleteOrderId) return;
    
    try {
      await deleteOrder(deleteOrderId);
      toast.success("Order deleted successfully");
      refetch();
      setDeleteOrderId(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Failed to delete order");
    }
  };

  const getOrderById = async (id: number) => {
    try {
      const response = await fetch(`http://45.77.171.162:3000/orders/${id}`, {
        headers: {
          "Authorization": localStorage.getItem("posToken") || "",
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order");
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Orders</h1>
        <p className="text-muted-foreground">
          View and manage customer orders
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordersData?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                ordersData?.data.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.reference}</TableCell>
                    <TableCell>{formatCurrency(order.total)}</TableCell>
                    <TableCell>{new Date(order.created_at).toLocaleString()}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewOrder(order.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteOrderId(order.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={viewOrderId !== null} onOpenChange={(open) => !open && setViewOrderId(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              Viewing order #{selectedOrder?.reference}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex justify-between mb-4">
              <div>
                <p><strong>Order ID:</strong> {selectedOrder?.id}</p>
                <p><strong>Date:</strong> {selectedOrder ? new Date(selectedOrder.created_at).toLocaleString() : ''}</p>
              </div>
              <div>
                <p><strong>Reference:</strong> {selectedOrder?.reference}</p>
                <p><strong>Total:</strong> {selectedOrder ? formatCurrency(selectedOrder.total) : ''}</p>
              </div>
            </div>

            <h3 className="font-semibold mb-2">Items</h3>
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product ID</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4">No items found</TableCell>
                    </TableRow>
                  ) : (
                    orderItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.product_id}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{formatCurrency(item.price * item.quantity)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="mt-6 text-right">
              <Button className="ml-auto" onClick={handlePrintReceipt}>
                <Printer className="mr-2 h-4 w-4" /> Print Receipt
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOrderId !== null} onOpenChange={(open) => !open && setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this order.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Hidden receipt for printing */}
      {selectedOrder && (
        <Receipt ref={receiptRef} order={selectedOrder} orderItems={orderItems} />
      )}
    </div>
  );
};

export default OrdersPage;
