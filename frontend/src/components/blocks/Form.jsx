//Food Bank Form react component

//form will be multi-levelled. 
//currently, I will build form logic before making specific form ui components and implementing them



import { useState } from 'react';
import { useEffect } from 'react';
import * as Form from '@radix-ui/react-form';
import { getFoodBankTimeSlots } from '../../lib/strapi';

export default function CreateFoodBankForm({ timeSlots = []}) {
  const [step, setStep] = useState(1);
  const [serverErrors, setServerErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');

/* //fetch food bank seating time
useEffect(() => {
  async function loadTimeSlots() {
    try {
      const slots = await getFoodBankTimeSlots();     
      setTimeSlots(slots);
    } catch (error) {
      console.error('Failed to load time slots:', error);
      setServerErrors({ general: 'Failed to load available times' });
    }
  }
  loadTimeSlots();
}, []);
 */

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget); //formData: This is a built-in browser API that creates an object containing all the form fields and their values. 
    const data = Object.fromEntries(formData.entries()); // formData.entries returns key-value pairs which Object.fromEntries converts to an individual js object


    // Flatten the data if your function expects a flat object
    // Your function currently expects: { data: { name, email... } }
    // But your fetch sends: { data: { data: { ... } } }
    // Let's adjust to match the function signature we wrote:
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      note: data.note,
      seating: data.seating,
      time: data.time,
      size: data.size
    };

    // ------------------------------------------------------------------------
    // STEP 3: SET LOADING STATES
    // ------------------------------------------------------------------------
    // Why: Disable button, clear previous errors, show "Submitting..."
    // Security: Prevents user from submitting multiple times while waiting
    // ------------------------------------------------------------------------
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setServerErrors({});

    try {
      // ----------------------------------------------------------------------
      // STEP 4: SEND DATA TO NETLIFY FUNCTION
      // ----------------------------------------------------------------------
      // Why: This is where the actual submission happens
      // Note: URL must match function filename: submit-food-bank.js
      // Security: Token is in function, NOT in this browser code
      // ----------------------------------------------------------------------
      const response = await fetch('/.netlify/functions/submit-food-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      // ----------------------------------------------------------------------
      // STEP 5: PARSE RESPONSE
      // ----------------------------------------------------------------------
      // Why: Function returns JSON, we need to read it
      // Note: Always await .json() even if you expect success
      // ----------------------------------------------------------------------
      const result = await response.json();

      // ----------------------------------------------------------------------
      // STEP 6: HANDLE SUCCESS
      // ----------------------------------------------------------------------
      // Why: Reset form, show success message, return to step 1
      // Note: response.ok is true for status codes 200-299
      // ----------------------------------------------------------------------
      if (response.ok) {
        setSubmitStatus('success');
        event.currentTarget.reset(); // Clear all form inputs
        setStep(1); // Return to first step
      } else {
        // --------------------------------------------------------------------
        // STEP 7: HANDLE ERRORS FROM FUNCTION
        // --------------------------------------------------------------------
        // Why: Function may return validation errors or Strapi failures
        // Note: Store error message to display to user
        // --------------------------------------------------------------------
        if (result.error) {
          setServerErrors({ general: result.error });
        } else {
          setServerErrors({ general: 'Submission failed' });
        }
        setSubmitStatus('error');
      }
    } catch (error) {
      // ----------------------------------------------------------------------
      // STEP 8: HANDLE NETWORK ERRORS
      // ----------------------------------------------------------------------
      // Why: Internet could be down, function could timeout, etc.
      // Security: Don't expose raw error to user (could leak info)
      // ----------------------------------------------------------------------
      console.error("Network error:", error); // Log for debugging
      setSubmitStatus('error');
      setServerErrors({ general: 'Network error. Please try again.' });
    } finally {
      // ----------------------------------------------------------------------
      // STEP 9: ALWAYS RESET LOADING STATE
      // ----------------------------------------------------------------------
      // Why: Whether success or failure, we're done submitting
      // Note: finally() runs even if there's an error
      // ----------------------------------------------------------------------
      setIsSubmitting(false);
    }
  }


  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  // Why: JSX defines what the user sees
  // Note: Radix UI Form components provide accessible form semantics
  // --------------------------------------------------------------------------
// src/components/blocks/Form.jsx

  const totalSteps = 2;

  return (
    <Form.Root onSubmit={handleSubmit} onClearServerErrors={() => setServerErrors({})}>
      <div className="step-indicator">
        <div>Step {step} of {totalSteps}</div>
        <div className="steps">
          <div className={step === 1 ? 'active' : ''}>1</div>
          <div className={step === 2 ? 'active' : ''}>2</div>
        </div>
      </div>

      {step === 1 && (
        <>
          <Form.Field name="name" serverInvalid={!!serverErrors.name}>
            <div>
              <Form.Label>Name *</Form.Label>
              <Form.Message match="valueMissing">Name required</Form.Message>
            </div>
            <Form.Control asChild>
              <input name="name" required />
            </Form.Control>
          </Form.Field>

          <Form.Field name="email" serverInvalid={!!serverErrors.email}>
            <div>
              <Form.Label>Email *</Form.Label>
              <Form.Message match="valueMissing">Email required</Form.Message>
              <Form.Message match="typeMismatch">Invalid email</Form.Message>
            </div>
            <Form.Control asChild>
              <input type="email" name="email" required />
            </Form.Control>
          </Form.Field>

          <Form.Field name="phone" serverInvalid={!!serverErrors.phone}>
            <div>
              <Form.Label>Phone *</Form.Label>
              <Form.Message match="valueMissing">Phone required</Form.Message>
            </div>
            <Form.Control asChild>
              <input type="tel" name="phone" required minLength={10} />
            </Form.Control>
          </Form.Field>

          <Form.Field name="note">
            <Form.Label>Questions or Concerns</Form.Label>
            <Form.Control asChild>
              <textarea name="note" rows={4} />
            </Form.Control>
          </Form.Field>
        </>
      )}

      {step === 2 && (
        <>
          <Form.Field name="seating" serverInvalid={!!serverErrors.seating}>
            <div>
              <Form.Label>Seating Preference *</Form.Label>
              <Form.Message match="valueMissing">Required</Form.Message>
            </div>
            <Form.Control asChild>
              <select name="seating" required>
                <option value="">Select...</option>
                <option value="indoor">Bar Top</option>
                <option value="outdoor">Bar Bottom</option>
              </select>
            </Form.Control>
          </Form.Field>

        {/* data does not come in slot.attributes, data comes as flat objects w/o attributes wrapper data : id: ,  */}
          <Form.Field name="time" serverInvalid={!!serverErrors.time}>
            <div>
              <Form.Label>Preferred Time *</Form.Label>
              <Form.Message match="valueMissing">Required</Form.Message>
            </div>
            <Form.Control asChild>
              <select name="time" required>
                <option value="">Select time...</option>
                {timeSlots.map(slot => (
                  <option key={slot.id} value={slot.time}>
                    {slot.time}
                  </option>
                ))}
              </select>
            </Form.Control>
          </Form.Field>
          <Form.Field name="size" serverInvalid={!!serverErrors.size}>
            <div>
              <Form.Label>Group Size *</Form.Label>
              <Form.Message match="valueMissing">Required</Form.Message>
            </div>
            <Form.Control asChild>
              <input type="number" name="size" min={1} required />
            </Form.Control>
          </Form.Field>
        </>
      )}

      <div className="form-actions">
        {step > 1 && (
          <button type="button" onClick={() => setStep(step - 1)} disabled={isSubmitting}>
            Back
          </button>
        )}
        {step < 2 ? (
          <button type="button" onClick={() => setStep(step + 1)} disabled={isSubmitting}>
            Next
          </button>
        ) : (
          <Form.Submit asChild>
            <button disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Create Food Bank'}
            </button>
          </Form.Submit>
        )}
      </div>

      {submitStatus === 'success' && (
        <div className="success-message">Food bank request submitted successfully!</div>
      )}
      {submitStatus === 'error' && (
        <div className="error-message">
          {serverErrors.general || 'Submission failed. Please try again.'}
        </div>
      )}
    </Form.Root>
  );
}




















