import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Pencil, Trash2 } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useEmployee, useEmployees } from '@/hooks/useEmployees';
import { useState } from 'react';
import { EmployeeFormDialog } from '@/components/employees/EmployeeFormDialog';
import { EmployeeInfoTab } from '@/components/employees/EmployeeInfoTab';
import { LeaveTab } from '@/components/employees/LeaveTab';
import { SickLeaveTab } from '@/components/employees/SickLeaveTab';
import { WorkClothingTab } from '@/components/employees/WorkClothingTab';
import { DocumentsTab } from '@/components/employees/DocumentsTab';
import { EmployeeAccountTab } from '@/components/employees/EmployeeAccountTab';
import { EmployeePermissionsTab } from '@/components/employees/EmployeePermissionsTab';

export default function EmployeeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: employee, isLoading } = useEmployee(id);
  const { deleteEmployee } = useEmployees();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    await deleteEmployee.mutateAsync(id);
    navigate('/employees');
  };

  if (isLoading) {
    return (
      <MainLayout title="Učitavanje..." subtitle="">
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 w-full" />
        </div>
      </MainLayout>
    );
  }

  if (!employee) {
    return (
      <MainLayout title="Zaposlenik nije pronađen" subtitle="">
        <Button variant="outline" onClick={() => navigate('/employees')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Natrag na listu
        </Button>
      </MainLayout>
    );
  }

  return (
    <MainLayout
      title={`${employee.first_name} ${employee.last_name}`}
      subtitle={employee.position || 'Bez pozicije'}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <Button variant="outline" onClick={() => navigate('/employees')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Natrag
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Uredi
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Obriši
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ova akcija će trajno obrisati zaposlenika i sve povezane podatke (godišnji,
                    bolovanja, oprema, dokumenti). Ova akcija se ne može poništiti.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Odustani</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Obriši</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge variant={employee.status === 'aktivan' ? 'default' : 'secondary'}>
            {employee.status}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {employee.employment_type}
          </Badge>
          {employee.department && <Badge variant="outline">{employee.department}</Badge>}
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="info">Podaci</TabsTrigger>
            <TabsTrigger value="account">Račun</TabsTrigger>
            <TabsTrigger value="permissions">Dozvole</TabsTrigger>
            <TabsTrigger value="leave">Godišnji</TabsTrigger>
            <TabsTrigger value="sick">Bolovanja</TabsTrigger>
            <TabsTrigger value="clothing">Odjeća</TabsTrigger>
            <TabsTrigger value="documents">Dokumenti</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="mt-6">
            <EmployeeInfoTab employee={employee} />
          </TabsContent>

          <TabsContent value="account" className="mt-6">
            <EmployeeAccountTab employee={employee} />
          </TabsContent>

          <TabsContent value="permissions" className="mt-6">
            <EmployeePermissionsTab employeeId={employee.id} hasAccount={!!employee.auth_user_id} />
          </TabsContent>

          <TabsContent value="leave" className="mt-6">
            <LeaveTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="sick" className="mt-6">
            <SickLeaveTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="clothing" className="mt-6">
            <WorkClothingTab employeeId={employee.id} />
          </TabsContent>

          <TabsContent value="documents" className="mt-6">
            <DocumentsTab employeeId={employee.id} />
          </TabsContent>
        </Tabs>
      </div>

      <EmployeeFormDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        employee={employee}
      />
    </MainLayout>
  );
}
