import { z } from 'zod';

export const urlFormSchema = z.object({
  urlValue: z
    .string()
    .trim()
    .min(1, 'Ingresa una URL.')
    .url('Ingresa una URL válida.'),
  cantidadRegistros: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      if (!value) 
        return undefined;
      return Number(value);
    })
    .refine(
      (value) => value === undefined || (Number.isInteger(value) && value > 0),
      'Debe ser un número entero mayor que cero.'
    ),
});

export type UrlFormInput = z.input<typeof urlFormSchema>;
export type UrlFormValues = z.output<typeof urlFormSchema>;
