import type { PaginationState, SortingState } from "@tanstack/react-table";
import { useState } from "react";
import { DataTable, type Cursor, type DataTableColumn } from "../../../component/DataTable";
import { useAuditoria } from "../hook/useAuditoria";
import { Modal } from "../../../component/Modal";
import { Alert } from "../../../component/Alert";
import type { AuditoriaDetalle, AuditoriaDetalleFilter } from "../type/AuditoriaTypes";
import type { PaginationQuery } from "../../../types/pagination";

const detailColumns: DataTableColumn<AuditoriaDetalle>[] = [
  { accessorKey: 'idDetalle', header: 'ID' }, 
  { accessorKey: 'url', header: 'URL' },
  { accessorKey: 'anioEje', header: 'Año' }, 
  { accessorKey: 'estadoUrl', header: 'Estado URL' },
  { accessorKey: 'httpStatus', header: 'HTTP' }, 
  { accessorKey: 'registrosEsperados', header: 'Esperados' },
  { accessorKey: 'registrosRecibidos', header: 'Recibidos' }, {
     accessorKey: 'registrosInsertados', header: 'Insertados' },
  { accessorKey: 'intentos', header: 'Intentos' }, 
  { accessorKey: 'duracionMs', header: 'Duración (ms)' },
  { accessorKey: 'tipoError', header: 'Tipo de error' }, 
  { accessorKey: 'fechaIntento', header: 'Fecha' },
];

const urlStates = ['EXITO', 'EXITO_CON_DIFERENCIA', 'ERROR_SIN_REGISTROS', 'DIFERENCIA_INSERCION', 'EXITO_SIN_DATOS'];
const httpStatuses = [200, 201, 400, 404, 500];

export function DetailModal({ idEjecucion, onClose }: { idEjecucion: number; onClose: () => void }) {

  const [sorting, setSorting] = useState<SortingState>([{ id: 'idDetalle', desc: false }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [filters, setFilters] = useState<AuditoriaDetalleFilter>({});
  const [cursor, setCursor] = useState<Cursor>({});
  const { data, isLoading, isError, error } = useAuditoria.useDetalles(idEjecucion, sorting, pagination, filters, cursor);
  const { data: anios } = useAuditoria.useAnios();

  const changeFilter = (key: keyof AuditoriaDetalleFilter, value: string) => {
    setFilters((current) => 
      ({ 
        ...current, 
        [key]: value ? Number(value) || value : undefined 
      })
  );
    setCursor({});
    setPagination((current) => ({ ...current, pageIndex: 0 }));
  };

  const requestPage = (query: PaginationQuery) => {
    setPagination((current) => ({ ...current, pageSize: query.limit }));
    setCursor({ lastId: query.lastId, lastSortValue: query.lastSortValue });
  };

  return <Modal title={`Detalles de ejecución #${idEjecucion}`} onClose={onClose}>
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm font-medium text-text-h">
        <span className="text-xs uppercase tracking-wide text-muted">Año</span>
        <select 
          className="rounded-xl border border-border bg-bg p-2 text-sm" 
          value={filters.anioEje ?? ''} 
          onChange={(e) => changeFilter('anioEje', e.target.value)}
        >
          <option value="">Todos</option>
          {anios?.map((anio) => <option key={anio} value={anio}>{anio}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-text-h">
        <span className="text-xs uppercase tracking-wide text-muted">Estado URL</span>
        <select 
          className="rounded-xl border border-border bg-bg p-2 text-sm" 
          value={filters.estadoUrl ?? ''} 
            onChange={(e) => { 
              setFilters((current) => ({ 
                ...current, 
                estadoUrl: e.target.value || undefined 
              })); 
            setCursor({}); 
          }}
        >
          <option value="">Todos</option>
          {urlStates.map((state) => <option key={state} value={state}>{state}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium text-text-h">
        <span className="text-xs uppercase tracking-wide text-muted">HTTP status</span>
        <select 
          className="rounded-xl border border-border bg-bg p-2 text-sm" 
          value={filters.httpStatus ?? ''} 
          onChange={(e) => changeFilter('httpStatus', e.target.value)}
        >
          <option value="">Todos</option>
          {httpStatuses.map((status) => 
            <option key={status} value={status}>{status}</option>
          )}
        </select>
      </label>
    </div>
    
    {isLoading && 
      <Alert variant="loading">Cargando detalles...</Alert>
    }

    {isError && 
      <Alert>{error.message}</Alert>
    }

    <DataTable<AuditoriaDetalle, AuditoriaDetalleFilter> 
      key={`${filters.anioEje ?? ''}-${filters.estadoUrl ?? ''}-${filters.httpStatus ?? ''}`} 
      mode="server" data={data} 
      sorting={sorting} 
      columnFilters={[]} 
      setSorting={setSorting} 
      setColumnFilters={() => undefined} 
      onPaginationChange={requestPage} 
      columns={detailColumns} 
      create={false} 
      filters={filters} 
      initialPageSize={10} 
    />
  
  </Modal>;
}