import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

interface Movie {
    id: number;
    title: string;
    actors?: string;
    duration?: number;
    description?: string;
    imageUrl: string;
    tab?: "nowShowing" | "upcoming" | "special" | "all"; // Thêm trường tab để phân loại phim
}

interface MovieListProps {
    movies: Movie[];
}

const MovieList: React.FC<MovieListProps> = ({ movies }) => {
    const [activeTab, setActiveTab] = useState<"nowShowing" | "upcoming" | "special" | "all">("nowShowing");
    const [showMore, setShowMore] = useState(false);

    // Giả lập lọc theo tab (ở thực tế bạn sẽ fetch theo tab)
    const filteredMovies = movies.filter(
        (movie) => movie.tab === activeTab || movie.tab === undefined // fallback nếu chưa có trường tab
    );

    const navigate = useNavigate(); // Thêm dòng này

    // Hàm xử lý chuyển trang
    const handleView = (id: number) => {
        navigate(`/movies/${id}`);
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5  px-4">
                {(showMore ? filteredMovies : filteredMovies.slice(0, 7)).map((movie) => (
                    <div
                        key={movie.id}
                        className="bg-white rounded-xl shadow-md overflow-hidden w-[270px] mx-auto flex flex-col items-center border"
                    >
                        <div className="rounded-xl pt-3">
                            <img
                                src={movie.imageUrl}
                                alt={movie.title}
                                className="w-[245px] h-[320px] object-cover rounded-lg  "
                            />

                        </div>
                        <div className="p-4 w-full flex flex-col items-center">
                            <h3 className="text-base font-semibold text-center text-[#2d3a5a] leading-tight mb-1">
                                {movie.title}
                            </h3>
                            {movie.actors && (
                                <p className="text-gray-600 text-center text-sm mb-1">
                                    Diễn viên: {movie.actors}
                                </p>
                            )}
                            {movie.duration && (
                                <p className="text-gray-600 text-center text-sm mb-1">
                                    Time: {movie.duration} phút
                                </p>
                            )}
                            {/* Nếu có đánh giá sao, render ở đây */}
                            <div className="flex justify-center mb-2">
                                {/* Ví dụ: renderStars(movie.rating) */}
                                <span className="text-[#ff4d4f] text-base">★★★★★</span>
                            </div>
                            <button className="w-full mt-2 py-2 rounded bg-[#162d5a] text-white font-semibold hover:bg-[#1a376e] transition"
                                onClick={() => handleView(movie.id)} // Sửa dòng này

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