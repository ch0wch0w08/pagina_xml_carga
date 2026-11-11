import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { DataTable, type Cursor, type DataTableColumn } from "../../../component/DataTable";
import { useAuditoria } from "../hook/useAuditoria";
import { Modal } from "../../../component/Modal";
import { Alert } from "../../../component/Alert";
import type { AuditoriaRechazo } from "../type/AuditoriaTypes";

const rejectionColumns: DataTableColumn<AuditoriaRechazo>[] = [
  { accessorKey: 'idRechazo', header: 'ID' }, { accessorKey: 'urlOrigen', header: 'URL' },
  { accessorKey: 'idStg', header: 'ID STG' }, { accessorKey: 'motivo', header: 'Motivo' },
  { accessorKey: 'filaOriginal', header: 'Fila original' }, { accessorKey: 'fechaRechazo', header: 'Fecha' },
];

export function RejectionModal({ idEjecucion, onClose }: { idEjecucion: number; onClose: () => void }) {
  
  const [sorting, setSorting] = useState<SortingState>([{ id: 'idRechazo', desc: false }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [cursor, setCursor] = useState<Cursor>({});
  const { data, isLoading, isError, error } = useAuditoria.useRechazos(idEjecucion, sorting, pagination, cursor);
  
  return (
    <Modal 
      title={`Rechazos de ejecución #${idEjecucion}`} 
      onClose={onClose}
    >
      {isLoading && <Alert variant="loading">Cargando rechazos...</Alert>}

      {isError && <Alert>{error.message}</Alert>}

      <DataTable<AuditoriaRechazo, Record<string, never>> 
        mode="server" 
        data={data} 
        sorting={sorting} 
        columnFilters={[]} 
        setSorting={setSorting} 
        setColumnFilters={() => undefined} 
        onPaginationChange={(query) => { setPagination((current) => ({ ...current, pageSize: query.limit })); 
        setCursor({ lastId: query.lastId, lastSortValue: query.lastSortValue }); }} 
        columns={rejectionColumns} 
        create={false} 
        initialPageSize={10} 
      />
  </Modal>
  );
  
}
