import { useState } from 'react';
import { Trash2, RotateCcw, AlertTriangle, FileText, Users, Package, UsersRound, Truck, Palmtree, Shirt } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useTrashItems, useRestoreItem, usePermanentDelete, useBulkDeleteOld, TrashEntityType } from '@/hooks/useTrash';
import { useDebounce } from '@/hooks/useDebounce';
import { formatDateHR } from '@/lib/utils';

const TABS: { value: TrashEntityType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'documents', label: 'Dokumenti', icon: FileText },
  { value: 'clients', label: 'Klijenti', icon: Users },
  { value: 'suppliers', label: 'Dobavljači', icon: Truck },
  { value: 'articles', label: 'Artikli', icon: Package },
  { value: 'employees', label: 'Zaposlenici', icon: UsersRound },
  { value: 'leave-requests', label: 'Godišnji', icon: Palmtree },
  { value: 'work-clothing', label: 'Odjeća', icon: Shirt },
];

const Trash = () => {
  const [activeTab, setActiveTab] = useState<TrashEntityType>('documents');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const { data: items = [], isLoading } = useTrashItems(activeTab);
  const restoreItem = useRestoreItem();
  const permanentDelete = usePermanentDelete();
  const bulkDeleteOld = useBulkDeleteOld();

  // Filter items by search
  const filteredItems = items.filter(item => {
    if (!debouncedSearch) return true;
    const searchLower = debouncedSearch.toLowerCase();
    return (
      item.name.toLowerCase().includes(searchLower) ||
      (item.extra_info && item.extra_info.toLowerCase().includes(searchLower))
    );
  });

  const handleRestore = async (id: string) => {
    await restoreItem.mutateAsync({ id, type: activeTab });
  };

  const handlePermanentDelete = async () => {
    if (deleteId) {
      await permanentDelete.mutateAsync({ id: deleteId, type: activeTab });
      setDeleteId(null);
    }
  };

  const handleBulkDelete = async () => {
    await bulkDeleteOld.mutateAsync();
    setBulkDeleteOpen(false);
  };

  return (
    <MainLayout 
      title="Kanta za smeće" 
      subtitle="Obrisani zapisi - vrati ili trajno obriši"
    >
      <div className="space-y-6">
        {/* Header with search and bulk action */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Pretraži u kanti..."
            className="flex-1 max-w-md"
          />
          <Button 
            variant="destructive" 
            onClick={() => setBulkDeleteOpen(true)}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Obriši trajno sve starije od 30 dana
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TrashEntityType)}>
          <TabsList className="grid w-full grid-cols-7">
            {TABS.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-2">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map(tab => (
            <TabsContent key={tab.value} value={tab.value} className="mt-6">
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">Učitavanje...</div>
              ) : filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <Trash2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {debouncedSearch ? `Nema rezultata za "${debouncedSearch}"` : 'Kanta je prazna'}
                  </h3>
                  <p className="text-muted-foreground">
                    {debouncedSearch ? 'Pokušajte s drugim pojmom' : 'Nema obrisanih zapisa u ovoj kategoriji'}
                  </p>
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Naziv</TableHead>
                          <TableHead>Dodatne informacije</TableHead>
                          <TableHead>Obrisano</TableHead>
                          <TableHead className="text-right">Akcije</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-muted-foreground">
                              {item.extra_info || '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {formatDateHR(item.deleted_at)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRestore(item.id)}
                                  disabled={restoreItem.isPending}
                                  className="gap-1"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                  Vrati
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setDeleteId(item.id)}
                                  className="gap-1"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  Obriši trajno
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Permanent Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Trajno brisanje
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ovo brisanje je <strong>nepovratno</strong>. Zapis će biti trajno obrisan iz sustava i neće ga biti moguće vratiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePermanentDelete} 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Obriši trajno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Trajno brisanje starijih zapisa
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ova radnja će <strong>trajno obrisati</strong> sve zapise iz kante koji su stariji od 30 dana.
              Ovo uključuje dokumente, klijente, dobavljače, artikle i zaposlenike.
              <br /><br />
              <strong>Ova radnja se ne može poništiti.</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Odustani</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              disabled={bulkDeleteOld.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleteOld.isPending ? 'Brišem...' : 'Obriši trajno sve starije od 30 dana'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
};

export default Trash;
