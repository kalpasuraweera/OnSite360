import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  className = "",
  type = "button",
  children,
  ...props
}) => (
  <button type={type} className={`btn rounded-xl mt-3 ${className}`} {...props}>
    {children}
  </button>
);

export default Button;
