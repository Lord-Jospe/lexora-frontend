import { createBrowserRouter } from "react-router-dom";
//import { Children, lazy } from 'react';

import LoginPage from '../views/auth/login/loginPage';
import RegisterPage from "../views/auth/register/registerPage";

const AppRouter = [
    {
        path: '/',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    }

];

const router = createBrowserRouter(AppRouter);

export default router;