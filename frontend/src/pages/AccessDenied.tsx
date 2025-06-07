import { Link } from "react-router-dom";

const AccessDenied = () => {
  return (
    <div>
      <h1>Access Denied</h1>
      <p>You don't have permission to access this page.</p>
      <p>Please contact your administrator if you believe this is an error.</p>
      <Link to="/">Go back to Home</Link>
    </div>
  );
};

export default AccessDenied;
