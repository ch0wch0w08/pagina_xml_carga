import { useState } from 'react';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable, type Cursor, type DataTableColumn } from '../../../component/DataTable';
import { Alert } from '../../../component/Alert';
import { useAuditoria } from '../hook/useAuditoria';

import type {
  AuditoriaEjecucion,
  AuditoriaEjecucionFilter,
} from '../type/AuditoriaTypes';
import { RejectionModal } from './RejectionModal';
import { DetailModal } from './DetailModal';

const executionStates = ['EXITOSO', 'EN_PROCESO', 'CON_ERRORES', 'ERROR', 'CANCELADO'];

const executionColumns: DataTableColumn<AuditoriaEjecucion>[] = [
  { accessorKey: 'idEjecucion', header: 'ID' }, { accessorKey: 'fechaInicio', header: 'Inicio' },
  { accessorKey: 'fechaFin', header: 'Fin' }, { accessorKey: 'estadoEjecucion', header: 'Estado' },
  { accessorKey: 'totalProcesados', header: 'Procesados' }, { accessorKey: 'totalErrores', header: 'Errores' },
  { accessorKey: 'observaciones', header: 'Observaciones' },
];

export function AuditoriaPage() {

  const [sorting, setSorting] = useState<SortingState>([{ id: 'idEjecucion', desc: true }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [filter, setFilter] = useState<AuditoriaEjecucionFilter>({});
  const [cursor, setCursor] = useState<Cursor>({});
  const [modal, setModal] = useState<{ type: 'details' | 'rejections'; id: number } | null>(null);
  const executionFilterColumns = filter.estadoEjecucion? [{ id: 'estadoEjecucion', value: filter.estadoEjecucion }] : [];

  const { data, isLoading, isError, error } = useAuditoria.useEjecuciones(sorting, executionFilterColumns, pagination, cursor);

  return (
    
  <section className="mx-auto w-full max-w-7xl space-y-6 px-5 py-8 sm:px-8">
    <div className="border-b border-border pb-6">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">Trazabilidad ETL</p>
      <h1 className="mb-2 text-2xl font-bold text-text-h sm:text-3xl">Auditoría de ejecuciones</h1>
      <p className="text-sm text-muted">Consulta ejecuciones, detalles y rechazos del proceso ETL.</p>
    </div>
    
    {isLoading && <Alert variant="loading">Cargando registros...</Alert>}

    {isError && (
      <Alert>
        No se pudieron cargar los registros: {error.message}
      </Alert>
    )}

    <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
      <label className="flex flex-col gap-1 text-sm font-medium text-text-h">
        <span className="text-xs uppercase tracking-wide text-muted">Estado de ejecución</span>
        <select 
          className="rounded-xl border border-border bg-bg p-2 text-sm" 
          value={filter.estadoEjecucion ?? ''} 
          onChange={(e) => { 
            setFilter({estadoEjecucion: e.target.value || undefined }); 
            setCursor({}); 
            setPagination((current) => ({ ...current, pageIndex: 0 })); 
          }}
        >
          <option value="">Todos</option>
          {executionStates.map((state) => 
            <option 
              key={state} 
              value={state}>{state}
            </option>
            )}
        </select>
      </label>
    </div>


    <DataTable<AuditoriaEjecucion, AuditoriaEjecucionFilter> 
      key={filter.estadoEjecucion ?? 'all'} 
      mode="server" 
      data={data} 
      sorting={sorting} 
      columnFilters={[]} 
      setSorting={setSorting} 
      setColumnFilters={() => undefined} 
      filters={filter} 
      onPaginationChange={(query) => { 
        setPagination((current) => ({ ...current, pageSize: query.limit })); 
        setCursor({ lastId: query.lastId, lastSortValue: query.lastSortValue }); 
      }} 
      columns={executionColumns} 
      create={false} 
      initialPageSize={10} 
      rowActions={(row) => 
        <div className="flex flex-wrap justify-center gap-2">
          <button 
            type="button" 
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-accent hover:bg-accent-soft" 
            onClick={() => setModal({ type: 'details', id: row.original.idEjecucion })}
          >
              Detalles
          </button>

          <button 
            type="button" 
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-semibold text-text-main hover:bg-accent-soft" 
            onClick={() => setModal({ type: 'rejections', id: row.original.idEjecucion })}
          >
            Rechazos
          </button>
        </div>
      } 
    />
    
    {modal?.type === 'details' && 
      <DetailModal idEjecucion={modal.id} onClose={() => setModal(null)} />
    }

    {modal?.type === 'rejections' && 
      <RejectionModal idEjecucion={modal.id} onClose={() => setModal(null)} />
    }
  
  </section>
)

}
