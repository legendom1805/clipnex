import React from 'react';
import ThemeProvider from './Components/ThemeProvider';
import MainContent from './Components/MainContent';
import Header from "./Components/Header/Header";
import Sidenav from "./Components/Sidenav/Sidenav";
import { Outlet } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

function App() {
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
