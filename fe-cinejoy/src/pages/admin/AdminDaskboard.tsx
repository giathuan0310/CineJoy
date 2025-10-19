import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { getVouchers } from "@/apiservice/apiVoucher";
import { getFoodCombos } from "@/apiservice/apiFoodCombo";
import { getTheaters } from "@/apiservice/apiTheater";
import { deleteMovie, getMovies, createMovie, updateMovie } from "@/apiservice/apiMovies";
import { getRegions, addRegion, deleteRegion, getRegionById, updateRegion } from "@/apiservice/apiRegion";
import { getBlogs } from "@/apiservice/apiBlog";
import banner from "@/assets/banner.jpg";
import { getShowTimes, updateShowtime, deleteShowtime } from "@/apiservice/apiShowTime";
import MovieForm from "@/pages/admin/Form/MovieForm";
import ShowtimeForm from "@/pages/admin/Form/ShowtimeForm";
import useAppStore from "@/store/app.store";

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<string>("movies");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [movies, setMovies] = useState<IMovie[]>([]);
    const [theaters, setTheaters] = useState<ITheater[]>([]);
    const [regions, setRegions] = useState<IRegion[]>([]);
    const [vouchers, setVouchers] = useState<IVoucher[]>([]);
    const [foodCombos, setFoodCombos] = useState<IFoodCombo[]>([]);
    const [blogs, setBlogs] = useState<IBlog[]>([]);
    const [showtimes, setShowtimes] = useState<IShowtime[]>([]);
    const [newRegionName, setNewRegionName] = useState<string>("");
    const [showMovieForm, setShowMovieForm] = useState<boolean>(false);
    const [selectedMovie, setSelectedMovie] = useState<IMovie | undefined>(undefined);
    const [editingRegion, setEditingRegion] = useState<IRegion | null>(null);
    const [showTimeForm, setShowTimeForm] = useState<boolean>(false);
    const [selectedShowtime, setSelectedShowtime] = useState<IShowtime | null>(null);
    const [showShowtimeForm, setShowShowtimeForm] = useState<boolean>(false);
    const [editingShowtime, setEditingShowtime] = useState<IShowtime | null>(null);
    const { user } = useAppStore();

    const itemsPerPage = 5;

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
        getShowTimes()
            .then((data) => {
                console.log('Showtimes API response:', data);
                setShowtimes(data && Array.isArray(data) ? data : []);
            })
            .catch((error) => {
                console.error('Error fetching showtimes:', error);
                setShowtimes([]);
            });
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

    // Showtimes
    const {
        paginated: paginatedShowtimes,
        totalPages: totalShowtimePages,
    } = filterAndPaginate<IShowtime>(
        showtimes,
        (showtime) => {
            const movie = movies.find(m => m._id === showtime.movieId._id);
            const theater = theaters.find(t => t._id === showtime.theaterId._id);
            return (
                (movie?.title?.toLowerCase() ?? "").includes(searchTerm.toLowerCase()) ||
                (theater?.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
            );
        }
    );

    // Reset page when tab/searchTerm thay đổi
    React.useEffect(() => {
        setCurrentPage(1);
    }, [activeTab, searchTerm]);

    ////////////////////////Xử lý CRUD khu vực////////////////////////
    const handleRegionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (editingRegion) {
            // Cập nhật
            try {
                const updated = await updateRegion(editingRegion._id, { ...editingRegion, name: newRegionName });
                setRegions(regions.map(r => r._id === updated._id ? updated : r));
                setEditingRegion(null);
                setNewRegionName('');
                toast.success('Cập nhật khu vực thành công!');
            } catch {
                toast.success('Cập nhật thất bại!');
            }
        } else {
            // Thêm mới
            try {
                const newRegion: IRegion = await addRegion({ name: newRegionName });
                setRegions([...regions, newRegion]);
                setNewRegionName('');
                toast.success('Thêm khu vực thành công!');
            } catch {
                toast.success('Thêm khu vực thất bại!');
            }
        }
    };
    const handleDeleteRegion = async (regionId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa khu vực này?')) {
            try {
                await deleteRegion(regionId); // Gọi API xóa
                setRegions((prevRegions) =>
                    prevRegions.filter((region) => region._id !== regionId) // Cập nhật state sau khi xóa thành công
                );
                toast.success('Xóa khu vực thành công!');
                // Sau khi xóa, có thể cần reset trang về 1 hoặc kiểm tra lại tổng số trang
                // Ví dụ: setCurrentPage(1); // hoặc kiểm tra lại logic phân trang của bạn
            } catch (error) {
                console.error('Lỗi khi xóa khu vực:', error);
                toast.success('Xóa khu vực thất bại!');
            }
        }
    };
    const handleEditRegion = async (regionId: string) => {
        try {
            const region = await getRegionById(regionId);
            setEditingRegion(region);
            setNewRegionName(region.name);
        } catch (error) {
            console.log(error);
            toast.error('Không lấy được thông tin khu vực!');
        }
    };
    /////////////////////////////////////////////////////////////////

    ////////////////////////Xử lý CRUD phim ////////////////////////
    const handleDeleteMovies = async (movieId: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa ?')) {
            try {
                await deleteMovie(movieId);
                setMovies(prevMovies => prevMovies.filter(movie => movie._id !== movieId));
                toast.success('Xóa Movie thành công!');
            } catch (error) {
                console.error('Lỗi khi xóa movie:', error);
                toast.error('Xóa movie thất bại!');
            }
        }
    };

    const handleAddMovie = async (movieData: Partial<IMovie>) => {
        try {
            const newMovie = await createMovie(movieData as IMovie);
            setMovies(prev => [...prev, newMovie]);
            setShowMovieForm(false);
            toast.success('Thêm phim thành công!');
        } catch (error) {
            console.error('Lỗi khi thêm phim:', error);
            toast.error('Thêm phim thất bại!');
        }
    };

    const handleUpdateMovie = async (movieData: Partial<IMovie>) => {
        if (!selectedMovie?._id) return;
        try {
            const updatedMovie = await updateMovie(selectedMovie._id, movieData as IMovie);
            setMovies(prev => prev.map(movie =>
                movie._id === selectedMovie._id ? updatedMovie : movie
            ));
            setShowMovieForm(false);
            setSelectedMovie(undefined);
            toast.success('Cập nhật phim thành công!');
        } catch (error) {
            console.error('Lỗi khi cập nhật phim:', error);
            toast.error('Cập nhật phim thất bại!');
        }
    };

    const handleEditMovie = (movie: IMovie) => {
        setSelectedMovie(movie);
        setShowMovieForm(true);
    };

    ///////////////Suất chiếu////////////////
    const handleShowtimeDetail = (showtime: IShowtime) => {
        setSelectedShowtime(showtime);
        setShowTimeForm(true);
    };

    const handleDeleteShowtime = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa suất chiếu này?')) {
            try {
                await deleteShowtime(id);
                setShowtimes(prevShowtimes => prevShowtimes.filter(showtime => showtime._id !== id));
                toast.success('Xóa suất chiếu thành công!');

            } catch (error) {
                console.error('Error deleting showtime:', error);
                toast.error('Xóa suất chiếu thất bại!');
            }
        }
    };

    const fetchShowtimes = async () => {
        try {
            const response = await getShowTimes();
            if (response && response.data) {
                setShowtimes(response.data);
            }
        } catch (error) {
            console.error('Error fetching showtimes:', error);
            toast.error('Không thể tải danh sách suất chiếu');
        }
    };

    const handleEditShowtime = (showtime: IShowtime) => {
        setEditingShowtime(showtime);
        setShowShowtimeForm(true);
    };

    return (
        <div className="min-h-screen flex font-roboto bg-white">
            {/* Sidebar */}
            <aside className="w-64 bg-black shadow-lg fixed h-full">
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <img
                            src={user?.avatar}
                            alt={user?.fullName}
                            className="h-10 w-10 rounded-full"
                        />
                        <div>
                            <p className="text-sm font-medium text-white mb-0.5 select-none">
                                {user?.fullName}
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
                            { label: "Suất chiếu", value: "showtimes", icon: "⏰" },
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
                    <Link
                        to="/"
                        className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded transition"
                    >
                        Quay về trang chủ
                    </Link>
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
                                <motion.button
                                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setSelectedMovie(undefined);
                                        setShowMovieForm(true);
                                    }}
                                >
                                    Thêm phim mới
                                </motion.button>
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
                                            <th className="p-3 text-left">Diễn Viên</th>
                                            <th className="p-3 text-left">Thể loại</th>
                                            <th className="p-3 text-left">Đạo diễn</th>
                                            <th className="p-3 text-left">Trạng thái</th>
                                            <th className="p-3 text-left">Ngôn Ngữ</th>
                                            <th className="p-3 text-left">Hành Động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedMovies.map((movie, idx) => (
                                            <tr key={movie._id} className="border-b hover:bg-gray-100">
                                                <td className="p-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                                <td className="p-3">
                                                    <img src={movie.image} alt={movie.title} className="w-16 h-20 object-cover rounded" />
                                                </td>
                                                <td className="p-3">{movie.title}</td>
                                                <td className="p-3">{new Date(movie.releaseDate).toLocaleDateString("vi-VN")}</td>
                                                <td className="p-3">{movie.duration} phút</td>
                                                <td className="p-3">{movie.actors.join(", ").length > 10
                                                    ? movie.actors.join(", ").substring(0, 10) + '...'
                                                    : movie.actors.join(", ")}</td>
                                                <td className="p-3">{movie.genre.join(", ").length > 10
                                                    ? movie.genre.join(", ").substring(0, 10) + '...'
                                                    : movie.genre.join(", ")}</td>
                                                <td className="p-3">{movie.director}</td>
                                                <td className="p-3">{movie.status}</td>
                                                <td className="p-3">{movie.language}</td>
                                                <td className="p-3">
                                                    <motion.button
                                                        className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-yellow-600 mr-2"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleEditMovie(movie)}
                                                    >
                                                        Sửa
                                                    </motion.button>
                                                    <motion.button
                                                        className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-red-600"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => handleDeleteMovies(movie._id)}
                                                    >
                                                        Xóa
                                                    </motion.button>
                                                </td>
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

                                <form onSubmit={handleRegionSubmit}>
                                    <div className="flex flex-col md:flex-row gap-6 ">
                                        <motion.input
                                            type="text"
                                            value={newRegionName}
                                            onChange={(e) => setNewRegionName(e.target.value)}
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
                                                className={editingRegion ? "bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700" : "bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                {editingRegion ? 'Sửa' : 'Thêm'}
                                            </motion.button>

                                            <motion.button
                                                type="button"
                                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => {
                                                    setEditingRegion(null);
                                                    setNewRegionName('');
                                                }}
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
                                                        onClick={() => handleEditRegion(region._id)}
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

                    {/* Showtimes Tab */}
                    {activeTab === "showtimes" && (
                        <div>
                            <h2 className="text-2xl font-semibold mb-6 text-black select-none">
                                Quản lý suất chiếu
                            </h2>
                            <div className="flex justify-between items-center mb-4">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm suất chiếu..."
                                    className="border border-gray-300 bg-white text-black rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                <motion.button
                                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setShowShowtimeForm(true)}
                                >
                                    Thêm suất chiếu mới
                                </motion.button>
                                <div>
                                    <span>
                                        Trang {currentPage} / {totalShowtimePages}
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
                                        disabled={currentPage === totalShowtimePages}
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
                                            <th className="p-3 text-left">Phim</th>
                                            <th className="p-3 text-left">Rạp</th>
                                            <th className="p-3 text-left">Ngày bắt đầu</th>
                                            <th className="p-3 text-left">Ngày kết thúc</th>
                                            <th className="p-3 text-left">Số suất chiếu</th>
                                            <th className="p-3 text-left">Chi tiết suất chiếu</th>
                                            <th className="p-3 text-left">Hành Động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedShowtimes.map((showtime, idx) => (
                                            <tr key={showtime._id} className="border-b hover:bg-gray-100">
                                                <td className="p-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                                                <td className="p-3">
                                                    {showtime.movieId?.title || 'N/A'}
                                                </td>
                                                <td className="p-3">
                                                    {showtime.theaterId?.name || 'N/A'}
                                                </td>
                                                <td className="p-3">
                                                    {showtime.showDate?.start
                                                        ? new Date(showtime.showDate.start).toLocaleDateString("vi-VN")
                                                        : 'N/A'}
                                                </td>
                                                <td className="p-3">
                                                    {showtime.showDate?.end
                                                        ? new Date(showtime.showDate.end).toLocaleDateString("vi-VN")
                                                        : 'N/A'}
                                                </td>
                                                <td className="p-3">{showtime.showTimes?.length || 0}</td>
                                                <td className="p-3">
                                                    <motion.button
                                                        onClick={() => handleShowtimeDetail(showtime)}
                                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                                        disabled={!showtime.showTimes?.length}
                                                    >
                                                        Xem chi tiết
                                                    </motion.button>
                                                </td>
                                                <td className="p-3">
                                                    <motion.button
                                                        onClick={() => handleEditShowtime(showtime)}
                                                        className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-yellow-600 mr-2"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        Sửa
                                                    </motion.button>
                                                    <motion.button
                                                        onClick={() => handleDeleteShowtime(showtime._id)}
                                                        className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-red-600"
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                    >
                                                        Xóa
                                                    </motion.button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                </main>
            </div>


            {/* Movie Form Modal */}
            {showMovieForm && (
                <MovieForm
                    movie={selectedMovie}
                    onSubmit={selectedMovie ? handleUpdateMovie : handleAddMovie}
                    onCancel={() => {
                        setShowMovieForm(false);
                        setSelectedMovie(undefined);
                    }}
                />
            )}

            {/* Showtime Detail Modal */}
            {showTimeForm && selectedShowtime && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-3/4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                    Chi tiết suất chiếu - {selectedShowtime.movieId?.title || 'N/A'}
                </h3>
                <button
                    onClick={() => {
                        setShowTimeForm(false);
                        setSelectedShowtime(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="font-semibold">Rạp chiếu:</p>
                        <p>{selectedShowtime.theaterId?.name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Thời gian chiếu:</p>
                        <p>
                            {selectedShowtime.showDate?.start && selectedShowtime.showDate?.end
                                ? `${new Date(selectedShowtime.showDate.start).toLocaleDateString("vi-VN")} - ${new Date(selectedShowtime.showDate.end).toLocaleDateString("vi-VN")}`
                                : 'N/A'}
                        </p>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold mb-2">Danh sách suất chiếu:</h4>
                    <div className="overflow-x-auto">
                        <table className="min-w-full">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 text-left">Ngày</th>
                                    <th className="p-2 text-left">Giờ bắt đầu</th>
                                    <th className="p-2 text-left">Giờ kết thúc</th>
                                    <th className="p-2 text-left">Phòng chiếu</th>
                                    <th className="p-2 text-left">Số ghế trống</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedShowtime.showTimes?.map((time, index) => (
                                    <tr key={index} className="border-b hover:bg-gray-50">
                                        <td className="p-2">{time.date ? new Date(time.date).toLocaleDateString("vi-VN") : 'N/A'}</td>
                                        <td className="p-2">{time.start ? new Date(time.start).toLocaleTimeString("vi-VN") : 'N/A'}</td>
                                        <td className="p-2">{time.end ? new Date(time.end).toLocaleTimeString("vi-VN") : 'N/A'}</td>
                                        <td className="p-2">{time.room || 'N/A'}</td>
                                        <td className="p-2">
                                            {time.seats?.filter(seat => seat.status === 'available').length || 0} / {time.seats?.length || 0}
                                        </td>
                                    </tr>
                                )) || (
                                    <tr>
                                        <td colSpan={5} className="p-2 text-center text-gray-500">
                                            Không có suất chiếu nào
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
)}

            {/* Showtime Form Modal */}
            {showShowtimeForm && (
                <ShowtimeForm
                    onCancel={() => {
                        setShowShowtimeForm(false);
                        setEditingShowtime(null);
                    }}
                    onSuccess={() => {
                        setShowShowtimeForm(false);
                        setEditingShowtime(null);
                        // Refresh showtimes data
                        getShowTimes()
                            .then((data) => {
                                console.log('Showtimes API response:', data);
                                setShowtimes(data && Array.isArray(data) ? data : []);
                            })
                            .catch((error) => {
                                console.error('Error fetching showtimes:', error);
                                setShowtimes([]);
                            });
                    }}
                    editData={editingShowtime || undefined}
                />
            )}
        </div>
    );
};

export default Dashboard;