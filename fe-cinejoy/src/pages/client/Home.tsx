import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';
import MoviesListCarousel from '@/components/moviesListCarousel';
import ScheduleList from '@/components/scheduleList';

const HomePage = () => {
    return (
        <>
            {/* Hero Section */}
            <div className="bg-[#134c0f1a] py-16">
                <div className="container mx-auto px-40">
                    <div className="flex flex-col md:flex-row items-center">
                        {/* Left Content */}
                        <div className="w-full md:w-1/2 md:pr-8">
                            <h1 className="text-3xl md:text-4xl font-medium mb-4 text-gray-800">
                                Mua vé xem phim <span className="text-[#ff6347]">Online</span> trên <span className="text-[#0095da]">CINEJOY</span>
                            </h1>
                            
                            <p className="text-gray-600 mb-8 text-lg">
                                Với nhiều ưu đãi hấp dẫn và kết nối với tất cả các rạp lớn phổ biến khắp Việt Nam.
                                Đặt vé ngay tại CINEJOY!
                            </p>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center">
                                    <FaCheckCircle className="text-[#8b5cf6] mr-3" size={22} />
                                    <span className="text-gray-700">Mua vé Online, trải nghiệm phim hay</span>
                                </div>
                                <div className="flex items-center">
                                    <FaCheckCircle className="text-[#8b5cf6] mr-3" size={22} />
                                    <span className="text-gray-700">Đặt vé an toàn trên CINEJOY</span>
                                </div>
                                <div className="flex items-center">
                                    <FaCheckCircle className="text-[#8b5cf6] mr-3" size={22} />
                                    <span className="text-gray-700">Thỏa sức chọn chỗ ngồi, mua bắp nước tiện lợi</span>
                                </div>
                                <div className="flex items-center">
                                    <FaCheckCircle className="text-[#8b5cf6] mr-3" size={22} />
                                    <span className="text-gray-700">Lịch sử đặt vé được lưu lại ngay</span>
                                </div>
                            </div>
                            
                            <Link 
                                to="/booking" 
                                className="bg-[#ff6347] hover:bg-[#ff5337] text-white font-medium py-3 px-8 rounded-full transition-all inline-block"
                            >
                                Đặt vé ngay
                            </Link>
                        </div>
                        
                        {/* Right Content with Image */}
                        <div className="w-full md:w-1/2 mt-10 md:mt-0">
                            <div className="text-center md:text-right mb-4">
                                <h2 className="text-xl md:text-2xl font-medium text-gray-800">
                                    Đặt vé xem phim trên CINEJOY
                                </h2>
                                <p className="text-lg text-gray-700">
                                    Ghế đẹp, giờ hot, vào rạp không chờ đợi!
                                </p>
                            </div>
                            
                            <div className="flex justify-center md:justify-end">
                                <img 
                                    src="https://res.cloudinary.com/ddia5yfia/image/upload/v1733633928/contact_5_otvgni.png" 
                                    alt="Cinema illustration" 
                                    className="w-full max-w-md"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <MoviesListCarousel title='PHIM ĐANG CHIẾU' starRating />
            <MoviesListCarousel title='PHIM SẮP CHIẾU' bg titleColor="#0f1b4c" />
            <ScheduleList />
        </>
    );
};

export default HomePage;