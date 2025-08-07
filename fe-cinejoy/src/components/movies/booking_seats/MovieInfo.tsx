import React from "react";
import useAppStore from "@/store/app.store";

interface MovieInfoProps {
  movie: {
    title: string;
    poster: string;
    format: string;
    genre: string;
    duration: number;
    cinema: string;
    date: string;
    time: string;
    room: string;
    seats: string[];
  };
  onContinue: () => void;
}

const MovieInfo: React.FC<MovieInfoProps> = ({ movie, onContinue }) => {
  const { isDarkMode } = useAppStore();
  const hasSelectedSeats = movie.seats.length > 0;

  return (
    <div
      className={`w-full md:w-[340px] rounded-2xl shadow-lg p-6 flex flex-col items-center ${
        isDarkMode ? "bg-[#f5f6fa0d] text-white" : "bg-white/80 text-[#162d5a]"
      }`}
    >
      <img
        src={movie.poster}
        alt={movie.title}
        className="w-32 h-44 object-cover rounded mb-3"
      />
      <div
        className={`text-lg font-semibold text-center mb-2 ${
          isDarkMode ? "text-yellow-300" : "text-[#162d5a]"
        }`}
      >
        {movie.title}
      </div>
      <div
        className={`text-sm mb-1 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        <b>Hình thức:</b> {movie.format}
      </div>
      <div
        className={`text-sm mb-1 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        <b>Thể loại:</b> {movie.genre}
      </div>
      <div
        className={`text-sm mb-1 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        <b>Thời lượng:</b> {movie.duration} phút
      </div>
      <div
        className={`text-sm mb-1 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        <b>Rạp chiếu:</b> {movie.cinema}
      </div>
      <div
        className={`text-sm mb-1 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        <b>Ngày chiếu:</b> {movie.date}
      </div>
      <div
        className={`text-sm mb-1 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        <b>Giờ chiếu:</b> {movie.time}
      </div>
      <div
        className={`text-sm mb-1 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        <b>Phòng chiếu:</b> {movie.room}
      </div>
      <div
        className={`text-sm mb-3 ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}
      >
        <b>Ghế ngồi:</b>{" "}
        {hasSelectedSeats ? movie.seats.join(", ") : "Chưa chọn"}
      </div>

      {/* Thông báo khi chưa chọn ghế */}
      {!hasSelectedSeats && (
        <div
          className={`text-xs mb-2 text-center ${
            isDarkMode ? "text-red-400" : "text-red-500"
          }`}
        >
          Vui lòng chọn ghế ngồi để tiếp tục
        </div>
      )}

      <button
        className={`mt-2 px-6 py-2 rounded font-semibold transition-all duration-200 ${
          hasSelectedSeats
            ? `cursor-pointer ${
                isDarkMode
                  ? "bg-cyan-400 hover:bg-cyan-300 text-[#23272f]"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`
            : `cursor-not-allowed ${
                isDarkMode
                  ? "bg-gray-600 text-gray-400"
                  : "bg-gray-300 text-gray-500"
              }`
        }`}
        onClick={hasSelectedSeats ? onContinue : undefined}
        disabled={!hasSelectedSeats}
      >
        Tiếp tục
      </button>
    </div>
  );
};

export default MovieInfo;
