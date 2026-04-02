//this is where our schema for validation (both client and server side) is defined. This is exported into both files for validating our reservation form.

import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(1, "Name required").max(100, "Name is too long"),
  email: z.email("Invalid email").min(1, "Email required").max(254, "Email is too long."),
  phone: z.string()
          .min(1, "Phone required")
          .refine(
      phone => {
      const digits = phone.replace(/\D/g, '');
      return digits.length === 10 || digits.length === 11;},
      "Phone must be a valid phone number."),  
  note: z.string().max(600, "Please keep your query under 600 characters.").optional(),
  reservationSlots: z.number().min(1, "Select a reservation slot"),
  partySize: z.coerce
  .number()
  .min(1, "Must be at least 1 person")
  .max(200, "Please have a party size of less than 200 people.")
});

