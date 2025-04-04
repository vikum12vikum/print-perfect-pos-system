
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Plus, Minus } from "lucide-react";
import { Product } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, cart, updateQuantity, removeFromCart } = useCart();
  
  const cartItem = cart.find((item) => item.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleUpdateQuantity = (newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(product.id);
    } else {
      updateQuantity(product.id, newQuantity);
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        {product.image ? (
          <img
            src={`http://45.77.171.162:3000/${product.image}`}
            alt={product.name}
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <img
              src="/placeholder.svg"
              alt={product.name}
              className="w-1/2 h-1/2 opacity-30"
            />
          </div>
        )}
      </div>
      
      <CardContent className="flex-grow pt-4">
        <h3 className="font-medium text-lg mb-1 line-clamp-1">{product.name}</h3>
        <p className="text-gray-500 text-sm mb-2 line-clamp-2">{product.description}</p>
        <p className="text-primary font-semibold">{formatCurrency(product.price)}</p>
      </CardContent>
      
      <CardFooter className="pt-0">
        {quantityInCart > 0 ? (
          <div className="flex items-center space-x-2 w-full">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdateQuantity(quantityInCart - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="flex-1 text-center">{quantityInCart}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => handleUpdateQuantity(quantityInCart + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button className="w-full" onClick={handleAddToCart}>
            Add to Cart
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
