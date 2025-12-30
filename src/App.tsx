import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ThemeProvider } from "@/hooks/useTheme";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Documents from "./pages/Documents";
import NewDocument from "./pages/NewDocument";
import DocumentView from "./pages/DocumentView";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Clients from "./pages/Clients";
import Articles from "./pages/Articles";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import EmployeePortal from "./pages/EmployeePortal";
import ContractEditor from "./pages/ContractEditor";
import DocumentTemplates from "./pages/DocumentTemplates";
import TemplateEditor from "./pages/TemplateEditor";
import Ponude from "./pages/Ponude";
import Ugovori from "./pages/Ugovori";
import Otpremnice from "./pages/Otpremnice";
import Nalozi from "./pages/Nalozi";
import Racuni from "./pages/Racuni";
import Kalendar from "./pages/Kalendar";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/employee-portal" element={<EmployeePortal />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                <Route path="/documents/new" element={<ProtectedRoute><NewDocument /></ProtectedRoute>} />
                <Route path="/documents/:id" element={<ProtectedRoute><DocumentView /></ProtectedRoute>} />
                <Route path="/documents/:id/edit" element={<ProtectedRoute><NewDocument /></ProtectedRoute>} />
                <Route path="/ponude" element={<ProtectedRoute><Ponude /></ProtectedRoute>} />
                <Route path="/ugovori" element={<ProtectedRoute><Ugovori /></ProtectedRoute>} />
                <Route path="/otpremnice" element={<ProtectedRoute><Otpremnice /></ProtectedRoute>} />
                <Route path="/nalozi" element={<ProtectedRoute><Nalozi /></ProtectedRoute>} />
                <Route path="/racuni" element={<ProtectedRoute><Racuni /></ProtectedRoute>} />
                <Route path="/kalendar" element={<ProtectedRoute><Kalendar /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/articles" element={<ProtectedRoute><Articles /></ProtectedRoute>} />
                <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
                <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
                <Route path="/contracts/new" element={<ProtectedRoute><ContractEditor /></ProtectedRoute>} />
                <Route path="/settings/templates" element={<ProtectedRoute><DocumentTemplates /></ProtectedRoute>} />
                <Route path="/settings/templates/new" element={<ProtectedRoute><TemplateEditor /></ProtectedRoute>} />
                <Route path="/settings/templates/:id" element={<ProtectedRoute><TemplateEditor /></ProtectedRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
