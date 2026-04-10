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
  const formRef = useRef(null);           // NEW: ref on the whole form
  const nameInputRef = useRef(null);

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

  // ==================== ACCESSIBLE FOCUS RESET ====================
  useEffect(() => {
    if (step === 2 && nameInputRef.current && formRef.current) {
      // Small delay to let the DOM stabilize after re-render
      const timer = setTimeout(() => {
        nameInputRef.current.focus();
      }, 80);

      return () => clearTimeout(timer);
    }
  }, [step]);
  // ============================================================

  async function onFormSubmit(data) {
    const payload = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      note: data.note,
      reservation_slot: data.reservation_slot,
      partySize: data.partySize,
    };

    setSubmitStatus("idle");
    setServerErrors({});

    try {
      const response = await fetch("/.netlify/functions/submit-food-bank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus("success");
        window.location.href = "/confirmation";
      } else {
        setServerErrors({ general: result.error || "Submission failed" });
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error("Network error:", error);
      setServerErrors({ general: "Network error. Please try again." });
      setSubmitStatus("error");
    }
  }

  const validateCurrentStep = async () => {
    const fields = step === 1
      ? ["reservation_slot", "partySize"]
      : ["name", "email", "phone"];
    return await trigger(fields);
  };

  return (
    <form
      ref={formRef}                     {/* ← Attach ref to the form */}
      onSubmit={handleSubmit(onFormSubmit)}
      className={styles.container}
      noValidate
    >
      <div className={styles.headerBlock}>
        <h2 className={styles.secondHeading}>Request form</h2>
        <div className={styles.stepIndicator}>
          <div className={styles.steps}>
            <div className={styles.step}>
              <div className={`${styles.circle} ${step >= 1 ? styles.active : ""}`}>1</div>
              <div className={styles.line}></div>
            </div>
            <div className={styles.step}>
              <div className={`${styles.circle} ${step >= 2 ? styles.active : ""}`}>2</div>
            </div>
          </div>
        </div>
      </div>

      {/* STEP 1 - unchanged */}
      {step === 1 && (
        <>
          <div className={styles.fieldWrapper}>
            <label>Time / Seating</label>
            <div className={styles.slotButtonGroup}>
              {reservationSlots.map((slot) => {
                const isSelected = form.watch("reservation_slot") === slot.documentId;
                const isDisabled = !slot.available;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => {
                      form.setValue("reservation_slot", slot.documentId, { shouldValidate: true });
                      form.trigger("reservation_slot");
                    }}
                    className={`${styles.slotButton} ${isSelected ? styles.slotButtonSelected : ""} ${isDisabled ? styles.slotButtonDisabled : ""}`}
                    aria-pressed={isSelected}
                    disabled={isDisabled}
                  >
                    <div className={styles.flex}>
                      <p>{slot.time}</p>
                      <p>{slot.seating}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            {errors.reservation_slot && <p className={styles.validationError}>{errors.reservation_slot.message}</p>}
          </div>

          <div className={styles.fieldWrapper}>
            <label>Party Size</label>
            <div className={`${styles.formInput} ${styles.stepper}`}>
              <button type="button" onClick={() => {
                const current = form.watch("partySize") || 1;
                if (current > 1) form.setValue("partySize", current - 1, { shouldValidate: true, shouldDirty: true });
              }}>−</button>
              <span className={styles.value}>{form.watch("partySize") || 1}</span>
              <button type="button" onClick={() => {
                const current = form.watch("partySize") || 1;
                form.setValue("partySize", current + 1, { shouldValidate: true, shouldDirty: true });
              }}>+</button>
            </div>
            {errors.partySize && <p className={styles.validationError}>{errors.partySize.message}</p>}
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
              placeholder="Enter your full name."
              ref={nameInputRef}
              className={`${styles.formInput} ${errors.name ? styles.formInputError : ""}`}
              {...form.register("name")}
            />
            {errors.name && <p className={styles.validationError}>{errors.name.message}</p>}
          </div>

          <div className={styles.fieldWrapper}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="example@something.com"
              className={`${styles.formInput} ${errors.email ? styles.formInputError : ""}`}
              {...form.register("email")}
            />
            {errors.email && <p className={styles.validationError}>{errors.email.message}</p>}
          </div>

          <div className={styles.fieldWrapper}>
            <label htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="tel"
              placeholder="123-123-1234"
              className={`${styles.formInput} ${errors.phone ? styles.formInputError : ""}`}
              {...form.register("phone")}
            />
            {errors.phone && <p className={styles.validationError}>{errors.phone.message}</p>}
          </div>

          <div className={styles.fieldWrapper}>
            <label htmlFor="note">Questions or Concerns</label>
            <textarea
              id="note"
              rows={4}
              placeholder="Let us know about allergies, questions, or anything else important."
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

      {submitStatus === "error" && (
        <div className={styles.errorMessage}>
          {serverErrors.general || "Submission failed. Please try again."}
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