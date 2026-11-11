
import {
  columnFilteringFeature,
  createFilteredRowModel,
  createPaginatedRowModel,
  createSortedRowModel,
  filterFn_includesString,
  flexRender,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  tableFeatures,
  useTable,
  type ColumnDef,
  type ColumnFiltersState,
  type PaginationState,
  type RowData,
  type Row,
  type SortingState,
} from "@tanstack/react-table";

import type { PaginationQuery, PaginationResponse } from "../types/pagination";

import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";


// FEATURES
const features = tableFeatures({
  columnFilteringFeature,
  rowSortingFeature,
  rowPaginationFeature,

  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),

  filterFns: {
    includesString: filterFn_includesString,
  },

  sortFns: {
    alphanumeric: sortFn_alphanumeric,
  },
});


// TYPES
interface CommonProps<T extends RowData> {
  columns: ColumnDef<typeof features, T>[];
  setOpenCreate?: () => void;
  create: boolean;
  rowActions?: (row: Row<typeof features, T>) => ReactNode;
  defaultSortBy?: string;
}

interface ServerProps<T extends RowData, TFilter extends object> extends CommonProps<T> {
  mode: "server";

  data?: PaginationResponse<T>;

  sorting: SortingState;
  columnFilters: ColumnFiltersState;
  filters?: TFilter;

  setSorting: Dispatch<SetStateAction<SortingState>>;
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;

  onPaginationChange: (query: PaginationQuery, filter: TFilter) => void;

  initialPageSize?: number;
}

type Props<T extends RowData, TFilter extends object> = ServerProps<T, TFilter>;

export interface Cursor {
  lastId?: number | null;
  lastSortValue?: unknown;
}

export type DataTableColumn<T extends RowData> = ColumnDef<typeof features, T>;

// UTIL
function resolveUpdater<T>(
  updater: T | ((old: T) => T),
  previous: T
): T {
  return typeof updater === "function"
    ? (updater as (old: T) => T)(previous)
    : updater;
}

function isPaginationFilterValue(value: unknown): value is string | number | boolean | null {
  return value === null || ["string", "number", "boolean"].includes(typeof value);
}


// COMPONENT
export function DataTable<T extends RowData, TFilter extends object = Record<string, unknown>>(
  props: Props<T, TFilter>
) {

  // PAGINATION STATE
  const [pageSize, setPageSize] = useState(
    props.initialPageSize ?? 18
  );
  const [totalItems, setTotalItems] = useState<number | null>(null);

  const [internalPagination] =
    useState<PaginationState>({
      pageIndex: 0,
      pageSize: props.initialPageSize ?? 18,
    });

  // CURSOR HISTORY (SERVER)
  const [cursorHistory, setCursorHistory] = useState<Cursor[]>([
    {},
  ]);

  // CONTROLLED / UNCONTROLLED STATE
  const sorting = props.sorting;
  const columnFilters = props.columnFilters;
  const setSorting = props.setSorting;
  const setColumnFilters = props.setColumnFilters;

  // SERVER REQUEST
  const requestServer = useCallback((
    cursor: Cursor = {},
    nextSorting: SortingState = sorting,
    nextFilters: ColumnFiltersState = columnFilters,
    nextLimit: number = pageSize
  ) => {

    const columnFilterValues = nextFilters.reduce<Record<string, unknown>>(
      (values, { id, value }) => {
        if (value !== undefined && value !== "") {
          values[id] = isPaginationFilterValue(value)
            ? value
            : String(value);
        }
        return values;
      },
      {}
    );

    props.onPaginationChange({
      limit: nextLimit,

      sortBy:
        nextSorting[0]?.id ??
        props.defaultSortBy ??
        "id",

      direction: nextSorting[0]?.desc
        ? "DESC"
        : "ASC",
      ...(cursor.lastId != null ? { lastId: cursor.lastId } : {}),
      ...(cursor.lastSortValue !== undefined
        ? { lastSortValue: cursor.lastSortValue }
        : {}),
    }, {
      ...(props.filters ?? {}),
      ...columnFilterValues,
    } as TFilter);
  }, [columnFilters, pageSize, props, sorting]);


  const filtersKey = JSON.stringify(props.filters ?? {});
  const previousFiltersKey = useRef(filtersKey);
  const requestServerRef = useRef(requestServer);

  useEffect(() => {
    requestServerRef.current = requestServer;
  }, [requestServer]);

  useEffect(() => {
    if (previousFiltersKey.current !== filtersKey) {
      setCursorHistory([{}]);
      setTotalItems(null);
      requestServerRef.current({});
    }
    previousFiltersKey.current = filtersKey;
  }, [filtersKey]);

  useEffect(() => {
    if (props.data?.totalItems != null) {
      setTotalItems(props.data.totalItems);
    }
  }, [props.data?.totalItems]);

  // SORTING
  const handleSortingChange = (
    updater: Parameters<
      NonNullable<
        Parameters<typeof useTable>[0]["onSortingChange"]
      >
    >[0]
  ) => {

    const nextSorting = resolveUpdater(updater, sorting);

    setSorting(updater);

    setCursorHistory([{}]);
    requestServer({}, nextSorting, columnFilters);
  };

  // FILTERING
  const handleColumnFiltersChange = (
    updater: Parameters<
      NonNullable<
        Parameters<typeof useTable>[0]["onColumnFiltersChange"]
      >
    >[0]
  ) => {

    const nextFilters = resolveUpdater(
      updater,
      columnFilters
    );

    setColumnFilters(updater);
    setCursorHistory([{}]);
    requestServer({}, sorting, nextFilters);
  };


  // TABLE
  const table = useTable({

    features,

    data: props.data?.content ?? [],

    columns: props.columns,

    state: {
      sorting,
      columnFilters,
      pagination: internalPagination,
    },

    onSortingChange: handleSortingChange,

    onColumnFiltersChange: handleColumnFiltersChange,

    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,

    enableSortingRemoval: false,

  });

  // NEXT PAGE (SERVER)
  const nextPage = () => {

    if (!props.data?.hasNext || props.data.nextLastId == null) return;

    const nextCursor: Cursor = {
      lastId: props.data.nextLastId,
      lastSortValue: props.data.nextLastSortValue,
    };

    setCursorHistory(prev => [
      ...prev,
      nextCursor,
    ]);

    requestServer(
      nextCursor
    );
  };

  // PREVIOUS PAGE (SERVER)
  const previousPage = () => {

    if (cursorHistory.length <= 1) return;
    const newHistory = cursorHistory.slice(0, -1);
    const previousCursor = newHistory[newHistory.length - 1];
    setCursorHistory(newHistory);
    requestServer(
      previousCursor
    );

  };

  // PAGE SIZE
  const handlePageSizeChange = (limit: number) => {

    setPageSize(limit);
    setCursorHistory([{}]);
    requestServer({}, sorting, columnFilters, limit);

  };

  // ==================================================
  // RENDER
  // ==================================================
  return (

    <div className="flex w-full justify-center">
      <div className="relative flex w-full min-w-0 flex-col space-y-4 pb-2">

        {/* HEADER */}
        <div className="flex items-center justify-end gap-3">
            {props.create && (
              <button
                type="button"
                className="cursor-pointer rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#09626d]"
                onClick={props.setOpenCreate}
              >
                Crear
              </button>

            )}
              
            <select
              value={pageSize}
              onChange={(e) => {
                handlePageSizeChange(
                  Number(e.target.value)
                );
              }}
              aria-label="Filas por página"
              className="rounded-xl border-border bg-white px-3 py-2 text-sm font-medium text-text-h"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
            </select>

        </div>

        {/* TABLE */}
        <div className="table-scroll min-h-[18rem] w-full overflow-x-auto rounded-2xl border border-border bg-white shadow-main">

          <table className="w-max min-w-full table-auto">
            <thead>

              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <th
                        key={header.id}
                        onClick={
                          header.column.getCanSort()
                            ? header.column.getToggleSortingHandler()
                            : undefined
                        }
                        className={`sticky top-0 z-10 whitespace-nowrap border-b border-border bg-[#f7fafb] px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted ${
                          header.column.getCanSort()
                            ? "cursor-pointer select-none"
                            : ""
                        }`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )
                        }
                        {sorted === "asc" && " ▲"}
                        {sorted === "desc" && " ▼"}

                      </th>
                    );
                  })}
                  {props.rowActions && (
                    <th className="sticky top-0 z-10 whitespace-nowrap border-b border-border bg-[#f7fafb] px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-muted">
                      Acciones
                    </th>
                  )}
                </tr>
              ))}
            </thead>

            <tbody>

              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={props.columns.length + (props.rowActions ? 1 : 0)}
                    className="px-4 py-12 text-center text-sm text-muted"
                  >
                    No hay registros para mostrar
                  </td>
                </tr>
              ) : (

                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border transition hover:bg-accent-soft/40"
                  >
                    {row.getAllCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="whitespace-nowrap px-4 py-3 text-sm text-text-main"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}

                      </td>
                    ))}
                    {props.rowActions && (
                      <td className="px-4 py-3 text-center text-sm">
                        {props.rowActions(row)}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div
          className="text-sm font-medium text-muted"
          aria-live="polite"
          aria-atomic="true"
        >
          Elementos: {totalItems ?? table.getRowModel().rows.length}
        </div>

        {/* PAGINATION */}
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex gap-2">

            {/* PREVIOUS */}
            <button
              type="button"
              onClick={previousPage}
              disabled={cursorHistory.length <= 1}
              aria-label="Página anterior"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-white text-text-h shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={20} />
            </button>

            {/* NEXT */}
            <button
              type="button"
              onClick={nextPage}
              disabled={!props.data?.hasNext || props.data.nextLastId == null}
              aria-label="Página siguiente"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-border bg-white text-text-h shadow-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {/* PAGE INDICATOR */}
          <span className="text-sm font-medium text-muted">
            Página {cursorHistory.length}
          </span>

        </div>

      </div>

    </div>

  );
}
