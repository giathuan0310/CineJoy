import { getMovies } from "@/apiservice/apiMovies";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";


const MovieList: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"nowShowing" | "upcoming" | "special" | "all">("nowShowing");
    const [showMore, setShowMore] = useState(false);
    const [movies, setMovies] = useState<IMovie[]>([]);

    const navigate = useNavigate(); // Thêm dòng này


    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const reponse = await getMovies();
                setMovies(Array.isArray(reponse) ? reponse : []);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách phim:", error);
            }
        };
        fetchMovies();
    }, []);


    const filteredMovies =
        activeTab === "all"
            ? movies
            : movies.filter((movie) => movie.status === activeTab);






    // Hàm xử lý chuyển trang
    const handleView = (_id: string) => {
        navigate(`/movies/${_id}`);
    };


    return (
        <div className="w-full">

            {/* Các nút Sắp chiếu */}
            <div className="flex justify-center gap-4 mb-8 pt-3 pb-3">
                <button
                    className={`px-6 h-10 border rounded font-semibold transition ${activeTab === "upcoming"
                        ? "bg-[#2d3a5a] text-white"
                        : "bg-white text-[#2d3a5a] hover:bg-[#2d3a5a] hover:text-white"
                        }`}
                    onClick={() => setActiveTab("upcoming")}
                >
                    Phim sắp chiếu
                </button>
                <button
                    className={`px-6 h-10 border rounded font-semibold transition ${activeTab === "nowShowing"
                        ? "bg-[#2d3a5a] text-white"
                        : "bg-white text-[#2d3a5a] hover:bg-[#2d3a5a] hover:text-white"
                        }`}
                    onClick={() => setActiveTab("nowShowing")}
                >
                    Phim đang chiếu
                </button>

                <button
                    className={`px-6 h-10 border rounded font-semibold transition ${activeTab === "special"
                        ? "bg-[#2d3a5a] text-white"
                        : "bg-white text-[#2d3a5a] hover:bg-[#2d3a5a] hover:text-white"
                        }`}
                    onClick={() => setActiveTab("special")}
                >
                    Suất chiếu đặc biệt
                </button>
                <button
                    className={`px-6 h-10 border rounded font-semibold transition ${activeTab === "all"
                        ? "bg-[#2d3a5a] text-white"
                        : "bg-white text-[#2d3a5a] hover:bg-[#2d3a5a] hover:text-white"
                        }`}
                    onClick={() => setActiveTab("all")}
                >
                    Tất cả các phim
                </button>
            </div>


            {/* Hiển Thị Tất Cả Phim */}
            <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5  px-4">
                {(showMore ? filteredMovies : filteredMovies.slice(0, 7)).map((movie) => (
                    <div
                        key={movie._id}
                        className="bg-white rounded-xl shadow-md overflow-hidden w-[270px] mx-auto flex flex-col items-center border"
                    >
                        <div className="rounded-xl pt-3">
                            <img
                                src={movie.posterImage || movie.image}
                                alt={movie.title}
                                className="w-[245px] h-[320px] object-cover rounded-lg"
                            />
                        </div>
                        <div className="p-4 w-full flex flex-col items-center flex-1">
                            <h3 className="text-base font-semibold text-center text-[#2d3a5a] leading-tight mb-1">
                                {movie.title}
                            </h3>
                            {movie.actors && (
                                <p className="text-gray-600 text-center text-sm mb-1 line-clamp-2 h-10">
                                    Diễn viên: {Array.isArray(movie.actors) ? movie.actors.join(", ") : movie.actors}
                                </p>
                            )}
                            {movie.duration && (
                                <p className="text-gray-600 text-center text-sm mb-1">
                                    Thời lượng: {movie.duration} phút
                                </p>
                            )}
                            <div className="flex justify-center mb-2">
                                <span className="text-[#ff4d4f] text-base">
                                    {movie.reviews && movie.reviews.length > 0
                                        ? "★".repeat(Math.round(
                                            movie.reviews.reduce((sum, r) => sum + r.rating, 0) / movie.reviews.length
                                        ))
                                        : "★★★★★"}
                                </span>
                            </div>
                            <div className="flex-1" />
                            <button
                                className="w-full mt-2 py-2 rounded bg-[#162d5a] text-white font-semibold hover:bg-[#1a376e] transition"
                                onClick={() => handleView(movie._id)}
                            >
                                Xem chi tiết
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            {filteredMovies.length > 7 && (
                <div className="flex justify-center mt-4">
                    <button
                        className="px-6 h-8 border rounded bg-white text-[#2d3a5a] font-semibold hover:bg-[#2d3a5a] hover:text-white transition"
                        onClick={() => setShowMore(!showMore)}
                    >
                        {showMore ? "Ẩn bớt" : "Xem thêm"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default MovieList;