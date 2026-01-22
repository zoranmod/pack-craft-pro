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
import PrintDocument from "./pages/PrintDocument";
import OpenPdf from "./pages/OpenPdf";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Clients from "./pages/Clients";
import Articles from "./pages/Articles";
import Employees from "./pages/Employees";
import EmployeeDetail from "./pages/EmployeeDetail";
import EmployeePortal from "./pages/EmployeePortal";
import ContractEditor from "./pages/ContractEditor";
import ContractEditorEdit from "./pages/ContractEditorEdit";
import FurnitureContractEditor from "./pages/FurnitureContractEditor";
import DocumentTemplates from "./pages/DocumentTemplates";
import TemplateEditor from "./pages/TemplateEditor";
import Ponude from "./pages/Ponude";
import Ugovori from "./pages/Ugovori";
import Otpremnice from "./pages/Otpremnice";
import Nalozi from "./pages/Nalozi";
import Racuni from "./pages/Racuni";
import Kalendar from "./pages/Kalendar";
import Dobavljaci from "./pages/Dobavljaci";
import Trash from "./pages/Trash";
import GodisnjiOdmori from "./pages/GodisnjiOdmori";
import RadnaOdjeca from "./pages/RadnaOdjeca";
import Bolovanja from "./pages/Bolovanja";
import AdminQA from "./pages/AdminQA";
import Reports from "./pages/Reports";
import ContractLayoutTemplates from "./pages/ContractLayoutTemplates";
import ContractLayoutEditor from "./pages/ContractLayoutEditor";
import PonudaKomarnici from "./pages/PonudaKomarnici";
import NewMosquitoNetQuote from "./pages/NewMosquitoNetQuote";
import MosquitoNetPriceList from "./pages/MosquitoNetPriceList";
import Reklamacije from "./pages/Reklamacije";
import { AdminProtectedRoute } from "@/components/AdminProtectedRoute";
import {
  AdminDashboard,
  AdminSettings,
  AdminTemplates,
  AdminUsers,
  AdminHolidays,
  AdminAudit
} from "./pages/admin";

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
                <Route path="/print/:id" element={<ProtectedRoute><PrintDocument /></ProtectedRoute>} />
                <Route path="/pdf/:id" element={<ProtectedRoute><OpenPdf /></ProtectedRoute>} />
                <Route path="/ponude" element={<ProtectedRoute><Ponude /></ProtectedRoute>} />
                <Route path="/ponuda-komarnici" element={<ProtectedRoute><PonudaKomarnici /></ProtectedRoute>} />
                <Route path="/ponuda-komarnici/nova" element={<ProtectedRoute><NewMosquitoNetQuote /></ProtectedRoute>} />
                <Route path="/ponuda-komarnici/:id/edit" element={<ProtectedRoute><NewMosquitoNetQuote /></ProtectedRoute>} />
                <Route path="/ponuda-komarnici/cjenik" element={<ProtectedRoute><MosquitoNetPriceList /></ProtectedRoute>} />
                <Route path="/ugovori" element={<ProtectedRoute><Ugovori /></ProtectedRoute>} />
                <Route path="/ugovori/predlosci" element={<ProtectedRoute><ContractLayoutTemplates /></ProtectedRoute>} />
                <Route path="/ugovori/predlosci/novi" element={<ProtectedRoute><ContractLayoutEditor /></ProtectedRoute>} />
                <Route path="/ugovori/predlosci/:id" element={<ProtectedRoute><ContractLayoutEditor /></ProtectedRoute>} />
                <Route path="/otpremnice" element={<ProtectedRoute><Otpremnice /></ProtectedRoute>} />
                <Route path="/nalozi" element={<ProtectedRoute><Nalozi /></ProtectedRoute>} />
                <Route path="/racuni" element={<ProtectedRoute><Racuni /></ProtectedRoute>} />
                <Route path="/reklamacije" element={<ProtectedRoute><Reklamacije /></ProtectedRoute>} />
                <Route path="/kalendar" element={<ProtectedRoute><Kalendar /></ProtectedRoute>} />
                <Route path="/dobavljaci" element={<ProtectedRoute><Dobavljaci /></ProtectedRoute>} />
                <Route path="/godisnji-odmori" element={<ProtectedRoute><GodisnjiOdmori /></ProtectedRoute>} />
                <Route path="/bolovanja" element={<ProtectedRoute><Bolovanja /></ProtectedRoute>} />
                <Route path="/radna-odjeca" element={<ProtectedRoute><RadnaOdjeca /></ProtectedRoute>} />
                <Route path="/trash" element={<ProtectedRoute><Trash /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/articles" element={<ProtectedRoute><Articles /></ProtectedRoute>} />
                <Route path="/employees" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
                <Route path="/employees/:id" element={<ProtectedRoute><EmployeeDetail /></ProtectedRoute>} />
                <Route path="/contracts/new" element={<ProtectedRoute><ContractEditor /></ProtectedRoute>} />
                <Route path="/contracts/new/furniture" element={<ProtectedRoute><FurnitureContractEditor /></ProtectedRoute>} />
                <Route path="/documents/:id/edit-contract" element={<ProtectedRoute><ContractEditorEdit /></ProtectedRoute>} />
                <Route path="/settings/templates" element={<ProtectedRoute><DocumentTemplates /></ProtectedRoute>} />
                <Route path="/settings/templates/new" element={<ProtectedRoute><TemplateEditor /></ProtectedRoute>} />
                <Route path="/settings/templates/:id" element={<ProtectedRoute><TemplateEditor /></ProtectedRoute>} />
                {/* Admin routes - protected by AdminProtectedRoute */}
                <Route path="/admin" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                <Route path="/admin/settings" element={<AdminProtectedRoute><AdminSettings /></AdminProtectedRoute>} />
                <Route path="/admin/templates" element={<AdminProtectedRoute><AdminTemplates /></AdminProtectedRoute>} />
                <Route path="/admin/users" element={<AdminProtectedRoute><AdminUsers /></AdminProtectedRoute>} />
                <Route path="/admin/holidays" element={<AdminProtectedRoute><AdminHolidays /></AdminProtectedRoute>} />
                <Route path="/admin/qa" element={<AdminProtectedRoute><AdminQA /></AdminProtectedRoute>} />
                <Route path="/admin/audit" element={<AdminProtectedRoute><AdminAudit /></AdminProtectedRoute>} />
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
