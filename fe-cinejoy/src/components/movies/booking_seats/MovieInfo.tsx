import React from "react";

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
    return (
        <div className="w-full md:w-[340px] bg-[#E7EDE7] rounded-xl shadow p-6 flex flex-col items-center">
            <img src={movie.poster} alt={movie.title} className="w-32 h-44 object-cover rounded mb-3" />
            <div className="text-lg font-semibold text-[#162d5a] text-center mb-2">{movie.title}</div>
            <div className="text-sm text-gray-700 mb-1"><b>Hình thức:</b> {movie.format}</div>
            <div className="text-sm text-gray-700 mb-1"><b>Thể loại:</b> {movie.genre}</div>
            <div className="text-sm text-gray-700 mb-1"><b>Thời lượng:</b> {movie.duration} phút</div>
            <div className="text-sm text-gray-700 mb-1"><b>Rạp chiếu:</b> {movie.cinema}</div>
            <div className="text-sm text-gray-700 mb-1"><b>Ngày chiếu:</b> {movie.date}</div>
            <div className="text-sm text-gray-700 mb-1"><b>Giờ chiếu:</b> {movie.time}</div>
            <div className="text-sm text-gray-700 mb-1"><b>Phòng chiếu:</b> {movie.room}</div>
            <div className="text-sm text-gray-700 mb-3"><b>Ghế ngồi:</b> {movie.seats.join(", ")}</div>
            <button
                className="mt-2 px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-semibold"
                onClick={onContinue}
            >
                Tiếp tục
            </button>
        </div>
    );
};

export default MovieInfo;