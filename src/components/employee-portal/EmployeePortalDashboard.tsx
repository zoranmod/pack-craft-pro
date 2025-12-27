import { useState } from 'react';
import { 
  FileText, 
  Calendar, 
  Thermometer, 
  Shirt, 
  Package, 
  Users, 
  Settings,
  LogOut,
  User,
  Building2,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import type { Employee } from '@/types/employee';
import { EmployeeLeaveSection } from './sections/EmployeeLeaveSection';
import { EmployeeSickLeaveSection } from './sections/EmployeeSickLeaveSection';
import { EmployeeWorkClothingSection } from './sections/EmployeeWorkClothingSection';
import { EmployeeDocumentsSection } from './sections/EmployeeDocumentsSection';
import { EmployeeProfileSection } from './sections/EmployeeProfileSection';

interface EmployeePermissions {
  can_view_documents: boolean;
  can_create_documents: boolean;
  can_edit_documents: boolean;
  can_manage_employees: boolean;
  can_request_leave: boolean;
  can_approve_leave: boolean;
  can_request_sick_leave: boolean;
  can_view_work_clothing: boolean;
  can_view_articles: boolean;
  can_edit_articles: boolean;
  can_view_clients: boolean;
  can_edit_clients: boolean;
  can_view_settings: boolean;
  can_edit_settings: boolean;
}

interface EmployeePortalDashboardProps {
  employee: Employee;
  permissions: EmployeePermissions;
  onLogout: () => void;
}

type ActiveSection = 'profile' | 'leave' | 'sick-leave' | 'work-clothing' | 'documents';

export function EmployeePortalDashboard({ employee, permissions, onLogout }: EmployeePortalDashboardProps) {
  const [activeSection, setActiveSection] = useState<ActiveSection>('profile');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { 
      id: 'profile' as ActiveSection, 
      label: 'Moj profil', 
      icon: User, 
      enabled: true,
      description: 'Pregled osobnih podataka'
    },
    { 
      id: 'leave' as ActiveSection, 
      label: 'Godišnji odmor', 
      icon: Calendar, 
      enabled: permissions.can_request_leave,
      description: 'Zahtjevi za godišnji odmor'
    },
    { 
      id: 'sick-leave' as ActiveSection, 
      label: 'Bolovanje', 
      icon: Thermometer, 
      enabled: permissions.can_request_sick_leave,
      description: 'Evidencija bolovanja'
    },
    { 
      id: 'work-clothing' as ActiveSection, 
      label: 'Radna odjeća', 
      icon: Shirt, 
      enabled: permissions.can_view_work_clothing,
      description: 'Zadužena radna odjeća'
    },
    { 
      id: 'documents' as ActiveSection, 
      label: 'Dokumenti', 
      icon: FileText, 
      enabled: permissions.can_view_documents,
      description: 'Osobni dokumenti'
    },
  ];

  const enabledMenuItems = menuItems.filter(item => item.enabled);

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return <EmployeeProfileSection employee={employee} />;
      case 'leave':
        return <EmployeeLeaveSection employeeId={employee.id} canRequest={permissions.can_request_leave} />;
      case 'sick-leave':
        return <EmployeeSickLeaveSection employeeId={employee.id} canRequest={permissions.can_request_sick_leave} />;
      case 'work-clothing':
        return <EmployeeWorkClothingSection employeeId={employee.id} />;
      case 'documents':
        return <EmployeeDocumentsSection employeeId={employee.id} />;
      default:
        return <EmployeeProfileSection employee={employee} />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold truncate">{employee.first_name} {employee.last_name}</h2>
            <p className="text-sm text-muted-foreground truncate">{employee.position || 'Zaposlenik'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {enabledMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveSection(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                isActive 
                  ? 'bg-primary text-primary-foreground' 
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1 truncate">{item.label}</span>
              {isActive && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-destructive"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Odjavi se
        </Button>
      </div>
    </div>
  );

  const currentItem = menuItems.find(item => item.id === activeSection);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72">
                <SidebarContent />
              </SheetContent>
            </Sheet>
            <div>
              <h1 className="font-semibold">{currentItem?.label}</h1>
            </div>
          </div>
          <Badge variant="secondary">{employee.status}</Badge>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 bg-background border-r">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-72">
          <div className="p-4 lg:p-8 max-w-5xl">
            {/* Desktop Header */}
            <div className="hidden lg:block mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{currentItem?.label}</h1>
                  <p className="text-muted-foreground">{currentItem?.description}</p>
                </div>
                <Badge variant="outline" className="text-sm">
                  {employee.status === 'aktivan' ? 'Aktivan' : employee.status}
                </Badge>
              </div>
            </div>

            {/* Content */}
            {renderActiveSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
