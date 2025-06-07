import React, { useState } from "react";

const cinemas = [
    {
        id: 1,
        name: "CGV Aeon Long Biên",
        city: "Hà Nội",
        address: "Tầng 4 - TTTM AEON Long Biên, Số 27 Cổ Linh, Quận Long Biên, Hà Nội",
    },
    {
        id: 2,
        name: "CGV Aeon Hà Đông",
        city: "Hà Nội",
        address: "Tầng 4 - TTTM AEON Hà Đông, Hà Nội",
    },
    {
        id: 3,
        name: "CGV Hồ Gươm Plaza",
        city: "Hà Nội",
        address: "Tầng 4 - Hồ Gươm Plaza, Hà Nội",
    },
    {
        id: 4,
        name: "CGV Vincom Ocean Park",
        city: "Hà Nội",
        address: "Tầng 4 - Vincom Ocean Park, Hà Nội",
    },
    {
        id: 5,
        name: "CGV Sư Vạn Hạnh",
        city: "Hồ Chí Minh",
        address: "Tầng 6, Van Hanh Mall, 11 Sư Vạn Hạnh, Quận 10, TPHCM",
    },
    {
        id: 6,
        name: "CGV Aeon Bình Tân",
        city: "Hồ Chí Minh",
        address: "Tầng 3, Aeon Mall Bình Tân, Số 1 Đường Số 17A, Bình Trị Đông B, Bình Tân, TPHCM",
    },
    {
        id: 7,
        name: "CGV Pandora City",
        city: "Hồ Chí Minh",
        address: "Tầng 3, Pandora City Shopping Centre, 1/1 Trường Chinh, Tân Phú, TPHCM",
    },
];

const dates = [
    { label: "Hôm nay\n7", value: "2025-07-07" },
    { label: "Ngày mai\n8", value: "2025-07-08" },
    { label: "Thứ 4\n9", value: "2025-07-09" },
    { label: "Thứ 5\n10", value: "2025-07-10" },
    { label: "Thứ 6\n11", value: "2025-07-11" },
    { label: "Thứ 7\n12", value: "2025-07-12" },
    { label: "Chủ nhật\n13", value: "2025-07-13" },
];

// Dữ liệu suất chiếu mẫu cho từng rạp và ngày
const showtimesData: Record<number, Record<string, string[]>> = {
    1: {
        "2025-07-07": ["09:00 AM", "07:45 PM"],
        "2025-07-08": ["10:00 AM", "08:00 PM"],
    },
    2: {
        "2025-07-07": ["11:00 AM", "09:00 PM"],
        "2025-07-08": ["12:00 PM", "06:00 PM"],
    },
    3: {
        "2025-07-07": ["13:00 PM", "17:45 PM"],
        "2025-07-08": ["14:00 PM", "19:00 PM"],
    },
    4: {
        "2025-07-07": ["15:00 PM", "20:00 PM"],
        "2025-07-08": ["16:00 PM", "21:00 PM"],
    },
    5: {
        "2025-07-07": ["09:00 AM", "07:45 PM"],
        "2025-07-08": ["10:00 AM", "08:00 PM"],
    },
    6: {
        "2025-07-07": ["11:00 AM", "09:00 PM"],
        "2025-07-08": ["12:00 PM", "06:00 PM"],
    },
    7: {
        "2025-07-07": ["13:00 PM", "17:45 PM"],
        "2025-07-08": ["14:00 PM", "19:00 PM"],
    },
};

const movies = [
    {
        id: 1,
        title: "Vây Hãm Tại Đài Bắc",
        poster:
            "https://res.cloudinary.com/ddia5yfia/image/upload/v1735969147/50.Va%CC%82y_Ha%CC%83m_Ta%CC%A3i_%C4%90a%CC%80i_Ba%CC%86%CC%81c_lr0jp4_wbdemr.jpg",
        age: "16+",
        subtitle: "2D Phụ đề",
        showtimes: ["03:00 PM ~ 04:52 PM", "05:15 PM ~ 07:07 PM"],
    },
    {
        id: 2,
        title: "Vùng Đất Bị Nguyền Rủa",
        poster:
            "https://res.cloudinary.com/ddia5yfia/image/upload/v1735969149/56._A%CC%81c_Quy%CC%89_Truy_Ho%CC%82%CC%80n_xdqdbj_jziajq.webp",
        age: "12+",
        subtitle: "2D Phụ đề",
        showtimes: ["03:00 PM ~ 04:59 PM", "05:15 PM ~ 07:14 PM"],
    },
    {
        id: 3,
        title: "Robot Hoang Dã",
        poster:
            "https://res.cloudinary.com/ddia5yfia/image/upload/v1742694499/57_Nobita_va%CC%80_Cuo%CC%A3%CC%82c_Phie%CC%82u_Lu%CC%9Bu_Va%CC%80o_The%CC%82%CC%81_Gio%CC%9B%CC%81i_Trong_Tranh_nyf1uc.webp",
        age: "15+",
        subtitle: "2D Phụ đề",
        showtimes: ["03:00 PM ~ 05:04 PM", "05:15 PM ~ 07:19 PM"],
    },
    {
        id: 4,
        title: "Tiên Tri Tử Thần",
        poster:
            "https://res.cloudinary.com/ddia5yfia/image/upload/v1742732596/58_Quy%CC%89_Nha%CC%A3%CC%82p_Tra%CC%80ng_xsxfca.jpg",
        age: "15+",
        subtitle: "2D Phụ đề",
        showtimes: ["03:00 PM ~ 05:26 PM", "05:15 PM ~ 07:41 PM"],
    },
];

const movie = {
    movie_id: 1,
    movie_name: "Nhà Gia Tiên",
    image: "https://res.cloudinary.com/ddia5yfia/image/upload/v1740883582/21_Nha_gia_tien_rp2jfd.jpg",
    background: "https://res.cloudinary.com/ddia5yfia/image/upload/v1741325247/21_Nha%CC%80_Gia_Tie%CC%82n_n5wndv.jpg",
    trailer: "https://www.youtube.com/watch?v=S-uf1N5FjTA",
    rating: 4,
    release_date: "01-12-2025",
    duration: 120,
    genre: "Hài, Gia đình",
    director: "Huỳnh Lập",
    actor: "Huỳnh Lập, Phương Mỹ Chi",
    language: "Vietnamese",
    description:
        "Nhà Gia Tiên xoay quanh câu chuyện đa góc nhìn về các thế hệ khác nhau trong một gia đình, có hai nhân vật chính là Gia Minh (Huỳnh Lập) và Mỹ Tiên (Phương Mỹ Chi). Trở về căn nhà gia tiên để quay các Hhiiiiiiiiiiiiiiiiiiiiiiiiiii",
    status: "active",
};

const cities = ["Hà Nội", "Hồ Chí Minh"];

const CardInfMovie = () => {
    const [showMoreDes, setShowMoreDes] = useState(false);
    const [activeTab, setActiveTab] = useState<"nowShowing" | "upcoming">("nowShowing");
    const [openModal, setOpenModal] = useState(false);
    const [selectedCity, setSelectedCity] = useState("Hà Nội");
    const [selectedCinemaId, setSelectedCinemaId] = useState<number>(1);
    const [selectedDate, setSelectedDate] = useState(dates[0].value);

    // Lọc rạp theo thành phố
    const filteredCinemas = cinemas.filter((c) => c.city === selectedCity);

    // Khi đổi thành phố, chọn lại rạp đầu tiên
    React.useEffect(() => {
        if (filteredCinemas.length > 0) {
            setSelectedCinemaId(filteredCinemas[0].id);
        }
    }, [selectedCity]);

    // Khi đổi rạp, nếu rạp không có ngày đang chọn thì chọn ngày đầu tiên có suất chiếu
    React.useEffect(() => {
        if (
            selectedCinemaId &&
            (!showtimesData[selectedCinemaId] || !showtimesData[selectedCinemaId][selectedDate])
        ) {
            const availableDates = showtimesData[selectedCinemaId]
                ? Object.keys(showtimesData[selectedCinemaId])
                : [];
            if (availableDates.length > 0) setSelectedDate(availableDates[0]);
        }
    }, [selectedCinemaId]);

    return (
        <>
            {/* Phần thông tin chi tiết về phim */}
            <div
                className="bg-cover bg-center min-h-[100px] py-2  relative"
                style={{ backgroundImage: `url(${movie.background})` }}
            >
                {/* Thông tin phim */}
                <div className="flex flex-col md:flex-row items-start max-w-5xl mx-auto bg-black/40 rounded-xl p-8 gap-10">
                    {/* Poster */}
                    <div className="min-w-[280px] text-center">
                        <img
                            src={movie.image}
                            alt={movie.movie_name}
                            className="w-[260px] h-[370px] object-cover rounded-xl border-4 border-white shadow-lg mx-auto"
                        />
                        <button
                            className={`mt-6 w-full py-3 rounded-md text-white font-semibold text-xl transition
                            ${movie.status === "active"
                                    ? "bg-[#162d5a] hover:bg-[#1a376e] cursor-pointer"
                                    : "bg-[#ff642e] opacity-80 cursor-not-allowed"}
                        `}
                            disabled={movie.status !== "active"}
                            onClick={() => setOpenModal(true)}
                        >
                            {movie.status === "active"
                                ? "Đặt vé ngay"
                                : movie.status === "close"
                                    ? "Đã đóng"
                                    : movie.status === "upcoming"
                                        ? "Sắp chiếu"
                                        : "Đặt vé ngay"}
                        </button>
                    </div>
                    {/* Info */}
                    <div className="flex-1 text-white">
                        <h2 className="text-4xl font-bold text-lime-300 mb-2">{movie.movie_name}</h2>
                        <div className="text-2xl text-[#ff642e] mb-2 flex items-center gap-2">
                            {"★".repeat(movie.rating)}
                            <span className="text-white text-lg ml-2">{movie.rating}/5</span>
                        </div>
                        <div className="text-lg mb-1">
                            <span className="text-yellow-300">Ngày phát hành :</span> {movie.release_date}
                        </div>
                        <div className="text-lg mb-1">
                            <span className="text-yellow-300">Thời lượng :</span> {movie.duration} phút
                        </div>
                        <div className="text-lg mb-1">
                            <span className="text-yellow-300">Đạo diễn :</span> {movie.director}
                        </div>
                        <div className="text-lg mb-1">
                            <span className="text-yellow-300">Diễn viên :</span> {movie.actor}
                        </div>
                        <div className="text-lg mb-1">
                            <span className="text-yellow-300">Ngôn ngữ :</span> {movie.language}
                        </div>
                        <div className="text-lg mb-1">
                            <span className="text-yellow-300">Thể loại :</span> {movie.genre}
                        </div>
                        <div className="mt-6">
                            <span className="text-yellow-200 font-bold text-xl">Nội dung</span>
                            <div className="text-white text-base mt-2">
                                {showMoreDes
                                    ? movie.description
                                    : `${movie.description.substring(0, 120)}...`}
                                <button
                                    className="bg-transparent border-none text-yellow-400 font-semibold ml-2 cursor-pointer"
                                    onClick={() => setShowMoreDes((v) => !v)}
                                >
                                    {showMoreDes ? "Ẩn bớt" : "Xem thêm"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>


            </div>

            {/* Phần trailer và danh sách phim */}
            <div className="bg-cover  min-h-[50px]  py-2 relative">
                <div className=" mx-auto   rounded-xl p-8 flex flex-col md:flex-row gap-8">
                    {/* Trailer bên trái */}
                    <div className="flex-1 flex flex-col items-center  ">

                        <iframe
                            width="100%"
                            height="320"
                            src={movie.trailer}
                            title={movie.movie_name}
                            className="rounded-xl border-none w-full max-w-[700px] h-[360px]"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                        ></iframe>
                    </div>
                    {/* Danh sách phim bên phải */}
                    <div className="w-full md:w-[400px] bg-[#F6F6F6] flex flex-col rounded-2xl">
                        <div className="flex justify-center gap-4 mb-8 pt-3 pb-3 pl-3 pr-3">


                            <button
                                className={`w-50 h-8 border rounded font-semibold transition ${activeTab === "nowShowing"
                                    ? "bg-[#b55210] text-white text-sm"
                                    : "bg-white text-[#2d3a5a] hover:bg-[#dd6c0f] hover:text-white"
                                    }`}
                                onClick={() => setActiveTab("nowShowing")}
                            >
                                Phim đang chiếu
                            </button>

                            <button
                                className={` w-50 h-8 border rounded font-semibold transition ${activeTab === "upcoming"
                                    ? "bg-[#dd6c0f] text-white"
                                    : "bg-white text-[#2d3a5a] hover:bg-[#dd6c0f] hover:text-white"
                                    }`}
                                onClick={() => setActiveTab("upcoming")}
                            >
                                Phim sắp chiếu
                            </button>


                        </div>
                        <ul className="space-y-4">
                            {/* Ví dụ danh sách phim cứng */}
                            {[
                                {
                                    id: 1,
                                    title: "Vây Hãm Tại Đài Bắc",
                                    genre: "Hài, Gia đình",
                                    image: "https://res.cloudinary.com/ddia5yfia/image/upload/v1740883582/21_Nha_gia_tien_rp2jfd.jpg",
                                    rating: 4,
                                },
                                {
                                    id: 2,
                                    title: "Vùng Đất Bị Nguyền Rủa",
                                    genre: "Hài, Gia đình",
                                    image: "https://res.cloudinary.com/ddia5yfia/image/upload/v1740883582/21_Nha_gia_tien_rp2jfd.jpg",
                                    rating: 5,
                                },
                            ].map((item) => (
                                <li key={item.id} className="flex items-center gap-3  rounded-lg p-2 border-b border-gray-300 mx-2">
                                    <img src={item.image} alt={item.title} className="w-12 h-16 object-cover rounded" />
                                    <div>
                                        <div className="text-black font-semibold">{item.title}</div>
                                        <div className="text-gray-600 text-sm">{item.genre}</div>
                                        <div className="text-yellow-400 text-sm">
                                            {"★".repeat(item.rating)}
                                        </div>
                                    </div>
                                </li>

                            ))}

                        </ul>
                    </div>
                </div>
            </div>

            {/* Modal đặt vé */}
            {openModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-2xl shadow-lg max-w-5xl w-full p-8 relative">

                        {/* Thông tin phim trên modal */}
                        <div className="flex items-start gap-6 mb-6">
                            <img
                                src={movie.image}
                                alt={movie.movie_name}
                                className="w-36 h-52 object-cover rounded-lg shadow"
                            />
                            <div>
                                <div className="text-3xl font-semibold text-[#162d5a] mb-2">{movie.movie_name}</div>
                                <div className="mb-2">
                                    <span className="inline-block bg-green-600 text-white text-sm font-bold px-2 py-0.5 rounded mr-2 align-middle">P+</span>
                                    <span className="text-gray-700 font-medium">Thời lượng:</span> <span className="text-gray-800">{movie.duration} phút</span>
                                </div>
                                <div className="mb-2">
                                    <span className="text-gray-700 font-medium">Thể loại:</span> <span className="text-gray-800">{movie.genre}</span>
                                </div>
                                <div>
                                    <span className="text-gray-700 font-medium">Diễn viên:</span> <span className="text-gray-800">{movie.actor}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            {/* Left: Cinema List */}
                            <div className="w-1/3 pr-4 border-r">
                                <select
                                    className="w-full border rounded px-3 py-2 mb-3"
                                    value={selectedCity}
                                    onChange={e => setSelectedCity(e.target.value)}
                                >
                                    <option>Hà Nội</option>
                                    <option>Hồ Chí Minh</option>
                                </select>

                                <div className="overflow-y-auto max-h-[350px] flex flex-col gap-2">
                                    {filteredCinemas.map((cinema) => (
                                        <button
                                            key={cinema.id}
                                            className={`flex items-center gap-2 px-3 py-2 rounded border w-full text-left ${selectedCinemaId === cinema.id
                                                ? "bg-blue-50 border-blue-700"
                                                : "bg-white border-gray-200"
                                                }`}
                                            onClick={() => setSelectedCinemaId(cinema.id)}
                                        >
                                            <img
                                                src="data:image/png;base64,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"
                                                alt="CGV"
                                                className="w-7 h-7"
                                            />
                                            <div>
                                                <div className="font-semibold">{cinema.name}</div>
                                                <div className="text-xs text-gray-500">{cinema.address}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {/* Right: Date & Showtimes */}
                            <div className="flex-1 pl-4">
                                <div className="flex gap-2 mb-4">
                                    {dates.map((date) => (
                                        <button
                                            key={date.value}
                                            className={`px-4 py-2 rounded font-medium ${selectedDate === date.value
                                                ? "bg-blue-900 text-white"
                                                : "bg-gray-100 text-blue-900"
                                                }`}
                                            onClick={() => setSelectedDate(date.value)}
                                        >
                                            {date.label.split("\n").map((line, idx) => (
                                                <span key={idx} className={idx === 0 ? "block" : "block text-lg font-bold"}>{line}</span>
                                            ))}
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-2">
                                    {showtimesData[selectedCinemaId] && showtimesData[selectedCinemaId][selectedDate] ? (
                                        <>
                                            <div className="flex items-center gap-2 mb-3">
                                                <span className="text-lg text-gray-700">•</span>
                                                <span className="text-gray-700 font-medium">
                                                    Suất chiếu ngày {selectedDate.split("-").reverse().join("/")}
                                                </span>
                                            </div>
                                            <div className="flex gap-3 flex-wrap">
                                                {showtimesData[selectedCinemaId][selectedDate].map((time, idx) => (
                                                    <button
                                                        key={idx}
                                                        className="border px-4 py-2 rounded text-gray-800 bg-white hover:bg-blue-50"
                                                    >
                                                        {time}
                                                    </button>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-gray-500 mt-6">Không có suất chiếu</div>
                                    )}
                                </div>
                                <div className="flex justify-end mt-10">
                                    <button
                                        className="px-8 py-2 rounded bg-gray-300 text-gray-500 font-semibold "
                                        onClick={() => setOpenModal(false)}
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CardInfMovie;