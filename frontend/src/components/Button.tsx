import React from "react";
import { FaArrowLeftLong } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  variant?: "default" | "back";
  children?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  className = "",
  variant = "default",
  children,
  ...props
}) => {
  const navigate = useNavigate();

  if (variant === "back") {
    return (
      <button
        type="button"
        onClick={() => navigate(-1)}
        className={`bg-base-100 p-4 rounded-full w-20 border border-base-300 ${className}`}
        {...props}
      >
        <FaArrowLeftLong />
      </button>
    );
  }

  return (
    <button className={`btn rounded-xl mt-3 ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;
