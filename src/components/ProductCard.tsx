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
        <div className="w-full max-w-sm bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 mx-4 my-6 cursor-pointer">
          <div className="block">
            {
              product.imageURL
              ?
              <img
              src={product.imageURL}
              alt={`Product ${product.name}`}
              className="w-full h-48 object-cover"
              data-view-transition-name={`product-image-${product.id}`}
              />
              :
              <div className="w-full h-48 bg-gray-200"></div>
            }
            <div className="p-6">
              <h3
                className="text-xl font-bold text-gray-900 mb-2"
                data-view-transition-name={`product-title-${product.id}`}
              >
                {product.name}
              </h3>
              <p className="text-gray-600 mb-4">{product.description}</p>
              <div className="flex justify-start items-center">
                <span className="text-2xl font-bold text-gray-900">${product.price}</span>
              </div>
            </div>
          </div>
        </div>
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