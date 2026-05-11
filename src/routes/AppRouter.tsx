import { createBrowserRouter } from "react-router-dom";
//import { Children, lazy } from 'react';

import LoginPage from '../pages/auth/login/loginPage';

const AppRouter = [
    {
        path: '/',
        element: <LoginPage />,
    },

];

const router = createBrowserRouter(AppRouter);

export default router;