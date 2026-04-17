import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'
import Checkout from './pages/Checkout'
import Success from './pages/Success'
import Cancel from './pages/Cancel'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Standalone pages — no Navbar/Cart overlay */}
        <Route path="/success"  element={<Success />} />
        <Route path="/cancel"   element={<Cancel />} />

        {/* Checkout — has Navbar but no cart drawer */}
        <Route
          path="/checkout"
          element={
            <>
              <Navbar />
              <div className="pt-16">
                <Checkout />
              </div>
            </>
          }
        />

        {/* Main storefront */}
        <Route
          path="/*"
          element={
            <>
              <Navbar />
              <CartDrawer />
              <div className="pt-16">
                <Home />
              </div>
            </>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
