import React from "react";
import useAppStore from '@/store/app.store';

interface SeatProps {
    selectedSeats: string[];
    soldSeats: string[];
    onSelect: (seat: string) => void;
}

// Danh sách hàng và số ghế mỗi hàng
const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
const seatsPerRow = 10;

// // Ghế đã chọn (ví dụ)
// const selectedSeats = ["C3", "D4", "E3", "G4"];

// Hàm xác định trạng thái ghế (cứng dữ liệu mẫu)
// const getSeatStatus = (seatName: string) => {
//     if (selectedSeats.includes(seatName)) return "selected";
//     // Ví dụ: ghế đã bán
//     if (seatName === "C4" || seatName === "D5") return "sold";
//     // Ví dụ: ghế đang giữ
//     if (seatName === "F6") return "holding";
//     return "empty";
// };

const seatImages: Record<string, string> = {
    empty: "https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809663/seat-unselect-normal_hygw6w.png",
    selected: "https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809662/seat-select-normal_nfev6o.png",
    holding: "https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809662/seat-process-normal_lzfigz.png",
    sold: "https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809662/seat-buy-normal_ryk3xl.png",
};

const Seat: React.FC<SeatProps> = ({ selectedSeats, soldSeats, onSelect }) => {
    const { isDarkMode } = useAppStore();
    const getSeatStatus = (seatName: string) => {
        if (soldSeats.includes(seatName)) return "sold";
        if (selectedSeats.includes(seatName)) return "selected";
        return "empty";
    };
    return (
        <div className="flex flex-col items-center gap-2">
            {rows.map((row) => (
                <div key={row} className="flex flex-row items-center gap-6 mb-2">
                    {Array.from({ length: seatsPerRow }, (_, i) => {
                        const seatName = `${row}${i + 1}`;
                        const status = getSeatStatus(seatName);
                        return (
                            <button
                                key={seatName}
                                className={`relative flex flex-col items-center bg-transparent border-none p-0 rounded-full transition-all duration-200 cursor-pointer
                                    ${status === 'empty' ? 'hover:scale-110' : ''}
                                `}
                                onClick={() => {
                                    if (status !== "sold") onSelect(seatName);
                                }}
                                disabled={status === "sold"}
                                type="button"
                            >
                                <img
                                    src={seatImages[status]}
                                    alt={seatName}
                                    className="w-8 h-8"
                                />
                                <span
                                    className={`absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-semibold pointer-events-none
                                        ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                                    style={{ textShadow: isDarkMode ? '0 1px 2px #222' : '0 1px 2px #fff' }}
                                >
                                    {seatName}
                                </span>
                            </button>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default Seat;