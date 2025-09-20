/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Popconfirm, Modal, Table, Tag, Space, Descriptions } from "antd";
import { getVouchers, addVoucher, updateVoucher, deleteVoucher } from "@/apiservice/apiVoucher";
import { getFoodCombos, addSingleProduct, addCombo, updateFoodCombo, deleteFoodCombo } from "@/apiservice/apiFoodCombo";
import { getTheaters, addTheater, updateTheater, deleteTheater } from "@/apiservice/apiTheater";
import { getAllUsersApi, createUserApi, updateUserApi, getAllRoomsApi, createRoomApi, updateRoomApi, deleteRoomApi, createSeatApi, updateSeatApi, createMultipleSeatsApi } from "@/services/api";
import { getAllShowSessionsApi, createShowSessionApi, updateShowSessionApi, deleteShowSessionApi } from "@/apiservice/apiShowSession";
import createInstanceAxios from "@/services/axios.customize";

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);
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
import UserForm from "@/pages/admin/Form/UserForm";
import RoomForm from "./Form/RoomForm";
import SeatForm from "./Form/SeatForm";
import ShowSessionForm from "./Form/ShowSessionForm";
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
  const [users, setUsers] = useState<IUser[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [showSessions, setShowSessions] = useState<IShowSession[]>([]);
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
  const [theaterLoading, setTheaterLoading] = useState<boolean>(false);
  const [showUserForm, setShowUserForm] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<IUser | undefined>(
    undefined
  );
  const [showRoomForm, setShowRoomForm] = useState<boolean>(false);
  const [selectedRoom, setSelectedRoom] = useState<any | undefined>(
    undefined
  );
  const [showSeatForm, setShowSeatForm] = useState<boolean>(false);
  const [selectedSeat, setSelectedSeat] = useState<any | undefined>(
    undefined
  );
  const [showShowSessionForm, setShowShowSessionForm] = useState<boolean>(false);
  const [selectedShowSession, setSelectedShowSession] = useState<IShowSession | undefined>(
    undefined
  );
  const [showSessionSubmitting, setShowSessionSubmitting] = useState<boolean>(false);
  const { user } = useAppStore();

  const itemsPerPage = 5;

  useEffect(() => {
    getTheaters()
      .then((data) => setTheaters(data))
      .catch((error) => {
        console.error("Error fetching theaters:", error);
        setTheaters([]);
      });
    getMovies()
      .then((res) => setMovies(res && Array.isArray(res) ? res : []))
      .catch((error) => {
        console.error("Error fetching movies:", error);
        setMovies([]);
      });
    getFoodCombos()
      .then((data) => setFoodCombos(data))
      .catch((error) => {
        console.error("Error fetching food combos:", error);
        setFoodCombos([]);
      });
    getRegions()
      .then((data) => setRegions(data))
      .catch((error) => {
        console.error("Error fetching regions:", error);
        setRegions([]);
      });
    getVouchers()
      .then((data) => setVouchers(data))
      .catch((error) => {
        console.error("Error fetching vouchers:", error);
        setVouchers([]);
      });
    getBlogs()
      .then((data) => setBlogs(data))
      .catch((error) => {
        console.error("Error fetching blogs:", error);
        setBlogs([]);
      });
    getShowTimes()
      .then((data) => {
        setShowtimes(data && Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Error fetching showtimes:", error);
        setShowtimes([]);
      });
    getAllUsersApi()
      .then((response) => {
        setUsers(response.data && Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
        setUsers([]);
      });
    loadRooms();
    loadShowSessions();
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

  // Users
  const { paginated: paginatedUsers, totalPages: totalUserPages } =
    filterAndPaginate<IUser>(
      users,
      (user) =>
        (user.fullName?.toLowerCase() ?? "").includes(
          searchTerm.toLowerCase()
        ) ||
        (user.email?.toLowerCase() ?? "").includes(
          searchTerm.toLowerCase()
        ) ||
        (user.phoneNumber?.toLowerCase() ?? "").includes(
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

  // Show Sessions
  console.log("Current showSessions state:", showSessions);
  const { paginated: paginatedShowSessions, totalPages: totalShowSessionPages } =
    filterAndPaginate<IShowSession>(showSessions, (session) =>
      (session.name?.toLowerCase() ?? "").includes(searchTerm.toLowerCase())
    );
  console.log("Paginated show sessions:", paginatedShowSessions);

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
    } catch (error) {
      console.error("Error submitting region:", error);
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
      console.error("Error deleting region:", error);
      toast.success("Xóa khu vực thất bại!");
    }
  };
  
  const handleEditRegion = async (regionId: string) => {
    try {
      const region = await getRegionById(regionId);
      setSelectedRegion(region);
      setShowRegionForm(true);
    } catch (error) {
      console.error("Error getting region:", error);
      toast.error("Không lấy được thông tin khu vực!");
    }
  };

  const handleAddRegion = () => {
    setSelectedRegion(undefined);
    setShowRegionForm(true);
  };

  // Load functions
  const loadRooms = async () => {
    try {
      const response = await getAllRoomsApi() as any;
      setRooms(response.data && Array.isArray(response.data) ? response.data : []);
    } catch {
      setRooms([]);
    }
  };


  // Room handlers
  const [isRoomSubmitting, setIsRoomSubmitting] = useState(false);
  
  const handleRoomSubmit = async (roomData: any) => {
    if (isRoomSubmitting) {
      return;
    }
    
    setIsRoomSubmitting(true);
    try {
      
      if (selectedRoom) {
        // Extract seatLayout from roomData
        const { seatLayout, ...roomDataOnly } = roomData;
        
        // Update room basic info
        await updateRoomApi(selectedRoom._id, roomDataOnly);
        
        // If seatLayout exists, update seats
        if (seatLayout && seatLayout.seats && Object.keys(seatLayout.seats).length > 0) {
          
          // Convert seatLayout to ISeat array
          const newSeats: any[] = [];
          Object.keys(seatLayout.seats).forEach(seatId => {
            const seatInfo = seatLayout.seats[seatId];
            const row = seatId.charAt(0);
            const number = parseInt(seatId.substring(1));
            
            newSeats.push({
              seatId: seatId,
              room: selectedRoom._id,
              row: row,
              number: number,
              type: seatInfo.type,
              status: seatInfo.status,
              price: getSeatPrice(seatInfo.type),
              position: {
                x: (number - 1) * 40,
                y: (row.charCodeAt(0) - 65) * 40
              }
            });
          });
          
          await updateRoomSeats(selectedRoom._id, newSeats);
        }
        
        toast.success("Cập nhật phòng chiếu thành công!");
      } else {
        // Create new room (seatLayout will be handled by backend)
        await createRoomApi(roomData);
        toast.success("Thêm phòng chiếu thành công!");
      }
      
      setShowRoomForm(false);
      setSelectedRoom(undefined);
      
      await loadRooms();
      
    } catch (error) {
      console.error("Error submitting room:", error);
      toast.error(selectedRoom ? "Cập nhật phòng chiếu thất bại!" : "Thêm phòng chiếu thất bại!");
    } finally {
      setIsRoomSubmitting(false);
    }
  };

  // Update room seats based on seat layout
  const updateRoomSeats = async (roomId: string, newSeats: any[]) => {
    // Only update if there are seats to create
    if (newSeats.length === 0) {
      return;
    }
    
    // Optimized approach: Use existing APIs but minimize calls
    // Step 1: Delete all existing seats for this room (single API call)
    await axios.delete(`/seats/room/${roomId}/all`);
    
    // Step 2: Create new seats in bulk (single API call)
    await createMultipleSeatsApi(newSeats);
  };

  // Helper function to get seat price based on type
  const getSeatPrice = (type: string): number => {
    switch (type) {
      case 'vip': return 120000;
      case 'couple': return 150000;
      case '4dx': return 180000;
      default: return 75000; // normal
    }
  };

  const handleEditRoom = (room: any) => {
    setSelectedRoom(room);
    setShowRoomForm(true);
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoomApi(roomId);
      toast.success("Xóa phòng chiếu thành công!");
      loadRooms();
    } catch (error) {
      console.error("Error deleting room:", error);
      toast.error("Xóa phòng chiếu thất bại!");
    }
  };

  const handleAddRoom = () => {
    setSelectedRoom(undefined);
    setShowRoomForm(true);
  };

  // Load functions for Show Sessions
  const loadShowSessions = async () => {
    try {
      console.log("Loading show sessions...");
      const response = await getAllShowSessionsApi();
      console.log("Show sessions response:", response);
      setShowSessions(response || []);
    } catch (error) {
      console.error("Error loading show sessions:", error);
      setShowSessions([]);
    }
  };

  // Show Session handlers
  const handleShowSessionSubmit = async (sessionData: Partial<IShowSession>) => {
    try {
      setShowSessionSubmitting(true);
      if (selectedShowSession) {
        // Update
        await updateShowSessionApi(selectedShowSession._id, sessionData);
        toast.success("Cập nhật ca chiếu thành công!");
      } else {
        // Create new
        await createShowSessionApi(sessionData as any);
        toast.success("Thêm ca chiếu thành công!");
      }
      
      // Reload data after add/edit
      await loadShowSessions();
      setShowShowSessionForm(false);
      setSelectedShowSession(undefined);
    } catch (error) {
      console.error("Error submitting show session:", error);
      toast.error(selectedShowSession ? "Cập nhật ca chiếu thất bại!" : (error as any)?.response?.data?.message);
    } finally {
      setShowSessionSubmitting(false);
    }
  };

  const handleDeleteShowSession = async (sessionId: string) => {
    try {
      await deleteShowSessionApi(sessionId);
      toast.success("Xóa ca chiếu thành công!");
      loadShowSessions();
    } catch (error) {
      console.error("Error deleting show session:", error);
      toast.error("Xóa ca chiếu thất bại!");
    }
  };

  const handleEditShowSession = (session: IShowSession) => {
    setSelectedShowSession(session);
    setShowShowSessionForm(true);
  };

  const handleAddShowSession = () => {
    setSelectedShowSession(undefined);
    setShowShowSessionForm(true);
  };


  // Seat handlers
  const handleSeatSubmit = async (seatData: any) => {
    try {
      if (selectedSeat) {
        await updateSeatApi(selectedSeat._id, seatData);
        toast.success("Cập nhật ghế ngồi thành công!");
      } else {
        await createSeatApi(seatData);
        toast.success("Thêm ghế ngồi thành công!");
      }
      setShowSeatForm(false);
      setSelectedSeat(undefined);
    } catch (error) {
      console.error("Error submitting seat:", error);
      toast.error(selectedSeat ? "Cập nhật ghế ngồi thất bại!" : "Thêm ghế ngồi thất bại!");
    }
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
    setTheaterLoading(true);
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
    } catch (error) {
      console.error("Error submitting theater:", error);
      toast.error(selectedTheater ? "Cập nhật rạp thất bại!" : "Thêm rạp thất bại!");
    } finally {
      setTheaterLoading(false);
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

  ////////////////////////Xử lý CRUD User////////////////////////
  const loadUsers = async () => {
    try {
      const response = await getAllUsersApi();
      setUsers(response.data && Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    }
  };

  const handleUserSubmit = async (userData: Partial<IUser>) => {
    try {
      if (selectedUser) {
        // Cập nhật
        await updateUserApi(selectedUser._id!, userData);
        toast.success("Cập nhật người dùng thành công!");
      } else {
        // Thêm mới
        await createUserApi(userData as Parameters<typeof createUserApi>[0]);
        toast.success("Thêm người dùng thành công!");
      }
      
      // Reload dữ liệu sau khi thêm/sửa
      await loadUsers();
      setShowUserForm(false);
      setSelectedUser(undefined);
    } catch (error: unknown) {
      console.error("Error submitting user:", error);
      const errorObj = error as { error?: number };
      if (errorObj?.error === 400) {
        toast.error("Email đã tồn tại!");
      } else {
        toast.error(selectedUser ? "Cập nhật người dùng thất bại!" : "Thêm người dùng thất bại!");
      }
    }
  };


  const handleEditUser = (user: IUser) => {
    setSelectedUser(user);
    setShowUserForm(true);
  };

  const handleAddUser = () => {
    setSelectedUser(undefined);
    setShowUserForm(true);
  };
  /////////////////////////////////////////////////////////////////

  ////////////////////////Xử lý CRUD Food Combo////////////////////////
  const loadFoodCombos = async () => {
    try {
      const data = await getFoodCombos();
      setFoodCombos(data);
    } catch {
      setFoodCombos([]);
    }
  };

  const handleFoodComboSubmit = async (comboData: any) => {
    try {
      if (selectedFoodCombo) {
        // Cập nhật
        await updateFoodCombo(selectedFoodCombo._id!, comboData);
        toast.success("Cập nhật sản phẩm thành công!");
      } else {
        // Thêm mới
        if (comboData.type === 'single') {
          await addSingleProduct({
            name: comboData.name,
            price: comboData.price,
            category: comboData.category,
            description: comboData.description,
            quantity: comboData.quantity
          });
          toast.success("Thêm sản phẩm đơn lẻ thành công!");
        } else {
          await addCombo({
            name: comboData.name,
            description: comboData.description,
            items: comboData.items,
            discountType: comboData.discountType,
            discountValue: comboData.discountValue
          });
          toast.success("Thêm combo thành công!");
        }
      }
      // Reload dữ liệu sau khi thêm/sửa
      await loadFoodCombos();
      setShowFoodComboForm(false);
      setSelectedFoodCombo(undefined);
    } catch (error) {
      console.error("Error submitting food combo:", error);
      toast.error(selectedFoodCombo ? "Cập nhật sản phẩm thất bại!" : "Thêm sản phẩm thất bại!");
    }
  };

  const handleDeleteFoodCombo = async (comboId: string) => {
    try {
      await deleteFoodCombo(comboId);
      // Reload dữ liệu sau khi xóa
      await loadFoodCombos();
      toast.success("Xóa sản phẩm thành công!");
    } catch (error) {
      console.error("Error deleting food combo:", error);
      toast.error("Xóa sản phẩm thất bại!");
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
      console.error("Error deleting movie:", error);
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
      console.error("Error adding movie:", error);
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
      console.error("Error updating movie:", error);
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
              { label: "Blog", value: "blogs", icon: "📰" },
              { label: "Sản phẩm & Combo", value: "foodCombos", icon: "🍿" },
              { label: "Khu vực", value: "regions", icon: "🌏" },
              { label: "Rạp", value: "theaters", icon: "🏢" },
              { label: "Voucher", value: "vouchers", icon: "🎟️" },
              { label: "Người dùng", value: "users", icon: "👥" },
              { label: "Phòng chiếu", value: "rooms", icon: "🏬" },
              { label: "Ca chiếu", value: "showSessions", icon: "🎭" },
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
                      <th className="p-3 text-left">Ngày khởi chiếu</th>
                      <th className="p-3 text-left">Ngày kết thúc</th>
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
                          {movie.startDate ? new Date(movie.startDate).toLocaleDateString(
                            "vi-VN"
                          ) : 'Chưa có'}
                        </td>
                        <td className="p-3">
                          {movie.endDate ? new Date(movie.endDate).toLocaleDateString(
                            "vi-VN"
                          ) : 'Chưa có'}
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
                Quản lý Sản phẩm & Combo
              </h2>
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm/combo..."
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
                    Thêm sản phẩm
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
                      <th className="p-3 text-left">Loại</th>
                      <th className="p-3 text-left">Tên</th>
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
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            combo.type === 'single' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {combo.type === 'single' ? 'Sản phẩm' : 'Combo'}
                          </span>
                        </td>
                        <td className="p-3 font-medium">{combo.name}</td>
                        <td className="p-3 text-green-600 font-semibold">
                          {combo.price.toLocaleString("vi-VN")} đ
                        </td>
                        <td className="p-3 max-w-xs truncate" title={combo.description || combo.category}>
                          {combo.description || combo.category}
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
                              title="Xóa sản phẩm"
                              description="Bạn có chắc chắn muốn xóa sản phẩm này?"
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

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-black select-none">
                Quản lý Người dùng
              </h2>
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm người dùng..."
                  className="border border-gray-300 bg-white text-black rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={handleAddUser}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Thêm người dùng
                  </motion.button>
                  <div>
                    <span>
                      Trang {currentPage} / {totalUserPages}
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
                      disabled={currentPage === totalUserPages}
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
                      <th className="p-3 text-left">Avatar</th>
                      <th className="p-3 text-left">Họ tên</th>
                      <th className="p-3 text-left">Email</th>
                      <th className="p-3 text-left">SĐT</th>
                      <th className="p-3 text-left">Vai trò</th>
                      <th className="p-3 text-left">Trạng thái</th>
                      <th className="p-3 text-left">Điểm</th>
                      <th className="p-3 text-left">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedUsers.map((user, idx) => (
                      <tr
                        key={user._id}
                        className="border-b hover:bg-gray-100"
                      >
                        <td className="p-3">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="p-3">
                          <img 
                            src={user.avatar} 
                            alt={user.fullName} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                          />
                        </td>
                        <td className="p-3 font-medium">{user.fullName}</td>
                        <td className="p-3 text-sm text-gray-600">{user.email}</td>
                        <td className="p-3">{user.phoneNumber}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.role === 'ADMIN' 
                              ? 'bg-purple-100 text-purple-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'ADMIN' ? '👑 Admin' : '👤 User'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.isActive ? '✅ Hoạt động' : '❌ Khóa'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-sm font-medium">
                            🎯 {user.point}
                          </span>
                        </td>
                        <td className="p-3">
                          <motion.button
                            onClick={() => handleEditUser(user)}
                            className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 cursor-pointer"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Sửa
                          </motion.button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Rooms Tab */}
          {activeTab === "rooms" && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-black select-none">
                Quản lý Phòng chiếu
              </h2>
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm phòng chiếu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 bg-white text-black rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
                />
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={handleAddRoom}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Thêm phòng mới
                  </motion.button>
                  <div>
                    <span>
                      Trang {currentPage} / {filterAndPaginate(rooms, () => true).totalPages}
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
                      disabled={currentPage === filterAndPaginate(rooms, () => true).totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>

              {/* Room Table */}
              <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-black text-white">
                    <tr>
                      <th className="p-3 text-left">STT</th>
                      <th className="p-3 text-left">Tên phòng</th>
                      <th className="p-3 text-left">Loại phòng</th>
                      <th className="p-3 text-left">Rạp chiếu</th>
                      <th className="p-3 text-left">Sức chứa</th>
                      <th className="p-3 text-left">Trạng thái</th>
                      <th className="p-3 text-left">Số ghế</th>
                      <th className="p-3 text-left">Ngày tạo</th>
                      <th className="p-3 text-left">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filterAndPaginate(
                      rooms,
                      (room: any) =>
                        room.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        room.theater?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        room.roomType?.toLowerCase().includes(searchTerm.toLowerCase())
                    ).paginated.map((room: any, idx: number) => (
                      <tr key={room._id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                        <td className="p-3 font-medium">{room.name}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            room.roomType === 'VIP' ? 'bg-yellow-100 text-yellow-800' :
                            room.roomType === 'IMAX' ? 'bg-blue-100 text-blue-800' :
                            room.roomType === '4DX' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {room.roomType}
                          </span>
                        </td>
                        <td className="p-3">{room.theater?.name}</td>
                        <td className="p-3">{room.capacity} ghế</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            room.status === 'active' ? 'bg-green-100 text-green-800' :
                            room.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {room.status === 'active' ? 'Hoạt động' : 
                             room.status === 'maintenance' ? 'Bảo trì' : 'Không hoạt động'}
                          </span>
                        </td>
                        <td className="p-3">{room.seats?.length || 0}</td>
                        <td className="p-3">{new Date(room.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => handleEditRoom(room)}
                              className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors text-sm cursor-pointer"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Sửa
                            </motion.button>
                            <Popconfirm
                              title="Xác nhận xóa"
                              description="Bạn có chắc chắn muốn xóa phòng chiếu này không? Tất cả ghế trong phòng cũng sẽ bị xóa."
                              onConfirm={() => handleDeleteRoom(room._id)}
                              okText="Xóa"
                              cancelText="Hủy"
                              okButtonProps={{ danger: true }}
                            >
                              <motion.button
                                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors text-sm cursor-pointer"
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

          {/* Show Sessions Tab */}
          {activeTab === "showSessions" && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-black select-none">
                Quản lý Ca chiếu
              </h2>
              <div className="flex justify-between items-center mb-4">
                <input
                  type="text"
                  placeholder="Tìm kiếm ca chiếu..."
                  className="border border-gray-300 bg-white text-black rounded-lg p-2 w-1/3 focus:outline-none focus:ring-2 focus:ring-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="flex items-center gap-4">
                  <motion.button
                    onClick={handleAddShowSession}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Thêm ca chiếu
                  </motion.button>
                  <div>
                    <span>
                      Trang {currentPage} / {totalShowSessionPages}
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
                      disabled={currentPage === totalShowSessionPages}
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
                      <th className="p-3 text-left">Tên ca chiếu</th>
                      <th className="p-3 text-left">Thời gian bắt đầu</th>
                      <th className="p-3 text-left">Thời gian kết thúc</th>
                      <th className="p-3 text-left">Thời lượng</th>
                      <th className="p-3 text-left">Ngày tạo</th>
                      <th className="p-3 text-left">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedShowSessions.map((session, idx) => {
                      // Calculate duration - handle overnight sessions
                      let duration;
                      if (session.endTime === '00:00') {
                        // Overnight session (e.g., 20:30 - 00:00)
                        const startTime = new Date(`2000-01-01 ${session.startTime}`);
                        const endTime = new Date(`2000-01-02 ${session.endTime}`);
                        duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // in minutes
                      } else {
                        // Normal session within same day
                        const startTime = new Date(`2000-01-01 ${session.startTime}`);
                        const endTime = new Date(`2000-01-01 ${session.endTime}`);
                        duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // in minutes
                      }
                      
                      return (
                        <tr
                          key={session._id}
                          className="border-b hover:bg-gray-100"
                        >
                          <td className="p-3">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-lg">{session.name}</span>
                          </td>
                          <td className="p-3">
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                              {session.startTime}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm font-semibold">
                              {session.endTime}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                              {Math.floor(duration / 60)}h {duration % 60}m
                            </span>
                          </td>
                          <td className="p-3">
                            {new Date(session.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <motion.button
                                onClick={() => handleEditShowSession(session)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600 cursor-pointer"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Sửa
                              </motion.button>
                              <Popconfirm
                                title="Xóa ca chiếu"
                                description="Bạn có chắc chắn muốn xóa ca chiếu này?"
                                onConfirm={() => handleDeleteShowSession(session._id)}
                                okText="Có"
                                cancelText="Không"
                                placement="topRight"
                                getPopupContainer={() => document.body}
                                overlayStyle={{ maxWidth: 'calc(100vw - 10px)', overflowWrap: 'break-word', wordBreak: 'break-word', marginLeft: 8 }}
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
                      );
                    })}
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
                      <th className="p-3 text-left">Ngày chiếu đầu tiên</th>
                      <th className="p-3 text-left">Ngày chiếu cuối cùng</th>
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
                          {showtime.showTimes.length > 0 ? 
                            new Date(showtime.showTimes[0].date).toLocaleDateString("vi-VN") : 
                            'N/A'
                          }
                        </td>
                        <td className="p-3">
                          {showtime.showTimes.length > 0 ? 
                            new Date(showtime.showTimes[showtime.showTimes.length - 1].date).toLocaleDateString("vi-VN") : 
                            'N/A'
                          }
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
                              description="Bạn có chắc chắn muốn xóa suất chiếu này? (Xóa suất chiếu sẽ xóa tất cả các suất chiếu của phim trong rạp)"
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
          style={{ 
            marginTop: '2vh',
            marginBottom: '2vh',
            maxHeight: '96vh'
          }}
          bodyStyle={{
            maxHeight: 'calc(96vh - 110px)',
            overflowY: 'auto',
            scrollbarWidth: 'none', // Firefox
            msOverflowStyle: 'none', // IE và Edge
          }}
          className="hide-scrollbar"
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
                  {selectedShowtime.showTimes.length > 0 && (
                    <>
                      <span>
                        <Tag color="green">
                          Từ: {new Date(selectedShowtime.showTimes[0].date).toLocaleDateString("vi-VN")}
                        </Tag>
                      </span>
                      <span>
                        <Tag color="orange">
                          Đến: {new Date(selectedShowtime.showTimes[selectedShowtime.showTimes.length - 1].date).toLocaleDateString("vi-VN")}
                        </Tag>
                      </span>
                    </>
                  )}
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
                dataSource={selectedShowtime.showTimes.map((time: any, index: number) => {
                  const roomVal = time.room;
                  const roomDisplay = typeof roomVal === 'string' ? roomVal : (roomVal?.name || roomVal?._id || 'N/A');
                  const seatsArr = Array.isArray(time.seats) ? time.seats : [];
                  return {
                    key: index,
                    index: index + 1,
                    date: time.date,
                    start: time.start,
                    end: time.end,
                    session: time.showSessionId,
                    room: roomDisplay,
                    availableSeats: seatsArr.filter((s: any) => s.status === 'available').length,
                    totalSeats: seatsArr.length,
                    seats: seatsArr
                  };
                })}
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
                    title: '🕒 Ca chiếu',
                    key: 'session',
                    render: (_, record) => {
                      const s = record.session;
                      const name = typeof s === 'object' ? (s?.name || '') : '';
                      const start = typeof s === 'object' ? s?.startTime : '';
                      const end = typeof s === 'object' ? s?.endTime : '';
                      return (
                        <Space direction="vertical" size="small">
                          <Tag color="geekblue" className="font-medium">{name || 'N/A'}</Tag>
                          {(start && end) && (
                            <div className="text-xs text-gray-600">{start} - {end}</div>
                          )}
                        </Space>
                      );
                    }
                  },
                  {
                    title: '🏠 Phòng chiếu',
                    dataIndex: 'room',
                    key: 'room',
                    render: (room: string) => (
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
                setShowtimes(data && Array.isArray(data) ? data : []);
              })
              .catch(() => {
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
            setTheaterLoading(false);
          }}
          loading={theaterLoading}
        />
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          user={selectedUser}
          onSubmit={handleUserSubmit}
          onCancel={() => {
            setShowUserForm(false);
            setSelectedUser(undefined);
          }}
        />
      )}

      {/* Room Form Modal */}
      {showRoomForm && (
        <RoomForm
          room={selectedRoom}
          theaters={theaters.map(t => ({ _id: t._id, name: t.name, address: t.location?.address || '', location: { city: t.location?.city || '' }, regionId: t.regionId }))}
          regions={regions}
          onSubmit={handleRoomSubmit}
          loading={isRoomSubmitting}
          onCancel={() => {
            setShowRoomForm(false);
            setSelectedRoom(undefined);
          }}
        />
      )}

      {/* Seat Form Modal */}
      {showSeatForm && (
        <SeatForm
          seat={selectedSeat}
          rooms={rooms}
          regions={regions}
          onSubmit={handleSeatSubmit}
          onCancel={() => {
            setShowSeatForm(false);
            setSelectedSeat(undefined);
          }}
        />
      )}

      {/* Show Session Form Modal */}
      {showShowSessionForm && (
        <ShowSessionForm
          showSession={selectedShowSession}
          loading={showSessionSubmitting}
          onSubmit={handleShowSessionSubmit}
          onCancel={() => {
            setShowShowSessionForm(false);
            setSelectedShowSession(undefined);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
