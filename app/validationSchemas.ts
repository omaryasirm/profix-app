import { z } from "zod";

export const createInvoiceSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().min(1).max(255),
  contact: z.string().min(1).max(255),
  vehicle: z.string().min(1).max(255),
  paymentMethod: z.string().min(1).max(255),
  paymentAccount: z.string().min(1).max(255),
  items: z
    .object({
      description: z.string().min(1).max(255),
      qty: z.number().min(1),
      rate: z.number().min(1),
      amount: z.number().min(1),
    })
    .array(),
  subtotal: z.number().min(1),
  tax: z.number().min(1),
  discount: z.number().min(1),
  total: z.number().min(1),
});

export const createSearchItemSchema = z.object({
  description: z.string().min(1).max(255),
});
