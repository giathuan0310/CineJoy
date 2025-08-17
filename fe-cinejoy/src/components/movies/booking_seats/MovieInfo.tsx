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
        className={`text-lg font-semibold text-center mb-4 ${
          isDarkMode ? "text-yellow-300" : "text-[#162d5a]"
        }`}
      >
        {movie.title}
      </div>
      <div className="w-full space-y-2 mb-4">
        <div
          className={`flex justify-between text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <span className="font-bold">Hình thức:</span>
          <span>{movie.format}</span>
        </div>
        <div
          className={`flex justify-between text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <span className="font-bold">Thể loại:</span>
          <span>{movie.genre}</span>
        </div>
        <div
          className={`flex justify-between text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <span className="font-bold">Thời lượng:</span>
          <span>{movie.duration} phút</span>
        </div>
        <div
          className={`flex justify-between text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <span className="font-bold">Rạp chiếu:</span>
          <span>{movie.cinema}</span>
        </div>
        <div
          className={`flex justify-between text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <span className="font-bold">Ngày chiếu:</span>
          <span>{movie.date}</span>
        </div>
        <div
          className={`flex justify-between text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <span className="font-bold">Giờ chiếu:</span>
          <span>{movie.time}</span>
        </div>
        <div
          className={`flex justify-between text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <span className="font-bold">Phòng chiếu:</span>
          <span>{movie.room}</span>
        </div>
        <div
          className={`flex justify-between text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-700"
          }`}
        >
          <span className="font-bold">Ghế ngồi:</span>
          <span>{hasSelectedSeats ? movie.seats.join(", ") : "Chưa chọn"}</span>
        </div>
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
        className={`mt-2 px-6 py-2 w-full rounded font-semibold transition-all duration-200 ${
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
