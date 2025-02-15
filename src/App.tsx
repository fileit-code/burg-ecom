import { Route, Routes } from "react-router"
import Home from "./pages/Home"
import { Toaster } from 'react-hot-toast';
import { ProductProvider } from "./context/ProductContext";
import OrderProvider from "./context/OrderContext";
import SuccessDelivery from "./pages/SuccessDelivery";
import SuccessPickup from "./pages/SuccessPickup";

function App() {

  return (
    <>
    <Toaster/>
    <ProductProvider>
      <OrderProvider>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/success/delivery" element={<SuccessDelivery/>} />
          <Route path="/success/pickup" element={<SuccessPickup/>} />
        </Routes>
      </OrderProvider>
    </ProductProvider>
    </>
  )
}

export default App
