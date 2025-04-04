
import { useState, useRef } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { createOrder } from "@/lib/api";
import { formatCurrency, generateRandomReference } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowLeft, Receipt as ReceiptIcon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Receipt from "@/components/Receipt";
import { printReceipt } from "@/lib/utils";
import { Order, OrderItem } from "@/lib/types";

const CheckoutPage = () => {
  const { cart, updateQuantity, removeFromCart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const receiptRef = useRef<HTMLDivElement>(null);

  const handleSubmitOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        user_id: user?.id || 1,
        orders: cart.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };

      const response = await createOrder(orderData);
      
      // Create a local order object for the receipt
      const newOrder: Order = {
        id: response.data.id,
        reference: response.data.reference || generateRandomReference(),
        user_id: user?.id || 1,
        total: subtotal,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Create order items for the receipt
      const newOrderItems: OrderItem[] = cart.map((item, index) => ({
        id: index,
        order_id: newOrder.id,
        product_id: item.product.id,
        product: item.product,
        quantity: item.quantity,
        price: item.product.price,
      }));
      
      setCurrentOrder(newOrder);
      setOrderItems(newOrderItems);
      
      toast.success("Order placed successfully!");
      clearCart();
      
      // Slight delay to ensure receipt data is set
      setTimeout(() => {
        printReceipt();
      }, 500);
      
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/products">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground">
            Review and complete your order
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Order Items</h2>
            
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Your cart is empty</p>
                <Link to="/products">
                  <Button>Continue Shopping</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        {item.product.image ? (
                          <img
                            src={`http://45.77.171.162:3000/${item.product.image}`}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/placeholder.svg";
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <img
                              src="/placeholder.svg"
                              alt={item.product.name}
                              className="w-1/2 h-1/2 opacity-30"
                            />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{item.product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(item.product.price)} per unit
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-r-none"
                          onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <div className="h-8 px-4 flex items-center justify-center border-y">
                          {item.quantity}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 rounded-l-none"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="w-20 text-right">
                        {formatCurrency(item.product.price * item.quantity)}
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full"
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleSubmitOrder}
            >
              {isSubmitting ? "Processing..." : "Complete Order"}
            </Button>
            
            {currentOrder && (
              <Button 
                variant="outline" 
                className="w-full mt-2"
                onClick={() => printReceipt()}
              >
                <ReceiptIcon className="mr-2 h-4 w-4" /> Print Receipt
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Hidden receipt for printing */}
      {currentOrder && (
        <Receipt ref={receiptRef} order={currentOrder} orderItems={orderItems} />
      )}
    </div>
  );
};

export default CheckoutPage;
