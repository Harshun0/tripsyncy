import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index";
import InfoPage from "./pages/InfoPage";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/features" element={<InfoPage page="features" />} />
            <Route path="/ai-itinerary" element={<InfoPage page="ai-itinerary" />} />
            <Route path="/about" element={<InfoPage page="about" />} />
            <Route path="/careers" element={<InfoPage page="careers" />} />
            <Route path="/blog" element={<InfoPage page="blog" />} />
            <Route path="/press" element={<InfoPage page="press" />} />
            <Route path="/help-center" element={<InfoPage page="help-center" />} />
            <Route path="/contact-us" element={<InfoPage page="help-center" />} />
            <Route path="/privacy-policy" element={<InfoPage page="privacy-policy" />} />
            <Route path="/terms-of-service" element={<InfoPage page="terms-of-service" />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
