
import React, { forwardRef } from "react";
import { formatCurrency } from "@/lib/utils";
import { Order, OrderItem } from "@/lib/types";

interface ReceiptProps {
  order: Order;
  orderItems: OrderItem[];
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ order, orderItems }, ref) => {
  const today = new Date();
  const storeName = "Grocery POS";
  const storeAddress = "123 Main Street, Anytown";
  const storePhone = "(555) 123-4567";
  const taxRate = 0.08; // 8% tax rate
  const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax;
  
  return (
    <div className="hidden print:block" ref={ref}>
      <div className="receipt-print text-sm" style={{ fontFamily: 'monospace', maxWidth: '300px', margin: '0 auto' }}>
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">{storeName}</h2>
          <p>{storeAddress}</p>
          <p>{storePhone}</p>
          <hr className="my-2" />
        </div>
        
        <div className="mb-2">
          <p><strong>Receipt:</strong> #{order.reference}</p>
          <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
          <hr className="my-2" />
        </div>
        
        <div className="mb-4">
          <div className="grid grid-cols-12 font-semibold mb-1">
            <div className="col-span-6">Item</div>
            <div className="col-span-2 text-center">Qty</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          <div className="divide-y">
            {orderItems.map((item, index) => (
              <div key={index} className="grid grid-cols-12 py-1 text-xs">
                <div className="col-span-6 truncate">{item.product?.name || `Item #${item.product_id}`}</div>
                <div className="col-span-2 text-center">{item.quantity}</div>
                <div className="col-span-2 text-right">{formatCurrency(item.price)}</div>
                <div className="col-span-2 text-right">{formatCurrency(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
          
          <hr className="my-2" />
          
          <div className="text-right space-y-1">
            <p>Subtotal: {formatCurrency(subtotal)}</p>
            <p>Tax ({(taxRate * 100).toFixed(0)}%): {formatCurrency(tax)}</p>
            <p className="font-semibold">Total: {formatCurrency(total)}</p>
          </div>
        </div>
        
        <div className="text-center mt-6 text-xs">
          <p>Thank you for shopping with us!</p>
          <p>Please come again</p>
          <p className="mt-4">{today.toLocaleDateString()} {today.toLocaleTimeString()}</p>
          <p>----- Cut Here -----</p>
        </div>
      </div>
    </div>
  );
});

Receipt.displayName = "Receipt";
export default Receipt;
