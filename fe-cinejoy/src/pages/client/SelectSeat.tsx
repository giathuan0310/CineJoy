import { useState } from "react";
import { useNavigate } from "react-router-dom";

import MovieInfo from "../../components/movies/booking_seats/MovieInfo";
import SeatLayout from "@/components/movies/booking_seats/SeatLayout";

export const SelectSeat = () => {
    const [selectedSeatPrice, setSelectedSeatPrice] = useState(() => {
        return Number(localStorage.getItem("selectedSeatPrice")) || 0;
    });
    const navigate = useNavigate();

    // Dữ liệu mẫu cho phim và suất chiếu
    const movie = {
        title: "Vây Hãm Tại Đài Bắc",
        poster: "https://res.cloudinary.com/ddia5yfia/image/upload/v1735969147/50.Va%CC%82y_Ha%CC%83m_Ta%CC%A3i_%C4%90a%CC%80i_Ba%CC%86%CC%81c_lr0jp4_wbdemr.jpg",
        format: "2D, Phụ đề Tiếng Việt",
        genre: "Gia đình, Phiêu lưu, Hoạt hình",
        duration: 80,
        cinema: "CGV Aeon Long Biên",
        date: "2025-06-07",
        time: "15:00",
        room: "P1",
        seats: ["C3", "D4"],
    };

    return (
        <div className="bg-[#e7ede7] min-h-screen py-6 ">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20">
                <SeatLayout selectedSeatPrice={selectedSeatPrice} />
                <MovieInfo movie={movie} onContinue={() => navigate("/thanh-toan")} />
            </div>
        </div>
    );
};

export default SelectSeat;