import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PriceProvider } from "@/contexts/PriceContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import Landing from "./pages/Landing";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import { DashboardLayout } from "@/components/DashboardLayout";
import Overview from "./pages/dashboard/Overview";
import Wallet from "./pages/dashboard/Wallet";
import Market from "./pages/dashboard/Market";
import Trade from "./pages/dashboard/Trade";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <PriceProvider syncInterval={10000}>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<Overview />} />
                  <Route path="wallet" element={<Wallet />} />
                  <Route path="market" element={<Market />} />
                  <Route path="trade" element={<Trade />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </TooltipProvider>
            </PriceProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;
