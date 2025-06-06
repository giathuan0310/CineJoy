import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="bg-gray-100 shadow-sm">
            <div className="container mx-auto px-4 py-1.5 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center w-[200px] ml-10">
                    <div className="flex items-center gap-5">
                        <img className='w-[60px] object-cover inline-block' src="https://vticinema.web.app/assets/logo-Bum-QgbD.png" alt="Logo" />
                        <div className="flex flex-col items-center text-sm">
                            <p className="text-[#0f1b4c] text-[15px] leading-tight font-normal">Đặt vé</p>
                            <p className="text-[#0f1b4c] text-[15px] leading-tight font-normal">xem phim</p>
                        </div>
                    </div>
                </Link>

                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-8 mx-4">
                    <Link to="/" className="text-red-800 font-medium hover:text-red-600 transition-colors uppercase text-[15px]">
                        Trang chủ
                    </Link>
                    <Link to="/movies" className="text-gray-800 font-medium hover:text-red-600 transition-colors uppercase text-[15px]">
                        Phim
                    </Link>
                    <Link to="/news" className="text-gray-800 font-medium hover:text-red-600 transition-colors uppercase text-[15px]">
                        Tin tức
                    </Link>
                    <Link to="/members" className="text-gray-800 font-medium hover:text-red-600 transition-colors uppercase text-[15px]">
                        Thành viên
                    </Link>
                    <Link to="/contact" className="text-gray-800 font-medium hover:text-red-600 transition-colors uppercase text-[15px]">
                        Liên hệ
                    </Link>
                </nav>

                {/* Right section */}
                <div className="flex items-center">
                    <div className="relative mr-4">
                        <button className="text-gray-700 hover:text-gray-900 bg-white rounded-full p-2 border border-gray-200">
                            <FaSearch size={16} />
                        </button>
                    </div>
                    <Link 
                        to="/login" 
                        className="bg-[#061b4b] text-white px-5 py-2 rounded-md hover:opacity-90 transition-opacity font-medium"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;