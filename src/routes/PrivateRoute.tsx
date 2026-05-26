import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/authContext";
 
const PrivateRoute = () => {
  const { token } = useAuth();
 
  // Si no hay token redirige al login
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};
 
export default PrivateRoute;
 