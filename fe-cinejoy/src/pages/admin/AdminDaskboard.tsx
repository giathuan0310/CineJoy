import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Popconfirm, Modal, Table, Tag, Space, Descriptions } from "antd";
import { getVouchers, addVoucher, updateVoucher, deleteVoucher } from "@/apiservice/apiVoucher";
import { getFoodCombos, addFoodCombo, updateFoodCombo, deleteFoodCombo } from "@/apiservice/apiFoodCombo";
import { getTheaters, addTheater, updateTheater, deleteTheater } from "@/apiservice/apiTheater";
import {
  deleteMovie,
  getMovies,
  createMovie,
  updateMovie,
} from "@/apiservice/apiMovies";
import {
  getRegions,
  addRegion,
  deleteRegion,
  getRegionById,
  updateRegion,
} from "@/apiservice/apiRegion";
import { getBlogs } from "@/apiservice/apiBlog";
import {
  getShowTimes,
  deleteShowtime,
} from "@/apiservice/apiShowTime";
import MovieForm from "@/pages/admin/Form/MovieForm";
import ShowtimeForm from "@/pages/admin/Form/ShowtimeForm";
import FoodComboForm from "@/pages/admin/Form/FoodComboForm";
import VoucherForm from "@/pages/admin/Form/VoucherForm";
import RegionForm from "@/pages/admin/Form/RegionForm";
import TheaterForm from "@/pages/admin/Form/TheaterForm";
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
  const [showMovieForm, setShowMovieForm] = useState<boolean>(false);
  const [selectedMovie, setSelectedMovie] = useState<IMovie | undefined>(
    undefined
  );
  const [showTimeForm, setShowTimeForm] = useState<boolean>(false);
  const [selectedShowtime, setSelectedShowtime] = useState<IShowtime | null>(
    null
  );
  const [showShowtimeForm, setShowShowtimeForm] = useState<boolean>(false);
  const [editingShowtime, setEditingShowtime] = useState<IShowtime | null>(
    null
  );
  const [showFoodComboForm, setShowFoodComboForm] = useState<boolean>(false);
  const [selectedFoodCombo, setSelectedFoodCombo] = useState<IFoodCombo | undefined>(
    undefined
  );
  const [showVoucherForm, setShowVoucherForm] = useState<boolean>(false);
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucher | undefined>(
    undefined
  );
  const [showRegionForm, setShowRegionForm] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<IRegion | undefined>(
    undefined
  );
  const [showTheaterForm, setShowTheaterForm] = useState<boolean>(false);
  const [selectedTheater, setSelectedTheater] = useState<ITheater | undefined>(
    undefined
  );
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
        console.log("Showtimes API response:", data);
        setShowtimes(data && Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error fetching showtimes:", error);
        setShowtimes([]);
      });
  }, []);

  // Lọc và phân trang cho từng tab
  const filterAndPaginate = <T,>(
    data: T[],
    filterFn: (item: T) => boolean
  ): { paginated: T[]; totalPages: number } => {
    const filtered = searchTerm.trim() ? data.filter(filterFn) : data;
    const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
    const paginated = filtered.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    return { paginated, totalPages };
  };

  // Movies
  const { paginated: paginatedMovies, totalPages: totalMoviePages } =
    filterAndPaginate<IMovie>(movies, (movie) =>
      (movie.title?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );

  // Blogs
  const { paginated: paginatedBlogs, totalPages: totalBlogPages } =
    filterAndPaginate<IBlog>(blogs, (blog) =>
      (blog.title.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );

  // FoodCombos
  const { paginated: paginatedCombos, totalPages: totalComboPages } =
    filterAndPaginate<IFoodCombo>(foodCombos, (combo) =>
      (combo.name.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );

  // Regions
  const { paginated: paginatedRegions, totalPages: totalRegionPages } =
    filterAndPaginate<IRegion>(regions, (region) =>
      (region.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );

  // Theaters
  const { paginated: paginatedTheaters, totalPages: totalTheaterPages } =
    filterAndPaginate<ITheater>(
      theaters,
      (theater) =>
        (theater.name?.toLowerCase() ?? "").includes(
          searchTerm.toLowerCase()
        ) ||
        (theater.location?.city?.toLowerCase() ?? "").includes(
          searchTerm.toLowerCase()
        )
    );

  // Vouchers
  const { paginated: paginatedVouchers, totalPages: totalVoucherPages } =
    filterAndPaginate<IVoucher>(vouchers, (voucher) =>
      (voucher.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );

  // Showtimes
  const { paginated: paginatedShowtimes, totalPages: totalShowtimePages } =
    filterAndPaginate<IShowtime>(showtimes, (showtime) => {
      const movie = movies.find((m) => m._id === showtime.movieId._id);
      const theater = theaters.find((t) => t._id === showtime.theaterId._id);
      return (
        (movie?.title?.toLowerCase() ?? "").includes(
          searchTerm.toLowerCase()
        ) ||
        (theater?.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
      );
    });

  // Reset page when tab/searchTerm thay đổi
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  ////////////////////////Xử lý CRUD khu vực////////////////////////
  const handleRegionSubmit = async (regionData: Partial<IRegion>) => {
    try {
      if (selectedRegion) {
        // Cập nhật
        const updated = await updateRegion(selectedRegion._id, {
          ...selectedRegion,
          ...regionData,
        });
        setRegions(regions.map((r) => (r._id === updated._id ? updated : r)));
        toast.success("Cập nhật khu vực thành công!");
      } else {
        // Thêm mới
        const newRegion: IRegion = await addRegion(regionData as IRegion);
        setRegions([...regions, newRegion]);
        toast.success("Thêm khu vực thành công!");
      }
      
      // Đóng modal và reset
      setShowRegionForm(false);
      setSelectedRegion(undefined);
    } catch {
      toast.error(selectedRegion ? "Cập nhật khu vực thất bại!" : "Thêm khu vực thất bại!");
    }
  };

  const handleDeleteRegion = async (regionId: string) => {
    try {
      await deleteRegion(regionId);
      setRegions((prevRegions) =>
        prevRegions.filter((region) => region._id !== regionId)
      );
      toast.success("Xóa khu vực thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa khu vực:", error);
      toast.success("Xóa khu vực thất bại!");
    }
  };
  const handleEditRegion = async (regionId: string) => {
    try {
      const region = await getRegionById(regionId);
      setSelectedRegion(region);
      setShowRegionForm(true);
    } catch (error) {
      console.log(error);
      toast.error("Không lấy được thông tin khu vực!");
    }
  };

  const handleAddRegion = () => {
    setSelectedRegion(undefined);
    setShowRegionForm(true);
  };
  /////////////////////////////////////////////////////////////////

  ////////////////////////Xử lý CRUD Theater////////////////////////
  const loadTheaters = async () => {
    try {
      const data = await getTheaters();
      setTheaters(data);
    } catch (error) {
      console.error("Error loading theaters:", error);
      setTheaters([]);
    }
  };

  const handleTheaterSubmit = async (theaterData: Partial<ITheater>) => {
    try {
      if (selectedTheater) {
        // Cập nhật
        await updateTheater(selectedTheater._id, {
          ...selectedTheater,
          ...theaterData,
        } as ITheater);
        toast.success("Cập nhật rạp thành công!");
      } else {
        // Thêm mới
        await addTheater(theaterData as ITheater);
        toast.success("Thêm rạp thành công!");
      }
      
      // Reload dữ liệu sau khi thêm/sửa
      await loadTheaters();
      setShowTheaterForm(false);
      setSelectedTheater(undefined);
    } catch {
      toast.error(selectedTheater ? "Cập nhật rạp thất bại!" : "Thêm rạp thất bại!");
    }
  };

  const handleDeleteTheater = async (theaterId: string) => {
    try {
      await deleteTheater(theaterId);
      // Reload dữ liệu sau khi xóa
      await loadTheaters();
      toast.success("Xóa rạp thành công!");
    } catch (error) {
      console.error("Error deleting theater:", error);
      toast.error("Xóa rạp thất bại!");
    }
  };

  const handleEditTheater = (theater: ITheater) => {
    setSelectedTheater(theater);
    setShowTheaterForm(true);
  };

  const handleAddTheater = () => {
    setSelectedTheater(undefined);
    setShowTheaterForm(true);
  };
  /////////////////////////////////////////////////////////////////

  ////////////////////////Xử lý CRUD Food Combo////////////////////////
  const loadFoodCombos = async () => {
    try {
      const data = await getFoodCombos();
      setFoodCombos(data);
    } catch (error) {
      console.error("Error loading food combos:", error);
      setFoodCombos([]);
    }
  };

  const handleFoodComboSubmit = async (comboData: Partial<IFoodCombo>) => {
    try {
      if (selectedFoodCombo) {
        // Cập nhật
        await updateFoodCombo(selectedFoodCombo._id!, comboData as IFoodCombo);
        toast.success("Cập nhật combo thành công!");
      } else {
        // Thêm mới
        await addFoodCombo(comboData as IFoodCombo);
        toast.success("Thêm combo thành công!");
      }
      // Reload dữ liệu sau khi thêm/sửa
      await loadFoodCombos();
      setShowFoodComboForm(false);
      setSelectedFoodCombo(undefined);
    } catch (error) {
      console.error("Error submitting combo:", error);
      toast.error(selectedFoodCombo ? "Cập nhật combo thất bại!" : "Thêm combo thất bại!");
    }
  };

  const handleDeleteFoodCombo = async (comboId: string) => {
    try {
      await deleteFoodCombo(comboId);
      // Reload dữ liệu sau khi xóa
      await loadFoodCombos();
      toast.success("Xóa combo thành công!");
    } catch (error) {
      console.error("Error deleting combo:", error);
      toast.error("Xóa combo thất bại!");
    }
  };

  const handleEditFoodCombo = (combo: IFoodCombo) => {
    setSelectedFoodCombo(combo);
    setShowFoodComboForm(true);
  };

  const handleAddFoodCombo = () => {
    setSelectedFoodCombo(undefined);
    setShowFoodComboForm(true);
  };
  /////////////////////////////////////////////////////////////////

  ////////////////////////Xử lý CRUD Voucher////////////////////////
  const loadVouchers = async () => {
    try {
      const data = await getVouchers();
      setVouchers(data);
    } catch (error) {
      console.error("Error loading vouchers:", error);
      setVouchers([]);
    }
  };

  const handleVoucherSubmit = async (voucherData: Partial<IVoucher>) => {
    try {
      if (selectedVoucher) {
        // Cập nhật
        await updateVoucher(selectedVoucher._id!, voucherData as IVoucher);
        toast.success("Cập nhật voucher thành công!");
      } else {
        // Thêm mới
        await addVoucher(voucherData as IVoucher);
        toast.success("Thêm voucher thành công!");
      }
      // Reload dữ liệu sau khi thêm/sửa
      await loadVouchers();
      setShowVoucherForm(false);
      setSelectedVoucher(undefined);
    } catch (error) {
      console.error("Error submitting voucher:", error);
      toast.error(selectedVoucher ? "Cập nhật voucher thất bại!" : "Thêm voucher thất bại!");
    }
  };

  const handleDeleteVoucher = async (voucherId: string) => {
    try {
      await deleteVoucher(voucherId);
      // Reload dữ liệu sau khi xóa
      await loadVouchers();
      toast.success("Xóa voucher thành công!");
    } catch (error) {
      console.error("Error deleting voucher:", error);
      toast.error("Xóa voucher thất bại!");
    }
  };

  const handleEditVoucher = (voucher: IVoucher) => {
    setSelectedVoucher(voucher);
    setShowVoucherForm(true);
  };

  const handleAddVoucher = () => {
    setSelectedVoucher(undefined);
    setShowVoucherForm(true);
  };
  /////////////////////////////////////////////////////////////////

  ////////////////////////Xử lý CRUD phim ////////////////////////
  const handleDeleteMovies = async (movieId: string) => {
    try {
      await deleteMovie(movieId);
      setMovies((prevMovies) =>
        prevMovies.filter((movie) => movie._id !== movieId)
      );
      toast.success("Xóa Movie thành công!");
    } catch (error) {
      console.error("Lỗi khi xóa movie:", error);
      toast.error("Xóa movie thất bại!");
    }
  };

  const handleAddMovie = async (movieData: Partial<IMovie>) => {
    try {
      const newMovie = await createMovie(movieData as IMovie);
      setMovies((prev) => [...prev, newMovie]);
      setShowMovieForm(false);
      toast.success("Thêm phim thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm phim:", error);
      toast.error("Thêm phim thất bại!");
    }
  };

  const handleUpdateMovie = async (movieData: Partial<IMovie>) => {
    if (!selectedMovie?._id) return;
    try {
      const updatedMovie = await updateMovie(
        selectedMovie._id,
        movieData as IMovie
      );
      setMovies((prev) =>
        prev.map((movie) =>
          movie._id === selectedMovie._id ? updatedMovie : movie
        )
      );
      setShowMovieForm(false);
      setSelectedMovie(undefined);
      toast.success("Cập nhật phim thành công!");
    } catch (error) {
      console.error("Lỗi khi cập nhật phim:", error);
      toast.error("Cập nhật phim thất bại!");
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
    try {
      await deleteShowtime(id);
      setShowtimes((prevShowtimes) =>
        prevShowtimes.filter((showtime) => showtime._id !== id)
      );
      toast.success("Xóa suất chiếu thành công!");
    } catch (error) {
      console.error("Error deleting showtime:", error);
      toast.error("Xóa suất chiếu thất bại!");
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
                className={`px-4 py-3 cursor-pointer flex items-center gap-3 transition-colors duration-200 ${
                  activeTab === tab.value
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
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSelectedMovie(undefined);
                    setShowMovieForm(true);
                  }}
                >
                  Thêm phim
                </motion.button>
                <div>
                  <span>
                    Trang {currentPage} / {totalMoviePages}
                  </span>
                  <button
                    className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50 cursor-pointer"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Trước
                  </button>
                  <button
                    className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50 cursor-pointer"
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
                      <tr
                        key={movie._id}
                        className="border-b hover:bg-gray-100"
                      >
                        <td className="p-3">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="p-3">
                          <img
                            src={movie.image}
                            alt={movie.title}
                            className="w-16 h-20 object-cover rounded"
                          />
                        </td>
                        <td className="p-3">{movie.title}</td>
                        <td className="p-3">
                          {new Date(movie.releaseDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="p-3">{movie.duration} phút</td>
                        <td className="p-3">
                          {movie.actors.join(", ").length > 10
                            ? movie.actors.join(", ").substring(0, 10) + "..."
                            : movie.actors.join(", ")}
                        </td>
                        <td className="p-3">
                          {movie.genre.join(", ").length > 10
                            ? movie.genre.join(", ").substring(0, 10) + "..."
                            : movie.genre.join(", ")}
                        </td>
                        <td className="p-3">{movie.director}</td>
                        <td className="p-3">{movie.status}</td>
                        <td className="p-3">{movie.language}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <motion.button
                              className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-yellow-600"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleEditMovie(movie)}
                            >
                              Sửa
                            </motion.button>
                            <Popconfirm
                              title="Xóa phim"
                              description={`Bạn có chắc chắn muốn xóa phim "${movie.title}"?`}
                              okText="Xóa"
                              cancelText="Hủy"
                              onConfirm={() => handleDeleteMovies(movie._id)}
                            >
                              <motion.button
                                className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-red-600"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                Xóa
                              </motion.button>
                            </Popconfirm>
                          </div>
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
                    className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50 cursor-pointer"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Trước
                  </button>
                  <button
                    className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50 cursor-pointer"
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
                        <td className="p-3">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="p-3">{blog.title}</td>
                        <td className="p-3">{blog.postedDate}</td>
                        <td className="p-3">{blog.content}</td>
                        <td className="p-3">
                          <img
                            src={blog.image}
                            alt={blog.title}
                            className="w-16 h-16 object-cover rounded"
                          />
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
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={handleAddFoodCombo}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Thêm combo
                  </motion.button>
                  <div>
                    <span>
                      Trang {currentPage} / {totalComboPages}
                    </span>
                    <button
                      className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50 cursor-pointer"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Trước
                    </button>
                    <button
                      className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50 cursor-pointer"
                      disabled={currentPage === totalComboPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="p-3 text-left">STT</th>
                      <th className="p-3 text-left">Tên Combo</th>
                      <th className="p-3 text-left">Giá</th>
                      <th className="p-3 text-left">Mô tả</th>
                      <th className="p-3 text-left">Số lượng</th>
                      <th className="p-3 text-left">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedCombos.map((combo, idx) => (
                      <tr
                        key={combo._id}
                        className="border-b hover:bg-gray-100"
                      >
                        <td className="p-3">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="p-3 font-medium">{combo.name}</td>
                        <td className="p-3 text-green-600 font-semibold">
                          {combo.price.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="p-3 max-w-xs truncate" title={combo.description}>
                          {combo.description}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            combo.quantity > 100 ? 'bg-green-100 text-green-800' :
                            combo.quantity > 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {combo.quantity}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => handleEditFoodCombo(combo)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 cursor-pointer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Sửa
                            </motion.button>
                            <Popconfirm
                              title="Xóa combo"
                              description="Bạn có chắc chắn muốn xóa combo này?"
                              onConfirm={() => handleDeleteFoodCombo(combo._id!)}
                              okText="Có"
                              cancelText="Không"
                            >
                              <motion.button
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Xóa
                              </motion.button>
                            </Popconfirm>
                          </div>
                        </td>
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
                <input
                  type="text"
                  placeholder="Tìm kiếm khu vực..."
                  className="border border-gray-300 bg-white text-black rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={handleAddRegion}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Thêm khu vực
                  </motion.button>
                  <div>
                    <span>
                      Trang {currentPage} / {totalRegionPages}
                    </span>
                    <button
                      className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50 cursor-pointer"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Trước
                    </button>
                    <button
                      className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50 cursor-pointer"
                      disabled={currentPage === totalRegionPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Sau
                    </button>
                  </div>
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
                      <tr
                        key={region._id}
                        className="border-b hover:bg-gray-100"
                      >
                        <td className="p-3">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
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
                          <Popconfirm
                            title="Xóa khu vực"
                            description="Bạn có chắc chắn muốn xóa khu vực này?"
                            okText="Xóa"
                            cancelText="Hủy"
                            onConfirm={() => handleDeleteRegion(region._id)}
                          >
                            <motion.button
                              className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-red-600"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              Xóa
                            </motion.button>
                          </Popconfirm>
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
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={handleAddTheater}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Thêm rạp
                  </motion.button>
                  <div>
                    <span>
                      Trang {currentPage} / {totalTheaterPages}
                    </span>
                    <button
                      className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50 cursor-pointer"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Trước
                    </button>
                    <button
                      className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50 cursor-pointer"
                      disabled={currentPage === totalTheaterPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Sau
                    </button>
                  </div>
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
                      <th className="p-3 text-left">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTheaters.map((theater, idx) => (
                      <tr
                        key={theater._id}
                        className="border-b hover:bg-gray-100"
                      >
                        <td className="p-3">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="p-3 font-medium">{theater.name}</td>
                        <td className="p-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {theater.location.city}
                          </span>
                        </td>
                        <td className="p-3 max-w-xs truncate" title={theater.location.address}>
                          {theater.location.address}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => handleEditTheater(theater)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 cursor-pointer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Sửa
                            </motion.button>
                            <Popconfirm
                              title="Xóa rạp"
                              description="Bạn có chắc chắn muốn xóa rạp này?"
                              onConfirm={() => handleDeleteTheater(theater._id!)}
                              okText="Có"
                              cancelText="Không"
                            >
                              <motion.button
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Xóa
                              </motion.button>
                            </Popconfirm>
                          </div>
                        </td>
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
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={handleAddVoucher}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Thêm voucher
                  </motion.button>
                  <div>
                    <span>
                      Trang {currentPage} / {totalVoucherPages}
                    </span>
                    <button
                      className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50 cursor-pointer"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Trước
                    </button>
                    <button
                      className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50 cursor-pointer"
                      disabled={currentPage === totalVoucherPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="p-3 text-left">STT</th>
                      <th className="p-3 text-left">Tên Voucher</th>
                      <th className="p-3 text-left">Giảm giá</th>
                      <th className="p-3 text-left">Điểm đổi</th>
                      <th className="p-3 text-left">Ngày bắt đầu</th>
                      <th className="p-3 text-left">Ngày kết thúc</th>
                      <th className="p-3 text-left">Số lượng</th>
                      <th className="p-3 text-left">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedVouchers.map((voucher, idx) => (
                      <tr
                        key={voucher._id}
                        className="border-b hover:bg-gray-100"
                      >
                        <td className="p-3">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="p-3 font-medium">{voucher.name}</td>
                        <td className="p-3">
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-semibold">
                            -{voucher.discountPercent}%
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                            {voucher.pointToRedeem} điểm
                          </span>
                        </td>
                        <td className="p-3">
                          {new Date(voucher.validityPeriod.startDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="p-3">
                          {new Date(voucher.validityPeriod.endDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-sm ${
                            voucher.quantity > 100 ? 'bg-green-100 text-green-800' :
                            voucher.quantity > 50 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {voucher.quantity}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => handleEditVoucher(voucher)}
                              className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 cursor-pointer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Sửa
                            </motion.button>
                            <Popconfirm
                              title="Xóa voucher"
                              description="Bạn có chắc chắn muốn xóa voucher này?"
                              onConfirm={() => handleDeleteVoucher(voucher._id!)}
                              okText="Có"
                              cancelText="Không"
                            >
                              <motion.button
                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Xóa
                              </motion.button>
                            </Popconfirm>
                          </div>
                        </td>
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
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowShowtimeForm(true)}
                >
                  Thêm suất chiếu
                </motion.button>
                <div>
                  <span>
                    Trang {currentPage} / {totalShowtimePages}
                  </span>
                  <button
                    className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50 cursor-pointer"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => p - 1)}
                  >
                    Trước
                  </button>
                  <button
                    className="ml-2 px-3 py-1 bg-gray-200 text-black rounded disabled:opacity-50 cursor-pointer"
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
                      <tr
                        key={showtime._id}
                        className="border-b hover:bg-gray-100"
                      >
                        <td className="p-3">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="p-3">{showtime.movieId.title}</td>
                        <td className="p-3">{showtime.theaterId.name}</td>
                        <td className="p-3">
                          {new Date(showtime.showDate.start).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="p-3">
                          {new Date(showtime.showDate.end).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="p-3">{showtime.showTimes.length}</td>
                        <td className="p-3">
                          <motion.button
                            onClick={() => handleShowtimeDetail(showtime)}
                            className="text-indigo-600 hover:text-indigo-900 mr-4 cursor-pointer"
                          >
                            Xem chi tiết
                          </motion.button>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-1">
                            <motion.button
                              onClick={() => handleEditShowtime(showtime)}
                              className="bg-yellow-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-yellow-600 mr-2"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              Sửa
                            </motion.button>
                            <Popconfirm
                              title="Xóa suất chiếu"
                              description="Bạn có chắc chắn muốn xóa suất chiếu này?"
                              okText="Xóa"
                              cancelText="Hủy"
                              onConfirm={() => handleDeleteShowtime(showtime._id)}
                            >
                              <motion.button
                                className="bg-red-500 text-white px-3 py-1 rounded cursor-pointer hover:bg-red-600"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                Xóa
                              </motion.button>
                            </Popconfirm>
                          </div>
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

      {/* Food Combo Form Modal */}
      {showFoodComboForm && (
        <FoodComboForm
          combo={selectedFoodCombo}
          onSubmit={handleFoodComboSubmit}
          onCancel={() => {
            setShowFoodComboForm(false);
            setSelectedFoodCombo(undefined);
          }}
        />
      )}

      {/* Voucher Form Modal */}
      {showVoucherForm && (
        <VoucherForm
          voucher={selectedVoucher}
          onSubmit={handleVoucherSubmit}
          onCancel={() => {
            setShowVoucherForm(false);
            setSelectedVoucher(undefined);
          }}
        />
      )}

      {/* Showtime Detail Modal */}
      {showTimeForm && selectedShowtime && (
        <Modal
          open={showTimeForm}
          title={
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-800">
                Chi tiết suất chiếu
              </h3>
            </div>
          }
          onCancel={() => {
            setShowTimeForm(false);
            setSelectedShowtime(null);
          }}
          footer={null}
          width={900}
          centered
          destroyOnClose
        >
          <div className="space-y-6">
            {/* Thông tin cơ bản */}
            <Descriptions
              bordered
              column={2}
              size="middle"
              labelStyle={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}
            >
              <Descriptions.Item label="🎬 Phim" span={2}>
                <span className="text-lg font-medium text-blue-600">
                  {selectedShowtime.movieId.title}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="🏢 Rạp chiếu">
                <Tag color="blue" className="text-sm">
                  {selectedShowtime.theaterId.name}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="📅 Khoảng thời gian">
                <Space direction="vertical" size="small">
                  <span>
                    <Tag color="green">
                      Từ: {new Date(selectedShowtime.showDate.start).toLocaleDateString("vi-VN")}
                    </Tag>
                  </span>
                  <span>
                    <Tag color="orange">
                      Đến: {new Date(selectedShowtime.showDate.end).toLocaleDateString("vi-VN")}
                    </Tag>
                  </span>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="🎪 Tổng số suất chiếu">
                <Tag color="purple" className="text-base font-semibold">
                  {selectedShowtime.showTimes.length} suất
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {/* Danh sách suất chiếu */}
            <div className="mt-5">
              <h4 className="text-lg font-semibold mb-3 text-gray-700">
                📋 Danh sách suất chiếu chi tiết
              </h4>
              <Table
                dataSource={selectedShowtime.showTimes.map((time, index) => ({
                  key: index,
                  index: index + 1,
                  date: time.date,
                  start: time.start,
                  end: time.end,
                  room: time.room,
                  availableSeats: time.seats.filter(seat => seat.status === "available").length,
                  totalSeats: time.seats.length,
                  seats: time.seats
                }))}
                columns={[
                  {
                    title: 'STT',
                    dataIndex: 'index',
                    key: 'index',
                    width: 60,
                    align: 'center',
                    render: (text) => <span className="font-medium">{text}</span>
                  },
                  {
                    title: '📅 Ngày chiếu',
                    dataIndex: 'date',
                    key: 'date',
                    render: (date) => (
                      <Tag color="blue" className="text-sm">
                        {new Date(date).toLocaleDateString("vi-VN")}
                      </Tag>
                    )
                  },
                  {
                    title: '⏰ Thời gian',
                    key: 'time',
                    render: (_, record) => (
                      <Space direction="vertical" size="small">
                        <Tag color="green">
                          Bắt đầu: {new Date(record.start).toLocaleTimeString("vi-VN", { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Tag>
                        <Tag color="orange">
                          Kết thúc: {new Date(record.end).toLocaleTimeString("vi-VN", { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </Tag>
                      </Space>
                    )
                  },
                  {
                    title: '🏠 Phòng chiếu',
                    dataIndex: 'room',
                    key: 'room',
                    render: (room) => (
                      <Tag color="purple" className="font-medium">
                        {room}
                      </Tag>
                    )
                  },
                  {
                    title: '💺 Tình trạng ghế',
                    key: 'seats',
                    render: (_, record) => {
                      const availableRatio = (record.availableSeats / record.totalSeats) * 100;
                      const color = availableRatio > 70 ? 'green' : availableRatio > 30 ? 'orange' : 'red';
                      
                      return (
                        <Space direction="vertical" size="small">
                          <Tag color={color} className="font-medium">
                            Trống: {record.availableSeats}/{record.totalSeats}
                          </Tag>
                          <div className="text-xs text-gray-500">
                            {Math.round(availableRatio)}% còn trống
                          </div>
                        </Space>
                      );
                    }
                  }
                ]}
                pagination={{
                  pageSize: 5,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} của ${total} suất chiếu`
                }}
                size="middle"
                scroll={{ x: 800 }}
                className="border rounded-lg"
              />
            </div>
          </div>
        </Modal>
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
                console.log("Showtimes API response:", data);
                setShowtimes(data && Array.isArray(data) ? data : []);
              })
              .catch((error) => {
                console.error("Error fetching showtimes:", error);
                setShowtimes([]);
              });
          }}
          editData={editingShowtime || undefined}
        />
      )}

      {/* Region Form Modal */}
      {showRegionForm && (
        <RegionForm
          region={selectedRegion}
          onSubmit={handleRegionSubmit}
          onCancel={() => {
            setShowRegionForm(false);
            setSelectedRegion(undefined);
          }}
        />
      )}

      {/* Theater Form Modal */}
      {showTheaterForm && (
        <TheaterForm
          theater={selectedTheater}
          onSubmit={handleTheaterSubmit}
          onCancel={() => {
            setShowTheaterForm(false);
            setSelectedTheater(undefined);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
