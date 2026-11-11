# React + TypeScript + Vite

## DataTable: paginación por cursor compuesto

El `DataTable` debe usarse con `mode="server"`. Cada acción de paginación,
ordenamiento o filtro llama a `onPaginationChange`; el navegador nunca carga
ni filtra el total de registros.

Los filtros adicionales se envían en `filters`, por lo que se pueden agregar
sin cambiar el componente:

```tsx
interface GastoPresupuestalFilter {
  anioEje?: number;
  mesEje?: number;
  idEntidad?: number;
  idClasificador?: number;
  idUbicacion?: number;
  idEjecucion?: number;
}

const queryFilters: GastoPresupuestalFilter = {
  anioEje: 2026,
  mesEje: 3,
};

<DataTable
  mode="server"
  data={page}
  filters={queryFilters}
  sorting={sorting}
  columnFilters={columnFilters}
  setSorting={setSorting}
  setColumnFilters={setColumnFilters}
  onPaginationChange={(query, filter) => {
    getCursorPage<Registro, GastoPresupuestalFilter>(
      "gastos-presupuestales",
      query,
      filter,
    ).then(setPage);
  }}
  // ...columns, filterColumn, setOpenCreate
/>
```

El backend recibe parámetros planos como `limit`, `lastId`, `lastSortValue`, `sortBy`,
`direction`, `anioEje`, `mesEje`, etc. Esto permite mapearlos directamente a:

```java
@GetMapping
public Mono<PaginationResponse<GastoPresupuestalResponse>> getGastoPresupuestal(
    @ModelAttribute PaginationQuery query,
    @ModelAttribute GastoPresupuestalFilter filter
) {
    return mediator.dispatch(new getAllRequest(query, filter));
}
```

```json
{
  "content": [],
  "limit": 18,
  "hasNext": true,
  "nextLastId": 123,
  "nextLastSortValue": "2026-03-01T00:00:00"
}
```

`lastId` y `lastSortValue` deben corresponder al último registro de la página y
ser estables para el conjunto de filtros y orden actual.
Cuando cambia un filtro, el componente reinicia automáticamente desde la
primera página.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
You can also try [the experimental native React Compiler support in plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md#rust-react-compiler) by using `compiler: true` in the plugin options instead of using the Babel plugin.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```

You can also install [eslint-plugin-react-x](https://npmx.dev/package/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://npmx.dev/package/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])

```
