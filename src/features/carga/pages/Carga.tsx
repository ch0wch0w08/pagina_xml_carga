import {
  Activity,
  Ban,
  CheckCircle2,
  LoaderCircle,
  Pencil,
  Play,
  RotateCcw,
  Terminal,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ColumnFiltersState, PaginationState, SortingState } from '@tanstack/react-table';
import { DataTable, type DataTableColumn } from '../../../component/DataTable';
import { Alert } from '../../../component/Alert';
import { Dialog } from '../../../component/Dialog';
import { Modal } from '../../../component/Modal';
import { UrlForm } from '../components/UrlForm';
import { getCargaErrorMessage, useUrlMutations, useUrlYears, useUrls } from '../hook/useCarga';
import { CargaService } from '../service/CargaService';
import type { EtlEvent, EtlJob, UrlRecord } from '../type/CargaTypes';
import type { PaginationQuery } from '../../../types/pagination';
import type { UrlFilter } from '../type/CargaTypes';
import type { UrlFormInput, UrlFormValues } from '../schemas/urlFormSchema';

const emptyForm: UrlFormInput = { urlValue: '', cantidadRegistros: '' };
const initialJob: EtlJob | null = null;
const cargaStateKey = 'carga-etl-state';

type PersistedCargaState = {
  job: EtlJob | null;
  events: EtlEvent[];
};

function readPersistedState(): PersistedCargaState {
  try {
    const stored = window.localStorage.getItem(cargaStateKey);
    if (!stored) 
      return { 
        job: initialJob, 
        events: [] 
      };

    const parsed = JSON.parse(stored) as PersistedCargaState;

    return {
      job: parsed.job ?? null,
      events: Array.isArray(parsed.events) ? parsed.events : [],
    };

  } catch {
    return { job: initialJob, events: [] };
  }
}

export function CargaPage() {
  const [year, setYear] = useState('');
  const [sorting, setSorting] = useState<SortingState>([{ id: 'idUrl', desc: false }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });
  const [cursor, setCursor] = useState<{ lastId?: number | null; lastSortValue?: unknown }>({});
  const [job, setJob] = useState<EtlJob | null>(() => readPersistedState().job);
  const [events, setEvents] = useState<EtlEvent[]>(() => readPersistedState().events);
  const [actionError, setActionError] = useState<string | null>(null);
  const [urlQueryErrorDismissed, setUrlQueryErrorDismissed] = useState(false);
  const [modal, setModal] = useState<'create' | UrlRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UrlRecord | null>(null);
  const eventSource = useRef<EventSource | null>(null);
  const yearsQuery = useUrlYears();
  
  const urlsQuery = useUrls({
      limit: pagination.pageSize,
      sortBy: sorting[0]?.id ?? 'idUrl',
      direction: sorting[0]?.desc ? 'DESC' : 'ASC',
      lastId: cursor.lastId,
      lastSortValue: cursor.lastSortValue,
    }, 
    year ? { anio: Number(year) } : {}
  );

  const mutations = useUrlMutations();

  useEffect(() => {
    if (!urlsQuery.isError) setUrlQueryErrorDismissed(false);
  }, [urlsQuery.isError]);

  const appendEvent = useCallback((event: EtlEvent) => {

    setEvents((current) => {
      const alreadyReceived = current.some((item) =>
        item.timestamp === event.timestamp
        && item.type === event.type
        && item.message === event.message
      );
      return alreadyReceived ? current : [...current.slice(-199), event];
    });

    if (event.type === 'ETL_ERROR') {
      const databaseError = typeof event.data.error === 'string'
        ? event.data.error
        : 'No se pudo guardar el lote en la base de datos.';
      setActionError(databaseError);
    }

    if (event.type === 'ETL_FINALIZADO') {
      setJob((current) => current ? { 
        ...current, 
        status: event.data.estado as EtlJob['status'] 
      } : current);
    }

  }, []);

  useEffect(() => {
    window.localStorage.setItem(cargaStateKey, JSON.stringify({ job, events }));
  }, [job, events]);

  const shouldReconnect = Boolean(job && !['SUCCEEDED', 'FAILED', 'CANCELLED'].includes(job.status));
  const jobId = job?.jobId;

  useEffect(() => {
    if (!shouldReconnect || !jobId) 
      return;

    let active = true;
    const source = new EventSource(CargaService.eventsUrl(jobId));
    eventSource.current = source;
    
    const handleEvent = (message: MessageEvent<string>) => {
      if (active) appendEvent(JSON.parse(message.data) as EtlEvent);
    };

    ['ETL_INICIADO', 'PROGRESO', 'ETL_FINALIZADO', 'CANCELACION_SOLICITADA', 'PROCESS_STARTED', 'STDERR', 'ETL_ERROR'].forEach((eventType) => source.addEventListener(eventType, handleEvent));
    source.onerror = () => source.close();

    const refreshJob = () => {
      void CargaService.getJob(jobId)
        .then((currentJob) => {
          if (active) setJob(currentJob);
        })
        .catch(() => undefined);
    };
    refreshJob();

    const statusPoll = window.setInterval(refreshJob, 1000);
    return () => {
      active = false;
      source.close();
      window.clearInterval(statusPoll);
      if (eventSource.current === source) eventSource.current = null;
    };

  }, [appendEvent, jobId, shouldReconnect]);

  const openCreate = () => {
    setActionError(null);
    setModal('create');
  };
  const openEdit = (url: UrlRecord) => {
    setActionError(null);
    setModal(url);
  };
  const closeModal = () => {
    if (mutations.create.isPending || mutations.update.isPending) 
      return;
    setActionError(null);
    setModal(null);
  };
  const openDelete = (url: UrlRecord) => {
    setActionError(null);
    setDeleteTarget(url);
  };
  const closeDelete = () => {
    if (!mutations.remove.isPending) 
      setDeleteTarget(null);
  };

  const handlePaginationChange = (nextQuery: PaginationQuery, filter: UrlFilter) => {
    setPagination((current) => ({
      ...current,
      pageIndex: nextQuery.lastId == null ? 0 : current.pageIndex,
      pageSize: nextQuery.limit,
    }));
    setCursor({
      lastId: nextQuery.lastId ?? null,
      lastSortValue: nextQuery.lastSortValue ?? null,
    });
    setColumnFilters(Object.entries(filter).map(([id, value]) => ({ id, value })));
  };

  const saveUrl = async (values: UrlFormValues) => {
    setActionError(null);

    const payload = {
      UrlValue: values.urlValue.trim(),
      CantidadRegistros: values.cantidadRegistros,
    };

    try {
      if (modal === 'create') { 
        await mutations.create.mutateAsync(payload);
      }
      else if (modal) 
        await mutations.update.mutateAsync({ 
          id: modal.idUrl, 
          payload 
        });
      setModal(null);
    } catch (error) {
      setActionError(getCargaErrorMessage(error, 'No se pudo guardar la URL.'));
    }

  };

  const deleteUrl = async () => {

    if (!deleteTarget) return;
    setActionError(null);
    try {
      await mutations.remove.mutateAsync(deleteTarget.idUrl);
      setDeleteTarget(null);
    } catch (error) {
      setActionError(getCargaErrorMessage(error, 'No se pudo eliminar la URL.'));
    }

  };

  const startJob = async () => {
    setActionError(null);
    setEvents([]);
    try {
      const started = await CargaService.startJob();
      setJob({ jobId: started.jobId, idEjecucion: null, status: 'RUNNING', exitCode: null });
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudo iniciar la carga.');
    }

  };

  const cancelJob = async () => {

    if (!job) return;
    try {
      await CargaService.cancelJob(job.jobId);
      setJob((current) => current ? { ...current, status: 'CANCELLING' } : current);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'No se pudo cancelar la carga.');
    }

  };

  const isRunning = job?.status === 'RUNNING' || job?.status === 'CANCELLING';

  const progressEvent = [...events].reverse().find((event) => event.type === 'PROGRESO');
  
  const progress = typeof progressEvent?.data.porcentaje === 'number' ? progressEvent.data.porcentaje : 0;
  
  const columns: DataTableColumn<UrlRecord>[] = [
    { accessorKey: 'idUrl', header: 'ID', cell: (info) => <span className="font-semibold">{info.getValue<number>()}</span>, enableSorting: true },
    { accessorKey: 'urlValue', header: 'URL', cell: (info) => <span className="block max-w-[42rem] whitespace-normal break-all text-accent">{info.getValue<string>()}</span>, enableSorting: false },
    { accessorKey: 'anio', header: 'Año', cell: (info) => info.getValue<number>(), enableSorting: true },
    { accessorKey: 'cantidadRegistros', header: 'Registros esperados', cell: (info) => info.getValue<number | null>() ?? '—', enableSorting: true },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl space-y-6 px-5 py-8 sm:px-8">

      <header className="flex flex-col gap-5 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">Gestión de cargas</p>
          <h1 className="mb-2 text-2xl font-bold text-text-h sm:text-3xl">Carga de XML</h1>
          <p className="text-sm text-muted">Administra las URLs y supervisa el proceso ETL en tiempo real.</p>
        </div>

        <button 
          type="button" 
          onClick={startJob}
          disabled={isRunning} 
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 font-semibold text-white shadow-lg shadow-accent/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isRunning ? <LoaderCircle className="animate-spin" size={18} /> : <Play size={18} />} Iniciar carga
        </button>
      </header>

      {actionError && 
        <Alert onClose={() => setActionError(null)}>{actionError}</Alert>
      }

      {urlsQuery.isLoading && (
        <Alert variant="loading">Cargando URLs...</Alert>
      )}
      
      {urlsQuery.isError && !urlQueryErrorDismissed && (
        <Alert onClose={() => setUrlQueryErrorDismissed(true)}>
          No se pudieron cargar las URLs: {urlsQuery.error.message}
        </Alert>
      )}

      <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
          <label className="flex flex-col gap-1 text-sm font-medium text-text-h">
            <span className="text-xs uppercase tracking-wide text-muted">Filtrar por año</span>
            <select 
              value={year} 
              onChange={(event) => { 
                setYear(event.target.value); 
                setCursor({}); 
                setPagination((current) => ({ ...current, pageIndex: 0 })); 
              }} 
              className="w-48 rounded-xl border border-border bg-bg px-3 py-2 text-sm"
            >
              <option value="">Todos los años</option>
              {yearsQuery.data?.map((availableYear) => (
                <option key={availableYear} value={availableYear}>{availableYear}</option>
              ))}
            </select>
          </label>

          <button 
            type="button" 
            onClick={() => void urlsQuery.refetch()} 
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-h hover:bg-accent-soft"
          >
            <RotateCcw size={16}/> 
            <span className='text-xs'>Actualizar</span>
          </button>
      </div>

      <DataTable
        key={year || 'all-years'}
        mode="server"
        data={urlsQuery.data}
        columns={columns}
        sorting={sorting}
        columnFilters={columnFilters}
        setSorting={setSorting}
        setColumnFilters={setColumnFilters}
        filters={year ? { anio: Number(year) } : {}}
        onPaginationChange={handlePaginationChange}
        create
        setOpenCreate={openCreate}
        defaultSortBy="idUrl"
        initialPageSize={10}
        rowActions={(row) => (
          <div className="flex items-center justify-center gap-2">
            <button type="button" title="Editar URL" aria-label="Editar URL" onClick={() => openEdit(row.original)} className="rounded-lg p-2 text-accent hover:bg-accent-soft"><Pencil size={16} /></button>
            <button type="button" title="Eliminar URL" aria-label="Eliminar URL" onClick={() => openDelete(row.original)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button>
          </div>
        )}
      />

      <section className="overflow-hidden rounded-2xl bg-[#102f3d] shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4 text-white">

          <div className="flex items-center gap-3"><Terminal className="text-[#7de1dc]" size={20} />
            <div>
              <h2 className="font-bold">Monitor de ejecución</h2>
              <p className="text-xs text-white/60">{job ? `Job ${job.jobId}` : 'Sin ejecución activa'}</p>
            </div>
          </div>

          {isRunning && 
            <button 
              type="button" 
              onClick={() => void cancelJob()} 
              disabled={job?.status === 'CANCELLING'} 
              className="inline-flex items-center gap-2 rounded-lg border border-red-300/40 px-3 py-2 text-sm font-semibold text-red-200 hover:bg-red-400/10 disabled:opacity-50"
            >
              <Ban size={16}/> 
              Cancelar
            </button>
          }

        </div>

        <div className="space-y-4 p-5">
          {job && 
            <div>
              <div className="mb-2 flex justify-between text-xs text-white/70">
                <span className="inline-flex items-center gap-2">
                  {job.status === 'SUCCEEDED' ? <CheckCircle2 size={15} /> : <Activity size={15} />} {job.status}
                </span>
                <span>{progress.toFixed(1)}%</span>
              </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[#7de1dc] transition-all" style={{ width: `${progress}%` }} />
                  </div>
            </div>
          }

          <div className="h-72 overflow-y-auto rounded-xl border border-white/10 bg-[#071c26] p-4 font-mono text-xs leading-relaxed text-[#b8d5d9]">
            {!events.length && 
              <p className="text-white/40">Los eventos de la ejecución aparecerán aquí...</p>
            }
            {events.map((event, index) => (
              <div key={`${event.timestamp}-${index}`} className="mb-2">
                <span className="text-[#6b9aa3]">[{new Date(event.timestamp).toLocaleTimeString()}]</span>{' '}
                <span className="font-bold text-[#7de1dc]">{event.type}</span>{' '}
                {event.message}
                {event.type === 'ETL_ERROR' && typeof event.data.error === 'string' && (
                  <span className="text-red-300">: {event.data.error}</span>
                )}
              </div>
            ))}
          </div>

        </div>
      </section>

      {modal && (
        <Modal title={modal === 'create' ? 'Nueva URL de carga' : 'Editar URL de carga'} onClose={closeModal}>
          <UrlForm
            initialValue={modal === 'create' ? emptyForm : { 
              urlValue: modal.urlValue ?? '', 
              cantidadRegistros: String(modal.cantidadRegistros ?? '') 
            }}
            submitting={mutations.create.isPending || mutations.update.isPending}
            error={actionError}
            onCancel={closeModal}
            onSubmit={saveUrl}
          />
        </Modal>
      )}

      {deleteTarget && (
        <Dialog
          title="Eliminar URL"
          message={<>¿Estás seguro de eliminar la URL <strong>{deleteTarget.urlValue}</strong>?</>}
          confirmLabel="Eliminar"
          pending={mutations.remove.isPending}
          error={mutations.remove.error instanceof Error ? mutations.remove.error.message : null}
          onConfirm={() => void deleteUrl()}
          onClose={closeDelete}
        />
      )}
    </section>
  );
}
