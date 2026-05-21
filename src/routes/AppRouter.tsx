import { createBrowserRouter } from "react-router-dom";
//import { Children, lazy } from 'react';

import LoginPage from '../views/auth/login/loginPage';
import RegisterPage from "../views/auth/register/registerPage";
import Loadable from "../layouts/shared/loadable/loadable";
import { lazy } from "react";

const MainContent = Loadable(lazy(() => import('../layouts/MainContent')));

const AppRouter = [
    {
        path: '/',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/admin',
        element: <MainContent />,
    }

];

const router = createBrowserRouter(AppRouter);

export default router;