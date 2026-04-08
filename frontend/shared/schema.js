//this is where our schema for validation (both client and server side) is defined. This is exported into both files for validating our reservation form.

import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(1, "Please enter your name.").max(100, "Name must be 100 characters or less."),
  email: z.email("Please enter a valid email address").min(1, "Please enter your email address.").max(254, "Email must be a 254 characters or less."),
  phone: z.string()
          .min(1, "Please enter your phone number")
          .refine(
      phone => {
      const digits = phone.replace(/\D/g, '');
      return digits.length === 10 || digits.length === 11;},
      "Please enter a valid phone number."),  
  note: z.string().max(600, "Please keep your message under 600 characters.").optional(),
  reservation_slot: z.string().min(1, "Please select a reservation slot."),
  partySize: z.coerce
  .number()
  .min(1, "Party size must be at least 1")
  .max(200, "For large groups, please contact us directly.")
});

