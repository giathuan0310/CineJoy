// import { getRegions, getTheaters } from "@/apiservice/apiTheater";
import { useState } from "react";

interface Cinema {
  id: number;
  name: string;
  address: string;
}

interface Movie {
  id: number;
  title: string;
  poster: string;
  age: string;
  subtitle: string;
  showtimes: string[];
}

const cinemas: Cinema[] = [
  {
    id: 1,
    name: "CGV Aeon Long Biên",
    address: "Tầng 4 - TTTM AEON Long Biên, Số 27 Cổ Linh, Quận Long Biên, Hà Nội",
  },
  {
    id: 2,
    name: "CGV Aeon Hà Đông",
    address: "Tầng 4 - TTTM AEON Hà Đông, Hà Nội",
  },
  {
    id: 3,
    name: "CGV Hồ Gươm Plaza",
    address: "Tầng 4 - Hồ Gươm Plaza, Hà Nội",
  },
  {
    id: 4,
    name: "CGV Vincom Ocean Park",
    address: "Tầng 4 - Vincom Ocean Park, Hà Nội",
  },
];

const movies: Movie[] = [
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

const dates = [
  { label: "Hôm nay\n7", value: "2024-05-07" },
  { label: "Ngày mai\n8", value: "2024-05-08" },
  { label: "Thứ 5\n9", value: "2024-05-09" },
  { label: "Thứ 6\n10", value: "2024-05-10" },
  { label: "Thứ 7\n11", value: "2024-05-11" },
  { label: "Chủ nhật\n12", value: "2024-05-12" },
  { label: "Thứ 2\n13", value: "2024-05-13" },
];

const ScheduleList: React.FC = () => {
  const [selectedCinemaId, setSelectedCinemaId] = useState(1);
  const [selectedDate, setSelectedDate] = useState(dates[0].value);
  // const [selectedCity, setSelectedCity] = useState("Hà Nội");
  // const [theater, setTheater] = useState<ITheater[]>([]);
  // const [region, setRegion] = useState<IRegion[]>([]);

  // useEffect(() => {
  //     const fetchTheater = async () => {
  //         try {
  //             const response = await getTheaters();
  //             setTheater(Array.isArray(response) ? response : []);
  //         } catch (error) {
  //             console.error("Lỗi khi lấy thông tin rạp:", error);
  //         }
  //     }

  //     const fetchRegion = async () => {
  //         try {
  //             const response = await getRegions();
  //             setRegion(Array.isArray(response) ? response : []);
  //         } catch (error) {
  //             console.error("Lỗi khi lấy thông tin vùng:", error);
  //         }
  //     }

  //     fetchTheater();
  //     fetchRegion();
  //   }, []);

  //   const filteredCinemas = theater.filter((c) => c.location.city === selectedCity);

  //   // Khi đổi thành phố, chọn lại rạp đầu tiên
  //   useEffect(() => {
  //     if (filteredCinemas.length > 0) {
  //         setSelectedCinemaId(filteredCinemas[0]._id);
  //     }
  //   }, [selectedCity]);


  return (
    <div className="flex flex-col bg-white rounded-2xl shadow p-6 gap-6 my-8 mx-30">
      <h2 className="text-3xl font-bold text-[#0f1b4c] text-center mb-4">
        LỊCH CHIẾU PHIM
      </h2>
      <div className="flex items-center gap-5">
        <label className="block text-gray-700 font-medium mb-2">Vị trí</label>
        <select className="w-[250px] text-sm border rounded p-2 cursor-pointer">
          <option>Hà Nội</option>
          <option>Hồ Chí Minh</option>
        </select>
      </div>
      <div className="flex">
        {/* Left: Cinema List */}
        <div className="w-2/6 mr-10">
          <div className="flex flex-col gap-2">
            {cinemas.map((cinema) => (
              <button
                key={cinema.id}
                className={`flex items-center gap-2 px-3 py-2 rounded border cursor-pointer ${selectedCinemaId !== cinema.id ? "hover:bg-[#f5f5f5] hover:border-[#0f1b4c]" : null} ${
                  selectedCinemaId === cinema.id
                    ? "bg-[#e4e6ee] border-[#0f1b4c]"
                    : "bg-white border-gray-200"
                }`}
                onClick={() => setSelectedCinemaId(cinema.id)}
              >
                <img
                  src="https://res.cloudinary.com/ddia5yfia/image/upload/v1742918428/xhnsfypp7fdgxwgpedkg_lxikuw.jpg"
                  alt="CGV"
                  className="w-9 h-9"
                />
                <span className="text-gray-800">{cinema.name}</span>
              </button>
            ))}
          </div>
        </div>
  
        {/* Right: Schedule */}
        <div className="flex-1">
          <div className="flex items-center gap-3 border border-[#ddd] rounded px-4 py-2 mb-4">
            <img className="w-10 h-10" src="https://res.cloudinary.com/ddia5yfia/image/upload/v1742918428/xhnsfypp7fdgxwgpedkg_lxikuw.jpg" alt="logo" />
            <div className="select-none">
              <span className="font-semibold text-[#333]">
                Lịch chiếu {cinemas.find((c) => c.id === selectedCinemaId)?.name}
              </span>
              <div className="text-gray-600 text-sm">
                {cinemas.find((c) => c.id === selectedCinemaId)?.address}{" "}
              </div>
            </div>
          </div>
          {/* Date Tabs */}
          <div className="flex gap-2 mb-4">
            {dates.map((date) => (
              <button
                key={date.value}
                className={`px-3 py-1 rounded font-[400px] cursor-pointer ${
                  selectedDate === date.value
                    ? "bg-[#0f1b4c] text-white"
                    : "bg-gray-100 text-[#0f1b4c]"
                }`}
                onClick={() => setSelectedDate(date.value)}
              >
                {date.label.split("\n").map((line, idx) => (
                  <span key={idx} className={idx === 0 ? "block" : "block text-lg font-bold"}>{line}</span>
                ))}
              </button>
            ))}
          </div>
          {/* Movie List */}
          <div className="flex flex-col gap-4 max-h-[500px] overflow-y-auto pr-2 pb-2">
            {movies.map((movie) => (
              <div
                key={movie.id}
                className="flex gap-4 bg-white rounded-lg shadow-sm p-3"
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-20 h-28 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded text-white ${
                        movie.age === "16+"
                          ? "bg-red-500"
                          : movie.age === "15+"
                          ? "bg-yellow-500"
                          : movie.age === "12+"
                          ? "bg-yellow-400"
                          : "bg-green-500"
                      }`}
                    >
                      {movie.age}
                    </span>
                    <span className="font-bold text-blue-900">{movie.title}</span>
                  </div>
                  <div className="text-gray-500 text-sm mb-2">{movie.subtitle}</div>
                  <div className="flex gap-2 flex-wrap">
                    {movie.showtimes.map((time, idx) => (
                      <span
                        key={idx}
                        className="bg-gray-50 border border-gray-300 rounded px-2 py-0.5 text-sm cursor-pointer hover:bg-[#0f1b4c] hover:text-white transition-all duration-250 ease-in-out"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleList; 