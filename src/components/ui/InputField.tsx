import { forwardRef, type InputHTMLAttributes } from "react";

interface InputFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "className"> {
  error?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(function InputField(
  { error, ...props },
  ref,
) {
  return (
    <>
      <input ref={ref} className="field" aria-invalid={!!error} {...props} />
      {error && <small className="field-error">{error}</small>}
    </>
  );
});
