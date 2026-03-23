//this is where our schema for validation (both client and server side) is defined. This is exported into both files for validating our reservation form.

import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1, "Name required").max(70, "Name is too long"),
  email: z.email("Invalid email").min(1, "Email required"),
  phone: z.string()
          .min(1, "Phone required")
          .refine(
      phone => {
      const digits = phone.replace(/\D/g, '');
      return digits.length === 10 || digits.length === 11;},
      "Phone must be a valid phone number."),  
  note: z.string().optional(),
  seating: z.enum(["bartop", "diningroom"], { message: "Select seating preference" }),
  time: z.string().min(1, "Select time"),
  partySize: z.coerce
  .number()
  .min(1, "Must be at least 1 person")
});

