import { Route, Routes } from "react-router"
import Shop from "./pages/Shop"
import { Toaster } from 'react-hot-toast';
import { ProductProvider } from "./context/ProductContext";
import OrderProvider from "./context/OrderContext";
import SuccessDelivery from "./pages/SuccessDelivery";
import SuccessPickup from "./pages/SuccessPickup";
import LandingPage from "./pages/LandingPage";

function App() {

  return (
    <>
    <Toaster/>
    <ProductProvider>
      <OrderProvider>
        <Routes>
          <Route path="/" element={<LandingPage/>} />
          <Route path="/:username" element={<Shop/>}/>
          <Route path="/success/delivery" element={<SuccessDelivery/>} />
          <Route path="/success/pickup" element={<SuccessPickup/>} />
        </Routes>
      </OrderProvider>
    </ProductProvider>
    </>
  )
}

export default App
