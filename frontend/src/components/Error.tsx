import React from "react";

interface ErrorMsgProps {
  children: React.ReactNode;
}

const ErrorMsg: React.FC<ErrorMsgProps> = ({ children }) => (
  <div role="alert" className="alert alert-error alert-soft">
    {children}
  </div>
);

export default ErrorMsg;
