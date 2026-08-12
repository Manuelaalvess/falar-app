import { z } from 'zod';

import { isCoreResponseItem } from '../constants/communication';

export const itemFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Digite um nome para o item')
    .refine((value) => !isCoreResponseItem({ name: value }), {
      message: 'Sim e Não ficam fixos no topo da tela Comunicar',
    }),
  emoji: z.string().min(1, 'Escolha um símbolo'),
});
export type ItemFormValues = z.infer<typeof itemFormSchema>;

export const categoryFormSchema = z.object({
  label: z.string().trim().min(1, 'Digite um nome para a categoria').max(40, 'Nome muito longo'),
  emoji: z.string().min(1, 'Escolha um símbolo'),
});
export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

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
