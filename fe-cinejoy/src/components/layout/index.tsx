import { useEffect } from 'react';
import { Outlet, useLocation } from "react-router-dom";
import Header from "components/header";
import Footer from "components/footer";
import Chatbot from "@/components/chatBot";

const Layout = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <Chatbot />
    </>
  );
}

export default Layout;
