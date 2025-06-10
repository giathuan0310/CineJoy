import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import Logo from 'assets/CineJoyLogo.png';
import ModalLogin from '@/components/modal/auth/login';

const Header = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  const handleOpenLoginModal = (value: boolean) => {
    setModalOpen(value);
    setLoginModalOpen(true)
  };

  const handleCloseLoginModal = (value: boolean) => {
    setModalOpen(value);
    setLoginModalOpen(false);
  };

    return (
        <>
            <header className={`sticky top-0 ${loginModalOpen || modalOpen ? "z-1000" : "z-2000"} bg-[#eee] shadow-sm border-b border-[#ccc]`}>
                <div className="container mx-auto pl-12 pr-4 py-1.5 flex items-center justify-between">
                    {/* Logo */}
                    <div className='flex items-center gap-6'>
                        <Link to="/" className="flex items-center">
                            <img className='w-[90px] object-cover inline-block' src={Logo} alt="Logo" />
                        </Link>

                        <div className="flex flex-col items-center text-sm select-none">
                            <p className="text-[#0f1b4c] text-[15px] leading-4 font-normal">Đặt vé</p>
                            <p className="text-[#0f1b4c] text-[15px] leading-4 font-normal">xem phim</p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-10 mx-4">
                        <NavLink to="/" className={({ isActive }) => isActive ? "text-red-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]" : "text-gray-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]"}>
                            Trang chủ
                        </NavLink>
                        <NavLink to="/movies" className={({ isActive }) => isActive ? "text-red-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]" : "text-gray-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]"}>
                            Phim
                        </NavLink>
                        <NavLink to="/news" className={({ isActive }) => isActive ? "text-red-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]" : "text-gray-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]"}>
                            Tin tức
                        </NavLink>
                        <NavLink to="/members" className={({ isActive }) => isActive ? "text-red-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]" : "text-gray-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]"}>
                            Thành viên
                        </NavLink>
                        <NavLink to="/contact" className={({ isActive }) => isActive ? "text-red-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]" : "text-gray-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]"}>
                            Liên hệ
                        </NavLink>
                    </nav>

                    {/* Right section */}
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <button className="text-gray-700 hover:text-gray-900 bg-white rounded-full p-2.5 border border-gray-200 cursor-pointer hover:scale-110 transition-all duration-250">
                                <FaSearch size={16} />
                            </button>
                        </div>
                        <button
                            className="bg-[#061b4b] text-white px-4 py-3.5 rounded-xl hover:opacity-90 transition-opacity font-medium cursor-pointer"
                            onClick={() => handleOpenLoginModal(false)}
                        >
                            Đăng nhập
                        </button>
                    </div>
                </div>
            </header>

            <ModalLogin isOpen={loginModalOpen} onOpen={handleOpenLoginModal} onClose={handleCloseLoginModal} />
        </>
    );
};

export default Header;