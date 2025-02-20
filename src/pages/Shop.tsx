import { useEffect, useState } from 'react';
import { MdOutlineShoppingCart } from "react-icons/md";
import { useProduct } from '@/context/ProductContext';
import { useOrder } from '@/context/OrderContext';
import ProductCard from '../components/ProductCard';
import ProductCartCard from '../components/ProductCartCard';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router';

const formSchema = z.object({
  deliveryType: z.enum(['delivery', 'pickup'], {
    required_error: "Debes seleccionar un tipo de entrega",
  }),
  address: z.string().optional(),
  phone: z.string()
    .min(9, "El teléfono debe tener al menos 9 dígitos")
    .max(15, "El teléfono no puede exceder 15 dígitos"),
  paymentMethod: z.enum(['efectivo', 'mercadopago'], {
    required_error: "Debes seleccionar un método de pago",
  }),
})
.superRefine((data, ctx) => {
  if (data.deliveryType === 'delivery' && !data.address) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "La dirección es requerida para entrega a domicilio",
      path: ['address']
    });
  }
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const { products, getProducts } = useProduct();
  const { order, price, addOrder } = useOrder()!;
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'form'>('cart');
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch, 
    setValue 
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deliveryType: 'delivery',
      paymentMethod: 'efectivo',
      address: '',
      phone: ''
    }
  });

  useEffect(()=> {
    if (username)
        getProducts(username)
  }, [])

  const deliveryType = watch('deliveryType');

  const onSubmit = async (data: FormValues) => {
    try {
      if (username) {
        const result = await addOrder({
          phone_number: Number(data.phone),
          address: data.deliveryType === 'delivery' ? data.address ?? '' : 'Retiro en local',
          deliveryType: data.deliveryType,
          paymentMethod: data.paymentMethod,
          username,
        });
        
        if (result == 'true') { 
          navigate(data.deliveryType === 'delivery' ? '/success/delivery' : '/success/pickup');
        }
        else if (result != 'false')  {
          window.location.href = result;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!products) return (
    <div className="w-full min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-2xl font-bold text-gray-600">
        Cargando menú...
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen relative bg-gradient-to-b from-orange-50 to-white">
      {/* Floating Cart Button */}
      <Drawer>
        <DrawerTrigger className="fixed top-6 right-6 z-50">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative p-4 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all"
          >
            <MdOutlineShoppingCart className="w-6 h-6 text-gray-800" />
            {order.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold"
              >
                {order.length}
              </motion.span>
            )}
          </motion.div>
        </DrawerTrigger>

        {/* Cart Content */}
        <DrawerContent className="max-h-[90vh] max-w-2xl mx-auto border-none shadow-2xl">
          <div className="p-6 bg-gradient-to-b from-white to-orange-50">
            <AnimatePresence mode='wait'>
              {checkoutStep === 'cart' ? (
                <motion.div
                  key="cart"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <DrawerHeader>
                    <DrawerTitle className="text-3xl font-bold text-gray-800">
                      Tu Carrito 🍔
                    </DrawerTitle>
                  </DrawerHeader>

                  <ScrollArea className="h-[40vh] pr-4">
                    {order.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                      >
                        <p className="text-gray-500 text-lg">
                          Tu carrito está vacío
                        </p>
                      </motion.div>
                    ) : (
                      order.map((product) => (
                        <ProductCartCard
                          key={product.uid}
                          product={product}
                        />
                      ))
                    )}
                  </ScrollArea>

                  <DrawerFooter className="px-0 mt-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold text-lg">Total:</span>
                      <span className="text-2xl font-bold text-orange-600">${price}</span>
                    </div>
                    <Button
                      size="lg"
                      className="w-full h-12 text-lg bg-orange-500 hover:bg-orange-600"
                      onClick={() => setCheckoutStep('form')}
                    >
                      Continuar compra
                    </Button>
                  </DrawerFooter>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <DrawerHeader>
                    <DrawerTitle className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                      🚚
                      Completa tu pedido
                    </DrawerTitle>
                  </DrawerHeader>
                  <ScrollArea className="h-[70vh] pr-4">
                  <div className="space-y-6">
                    {/* Delivery Type */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Tipo de entrega</Label>
                      <RadioGroup 
                        value={deliveryType}
                        onValueChange={(value: 'delivery' | 'pickup') => {
                          setValue('deliveryType', value);
                          if (value === 'pickup') setValue('address', '');
                        }}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                          <Label
                            htmlFor="delivery"
                            className="flex items-center justify-center text-xl font-extrabold p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-orange-400 peer-data-[state=checked]:border-orange-500 transition-all"
                          >
                            🚚
                            <span className="font-medium">Delivery</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                          <Label
                            htmlFor="pickup"
                            className="flex items-center justify-center text-xl font-extrabold p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-orange-400 peer-data-[state=checked]:border-orange-500 transition-all"
                          >
                            🏪
                            <span className="font-medium">Retiro en local</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Address Input */}
                    {deliveryType === 'delivery' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <Label className="text-lg font-semibold">Dirección de entrega</Label>
                        <Input
                          {...register('address')}
                          placeholder="Calle y número, departamento, referencia"
                          className="h-12 text-lg"
                        />
                        {errors.address && (
                          <p className="text-red-500 font-medium">{errors.address.message}</p>
                        )}
                      </motion.div>
                    )}

                    {/* Phone Input */}
                    <div className="space-y-2">
                      <Label className="text-lg font-semibold">Teléfono de contacto</Label>
                      <Input
                        {...register('phone')}
                        placeholder="Ej: 099123456"
                        className="h-12 text-lg"
                      />
                      {errors.phone && (
                        <p className="text-red-500 font-medium">{errors.phone.message}</p>
                      )}
                    </div>

                    {/* Payment Method */}
                    <div className="space-y-4">
                      <Label className="text-lg font-semibold">Método de pago</Label>
                      <RadioGroup 
                        value={watch('paymentMethod')}
                        onValueChange={(value: 'efectivo' | 'mercadopago') => setValue('paymentMethod', value)}
                        className="grid grid-cols-2 gap-4"
                      >
                        <div>
                          <RadioGroupItem value="efectivo" id="efectivo" className="peer sr-only" />
                          <Label
                            htmlFor="efectivo"
                            className="flex items-center justify-center p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-orange-400 peer-data-[state=checked]:border-orange-500 transition-all"
                          >
                            <span className="text-2xl">💵</span>
                            <span className="ml-2 font-medium">Efectivo</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="mercadopago" id="mercadopago" className="peer sr-only" />
                          <Label
                            htmlFor="mercadopago"
                            className="flex items-center justify-center p-6 rounded-xl border-2 border-gray-200 bg-white hover:border-orange-400 peer-data-[state=checked]:border-orange-500 transition-all"
                          >
                            <img 
                              src="/mercadopago-logo.png" 
                              className="h-6 mr-2" 
                              alt="Mercado Pago" 
                            />
                            <span className="font-medium">Mercado Pago</span>
                          </Label>
                        </div>
                      </RadioGroup>
                      {errors.paymentMethod && (
                        <p className="text-red-500 font-medium">{errors.paymentMethod.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <DrawerFooter className="px-0 mt-8">
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCheckoutStep('cart')}
                        className="h-12 flex-1 text-lg"
                      >
                        Volver al carrito
                      </Button>
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="h-12 flex-1 text-lg bg-orange-500 hover:bg-orange-600"
                      >
                        Confirmar pedido
                      </Button>
                    </div>
                  </DrawerFooter>
                  </ScrollArea>                  
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </DrawerContent>
      </Drawer>

      {/* Hero Section */}
      <section className="w-full h-screen relative flex flex-col items-center justify-center pt-24">
        <div className="absolute inset-0 bg-[url('/burg-wallp.jpg')] bg-cover bg-center bg-no-repeat">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
        
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center px-4"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-8">
            HAMBURGUESERÍA
          </h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-xl text-orange-100 leading-relaxed px-12 max-w-[1000px] mb-4"
          >
            Descubre el auténtico sabor de las hamburguesas artesanales preparadas con ingredientes 
            premium seleccionados cuidadosamente. Nuestra pasión por la calidad se traduce en cada 
            bocado que disfrutarás.
          </motion.p>
          <motion.a
            href="#tienda"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block px-8 py-4 bg-orange-500 text-white text-xl font-bold rounded-xl shadow-lg hover:bg-orange-600 transition-colors"
          >
            Ver Menú Completo
          </motion.a>
        </motion.div>
      </section>

      {/* Products Section */}
      <section 
        id="tienda"
        className="w-full py-20 px-4 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-center text-gray-800 mb-16"
          >
            Nuestro Menú
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}