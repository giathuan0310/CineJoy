import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAppStore from '@/store/app.store';
import MovieInfo from "@/components/movies/booking_seats/MovieInfo";
import SeatLayout from "@/components/movies/booking_seats/SeatLayout";

export const SelectSeat = () => {
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    // Ghế đã bán (cứng mẫu, thực tế lấy từ API)
    const soldSeats = ["C4", "D5", "F6"];

    const navigate = useNavigate();
    const location = useLocation();
    const { isDarkMode } = useAppStore();
    // const movie = {
    //     title: "Vây Hãm Tại Đài Bắc",
    //     poster: "https://res.cloudinary.com/ddia5yfia/image/upload/v1735969147/50.Va%CC%82y_Ha%CC%83m_Ta%CC%A3i_%C4%90a%CC%80i_Ba%CC%86%CC%81c_lr0jp4_wbdemr.jpg",
    //     format: "2D, Phụ đề Tiếng Việt",
    //     genre: "Gia đình, Phiêu lưu, Hoạt hình",
    //     duration: 80,
    //     cinema: "CGV Aeon Long Biên",
    //     date: "2025-06-07",
    //     time: "15:00",
    //     room: "P1",
    //     seats: selectedSeats,
    // };
    const {
        movie = {},
        cinema = "",
        date = "",
        time = "",
        room = "",
    } = location.state || {};

    const handleSelectSeat = (seat: string) => {
        setSelectedSeats((prev) =>
            prev.includes(seat)
                ? prev.filter((s) => s !== seat)
                : [...prev, seat]
        );
    };

    return (
        <div className={`${isDarkMode ? 'bg-[#23272f]' : 'bg-[#e7ede7]'} min-h-screen py-6`}>
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20">
                <SeatLayout
                    selectedSeats={selectedSeats}
                    soldSeats={soldSeats}
                    onSelect={handleSelectSeat}
                    selectedSeatPrice={90000}
                />
                <MovieInfo movie={{
                    ...movie,
                    cinema,
                    date,
                    time,
                    room,
                    seats: selectedSeats, // cập nhật ghế đã chọn
                }} onContinue={() => navigate("/thanh-toan")} />
            </div>
        </div>
    );
};

export default SelectSeat;