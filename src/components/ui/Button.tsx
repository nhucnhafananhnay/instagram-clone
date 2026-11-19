import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  children: ReactNode;
  variant?: "primary" | "secondary" | "link";
};

export function Button({ children, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} className={`button ${variant}`} {...props}>
      {children}
    </button>
  );
}
