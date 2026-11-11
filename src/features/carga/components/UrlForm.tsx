import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { LoaderCircle } from 'lucide-react';
import { urlFormSchema, type UrlFormInput, type UrlFormValues } from '../schemas/urlFormSchema';

type UrlFormProps = {
  initialValue: UrlFormInput;
  submitting: boolean;
  error?: string | null;
  onCancel: () => void;
  onSubmit: (values: UrlFormValues) => Promise<void>;
};

export function UrlForm({ initialValue, submitting, error, onCancel, onSubmit }: UrlFormProps) {
  const { urlValue, cantidadRegistros } = initialValue;
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<UrlFormInput, unknown, UrlFormValues>({
    resolver: zodResolver(urlFormSchema),
    defaultValues: initialValue,
  });

  useEffect(() => {
    reset({ 
      urlValue, 
      cantidadRegistros 
    });
  }, [cantidadRegistros, reset, urlValue]);


  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>

      {error && 
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      }

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-text-h">URL de descarga</span>
        <input
          {...register('urlValue')}
          className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
          placeholder="https://..."
          autoFocus
          aria-invalid={Boolean(errors.urlValue)}
        />
        {errors.urlValue && 
          <span className="text-xs text-red-600">{errors.urlValue.message}</span>
        }
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-text-h">Cantidad de registros</span>
        <Controller
          name="cantidadRegistros"
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="number"
              min="1"
              step="1"
              className="w-full rounded-xl border border-border bg-bg px-3 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
              placeholder="Ej. 1000"
              aria-invalid={Boolean(errors.cantidadRegistros)}
            />
          )}
        />
        {errors.cantidadRegistros && 
          <span className="text-xs text-red-600">{errors.cantidadRegistros.message}</span>
        }
      </label>

      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <button 
          type="button" 
          onClick={onCancel}
          disabled={submitting} 
          className="rounded-xl border border-border px-4 py-2 text-sm font-semibold text-text-h hover:bg-bg disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          disabled={submitting} 
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-[#09626d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && 
            <LoaderCircle size={16} className="animate-spin" />
          }
          {submitting ? 'Guardando...' : 'Guardar URL'}
        </button>
      </div>
    </form>
  );
}
