import React from "react";

interface ErrorMsgProps {
  children: React.ReactNode;
}

const ErrorMsg: React.FC<ErrorMsgProps> = ({ children }) => (
  <div role="alert" className="alert alert-error my-4 mx-10 alert-soft">
    {children}
  </div>
);

export default ErrorMsg;
