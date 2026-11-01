import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PageLayout({ children }) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col bg-[#fbf9f3] text-[#1a2138]">
      <Navbar />
      <main id="main-content" className={`flex-1 ${!isHome ? 'pt-[76px]' : ''}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
