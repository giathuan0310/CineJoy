import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTwitter } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-gray-100 pt-10 pb-4">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
                    {/* Left sidebar - Links */}
                    <div className="md:col-span-1">
                        <div className="mb-6">
                            <Link to="/">
                                <img
                                    src="/logo-vti.png"
                                    alt="VTI Logo"
                                    className="w-16 h-auto"

                                />
                            </Link>
                        </div>
                        <ul className="space-y-3">
                            <li><Link to="/faq" className="text-gray-700 hover:text-red-600">FAQ</Link></li>
                            <li><Link to="/about" className="text-gray-700 hover:text-red-600">Giới thiệu</Link></li>
                            <li><Link to="/terms" className="text-gray-700 hover:text-red-600">Điều khoản sử dụng</Link></li>
                            <li><Link to="/privacy" className="text-gray-700 hover:text-red-600">Chính Sách Quyền Riêng Tư</Link></li>
                            <li><Link to="/account-request" className="text-gray-700 hover:text-red-600">Yêu cầu riêng về tài khoản</Link></li>
                            <li><Link to="/booking-guide" className="text-gray-700 hover:text-red-600">Hướng dẫn đặt vé online</Link></li>
                        </ul>
                    </div>

                    {/* Theater System - 3 columns */}
                    <div className="md:col-span-3">
                        <h3 className="text-lg font-semibold mb-6 text-center">Hệ thống rạp</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Northern Region */}
                            <div>
                                <h4 className="font-semibold mb-4 text-center">Miền Bắc</h4>
                                <ul className="space-y-2">
                                    <li><Link to="/cinema/hanoi" className="text-gray-700 hover:text-red-600">VTI Hà Nội Cinema</Link></li>
                                    <li><Link to="/cinema/thanglong" className="text-gray-700 hover:text-red-600">VTI Thăng Long Movie</Link></li>
                                    <li><Link to="/cinema/royal" className="text-gray-700 hover:text-red-600">VTI Royal Hanoi Theater</Link></li>
                                    <li><Link to="/cinema/westlake" className="text-gray-700 hover:text-red-600">VTI West Lake Cinema</Link></li>
                                    <li><Link to="/cinema/redriver" className="text-gray-700 hover:text-red-600">VTI Red River Film House</Link></li>
                                </ul>
                            </div>

                            {/* Central Region */}
                            <div>
                                <h4 className="font-semibold mb-4 text-center">Miền Trung</h4>
                                <ul className="space-y-2">
                                    <li><Link to="/cinema/danang" className="text-gray-700 hover:text-red-600">VTI Đà Nẵng Star Cinema</Link></li>
                                    <li><Link to="/cinema/hue" className="text-gray-700 hover:text-red-600">VTI Huế Heritage Cinema</Link></li>
                                    <li><Link to="/cinema/hoian" className="text-gray-700 hover:text-red-600">VTI Đồng Hới Film Center</Link></li>
                                    <li><Link to="/cinema/nhatrang" className="text-gray-700 hover:text-red-600">VTI Nha Trang Sun Theater</Link></li>
                                    <li><Link to="/cinema/pleiku" className="text-gray-700 hover:text-red-600">VTI Pleiku Movies</Link></li>
                                </ul>
                            </div>

                            {/* Southern Region */}
                            <div>
                                <h4 className="font-semibold mb-4 text-center">Miền Nam</h4>
                                <ul className="space-y-2">
                                    <li><Link to="/cinema/saigon" className="text-gray-700 hover:text-red-600">VTI Sài Gòn Film House</Link></li>
                                    <li><Link to="/cinema/mekong" className="text-gray-700 hover:text-red-600">VTI Mekong Movie Center</Link></li>
                                    <li><Link to="/cinema/vungtau" className="text-gray-700 hover:text-red-600">VTI Vũng Tàu Ocean Cinema</Link></li>
                                    <li><Link to="/cinema/cantho" className="text-gray-700 hover:text-red-600">VTI Cần Thơ Riverside Theater</Link></li>
                                    <li><Link to="/cinema/bienhoa" className="text-gray-700 hover:text-red-600">VTI Biên Hòa Galaxy</Link></li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Connect & Contact */}
                    <div className="md:col-span-1">
                        <div className="mb-8">
                            <h3 className="text-lg font-semibold mb-4">Kết nối</h3>
                            <div className="flex gap-4">
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-blue-600">
                                    <FaFacebookF className="text-lg" /> Facebook
                                </a>
                            </div>
                            <div className="flex gap-4 my-3">
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-pink-600">
                                    <FaInstagram className="text-lg" /> Instagram
                                </a>
                            </div>
                            <div className="flex gap-4">
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-blue-400">
                                    <FaTwitter className="text-lg" /> Twitter
                                </a>
                            </div>

                            <div className="mt-4">
                                <img
                                    src="/bo-cong-thuong.png"
                                    alt="Bộ Công Thương"
                                    className="w-32 h-auto"

                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
                            <p className="mb-2 font-semibold">CÔNG TY CỔ PHẦN VTI MEDIA</p>
                            <p className="mb-2">LIÊN HỆ HỢP TÁC</p>
                            <p className="mb-2">HOTLINE: 1900 1999</p>
                            <p className="mb-2">EMAIL: vticinema@gmail.com</p>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-10 pt-6 border-t border-gray-200 text-center text-gray-600 text-sm">
                    © Copyright 2024 - 2025
                </div>
            </div>
        </footer>
    );
};

export default Footer;