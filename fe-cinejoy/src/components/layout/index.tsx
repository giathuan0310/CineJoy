import { Outlet } from "react-router-dom";
import Header from "components/header";
import Footer from "components/footer";
import Chatbot from "components/chatBot/Chatbot";
import { useEffect, useState } from 'react';

const Layout = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      <Chatbot />
      {showScrollTop && (
        <button
          onClick={handleScrollToTop}
          className="fixed bottom-40 right-5 z-[9999] bg-blue-600 hover:bg-blue-800 text-white p-3.5 rounded-full shadow-lg transition-all duration-300 cursor-pointer"
          title="Lên đầu trang"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </>
  );
}

export default Layout;
