import {useState, useContext, createContext, ReactNode} from 'react';

interface OrderProduct {
    id: number;
    name: string;
    price: number;
    description: string;
    imageURL: string | null;
    createdAt: Date;
    createdBy: number;
    comment: string;
}

export interface ArrayOrderProduct extends OrderProduct {
  uid:number;
}

interface OrderContextType {
  order: ArrayOrderProduct[];
  price: number,
  deleteProduct: (uid: number)=> void,
  addToOrder: (product: OrderProduct)=> void,
  addOrder: ({phone_number, address, deliveryType}: {phone_number: number, address: string, deliveryType: string, paymentMethod: string})=> Promise<string>,
}

const context = createContext<OrderContextType | undefined>( undefined )
  
export const useOrder = ()=>{
  const newContext = useContext(context)
  return newContext
}

const OrderProvider = ({ children }: { children: ReactNode })=>{
  const [order, setOrder] = useState<ArrayOrderProduct[]>([])
  const [price, setPrice] = useState(0)
  const url =  'https://ecommerceplantilla-back.fileit-contact.workers.dev/api';
  const [contadorUID, setContadorUID] = useState(0);

  const addToOrder = ( product: OrderProduct ) => {
    setOrder([...order, ({...product, uid: contadorUID})]);
    setContadorUID(contadorUID + 1);
    setPrice(price + product.price);
  }

  const deleteProduct = (uid: number)=>{
    try{
      order.map((orderedProduct: ArrayOrderProduct)=> orderedProduct.uid === uid && setPrice(price - orderedProduct.price));
      setOrder(order.filter((orderedProduct: ArrayOrderProduct)=> orderedProduct.uid !== uid));
    }
    catch(error){
        Promise.reject(error)
    }
  }

  const addOrder = async ({phone_number, address, deliveryType, paymentMethod}: {phone_number: number, address: string, deliveryType: string, paymentMethod: string})=>{
    try {
      const finalOrder = order.map(product => ({id: product.id, comment: product.comment}));

      if (paymentMethod== 'mercadopago') {
        let items = [];

        for await (let item of order) {
          if ( item.price > 0 ) {
              items.push({
                  id: `${item.id}`,
                  title: item.name,
                  currency_id: "ARS",
                  picture_url: item.imageURL,
                  unit_price: Number(item.price),
                  quantity: 1,
              })
          }
        }
        const preferenceResponse = await fetch(url+'/payments/createPreference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            items
          }),
        });

      if (preferenceResponse.ok) {
        const data = await preferenceResponse.json();
        // const { order, price, phone_number, address, paymentMethod, preferenceId, deliveryType } = c.req.valid("json");

        const response = await fetch(url+'/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            order: finalOrder,
            price, 
            phone_number: `${phone_number}`,
            address,
            paymentMethod,
            preferenceId: data.preference.id,
            deliveryType,
            userId: 2,
          }),
        }); 
        if (response.ok) {
          setOrder([])
          setPrice(0)
          return data.preference.init_point
        }
        else {
          return 'false';
        }
      }
    }
    else {
      const response = await fetch(url+'/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          order: finalOrder,
          price, 
          phone_number: `${phone_number}`,
          address,
          paymentMethod,
          deliveryType,
          userId: 2,
        }),
      });
      console.log(response)
      const data = await response.json()
      console.log(data)
      if (response.ok) {

        const result = await response.json()
        console.log(result)
        setOrder([])
        setPrice(0)
        return 'true'
      }
      else return 'false'
    }
  } 
  catch (error) {
    console.log(error)
    return false;
  }
}


  return (
    <context.Provider value={{
      order,
      price,
      deleteProduct,
      addToOrder,
      addOrder,
    }}>
      {children}
    </context.Provider>
  );
}

export default OrderProvider