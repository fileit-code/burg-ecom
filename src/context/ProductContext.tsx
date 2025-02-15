import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  imageURL: string | null;
  createdAt: Date;
  createdBy: number;
}

interface ProductContextType {
  products: Product[];
  getProduct: (id: number) => Promise<Product | null>;
  getProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const id = 2;

export const useProduct = () => {
  const context = useContext(ProductContext);
  if (!context) throw new Error("useProduct must be used within a ProductProvider");
  return context;
};

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const url =  'https://ecommerceplantilla-back.fileit-contact.workers.dev/api';
  const getProducts = async () => {
    try {
      const response = await fetch(url+'/products/list/'+id);
      const data = await response.json();
      if (data.products.length > 1) 
        setProducts(data.products.map((p: any) => ({
          ...p
        })));
      else setProducts([data.products])
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const getProduct = async (id: number): Promise<Product | null> => {
    try {
      const response = await fetch(url+`/products/get/${id}`);
      const data = await response.json();
      return data.product ? { 
        ...data.product, 
        createdAt: new Date(data.product.createdAt) 
      } : null;
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  };

  useEffect(()=> {
    if (products.length === 0) {
      getProducts();
    }
  }, [])


  return (
    <ProductContext.Provider value={{
      products,
      getProducts,
      getProduct
    }}>
      {children}
    </ProductContext.Provider>
  );
};