// src/utils/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";

export const getToken = () => {
  return localStorage.getItem("access_token"); 
};

const PrivateRoute = ({ children }) => {
  const token = getToken();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/register" state={{ from: location }} replace />;
  }

  return children;
};

export default PrivateRoute;

export const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${process.env.REACT_APP_API_BASE_URL}${url}`;
};
