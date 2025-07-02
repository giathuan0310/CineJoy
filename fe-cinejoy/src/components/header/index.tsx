import { MdDarkMode } from "react-icons/md";
import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { Dropdown } from 'antd';
import ModalLogin from '@/components/modal/auth/login';
import useAppStore from '@/store/app.store';
import { logoutApi, updateUser } from '@/services/api';
import { useAlertContextApp } from '@/context/alert.context';
import Logo from 'assets/CineJoyLogo.png';

const Header = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const { user, isAuthenticated, setIsAppLoading, setUser, setIsAuthenticated, isModalOpen, isDarkMode, setIsDarkMode } = useAppStore();
  const { messageApi } = useAlertContextApp();

  const handleOpenLoginModal = (value: boolean) => {
    setModalOpen(value);
    setLoginModalOpen(true);
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

  const handleDarkMode = async () => {
    if (isAuthenticated && user?._id) {
        setIsDarkMode(!user.settings.darkMode);
        try {
            const res = await updateUser(user._id, { settings: { darkMode: !user.settings.darkMode } });
            if (res.data && res.status) {
                setUser(res.data);
            }
        } catch (error) {
            setIsDarkMode(user.settings.darkMode);
            messageApi?.open({ type: "error", content: "Cập nhật dark mode thất bại!" });
            console.log(error);
        }
    } else {
        setIsDarkMode(!isDarkMode);
    }
  }

  useEffect(() => {
    if (user && typeof user.settings?.darkMode === 'boolean') {
      setIsDarkMode(user.settings.darkMode);
    }
  }, [user]);

  const items = [
    {
      key: "profile",
      label: <div className="text-center">Thông tin cá nhân</div>,
    //   onClick: () => navigate("/profile"),
    },
    {
      key: "/history",
      label: <div className="text-center">Vé đã mua</div>,
    //   onClick: () => navigate("/history"),
    },
    {
      key: "logout",
      label: <div className="text-center">Đăng xuất</div>,
      onClick: handleLogout,
    },
  ];
  if (user?.role === 'ADMIN') {
    items.unshift({
        label: <Link to='/admin'><div className="text-center">Trang quản trị</div></Link>,
        key: 'admin',
    })
  }

    return (
        <>
            <header className={`sticky top-0 ${loginModalOpen || modalOpen || isModalOpen ? "z-1000" : "z-2000"} ${isDarkMode ? "bg-[#23272f]" : "bg-[#eee]"} shadow-sm border-b border-[#ccc]`}>
                <div className="container mx-auto pl-12 pr-4 py-1.5 flex items-center justify-between">
                    {/* Logo */}
                    <div className='flex items-center gap-6'>
                        <Link to="/" className="flex items-center">
                            <img className='w-[90px] object-cover inline-block' src={Logo} alt="Logo" />
                        </Link>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-10 mx-4">
                        <NavLink to="/" className={({ isActive }) => isActive ? "text-red-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]" : `${isDarkMode ? "text-white" : "text-gray-800"} font-medium hover:text-red-600 transition-colors uppercase text-[18px]`}>
                            Trang chủ
                        </NavLink>
                        <NavLink to="/movies" className={({ isActive }) => isActive ? "text-red-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]" : `${isDarkMode ? "text-white" : "text-gray-800"} font-medium hover:text-red-600 transition-colors uppercase text-[18px]`}>
                            Phim
                        </NavLink>
                        <NavLink to="/news" className={({ isActive }) => isActive ? "text-red-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]" : `${isDarkMode ? "text-white" : "text-gray-800"} font-medium hover:text-red-600 transition-colors uppercase text-[18px]`}>
                            Tin tức
                        </NavLink>
                        <NavLink to="/members" className={({ isActive }) => isActive ? "text-red-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]" : `${isDarkMode ? "text-white" : "text-gray-800"} font-medium hover:text-red-600 transition-colors uppercase text-[18px]`}>
                            Thành viên
                        </NavLink>
                        <NavLink to="/contact" className={({ isActive }) => isActive ? "text-red-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]" : `${isDarkMode ? "text-white" : "text-gray-800"} font-medium hover:text-red-600 transition-colors uppercase text-[18px]`}>
                            Liên hệ
                        </NavLink>
                    </nav>

                    {/* Right section */}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <button className="text-gray-700 hover:text-gray-900 bg-white rounded-full p-2.5 border border-gray-200 cursor-pointer hover:scale-110 transition-all duration-250">
                                    <FaSearch size={16} />
                                </button>
                            </div>
                            <div className="cursor-pointer hover:scale-110 transition-all duration-200" onClick={handleDarkMode}> 
                                {isDarkMode ? <MdDarkMode color="white" size={35} /> : <MdDarkMode size={35} />}
                            </div>
                            <Dropdown menu={{ items }} placement="bottom" overlayStyle={{ zIndex: 9999 }}>
                                <div className="flex items-center space-x-2 cursor-pointer hover:text-red-500 transition-all duration-300 hover:opacity-80 mr-3">
                                    <img
                                        src={user?.avatar}
                                        alt="User Avatar"
                                        className="w-9 h-9 mr-3 rounded-full object-cover"
                                    />
                                    <span className={`text-md font-medium ${isDarkMode ? "text-white" : ""}`}>
                                        {user?.fullName}
                                    </span>
                                </div>
                            </Dropdown>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <button className="text-gray-700 hover:text-gray-900 bg-white rounded-full p-2.5 border border-gray-200 cursor-pointer hover:scale-110 transition-all duration-250">
                                        <FaSearch size={16} />
                                    </button>
                                </div>
                                <div className="cursor-pointer hover:scale-110 transition-all duration-200" onClick={handleDarkMode}> 
                                    {isDarkMode ? <MdDarkMode color="white" size={35} /> : <MdDarkMode size={35} />}
                                </div>
                                <button
                                    className={`${isDarkMode ? "bg-blue-700" : "bg-[#061b4b]"} text-white px-4 py-3.5 rounded-xl hover:opacity-90 transition-opacity font-medium cursor-pointer`}
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