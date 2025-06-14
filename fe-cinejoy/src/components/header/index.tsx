import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { Dropdown } from 'antd';
import ModalLogin from '@/components/modal/auth/login';
import useAppStore from '@/store/app.store';
import { logoutApi } from '@/services/api';
import { useAlertContextApp } from '@/context/alert.context';
import Logo from 'assets/CineJoyLogo.png';

const Header = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const { user, isAuthenticated, setIsAppLoading, setUser, setIsAuthenticated, isModalOpen } = useAppStore();
  const { messageApi } = useAlertContextApp();

  const handleOpenLoginModal = (value: boolean) => {
    setModalOpen(value);
    setLoginModalOpen(true)
  };

  const handleCloseLoginModal = (value: boolean) => {
    setModalOpen(value);
    setLoginModalOpen(false);
  };

  const handleLogout = async () => {
    try {
      setIsAppLoading(true);
      const response = await logoutApi();
      if (response.status) {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem("accessToken");
        messageApi!.open({
          type: "success",
          content: "Đăng xuất thành công!",
        });
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      messageApi!.open({
        type: "error",
        content: "Có lỗi xảy ra khi đăng xuất!",
      });
    } finally {
      setIsAppLoading(false);
    }
  };

  const items = [
    {
      key: "profile",
      label: "Thông tin cá nhân",
    //   onClick: () => navigate("/profile"),
    },
    {
      key: "/history",
      label: "Vé đã mua",
    //   onClick: () => navigate("/history"),
    },
    {
      key: "logout",
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];
//   if (user?.role === 'ADMIN') {
//     items.unshift({
//         label: <Link to='/admin'>Trang quản trị</Link>,
//         key: 'admin',
//     })
//   }


    return (
        <>
            <header className={`sticky top-0 ${loginModalOpen || modalOpen || isModalOpen ? "z-1000" : "z-2000"} bg-[#eee] shadow-sm border-b border-[#ccc]`}>
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
                    {isAuthenticated ? (
                        <>
                            <Dropdown menu={{ items }} placement="bottom" overlayStyle={{ zIndex: 9999 }}>
                                <div className="flex items-center space-x-2 cursor-pointer hover:text-red-500 transition-all duration-300 hover:opacity-80 mr-3">
                                    <img
                                        src={user?.avatar}
                                        alt="User Avatar"
                                        className="w-9 h-9 mr-3 rounded-full object-cover"
                                    />
                                    <span className="text-md font-medium">
                                        {user?.fullName}
                                    </span>
                                </div>
                            </Dropdown>
                        </>
                    ) : (
                        <>
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
                        </>
                    )}
                </div>
            </header>

            <ModalLogin isOpen={loginModalOpen} onOpen={handleOpenLoginModal} onClose={handleCloseLoginModal} />
        </>
    );
};

export default Header;