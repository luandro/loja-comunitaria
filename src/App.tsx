
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProductProvider } from "@/hooks/use-products";
import { CartProvider } from "@/context/CartContext";
import { SiteContentProvider } from "@/context/SiteContentContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { WhatsAppFloat } from "./components/WhatsAppFloat";
import { StoreDiagnostics } from "./components/StoreDiagnostics";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CommunityPage from "./pages/Community";
import StoreCheck from "./pages/StoreCheck";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
   <SiteContentProvider>
    <ProductProvider>
      <TooltipProvider>
        <BrowserRouter>
          <CartProvider>
            <div className="flex flex-col min-h-screen">
              <StoreDiagnostics />
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/produtos" element={<Products />} />
                  <Route path="/produto/:id" element={<ProductDetails />} />
                  <Route path="/carrinho" element={<Cart />} />
                  <Route path="/sobre" element={<About />} />
                  <Route path="/contato" element={<Contact />} />
                  <Route path="/comunidade/:slug" element={<CommunityPage />} />
                  <Route path="/verificar-loja" element={<StoreCheck />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <WhatsAppFloat />
            <Toaster />
            <Sonner />
          </CartProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ProductProvider>
   </SiteContentProvider>
  </QueryClientProvider>
);

export default App;
