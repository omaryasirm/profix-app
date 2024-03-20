import { z } from "zod";

export const createInvoiceSchema = z.object({
  customerId: z.number().min(1),
  name: z.string().max(255),
  contact: z.string().max(255).optional(),
  registrationNo: z.string().max(255).optional(),
  vehicle: z.string().max(255).optional(),
  paymentMethod: z.string().max(255).optional(),
  paymentAccount: z.string().max(255).optional(),
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

export const createCustomerSchema = z.object({
  name: z.string().max(255),
  contact: z.string().max(255).optional(),
  registrationNo: z.string().max(255).optional(),
  vehicle: z.string().max(255).optional(),
});

export const createSearchItemSchema = z.object({
  description: z.string().min(1).max(255),
});
