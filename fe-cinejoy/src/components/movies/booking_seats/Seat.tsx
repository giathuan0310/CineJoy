import React, { useState, useEffect, useRef } from "react";
import useAppStore from "@/store/app.store";
import { getSeatsForShowtimeApi } from "@/apiservice/apiShowTime";

interface SeatProps {
  selectedSeats: string[];
  soldSeats: string[];
  onSelect: (seat: string) => void;
  showtimeId?: string;
  date?: string;
  startTime?: string;
  room?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSeatsLoaded?: (seatData: any) => void;
}

interface SeatData {
  seatId: string;
  status: "available" | "occupied" | "selected" | "reserved";
  type: "standard" | "vip" | "couple";
  price: number;
  number: number;
}

interface SeatLayout {
  rows: string[];
  layout: Record<string, SeatData[]>;
  totalSeats: number;
  availableSeats: number;
  occupiedSeats: number;
}

// Danh sách hàng và số ghế mỗi hàng (fallback values)
// const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
// const seatsPerRow = 10;

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
  empty:
    "https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809663/seat-unselect-normal_hygw6w.png",
  selected:
    "https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809662/seat-select-normal_nfev6o.png",
  holding:
    "https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809662/seat-process-normal_lzfigz.png",
  sold: "https://res.cloudinary.com/dcoviwlpx/image/upload/v1731809662/seat-buy-normal_ryk3xl.png",
};

const Seat: React.FC<SeatProps> = ({
  selectedSeats,
  soldSeats,
  onSelect,
  showtimeId,
  date,
  startTime,
  room,
  onSeatsLoaded,
}) => {
  const { isDarkMode } = useAppStore();
  const [seatLayout, setSeatLayout] = useState<SeatLayout | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use ref to store the callback to avoid re-renders
  const onSeatsLoadedRef = useRef(onSeatsLoaded);
  onSeatsLoadedRef.current = onSeatsLoaded;

  // Load seats from API
  useEffect(() => {
    const loadSeats = async () => {
      // Debug: log the props to see what's missing
      console.log("Seat component props:", {
        showtimeId,
        date,
        startTime,
        room,
      });

      if (!showtimeId || !date || !startTime) {
        console.log("Missing required props for API call, using static data");
        // Fallback to static data if no API params provided
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Call the API to get seats
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        console.log("Calling API with params:", {
          showtimeId,
          date,
          startTime,
          room,
        });

        const response = await getSeatsForShowtimeApi(
          showtimeId,
          date,
          startTime,
          room
        );

        if (response.status && response.data) {
          // Cast the API response to match our SeatLayout interface
          const apiSeatLayout = response.data.seatLayout;
          const typedSeatLayout: SeatLayout = {
            ...apiSeatLayout,
            layout: Object.fromEntries(
              Object.entries(apiSeatLayout.layout).map(([row, seats]) => [
                row,
                seats.map((seat) => ({
                  ...seat,
                  status: seat.status as
                    | "available"
                    | "occupied"
                    | "selected"
                    | "reserved",
                  type: seat.type as "standard" | "vip" | "couple",
                })),
              ])
            ),
          };

          setSeatLayout(typedSeatLayout);
          if (onSeatsLoadedRef.current) {
            onSeatsLoadedRef.current(response.data);
          }
        } else {
          setError(response.message || "Không thể tải dữ liệu ghế");
        }
      } catch (err) {
        console.error("Error loading seats:", err);
        setError("Lỗi kết nối khi tải dữ liệu ghế");
      } finally {
        setLoading(false);
      }
    };

    loadSeats();
  }, [showtimeId, date, startTime, room]); // Removed onSeatsLoaded from dependencies

  const getSeatStatus = (seatName: string) => {
    if (selectedSeats.includes(seatName)) return "selected";

    // Check API data first if available
    if (seatLayout) {
      const row = seatName.charAt(0);
      const seatNumber = parseInt(seatName.substring(1));
      const rowSeats = seatLayout.layout[row];

      if (rowSeats) {
        const seat = rowSeats.find((s) => s.number === seatNumber);
        if (seat) {
          switch (seat.status) {
            case "occupied":
              return "sold";
            case "reserved":
              return "holding";
            default:
              return "empty";
          }
        }
      }
    }

    // Fallback to soldSeats prop (for static data)
    if (soldSeats.includes(seatName)) return "sold";

    return "empty";
  };

  // Determine which rows and seats to render
  const renderRows = seatLayout
    ? seatLayout.rows
    : ["A", "B", "C", "D", "E", "F", "G", "H"];
  const renderSeatsForRow = (row: string) => {
    if (seatLayout && seatLayout.layout[row]) {
      return seatLayout.layout[row];
    }
    // Fallback to static 10 seats per row
    return Array.from({ length: 10 }, (_, i) => ({
      seatId: `${row}${i + 1}`,
      number: i + 1,
      status: "available" as const,
      type: "standard" as const,
      price: 90000,
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p
          className={`mt-2 text-sm ${
            isDarkMode ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Đang tải sơ đồ ghế...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <p className={`text-sm text-red-500 mb-2`}>{error}</p>
        <p
          className={`text-xs ${
            isDarkMode ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Sử dụng sơ đồ ghế mặc định
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-2">
      {renderRows.map((row) => {
        const rowSeats = renderSeatsForRow(row);
        return (
          <div key={row} className="flex flex-row items-center gap-6 mb-2">
            {rowSeats.map((seatData) => {
              const seatName = seatData.seatId;
              const status = getSeatStatus(seatName);
              return (
                <button
                  key={seatName}
                  className={`relative flex flex-col items-center bg-transparent border-none p-0 rounded-full transition-all duration-200 cursor-pointer
                                        ${
                                          status === "empty"
                                            ? "hover:scale-110"
                                            : ""
                                        }
                                    `}
                  onClick={() => {
                    if (status !== "sold" && status !== "holding") {
                      onSelect(seatName);
                    }
                  }}
                  disabled={status === "sold" || status === "holding"}
                  type="button"
                >
                  <img
                    src={seatImages[status]}
                    alt={seatName}
                    className="w-8 h-8"
                  />
                  <span
                    className={`absolute top-1 left-1/2 -translate-x-1/2 text-[10px] font-semibold pointer-events-none
                                            ${
                                              isDarkMode
                                                ? "text-gray-200"
                                                : "text-gray-700"
                                            }`}
                    style={{
                      textShadow: isDarkMode
                        ? "0 1px 2px #222"
                        : "0 1px 2px #fff",
                    }}
                  >
                    {seatName}
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Seat;
