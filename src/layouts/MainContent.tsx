import type { FC } from 'react';
import { Outlet } from 'react-router';
import Sidebar from './full/sidebar/Sidebar';
import Header from './full/header/Header';

const AdminLayout: FC = () => {
  return (
    <>
      <div className="flex w-full min-h-screen">
        <div className="page-wrapper flex w-full ">
          {/* Header/sidebar */}
          <div className="xl:block hidden">
            <Sidebar />
          </div>
          <div className="body-wrapper w-full bg-white dark:bg-dark">
            {/* Top Header  */}
            <Header />

            {/* Body Content  */}
            <div className={'container mx-auto px-6 py-30'}>
              <main className="grow">
                <Outlet />
              </main>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLayout;