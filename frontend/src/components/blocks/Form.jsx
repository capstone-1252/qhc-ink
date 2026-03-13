//Food Bank Form react component

//form will be multi-levelled. 
//currently, I will build form logic before making specific form ui components and implementing them

//useState


import { useState } from 'react';
import * as Form from '@radix-ui/react-form';

export default function CreateFoodBankForm() {
  const [step, setStep] = useState(1);
  const [serverErrors, setServerErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState('idle');

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

  const totalSteps = 2;

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  // Why: JSX defines what the user sees
  // Note: Radix UI Form components provide accessible form semantics
  // --------------------------------------------------------------------------

  return (
    <Form.Root onSubmit={handleSubmit} onClearServerErrors={() => setServerErrors({})}>
      <div>
        <div>Step {step} of {totalSteps}</div>
        <div>
          <div>{step === 1 ? '1' : ''}</div>
          <div>{step === 2 ? '2' : ''}</div>
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
                <option value="indoor">Indoor</option>
                <option value="outdoor">Outdoor</option>
                <option value="either">Either</option>
              </select>
            </Form.Control>
          </Form.Field>

          <Form.Field name="time" serverInvalid={!!serverErrors.time}>
            <div>
              <Form.Label>Preferred Time *</Form.Label>
              <Form.Message match="valueMissing">Required</Form.Message>
            </div>
            <Form.Control asChild>
              <select name="time" required>
                <option value="">Select...</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
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

      <div>
        {step > 1 && (
          <button type="button" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        {step < 2 ? (
          <button type="button" onClick={() => setStep(step + 1)}>
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
        <div>Food bank request submitted successfully!</div>
      )}
      {submitStatus === 'error' && (
        <div>Submission failed. Please try again.</div>
      )}
    </Form.Root>
  );
}



//my solution that i started on
/* import { useState } from 'react';
import Button from '../ui/Button.astro';

export default function createFoodBankForm(userData, setUserData) {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [seating, setSeating] = useState('');
  const [time, setTime] = useState('');
  const [size, setSize] = useState('');


  const handleSubmit = (event) => {
 

  return
    

} */


































