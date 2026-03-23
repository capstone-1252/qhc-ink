// Food Bank Form react component
// NOTES:
// 1. Zod schema = ONE source of truth for ALL validation (client + server compatible)
// 2. React Hook Form manages ALL form state (no more manual formValues)
// 3. form.trigger() validates ONLY current step's fields on Next
// 4. Errors display automatically under each field
// 5. Your exact fetch logic preserved (payload, states, etc.)
// 6. Native HTML labels + error messages = accessible by default
// 7. className fixed (was "classname")

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
/* import { z } from 'zod';*/
import { formSchema } from '@/shared/schema.js'



/* // STEP 1: Zod schema - ALL validation rules in ONE place
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
}); */

// timeSlots = an array (unchanged)
export default function CreateFoodBankForm({ timeSlots }) {
  // STEP 2: React Hook Form replaces ALL manual state + validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      note: '',
      seating: undefined,
      time: '',
      partySize: ''
    }
  });

  const { 
    handleSubmit, 
    formState: { errors, formIsSubmitting: formIsSubmitting }, 
    trigger,
    reset 
  } = form;

  // STEP 3: Your existing states (unchanged)
  const [step, setStep] = useState(1);
  const [serverErrors, setServerErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('idle');
  /* const [formIsSubmitting, setIsSubmitting] = useState(false); */ // ← YOUR manual state

  // STEP 4: Your EXACT fetch handler preserved (just gets data from form)
  async function onFormSubmit(data) {
    console.log('Form data validated on client side:', data); // debug
    // STEP 3-9: Your exact payload + loading + fetch logic preserved
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      note: data.note,
      seating: data.seating,
      time: data.time,
      partySize: data.partySize
    };

/*     setIsSubmitting(true);
 */    setSubmitStatus('idle');
    setServerErrors({});

    try {
      const response = await fetch('/.netlify/functions/submit-food-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        reset(); // Form reset (replaces manual setFormValues)
        setStep(1);
      } else {
        if (result.error) {
          setServerErrors({ general: result.error });
        } else {
          setServerErrors({ general: 'Submission failed' });
        }
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error("Network error:", error);
      setSubmitStatus('error');
      setServerErrors({ general: 'Network error. Please try again.' });
    } /* finally {
      setIsSubmitting(false);
    } */
  }

  // STEP 5: Step validation (only current step's fields)
  const validateCurrentStep = async () => {
    const fields = step === 1 
      ? ['name', 'email', 'phone'] 
      : ['seating', 'time', 'partySize'];
    
    const isValid = await trigger(fields); // Zod validates ONLY these fields
    return isValid;
  };

  const totalSteps = 2;

  return (
    // STEP 6: Native form (Radix removed, fully accessible)
    <form onSubmit={handleSubmit(onFormSubmit)} noValidate>
      {/* Step indicator (className fixed) */}
      <div className="step-indicator">
        <div>Step {step} of {totalSteps}</div>
        <div className="steps">
          <div className={step === 1 ? 'active' : ''}>1</div>
          <div className={step === 2 ? 'active' : ''}>2</div>
        </div>
      </div>

      {/* STEP 1 FIELDS */}
      {step === 1 && (
        <>
          {/* Name field - Zod errors display automatically */}
          <div>
            <label htmlFor="name">Name *</label>
            <input
              id="name"
              type="text"
              {...form.register("name")}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="error" role="alert">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Email field */}
          <div>
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              {...form.register("email")}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            {errors.email && (
              <p id="email-error" className="error" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone field */}
          <div>
            <label htmlFor="phone">Phone *</label>
            <input
              id="phone"
              type="tel"
              {...form.register("phone")}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? "phone-error" : undefined}
            />
            {errors.phone && (
              <p id="phone-error" className="error" role="alert">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Note field (optional) */}
          <div>
            <label htmlFor="note">Questions or Concerns</label>
            <textarea
              id="note"
              rows={4}
              {...form.register("note")}
            />
          </div>
        </>
      )}

      {/* STEP 2 FIELDS */}
      {step === 2 && (
        <>
          {/* Seating field */}
          <div>
            <label htmlFor="seating">Seating Preference *</label>
            <select
              id="seating"
              {...form.register("seating")}
              aria-invalid={!!errors.seating}
              aria-describedby={errors.seating ? "seating-error" : undefined}
            >
              <option value="">Select...</option>
              <option value="bartop">Bar Top</option>
              <option value="diningroom">Dining Room</option>
            </select>
            {errors.seating && (
              <p id="seating-error" className="error" role="alert">
                {errors.seating.message}
              </p>
            )}
          </div>

          {/* Time field - timeSlots unchanged */}
          <div>
            <label htmlFor="time">Preferred Time *</label>
            <select
              id="time"
              {...form.register("time")}
              aria-invalid={!!errors.time}
              aria-describedby={errors.time ? "time-error" : undefined}
            >
              <option value="">Select time...</option>
              {timeSlots.map(slot => (
                <option key={slot.id} value={slot.time}>
                  {slot.time}
                </option>
              ))}
            </select>
            {errors.time && (
              <p id="time-error" className="error" role="alert">
                {errors.time.message}
              </p>
            )}
          </div>

          {/* Party Size field */}
          <div>
            <label htmlFor="partySize">Group Size *</label>
            <input
              id="partySize"
              type="number"
              min={1}
              {...form.register("partySize")}
              aria-invalid={!!errors.partySize}
              aria-describedby={errors.partySize ? "partySize-error" : undefined}
            />
            {errors.partySize && (
              <p id="partySize-error" className="error" role="alert">
                {errors.partySize.message}
              </p>
            )}
          </div>
        </>
      )}

      {/* Buttons - Next validates current step */}
      <div className="form-actions">
        {step > 1 && (
          <button 
            type="button" 
            onClick={() => setStep(step - 1)} 
            disabled={formIsSubmitting}
          >
            Back
          </button>
        )}
        
        {step < 2 ? (
          <button
            type="button"
            onClick={async () => {
              const isValid = await validateCurrentStep();
              if (isValid) setStep(step + 1);
            }}
            disabled={formIsSubmitting}
          >
            Next
          </button>
        ) : (
          <button type="submit" disabled={formIsSubmitting}>
            {formIsSubmitting ? 'Submitting...' : 'Create Food Bank'}
          </button>
        )}
      </div>

      {/* Your existing status messages (unchanged) */}
      {submitStatus === 'success' && (
        <div className="success-message">Food bank request submitted successfully!</div>
      )}
      {submitStatus === 'error' && (
        <div className="error-message">
          {serverErrors.general || 'Submission failed. Please try again.'}
        </div>
      )}
    </form>
  );
}
