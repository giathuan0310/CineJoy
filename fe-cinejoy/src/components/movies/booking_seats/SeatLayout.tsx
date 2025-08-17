import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Seat from "components/movies/booking_seats/Seat";
import useAppStore from "@/store/app.store";

interface SeatLayoutProps {
  selectedSeats: string[];
  soldSeats: string[];
  onSelect: (seat: string) => void;
  selectedSeatPrice: number;
}

const SeatLayout: React.FC<SeatLayoutProps> = ({
  selectedSeats,
  soldSeats,
  onSelect,
  selectedSeatPrice,
}) => {
  const { isDarkMode } = useAppStore();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<number>(600);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          alert("Hết thời gian đặt vé! Vui lòng thực hiện lại.");
          navigate("/");
          return 0;
        }

        // Cảnh báo khi còn 2 phút
        if (prevTime === 120) {
          alert("⚠️ Chỉ còn 2 phút để hoàn tất đặt vé!");
        }

        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  return (
    <div
      className={`flex-1 rounded-2xl shadow-lg p-6 md:p-10 ${
        isDarkMode ? "bg-[#f5f6fa0d] text-white" : "bg-white/80 text-[#162d5a]"
      }`}
    >
      {/* Màn hình chiếu */}
      <div className="flex flex-col items-center mb-4 ">
        <img
          src="https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809663/ic-screen_qsvlrn.png"
          alt="Màn hình chiếu"
          className="w-[60%] max-w-lg mb-2"
        />
        <span
          className={`text-sm mb-4 ${
            isDarkMode ? "text-gray-300" : "text-gray-500"
          }`}
        >
          MÀN HÌNH CHIẾU
        </span>
      </div>
      {/* Sơ đồ ghế (render ghế ở đây) */}
      <div className="flex flex-col items-center">
        <Seat
          selectedSeats={selectedSeats}
          soldSeats={soldSeats}
          onSelect={onSelect}
        />
      </div>
      {/* Trạng thái ghế */}
      <div className="flex flex-row justify-center gap-8 mt-6 mb-2">
        <div className="flex flex-col items-center text-xs">
          <img
            src="https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809663/seat-unselect-normal_hygw6w.png"
            alt="Ghế trống"
            className="w-7 h-7"
          />
          <span className={`mt-1 ${isDarkMode ? "text-gray-300" : ""}`}>
            Ghế trống
          </span>
        </div>
        <div className="flex flex-col items-center text-xs">
          <img
            src="https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809662/seat-select-normal_nfev6o.png"
            alt="Ghế đang chọn"
            className="w-7 h-7"
          />
          <span className={`mt-1 ${isDarkMode ? "text-gray-300" : ""}`}>
            Ghế đang chọn
          </span>
        </div>
        <div className="flex flex-col items-center text-xs">
          <img
            src="https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809662/seat-process-normal_lzfigz.png"
            alt="Ghế đang giữ"
            className="w-7 h-7"
          />
          <span className={`mt-1 ${isDarkMode ? "text-gray-300" : ""}`}>
            Ghế đang giữ
          </span>
        </div>
        <div className="flex flex-col items-center text-xs">
          <img
            src="https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809662/seat-buy-normal_ryk3xl.png"
            alt="Ghế đã bán"
            className="w-7 h-7"
          />
          <span className={`mt-1 ${isDarkMode ? "text-gray-300" : ""}`}>
            Ghế đã bán
          </span>
        </div>
      </div>
      {/* Thời gian và giá vé */}
      <div className="flex flex-col md:flex-row justify-between items-center mt-4">
        <div className="mb-2 md:mb-0">
          <p
            className="text-sm font-semibold"
            style={{ color: isDarkMode ? "#ff7675" : "#e74c3c" }}
          >
            Thời gian đặt vé còn lại:
          </p>
          <div
            className={`text-lg mt-2 font-bold px-3 text-center py-1 rounded-lg transition-all duration-300 ${
              timeLeft <= 60
                ? "animate-pulse bg-red-100 text-red-600 border border-red-300"
                : timeLeft <= 300
                ? "bg-orange-100 text-orange-600 border border-orange-300"
                : isDarkMode
                ? "bg-gray-800 text-[#ff7675]"
                : "bg-blue-50 text-[#e74c3c] border border-blue-200"
            }`}
          >
            {formatTime(timeLeft)}
          </div>
        </div>
        <div>
          <p className="text-base font-medium">Giá vé:</p>
          <div
            className="text-xl font-bold"
            style={{ color: isDarkMode ? "#f9ca24" : "#b55210" }}
          >
            {(selectedSeatPrice * selectedSeats.length).toLocaleString()} VNĐ
          </div>
          <p
            className={`text-xs mt-1 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            ({selectedSeats.length} ghế x {selectedSeatPrice.toLocaleString()}{" "}
            VNĐ)
          </p>
        </div>
      </div>
    </div>
  );
};

export default SeatLayout;
