
import React, { forwardRef } from "react";
import { formatCurrency } from "@/lib/utils";
import { Order, OrderItem } from "@/lib/types";

interface ReceiptProps {
  order: Order;
  orderItems: OrderItem[];
}

const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ order, orderItems }, ref) => {
  const today = new Date();
  
  return (
    <div className="hidden print:block" ref={ref}>
      <div className="receipt-print text-sm">
        <div className="text-center mb-4">
          <h2 className="text-lg font-bold">Print Perfect POS</h2>
          <p>123 Main Street</p>
          <p>Anytown, ST 12345</p>
          <p>Tel: (123) 456-7890</p>
        </div>
        
        <div className="mb-4">
          <p><strong>Receipt:</strong> #{order.reference}</p>
          <p><strong>Date:</strong> {new Date(order.created_at).toLocaleString()}</p>
        </div>
        
        <div className="mb-4">
          <div className="border-t border-b py-2">
            <div className="grid grid-cols-12 font-semibold">
              <div className="col-span-6">Item</div>
              <div className="col-span-2 text-center">Qty</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">Total</div>
            </div>
          </div>

          {orderItems.map((item, index) => (
            <div key={index} className="grid grid-cols-12 py-1 border-b text-xs">
              <div className="col-span-6">{item.product?.name || `Product #${item.product_id}`}</div>
              <div className="col-span-2 text-center">{item.quantity}</div>
              <div className="col-span-2 text-right">{formatCurrency(item.price)}</div>
              <div className="col-span-2 text-right">{formatCurrency(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>
        
        <div className="text-right mb-4">
          <div className="font-semibold">
            <p>Total: {formatCurrency(order.total)}</p>
          </div>
        </div>
        
        <div className="text-center mt-6">
          <p>Thank you for your purchase!</p>
          <p>Please come again</p>
          <p className="text-xs mt-4">{today.toISOString()}</p>
        </div>
      </div>
    </div>
  );
});

Receipt.displayName = "Receipt";
export default Receipt;
