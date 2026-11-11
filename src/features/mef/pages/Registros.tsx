import {
    type ColumnFiltersState,
    type PaginationState,
    type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { useMef } from '../hook/useMef';
import { DataTable, type Cursor, type DataTableColumn } from '../../../component/DataTable';
import { Alert } from '../../../component/Alert';
import type { PaginationQuery } from '../../../types/pagination';
import type { GastoPresupuestalFilter, GastoPresupuestalResponse } from '../type/MefTypes';

const columns: DataTableColumn<GastoPresupuestalResponse>[] = [
    { accessorKey: 'idHecho', header: 'ID' },
    { accessorKey: 'idTiempo', header: 'Tiempo' },
    { accessorKey: 'idEntidad', header: 'Entidad' },
    { accessorKey: 'idClasificador', header: 'Clasificador' },
    { accessorKey: 'idUbicacion', header: 'Ubicación' },
    { accessorKey: 'idEjecucion', header: 'Ejecución' },
    { accessorKey: 'pia', header: 'PIA' },
    { accessorKey: 'pim', header: 'PIM' },
    { accessorKey: 'certificado', header: 'Certificado' },
    { accessorKey: 'compAnual', header: 'Comp. anual' },
    { accessorKey: 'atencionCompMensual', header: 'Atención mensual' },
    { accessorKey: 'devengado', header: 'Devengado' },
    { accessorKey: 'girado', header: 'Girado' },
    { accessorKey: 'fechaCarga', header: 'Fecha de carga' },
    { accessorKey: 'idUrl', header: 'ID URL' },
];

export function RegistrosPages(){
    const [sorting, setSorting] = useState<SortingState>([{
        id: "idHecho",
        desc: false
    }]);
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

    const [cursor, setCursor] = useState<Cursor>({
        lastId: null,
        lastSortValue: null
    });
    const [createOpen, setCreateOpen] = useState(false);
    const { data: tiempoOptions } = useMef.useGetTiempoOptions();

    const { data, isLoading, isError, error } = useMef.useGetAllGastos(
        sorting,
        columnFilters,
        pagination,
        cursor.lastId,
        cursor.lastSortValue
    );

    const handlePaginationChange = (
        query: PaginationQuery,
        filter: GastoPresupuestalFilter
    ) => {
        setPagination((current) => ({
            ...current,
            pageIndex: query.lastId == null ? 0 : current.pageIndex,
            pageSize: query.limit,
        }));
        setCursor({
            lastId: query.lastId ?? null,
            lastSortValue: query.lastSortValue ?? null,
        });
        setColumnFilters(
            Object.entries(filter).map(([id, value]) => ({ id, value }))
        );
    };

    const getFilterValue = (id: string) => {
        return columnFilters.find((filter) => filter.id === id)?.value?.toString() ?? '';
    };

    const handleTimeFilterChange = (id: 'anioEje' | 'mesEje', value: string) => {
        setColumnFilters((current) => [
            ...current.filter((filter) => filter.id !== id),
            ...(value ? [{ id, value: Number(value) }] : []),
        ]);
        setCursor({ lastId: null, lastSortValue: null });
    };

    return (
        <section className="mx-auto w-full max-w-7xl space-y-6 px-5 py-8 sm:px-8">
            <div className="border-b border-border pb-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">Módulo financiero</p>
                <h1 className="mb-2 text-2xl font-bold text-text-h sm:text-3xl">Registros MEF</h1>
                <p className="text-sm text-muted">
                    Consulta los gastos presupuestales registrados.
                </p>
            </div>

            {isLoading && <Alert variant="loading">Cargando registros...</Alert>}
            {isError && (
                <Alert>
                    No se pudieron cargar los registros: {error.message}
                </Alert>
            )}

            <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm">
                <label className="flex flex-col gap-1 text-sm font-medium text-text-h">
                    <span className="text-xs uppercase tracking-wide text-muted">Año de ejercicio</span>
                    <select
                        value={getFilterValue('anioEje')}
                        onChange={(event) => handleTimeFilterChange('anioEje', event.target.value)}
                        className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text-h"
                    >
                        <option value="">Todos los años</option>
                        {tiempoOptions?.anios.map((anio) => (
                            <option key={anio} value={anio}>{anio}</option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium text-text-h">
                    <span className="text-xs uppercase tracking-wide text-muted">Mes de ejercicio</span>
                    <select
                        value={getFilterValue('mesEje')}
                        onChange={(event) => handleTimeFilterChange('mesEje', event.target.value)}
                        className="rounded-xl border border-border bg-bg px-3 py-2 text-sm text-text-h"
                    >
                        <option value="">Todos los meses</option>
                        {tiempoOptions?.meses.map((mes) => (
                            <option key={mes} value={mes}>{mes}</option>
                        ))}
                    </select>
                </label>
            </div>

            <DataTable<GastoPresupuestalResponse, GastoPresupuestalFilter>
                key={`${getFilterValue('anioEje')}-${getFilterValue('mesEje')}`}
                mode="server"
                data={data}
                sorting={sorting}
                columnFilters={columnFilters}
                setSorting={setSorting}
                setColumnFilters={setColumnFilters}
                onPaginationChange={handlePaginationChange}
                columns={columns}
                setOpenCreate={() => setCreateOpen(true)}
                create={false}
                initialPageSize={10}
            />

            {createOpen && (
                <div className="rounded-xl border border-border bg-white p-4 text-sm text-muted shadow-sm">
                    La creación de registros no está disponible en este módulo.
                    <button
                        type="button"
                        className="ml-3 font-semibold text-accent underline"
                        onClick={() => setCreateOpen(false)}
                    >
                        Cerrar
                    </button>
                </div>
            )}
        </section>
    );
}