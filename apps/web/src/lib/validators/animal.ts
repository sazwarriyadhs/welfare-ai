import { z } from "zod";

export const animalCreateSchema = z.object({
  tagNumber: z.string().min(2, "Tag number minimal 2 karakter").max(50),
  species: z.enum(["cattle", "goat", "sheep", "pig", "poultry", "other"]),
  breed: z.string().max(80).optional().or(z.literal("")),
  sex: z.enum(["male", "female"]),
  birthDate: z.string().datetime().optional().or(z.literal("")),
  healthScore: z.coerce.number().int().min(0).max(100),
  status: z.enum(["active", "sick", "quarantined", "deceased"]).default("active"),
  location: z.string().max(120).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type AnimalCreateInput = z.infer<typeof animalCreateSchema>;