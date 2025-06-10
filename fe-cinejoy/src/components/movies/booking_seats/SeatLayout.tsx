import React from "react";
import Seat from "./Seat";

interface SeatLayoutProps {
    selectedSeats: string[];
    soldSeats: string[];
    onSelect: (seat: string) => void;
    selectedSeatPrice: number;

}

const SeatLayout: React.FC<SeatLayoutProps> = ({ selectedSeats,
    soldSeats,
    onSelect, selectedSeatPrice }) => {
    return (
        <div className="flex-1 bg-[#e7ede7] rounded-xl p-4">
            {/* Màn hình chiếu */}
            <div className="flex flex-col items-center mb-4 ">
                <img
                    src="https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809663/ic-screen_qsvlrn.png"
                    alt="Màn hình chiếu"
                    className="w-[60%] max-w-lg mb-2"
                />
                <span className="text-gray-500 text-sm mb-4">MÀN HÌNH CHIẾU</span>
            </div>
            {/* Sơ đồ ghế (render ghế ở đây) */}
            <div className="flex flex-col items-center">
                <Seat selectedSeats={selectedSeats}
                    soldSeats={soldSeats}
                    onSelect={onSelect} />
            </div>
            {/* Trạng thái ghế */}
            <div className="flex flex-row justify-center gap-8 mt-6 mb-2">
                <div className="flex flex-col items-center text-xs">
                    <img src="https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809663/seat-unselect-normal_hygw6w.png" alt="Ghế trống" className="w-7 h-7" />
                    <span className="mt-1">Ghế trống</span>
                </div>
                <div className="flex flex-col items-center text-xs">
                    <img src="https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809662/seat-select-normal_nfev6o.png" alt="Ghế đang chọn" className="w-7 h-7" />
                    <span className="mt-1">Ghế đang chọn</span>
                </div>
                <div className="flex flex-col items-center text-xs">
                    <img src="https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809662/seat-process-normal_lzfigz.png" alt="Ghế đang giữ" className="w-7 h-7" />
                    <span className="mt-1">Ghế đang giữ</span>
                </div>
                <div className="flex flex-col items-center text-xs">
                    <img src="https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809662/seat-buy-normal_ryk3xl.png" alt="Ghế đã bán" className="w-7 h-7" />
                    <span className="mt-1">Ghế đã bán</span>
                </div>
            </div>
            {/* Thời gian và giá vé */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-4">
                <div className="mb-2 md:mb-0">
                    <p className="text-sm text-red-600 font-semibold">Thời gian đặt vé còn lại:</p>
                    <div className="text-lg font-bold text-red-600">1:26</div>
                </div>
                <div>
                    <p className="text-base font-medium">Giá vé:</p>
                    <div className="text-xl font-bold text-[#b55210]">
                        {(selectedSeatPrice * selectedSeats.length).toLocaleString()} VNĐ
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        ({selectedSeats.length} ghế x {selectedSeatPrice.toLocaleString()} VNĐ)
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SeatLayout;