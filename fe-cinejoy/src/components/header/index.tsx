import { FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="bg-[#eee] shadow-sm border-b border-[#ccc]">
            <div className="container mx-auto pl-12 pr-4 py-1.5 flex items-center justify-between">
                {/* Logo */}
                <div className='flex items-center gap-6'>
                    <Link to="/" className="flex items-center">
                        <img className='w-[60px] object-cover inline-block' src="https://vticinema.web.app/assets/logo-Bum-QgbD.png" alt="Logo" />
                    </Link>
    
                    <div className="flex flex-col items-center text-sm select-none">
                        <p className="text-[#0f1b4c] text-[15px] leading-4 font-normal">Đặt vé</p>
                        <p className="text-[#0f1b4c] text-[15px] leading-4 font-normal">xem phim</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="hidden md:flex items-center gap-10 mx-4">
                    <Link to="/" className="text-red-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]">
                        Trang chủ
                    </Link>
                    <Link to="/movies" className="text-gray-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]">
                        Phim
                    </Link>
                    <Link to="/news" className="text-gray-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]">
                        Tin tức
                    </Link>
                    <Link to="/members" className="text-gray-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]">
                        Thành viên
                    </Link>
                    <Link to="/contact" className="text-gray-800 font-medium hover:text-red-600 transition-colors uppercase text-[18px]">
                        Liên hệ
                    </Link>
                </nav>

                {/* Right section */}
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <button className="text-gray-700 hover:text-gray-900 bg-white rounded-full p-2.5 border border-gray-200 cursor-pointer hover:scale-110 transition-all duration-250">
                            <FaSearch size={16} />
                        </button>
                    </div>
                    <Link 
                        to="/login" 
                        className="bg-[#061b4b] text-white px-4 py-3.5 rounded-xl hover:opacity-90 transition-opacity font-medium"
                    >
                        Đăng nhập
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;