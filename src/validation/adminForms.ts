import { z } from 'zod';

export const itemFormSchema = z.object({
  name: z.string().trim().min(1, 'Digite um nome para o item'),
  emoji: z.string().min(1, 'Escolha um símbolo'),
});
export type ItemFormValues = z.infer<typeof itemFormSchema>;

export const contactFormSchema = z.object({
  name: z.string().trim().min(1, 'Digite o nome do contato'),
  relation: z.string().trim(),
  phone: z
    .string()
    .trim()
    .min(1, 'Digite um telefone')
    .refine(
      (value) => value.replace(/\D/g, '').length >= 8,
      'Telefone precisa ter pelo menos 8 dígitos',
    ),
  emoji: z.string().min(1, 'Escolha um símbolo'),
});
export type ContactFormValues = z.infer<typeof contactFormSchema>;
