import type { FC } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './full/sidebar/Sidebar';
import Header from './full/header/Header';

const AdminLayout: FC = () => {
  return (
    <div className="min-h-screen bg-background flex">

      {/* Sidebar — visible solo en xl, sticky via CSS */}
      <div className="hidden xl:block shrink-0">
        <Sidebar />
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl px-11 ">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;