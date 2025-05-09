import { Navigate, Outlet } from "react-router-dom";
import React from "react";



const ProtectedRoute = () => {
    const token = localStorage.getItem("token");

    return token ? <Outlet /> : <Navigate to="/TelaLogin" replace />;
};

export default ProtectedRoute;