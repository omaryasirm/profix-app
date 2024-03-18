import { z } from "zod";

export const createInvoiceSchema = z.object({
  name: z.string().min(1).max(255),
  address: z.string().min(1).max(255),
  contact: z.string().min(1).max(255),
  vehicle: z.string().min(1).max(255),
  paymentMethod: z.string().min(1).max(255),
  paymentAccount: z.string().optional(),
  items: z
    .object({
      description: z.string().min(1).max(255),
      qty: z.number().min(1),
      rate: z.number().min(0),
      amount: z.number().min(0),
    })
    .array(),
  subtotal: z.number().min(0),
  tax: z.number().min(0),
  discount: z.number().min(0),
  total: z.number().min(0),
});

export const createSearchItemSchema = z.object({
  description: z.string().min(1).max(255),
});
