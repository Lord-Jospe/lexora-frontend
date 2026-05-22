import { createBrowserRouter } from "react-router-dom";
//import { Children, lazy } from 'react';

import LoginPage from '../views/auth/login/loginPage';
import RegisterPage from "../views/auth/register/registerPage";
import Loadable from "../layouts/shared/loadable/loadable";
import { lazy } from "react";

const ConfiguracionesPage = Loadable(lazy(() => import('../views/admin/ConfiguracionesPage')));
const CargarDocumentosPage = Loadable(lazy(() => import('../views/admin/CargarDocumentosPage')));
const HistorialFacturasPage = Loadable(lazy(() => import('../views/admin/HistorialFacturasPage')));
const RevisionFacturasPage = Loadable(lazy(() => import('../views/admin/RevisionFacturasPage')));

const MainContent = Loadable(lazy(() => import('../layouts/MainContent')));

const AppRouter = [
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/admin',
        element: <MainContent />,
        children: [
            {
                path: 'configuraciones',
                element: <ConfiguracionesPage />,
            },

            {
                path: 'historial-facturas',
                element: <HistorialFacturasPage />,
            },

            {
                path: 'revision-facturas',
                element: <RevisionFacturasPage />,
            },

            {
                path: 'cargar-documentos',
                element: <CargarDocumentosPage />,
            },
        ],
    }

];

const router = createBrowserRouter(AppRouter);

export default router;