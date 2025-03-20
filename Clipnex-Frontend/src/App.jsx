import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ThemeProvider from './Components/ThemeProvider';
import MainContent from './Components/MainContent';
import Header from "./Components/Header/Header";
import Sidenav from "./Components/Sidenav/Sidenav";
import { Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { checkAuthStatus } from './Store/authSlice';

function App() {
  const dispatch = useDispatch();
  const { loading, user } = useSelector(state => state.auth);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    // Check auth status when app loads
    const checkAuth = async () => {
      try {
        console.log('Starting initial auth check...');
        await dispatch(checkAuthStatus()).unwrap();
        console.log('Auth check completed successfully');
      } catch (error) {
        console.log('Auth check failed, but continuing to render app:', error);
      } finally {
        setInitialCheckDone(true);
        console.log('Initial auth check done');
      }
    };
    checkAuth();
  }, [dispatch]);

  // Only show loading state during initial auth check
  if (!initialCheckDone) {
    console.log('Showing initial loading state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  console.log('Rendering main app, auth state:', { loading, user: !!user });
  return (
    <>
      <Toaster />
      <ThemeProvider>
        <MainContent>
          <Header />
          <div className="pt-[67px]">
            <Sidenav />
          </div>
          <Outlet />
        </MainContent>
      </ThemeProvider>
    </>
  );
}

export default App;
