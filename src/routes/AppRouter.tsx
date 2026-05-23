import { createBrowserRouter, Navigate } from "react-router-dom";
//import { Children, lazy } from 'react';

import LoginPage from '../views/auth/login/loginPage';
import RegisterPage from "../views/auth/register/registerPage";
import Loadable from "../layouts/shared/loadable/loadable";
import PrivateRoute from "./PrivateRoute";

import { lazy } from "react";

const ConfiguracionesPage = Loadable(lazy(() => import('../views/admin/ConfiguracionesPage')));
const CargarDocumentosPage = Loadable(lazy(() => import('../views/admin/CargarDocumentosPage')));
const HistorialFacturasPage = Loadable(lazy(() => import('../views/admin/HistorialFacturasPage')));
const RevisionFacturasPage = Loadable(lazy(() => import('../views/admin/RevisionFacturasPage')));

const MainContent = Loadable(lazy(() => import('../layouts/MainContent')));

const AppRouter = [
    
    // Redirige raíz al login
    {
        path: "/",
        element: <Navigate to="/login" replace />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        element: <PrivateRoute />,
        children: [
        {
            path: "/admin",
            element: <MainContent />,
            children: [
                { index: true, element: <Navigate to="cargar-documentos" replace /> },
                { path: "cargar-documentos",  element: <CargarDocumentosPage />  },
                { path: "historial-facturas", element: <HistorialFacturasPage /> },
                { path: "revision-facturas",  element: <RevisionFacturasPage />  },
                { path: "configuraciones",    element: <ConfiguracionesPage />   },
                ],
            },
        ],
    },
];

const router = createBrowserRouter(AppRouter);

export default router;