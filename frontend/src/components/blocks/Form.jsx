// Food Bank Form react component
// NOTES:
// 1. Zod schema = ONE source of truth for ALL validation (client + server compatible)
// 2. React Hook Form manages ALL form state (no more manual formValues)
// 3. form.trigger() validates ONLY current step's fields on Next
// 4. Errors display automatically under each field
// 5. Your exact fetch logic preserved (payload, states, etc.)
// 6. Native HTML labels + error messages = accessible by default
// 7. className fixed (was "classname")

import styles from './Form.module.css';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { formSchema } from '@/shared/schema.js'


//this is my modal function
function ConfirmModal({ isOpen, onClose, onConfirm, isSubmitting }) {
  if (!isOpen) return null;

  return (
   <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Confirm Submission</h2>
        <p>Are you sure you want to submit?</p>

        <p>All the other confirmation/explanation text that goes here.</p>

        <div className={styles.modalActions}>
          <button 
            type="button" 
            onClick={onClose} 
            disabled={isSubmitting}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            Back
          </button>

          <button 
            type="button" 
            onClick={onConfirm} 
            disabled={isSubmitting}
            className={`${styles.btn} ${styles.btnPrimary} ${isSubmitting ? styles.btnLoading : ''}`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
}


export default function CreateFoodBankForm({ reservationSlots }) {
  // STEP 2: React Hook Form replaces ALL manual state + validation
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      note: '',
      reservation_slot: '',
      partySize: ''
    }
  });


  const { 
    handleSubmit, 
    formState: { errors, isSubmitting }, 
    trigger,
    reset 
  } = form;



  // STEP 3: Your existing states (unchanged)
  const [step, setStep] = useState(1);
  const [serverErrors, setServerErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState('idle');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  /* const [isSubmitting, setIsSubmitting] = useState(false); */ // ← YOUR manual state


  async function onFormSubmit(data) {
    console.log('Form data validated on client side:', data); // debug
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      note: data.note,
     reservation_slot: data.reservation_slot,  // must match backend relation name

      partySize: data.partySize
    };
  
      setSubmitStatus('idle');
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
        window.location.href = '/confirmation'; 
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
      ? ['reservation_slot', 'partySize'] 
      : ['name', 'email', 'phone'];
    
    const isValid = await trigger(fields); // Zod validates ONLY these fields
    return isValid;
  };


  const totalSteps = 2;


  return (
    // STEP 6: Native form (Radix removed, fully accessible)
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.container} noValidate>
      {/* Step indicator (className fixed) */}
<div className={styles.headerBlock}>
  <h2 className={styles.secondHeading}>Request form</h2>

  <div className={styles.stepIndicator}>
    <div className={styles.steps}>
      <div className={styles.step}>
        <div className={`${styles.circle} ${step >= 1 ? styles.active : ''}`}>
          1
        </div>
        <div className={styles.line}></div>
      </div>

      <div className={styles.step}>
        <div className={`${styles.circle} ${step >= 2 ? styles.active : ''}`}>
          2
        </div>
      </div>
    </div>
  </div>
</div>

  {/* STEP 1 */}
  {step === 1 && (
    <>
      <div className={styles.fieldWrapper}>
        <label>Time / Seating</label>
        <div className={styles.slotButtonGroup}>
          {reservationSlots.map(slot => {
            const isSelected = form.watch("reservation_slot") === slot.documentId; //slot.id
            const isDisabled = !slot.available; //for disabling if unavailable at backend
            return (
              <button
                key={slot.id} //slot.id bcs this is for react 
                type="button"
                /*  
                onClick={() => form.setValue("reservationSlots", slot.documentId, { shouldValidate: true })}
                */
                onClick={() => {
                  form.setValue("reservation_slot", slot.documentId, { shouldValidate: true });
                  // Force a re-trigger of validation for this specific field immediately
                  form.trigger("reservation_slot"); 
                }}


                className={`${styles.slotButton} ${isSelected ? styles.slotButtonSelected : ''} ${isDisabled ? styles.slotButtonDisabled : ''}`}
                aria-pressed={isSelected}
                disabled={isDisabled} //native HTML disabled
              > 
                <div className={styles.flex}>
                  <p>{slot.time}</p> 
                  <p>{slot.seating}</p>
                </div>
  
              </button>
            );
          })}
        </div>
        {errors.reservation_slot && (
          <p className={styles.validationError}>{errors.reservation_slot.message}</p>
        )}
      </div>

      <div className={styles.fieldWrapper}>
        <label htmlFor="partySize">Party Size</label>
        <input
          id="partySize"
          type="number"
          min={1}
          className={`${styles.formInput} ${errors.partySize ? styles.formInputError : ''}`}
          {...form.register("partySize")}
        />
        {errors.partySize && (
          <p className={styles.validationError}>
            {errors.partySize.message}
          </p>
        )}
      </div>
    </>
    
  )}

  {/* STEP 2 */}
  {step === 2 && (
    

    <>
      <div className={styles.fieldWrapper}>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          className={`${styles.formInput} ${errors.name ? styles.formInputError : ''}`}
          {...form.register("name")}
        />
        {errors.name && (
          <p className={styles.validationError}>
            {errors.name.message}
          </p>
        )}
      </div>

      <div className={styles.fieldWrapper}>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          className={`${styles.formInput} ${errors.email ? styles.formInputError : ''}`}
          {...form.register("email")}
        />
        {errors.email && (
          <p className={styles.validationError}>
            {errors.email.message}
          </p>
        )}
      </div>

      <div className={styles.fieldWrapper}>
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="tel"
          className={`${styles.formInput} ${errors.phone ? styles.formInputError : ''}`}
          {...form.register("phone")}
        />
        {errors.phone && (
          <p className={styles.validationError}>
            {errors.phone.message}
          </p>
        )}
      </div>

      <div className={styles.fieldWrapper}>
        <label htmlFor="note">Questions or Concerns</label>
        <textarea
          id="note"
          rows={4}
          className={`${styles.formInput} ${styles.textarea}`}
          {...form.register("note")}
        />
      </div>
    </>
  )}

  {/* Buttons */}
  <div className={styles.formActions}>
    {step > 1 && (
      <button 
        type="button" 
        className={`${styles.btn} ${styles.btnSecondary}`}
        onClick={() => setStep(step - 1)} 
        disabled={isSubmitting}
      >
        Back
      </button>
    )}
    
    {step < 2 ? (
      <button
        type="button"
        className={`${styles.btn} ${styles.btnPrimary}`}
        onClick={async () => {
          const isValid = await validateCurrentStep();
          if (isValid) setStep(step + 1);
        }}
        disabled={isSubmitting}
      >
        Next
      </button>
    ) : (
      <button
        type="button"
        className={`${styles.btn} ${styles.btnPrimary} ${isSubmitting ? styles.btnLoading : ''}`}
        onClick={async () => {
          const isValid = await validateCurrentStep();
          if (isValid) setShowConfirmModal(true);
        }}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    )}
  </div>

  {/* Status */}
  {submitStatus === 'error' && (
    <div className={styles.errorMessage}>
      {serverErrors.general || 'Submission failed. Please try again.'}
    </div>
  )}

  <ConfirmModal
    isOpen={showConfirmModal}
    onClose={() => setShowConfirmModal(false)}
    onConfirm={() => {
      setShowConfirmModal(false);
      const data = form.getValues(); 
      onFormSubmit(data);
    }}
    isSubmitting={isSubmitting}
  />    
  
  </form>
  );
}

