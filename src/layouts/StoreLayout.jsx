import React from 'react';
import { Outlet } from 'react-router-dom';
import AnnouncementBar from '../components/common/AnnouncementBar';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Toast from '../components/common/Toast';

export const StoreLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <AnnouncementBar />
      <Navbar />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  );
};

export default StoreLayout;
