import Navbar from './components/Navbar'
import CartDrawer from './components/CartDrawer'
import Home from './pages/Home'

export default function App() {
  return (
    <>
      <Navbar />
      <CartDrawer />
      <div className="pt-16">
        <Home />
      </div>
    </>
  )
}
