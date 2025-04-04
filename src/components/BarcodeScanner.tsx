
import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Barcode } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { getProducts } from "@/lib/api";
import { toast } from "sonner";

const BarcodeScanner: React.FC = () => {
  const [barcode, setBarcode] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addToCart } = useCart();
  
  // Focus the input when the component mounts or when isScanning changes
  useEffect(() => {
    if (isScanning && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isScanning]);

  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcode(e.target.value);
  };

  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!barcode.trim()) {
      return;
    }
    
    try {
      // Simulate looking up the product by barcode
      // In a real system, you might want to add a dedicated barcode field to products
      // For now, we'll search by ID as a simulation
      const productsResponse = await getProducts(`filter[id]=${barcode}`);
      
      if (productsResponse.data.length > 0) {
        const product = productsResponse.data[0];
        addToCart(product);
        toast.success(`Added ${product.name} to cart`);
      } else {
        toast.error(`Product with barcode ${barcode} not found`);
      }
    } catch (error) {
      console.error("Error finding product by barcode:", error);
      toast.error("Failed to process barcode");
    }
    
    // Clear the barcode field for the next scan
    setBarcode("");
  };

  const toggleScanning = () => {
    setIsScanning(!isScanning);
    // Focus the input when scanning is enabled
    if (!isScanning && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  return (
    <div className="relative">
      {isScanning ? (
        <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={barcode}
            onChange={handleBarcodeChange}
            placeholder="Scan barcode..."
            className="pr-10"
            autoFocus
          />
          <button
            type="button"
            onClick={toggleScanning}
            className="text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </form>
      ) : (
        <button
          onClick={toggleScanning}
          className="flex items-center gap-2 px-4 py-2 border rounded-md bg-background hover:bg-accent transition-colors"
        >
          <Barcode className="h-4 w-4" />
          <span>Scan Barcode</span>
        </button>
      )}
    </div>
  );
};

export default BarcodeScanner;
