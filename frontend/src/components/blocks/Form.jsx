import styles from "./Form.module.css";
import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formSchema } from "../../../shared/schema";

function ConfirmModal({ isOpen, onClose, onConfirm, isSubmitting }) {
  if (!isOpen) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Request Food Bank Dinner?</h2>
        <p>Are you sure you want to submit?</p>
        <p>All the other confirmation/explanation text that goes here.</p>
        <div className={styles.modalActions}>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={`${styles.btn} ${styles.btnSecondary}`}
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`${styles.btn} ${styles.btnPrimary} ${isSubmitting ? styles.btnLoading : ""}`}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CreateFoodBankForm({ reservationSlots }) {
  const nameInputRef = useRef(null);
  const firstStepRef = useRef(null);   // NEW: container for Step 1
  const secondStepRef = useRef(null);  // NEW: container for Step 2

  const form = useForm({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      note: "",
      reservation_slot: "",
      partySize: 1,
    },
  });

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
    getValues,
  } = form;

  const [step, setStep] = useState(1);
  const [serverErrors, setServerErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Focus management when step changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (step === 1 && firstStepRef.current) {
        // Focus first focusable element in Step 1 (e.g. first slot button)
        const firstFocusable = firstStepRef.current.querySelector('button, input, textarea, [tabindex="0"]');
        firstFocusable?.focus();
      } 
      else if (step === 2 && nameInputRef.current) {
        nameInputRef.current.focus();   // Direct focus on Name field
      }
    }, 50); // Small delay to let React finish rendering

    return () => clearTimeout(timeoutId);
  }, [step]);

  async function onFormSubmit(data) { /* your existing submit logic */ }

  const validateCurrentStep = async () => {
    const fields = step === 1 ? ["reservation_slot", "partySize"] : ["name", "email", "phone"];
    return await trigger(fields);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className={styles.container} noValidate>
      <div className={styles.headerBlock}>
        <h2 className={styles.secondHeading}>Request form</h2>
        {/* step indicator unchanged */}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div ref={firstStepRef}>   {/* ← NEW wrapper */}
          {/* your existing Step 1 content (slot buttons + party size) */}
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div ref={secondStepRef}>   {/* ← NEW wrapper */}
          {/* your existing Step 2 fields */}
          <div className={styles.fieldWrapper}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              ref={nameInputRef}   // keep your ref
              className={`${styles.formInput} ${errors.name ? styles.formInputError : ""}`}
              {...form.register("name")}
            />
            {/* error message */}
          </div>
          {/* email, phone, note fields unchanged */}
        </div>
      )}

      {/* Buttons - unchanged except add tabIndex management if needed */}
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
            className={`${styles.btn} ${styles.btnPrimary} ${isSubmitting ? styles.btnLoading : ""}`}
            onClick={async () => {
              const isValid = await validateCurrentStep();
              if (isValid) setShowConfirmModal(true);
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>

      {/* error message and ConfirmModal unchanged */}
    </form>
  );
}