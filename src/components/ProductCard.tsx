import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { useOrder } from "@/context/OrderContext";
import toast from "react-hot-toast";
import { MdOutlineShoppingCart } from "react-icons/md";
import { Textarea } from "./ui/textarea";
import { useState } from "react";
import { Card } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { Button } from "./ui/button";
import { Heart, ShoppingCart } from "lucide-react";

interface Product {
  id: number;
  imageURL: string | null;
  name: string;
  description: string;
  price: number;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToOrder } = useOrder()!;
  const [comment, setComment] = useState('');

  const handleAddToCart = () => {
    addToOrder({
      ...product,
      comment,
      createdAt: new Date(),
      createdBy: 0, // Asumimos un ID de usuario temporal
    });
    setComment('')
    toast.success('Producto añadido al carrito');
  };

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Card className="group relative overflow-hidden transition-all hover:shadow-lg h-full flex flex-col sm:flex-row">
        {/* Sección de imagen - Mobile: Full width, Desktop: 40% */}
        <div className="sm:w-[40%] flex-shrink-0 border-r bg-muted/50">
          <AspectRatio ratio={4/3} className="bg-gradient-to-br from-muted/20 to-muted/50">
            {product.imageURL ? (
              <img
                src={product.imageURL}
                alt={product.name}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground/50">
                <span className="text-sm">Sin imagen</span>
              </div>
            )}
          </AspectRatio>
        </div>

        {/* Contenido - Mobile: Full width, Desktop: 60% */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div className="space-y-2 mb-4">
            <h3 className="text-lg font-semibold truncate">{product.name}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3 mb-2">
              {product.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-muted-foreground self-end">ARS</span>
              <p className="text-xl font-bold text-primary">
                ${product.price.toLocaleString()}
              </p>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full h-9 w-9 p-0 sm:h-8 sm:w-8 flex-shrink-0"
              >
                <Heart className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                className="rounded-full flex-1 gap-2 sm:flex-none sm:px-4"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Añadir</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Ribbon para desktop */}
        <div className="absolute top-2 left-2 hidden sm:block">
          <div className="bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
            Nuevo
          </div>
        </div>
      </Card>
      </DrawerTrigger>

      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle
              data-view-transition-name={`product-title-${product.id}`}
            >
              {product.name}
            </DrawerTitle>
            <DrawerDescription>{product.description}</DrawerDescription>
          </DrawerHeader>
          
          <div className="p-4">
            {
              product.imageURL
              ? 
              <img
              src={product.imageURL}
              alt={`Product ${product.name}`}
              className="w-full h-48 object-cover rounded-lg"
              data-view-transition-name={`product-image-${product.id}`}
              />
              :
              <div className="w-full h-48 bg-gray-200 rounded-lg"></div>
            }
            <div className="mt-4 flex justify-between items-center">
              <span className="text-2xl font-bold text-gray-900">
                ${product.price}
              </span>
            </div>
            <Textarea  
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Añade un comentario"/>
          </div>

          <DrawerFooter>
            <DrawerClose>
              <button 
              onClick={() => handleAddToCart()}
              className="flex items-center justify-center w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
                Añadir al Carrito <MdOutlineShoppingCart className="text-xl ml-2"/>
              </button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}