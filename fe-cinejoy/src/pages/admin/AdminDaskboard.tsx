import React, { useState, useEffect } from "react";

import { getVouchers } from "@/apiservice/apiVoucher";
import { getFoodCombos } from "@/apiservice/apiFoodCombo";
import { getTheaters } from "@/apiservice/apiTheater";
import { getMovies } from "@/apiservice/apiMovies";
import { getRegions, addRegion, deleteRegion } from "@/apiservice/apiRegion";
import { getBlogs } from "@/apiservice/apiBlog";
import { motion } from "framer-motion";









const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState("movies");
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;
    const [movies, setMovies] = useState<IMovie[]>([]);
    const [theaters, setTheaters] = useState<ITheater[]>([]);
    const [regions, setRegions] = useState<IRegion[]>([]);
    const [vouchers, setVouchers] = useState<IVoucher[]>([]);
    const [foodCombos, setFoodCombos] = useState<IFoodCombo[]>([]);
    const [blogs, setBlogs] = useState<IBlog[]>([]);

    const [newRegionName, setNewRegionName] = useState("");

    useEffect(() => {
        getTheaters()
            .then((data) => setTheaters(data))
            .catch(() => setTheaters([]));
        getMovies()
            .then((res) => setMovies(res && Array.isArray(res) ? res : []))
            .catch(() => setMovies([]));
        getFoodCombos()
            .then((data) => setFoodCombos(data))
            .catch(() => setFoodCombos([]));
        getRegions()
            .then((data) => setRegions(data))
            .catch(() => setRegions([]));
        getVouchers()
            .then((data) => setVouchers(data))
            .catch(() => setVouchers([]));
        getBlogs()
            .then((data) => setBlogs(data))
            .catch(() => setBlogs([]));

    }, []);



    // Lọc và phân trang cho từng tab
    const filterAndPaginate = <T,>(
        data: T[],
        filterFn: (item: T) => boolean
    ): { paginated: T[]; totalPages: number } => {
        const filtered = searchTerm.trim()
            ? data.filter(filterFn)
            : data;
        const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
        const paginated = filtered.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
        );
        return { paginated, totalPages };
    };

    // Movies
    const {
        paginated: paginatedMovies,
        totalPages: totalMoviePages,
    } = filterAndPaginate<IMovie>(
        movies,
        (movie) =>
            (movie.title?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())

    );



    // Blogs
    const {
        paginated: paginatedBlogs,
        totalPages: totalBlogPages,
    } = filterAndPaginate<IBlog>(
        blogs,
        (blog) =>
            (blog.title.toLowerCase() ?? "").includes(searchTerm.toLowerCase())

    );

    // FoodCombos
    const {
        paginated: paginatedCombos,
        totalPages: totalComboPages,
    } = filterAndPaginate<IFoodCombo>(
        foodCombos,
        (combo) => (combo.name.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );

    // Regions
    const {
        paginated: paginatedRegions,
        totalPages: totalRegionPages,
    } = filterAndPaginate<IRegion>(
        regions,
        (region) =>
            (region.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())

    );

    // Theaters
    const {
        paginated: paginatedTheaters,
        totalPages: totalTheaterPages,
    } = filterAndPaginate<ITheater>(
        theaters,
        (theater) =>
            (theater.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
            (theater.location?.city?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );

    // Vouchers
    const {
        paginated: paginatedVouchers,
        totalPages: totalVoucherPages,
    } = filterAndPaginate<IVoucher>(
        vouchers,
        (voucher) => (voucher.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );



    // Reset page when tab/searchTerm thay đổi
    React.useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    const handleAddRegion = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Adding region:", newRegionName);
        try {
            const newRegion: IRegion = await addRegion({ name: newRegionName });
            setRegions([...regions, newRegion]);
            setNewRegionName("");
        } catch (error) {
            console.error("Failed to add region:", error);
        }
    };

    const handleDeleteRegion = async (regionId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khu vực này?')) {
            try {
                await deleteRegion(regionId); // Gọi API xóa
                setRegions((prevRegions) =>
                    prevRegions.filter((region) => region._id !== regionId) // Cập nhật state sau khi xóa thành công
                );
                alert('Xóa khu vực thành công!');
                // Sau khi xóa, có thể cần reset trang về 1 hoặc kiểm tra lại tổng số trang
                // Ví dụ: setCurrentPage(1); // hoặc kiểm tra lại logic phân trang của bạn
            } catch (error) {
                console.error('Lỗi khi xóa khu vực:', error);
                alert('Xóa khu vực thất bại!');
            }
        }
    };



    return (
        <div className="min-h-screen flex font-roboto bg-white">
            {/* Sidebar */}
            <aside className="w-64 bg-black shadow-lg fixed h-full">
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://i.pravatar.cc/100"
                            alt="Admin Avatar"
                            className="h-10 w-10 rounded-full"
                        />
                        <div>
                            <p className="text-sm font-medium text-white mb-0.5 select-none">
                                Admin
                            </p>
                            <p className="text-xs text-gray-400 select-none">Quản trị viên</p>
                        </div>
                    </div>
                </div>
                <nav className="mt-4">
                    <ul>
                        {[
                            { label: "Phim", value: "movies", icon: "🎬" },
                            // { label: "Đơn hàng", value: "orders", icon: "📦" },
                            // { label: "Người dùng", value: "users", icon: "👥" },
                            { label: "Blog", value: "blogs", icon: "📰" },
                            { label: "Combo", value: "foodCombos", icon: "🍿" },
                            { label: "Khu vực", value: "regions", icon: "🌏" },
                            { label: "Rạp", value: "theaters", icon: "🏢" },
                            { label: "Voucher", value: "vouchers", icon: "🎟️" },
                            // { label: "Suất chiếu", value: "showtimes", icon: "⏰" },
                        ].map((tab) => (
                            <li
                                key={tab.value}
                                className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors duration-200 ${activeTab === tab.value
                                    ? "bg-gray-900 text-white"
                                    : "text-gray-200 hover:bg-gray-800"
                                    }`}
                                onClick={() => {
                                    setActiveTab(tab.value);
                                    setSearchTerm("");
                                    setCurrentPage(1);
                                }}
                            >
                                <span className="text-lg">{tab.icon}</span>
                                {tab.label}
                            </li>
                        ))}
                    </ul>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 ml-64">
                {/* Header */}
                <header className="bg-black text-white p-4 flex justify-between items-center shadow-md">
                    <h1 className="text-xl font-semibold select-none">
                        Admin Dashboard - CineJoy
                    </h1>
                    <button
                        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
                        onClick={() => {
                            window.location.href = "/login";
                        }}
                    >
                        Đăng xuất
                    </button>
                </header>

                {/* Content */}
                <main className="p-6">
                    {/* Movies Tab */}
                    {activeTab === "movies" && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6 text-black select-none">
                                Quản lý phim
                            </h2>
                            <div className="flex justify-between items-center mb-4">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm phim..."
                                    className="border border-gray-300 bg-white text-black rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div>
                                    <span>
                                        Trang {currentPage} / {totalMoviePages}
                                    </span>
                                    <button
                                        className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        Trước
                                    </button>
                                    <button
                                        className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50"
                                        disabled={currentPage === totalMoviePages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-black text-white">
                                        <tr>
                                            <th className="p-3 text-left">STT</th>
                                            <th className="p-3 text-left">Poster</th>
                                            <th className="p-3 text-left">Tên phim</th>
                                            <th className="p-3 text-left">Ngày phát hành</th>
                                            <th className="p-3 text-left">Thời lượng</th>
                                            <th className="p-3 text-left">Thể loại</th>
                                            <th className="p-3 text-left">Đạo diễn</th>
                                            <th className="p-3 text-left">Trạng thái</th>
                                            <th className="p-3 text-left">Đánh giá TB</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedMovies.map((movie, idx) => (
                                            <tr key={movie._id} className="border-b hover:bg-gray-100">
                                                <td className="p-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                                <td className="p-3">
                                                    <img src={movie.posterImage} alt={movie.title} className="w-16 h-20 object-cover rounded" />
                                                </td>
                                                <td className="p-3">{movie.title}</td>
                                                <td className="p-3">{movie.releaseDate}</td>
                                                <td className="p-3">{movie.duration} phút</td>
                                                <td className="p-3">{movie.genre.join(", ")}</td>
                                                <td className="p-3">{movie.director}</td>
                                                <td className="p-3">{movie.status}</td>
                                                <td className="p-3">{movie.averageRating}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}



                    {/* Blogs Tab */}
                    {activeTab === "blogs" && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6 text-black select-none">
                                Quản lý Blog
                            </h2>
                            <div className="flex justify-between items-center mb-4">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm blog..."
                                    className="border border-gray-300 bg-white text-black rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div>
                                    <span>
                                        Trang {currentPage} / {totalBlogPages}
                                    </span>
                                    <button
                                        className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        Trước
                                    </button>
                                    <button
                                        className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50"
                                        disabled={currentPage === totalBlogPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-black text-white">
                                        <tr>
                                            <th className="p-3 text-left">STT</th>
                                            <th className="p-3 text-left">Tiêu đề</th>
                                            <th className="p-3 text-left">Ngày đăng</th>
                                            <th className="p-3 text-left">Nội dung</th>
                                            <th className="p-3 text-left">Ảnh</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedBlogs.map((blog, idx) => (
                                            <tr key={blog._id} className="border-b hover:bg-gray-100">
                                                <td className="p-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                                <td className="p-3">{blog.title}</td>
                                                <td className="p-3">{blog.postedDate}</td>
                                                <td className="p-3">{blog.content}</td>
                                                <td className="p-3">
                                                    <img src={blog.image} alt={blog.title} className="w-16 h-16 object-cover rounded" />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Food Combos Tab */}
                    {activeTab === "foodCombos" && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6 text-black select-none">
                                Quản lý Combo
                            </h2>
                            <div className="flex justify-between items-center mb-4">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm combo..."
                                    className="border border-gray-300 bg-white text-black rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div>
                                    <span>
                                        Trang {currentPage} / {totalComboPages}
                                    </span>
                                    <button
                                        className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        Trước
                                    </button>
                                    <button
                                        className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50"
                                        disabled={currentPage === totalComboPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-black text-white">
                                        <tr>
                                            <th className="p-3 text-left">STT</th>
                                            <th className="p-3 text-left">Tên Combo</th>
                                            <th className="p-3 text-left">Giá</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedCombos.map((combo, idx) => (
                                            <tr key={combo._id} className="border-b hover:bg-gray-100">
                                                <td className="p-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                                <td className="p-3">{combo.name}</td>
                                                <td className="p-3">{combo.price.toLocaleString("vi-VN")} đ</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Regions Tab */}
                    {activeTab === "regions" && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6 text-black select-none">
                                Quản lý Khu vực
                            </h2>
                            <div className="flex justify-between items-center mb-4">

                                <form onSubmit={handleAddRegion}>
                                    <div className="flex flex-col md:flex-row gap-6 ">
                                        <motion.input
                                            type="text"

                                            value={newRegionName} // Bind giá trị với state
                                            onChange={(e) => setNewRegionName(e.target.value)} // Cập nhật giá trị khi người dùng nhập
                                            placeholder="Nhập tên Khu vực"
                                            className="w-full md:w-1/3 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-700"
                                            whileFocus={{
                                                scale: 1.02,
                                                transition: { duration: 0.2 },
                                            }}

                                        />
                                        <div className="flex gap-2">
                                            <motion.button
                                                type="submit"
                                                className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Thêm
                                            </motion.button>

                                            <motion.button
                                                type="button"

                                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Hủy
                                            </motion.button>

                                        </div>

                                        <motion.input
                                            type="text"
                                            placeholder="Tìm kiếm khu vực..."
                                            className="border border-gray-300 bg-white text-black rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                </form>

                                <div>
                                    <span>
                                        Trang {currentPage} / {totalRegionPages}
                                    </span>
                                    <button
                                        className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        Trước
                                    </button>
                                    <button
                                        className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50"
                                        disabled={currentPage === totalRegionPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-black text-white">
                                        <tr>
                                            <th className="p-3 text-left">STT</th>
                                            <th className="p-3 text-left">Tên Khu vực</th>
                                            <th className="p-3 text-left">Hành Động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedRegions.map((region, idx) => (
                                            <tr key={region._id} className="border-b hover:bg-gray-100">
                                                <td className="p-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                                <td className="p-3">{region.name}</td>
                                                <td className="p-3">
                                                    <motion.button
                                                        className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-yellow-600 mr-2"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}

                                                    >
                                                        Sửa
                                                    </motion.button>
                                                    <motion.button
                                                        className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-red-600"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDeleteRegion(region._id)}
                                                    >
                                                        Xóa
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}


                                                    >

                                                    </motion.button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Theaters Tab */}
                    {activeTab === "theaters" && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6 text-black select-none">
                                Quản lý Rạp
                            </h2>
                            <div className="flex justify-between items-center mb-4">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm rạp..."
                                    className="border border-gray-300 bg-white text-black rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div>
                                    <span>
                                        Trang {currentPage} / {totalTheaterPages}
                                    </span>
                                    <button
                                        className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        Trước
                                    </button>
                                    <button
                                        className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50"
                                        disabled={currentPage === totalTheaterPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-black text-white">
                                        <tr>
                                            <th className="p-3 text-left">STT</th>
                                            <th className="p-3 text-left">Tên rạp</th>
                                            <th className="p-3 text-left">Thành phố</th>
                                            <th className="p-3 text-left">Địa chỉ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedTheaters.map((theater, idx) => (
                                            <tr key={theater._id} className="border-b hover:bg-gray-100">
                                                <td className="p-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                                <td className="p-3">{theater.name}</td>
                                                <td className="p-3">{theater.location.city}</td>
                                                <td className="p-3">{theater.location.address}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Vouchers Tab */}
                    {activeTab === "vouchers" && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6 text-black select-none">
                                Quản lý Voucher
                            </h2>
                            <div className="flex justify-between items-center mb-4">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm voucher..."
                                    className="border border-gray-300 bg-white text-black rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <div>
                                    <span>
                                        Trang {currentPage} / {totalVoucherPages}
                                    </span>
                                    <button
                                        className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage((p) => p - 1)}
                                    >
                                        Trước
                                    </button>
                                    <button
                                        className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50"
                                        disabled={currentPage === totalVoucherPages}
                                        onClick={() => setCurrentPage((p) => p + 1)}
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                                <table className="min-w-full">
                                    <thead className="bg-black text-white">
                                        <tr>
                                            <th className="p-3 text-left">STT</th>
                                            <th className="p-3 text-left">Tên Voucher</th>
                                            <th className="p-3 text-left">Ngày bắt đầu</th>
                                            <th className="p-3 text-left">Ngày kết thúc</th>
                                            <th className="p-3 text-left">Số lượng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedVouchers.map((voucher, idx) => (
                                            <tr key={voucher._id} className="border-b hover:bg-gray-100">
                                                <td className="p-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                                <td className="p-3">{voucher.name}</td>
                                                <td className="p-3">{voucher.validityPeriod.startDate}</td>
                                                <td className="p-3">{voucher.validityPeriod.endDate}</td>
                                                <td className="p-3">{voucher.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}



                </main>
            </div>
        </div>
    );
};

export default Dashboard;