import { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { message } from "antd";
import useAppStore from "@/store/app.store";
import MovieInfo from "@/components/movies/booking_seats/MovieInfo";
import SeatLayout from "@/components/movies/booking_seats/SeatLayout";

export const SelectSeat = () => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [soldSeats, setSoldSeats] = useState<string[]>([]);
  const [selectedSeatType, setSelectedSeatType] = useState<string | null>(null);
  const [seatTypeMap, setSeatTypeMap] = useState<Record<string, string>>({});
  const [layoutCols, setLayoutCols] = useState<number>(10);
  const [has4dx, setHas4dx] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useAppStore();
  const { movie, cinema, date, time, room, showtimeId } = location.state || {};

  const displayTime = time;
  const apiTime = time;

  // Helper function to validate seat type selection
  const validateSeatTypeSelection = useCallback((newSeatType: string): boolean => {
    if (selectedSeatType === null) {
      return true; // Allow selection if no seats are selected
    }
    
    if (selectedSeatType === newSeatType) {
      return true; // Allow selection if same type
    }
    
    // Different type - show warning message (always show per click)
    const seatTypeNames: Record<string, string> = {
      'normal': 'Ghế thường',
      'vip': 'Ghế VIP', 
      'couple': 'Ghế cặp đôi',
      '4dx': 'Ghế 4DX'
    };
    const currentTypeName = seatTypeNames[selectedSeatType] || selectedSeatType;
    const newTypeName = seatTypeNames[newSeatType] || newSeatType;
    
    const messageText = `Bạn chỉ có thể chọn ${currentTypeName}. Vui lòng bỏ chọn ghế ${currentTypeName} trước khi chọn ${newTypeName}.`;
    message.warning(messageText);
    
    return false;
  }, [selectedSeatType]);

  const handleSelectSeat = useCallback((seat: string) => {
    const seatType = seatTypeMap[seat];
    if (!seatType) {
      message.error("Không thể xác định loại ghế! Vui lòng tải lại trang.");
      return;
    }

    const isCurrentlySelected = selectedSeats.includes(seat);

    if (isCurrentlySelected) {
      const newSeats = selectedSeats.filter((s) => s !== seat);
      setSelectedSeats(newSeats);
      if (newSeats.length === 0) {
        setSelectedSeatType(null);
      }
      return;
    }

    // Selecting a new seat
    if (!validateSeatTypeSelection(seatType)) {
      return;
    }

    if (selectedSeatType === null) {
      setSelectedSeatType(seatType);
    }
    setSelectedSeats([...selectedSeats, seat]);
  }, [seatTypeMap, selectedSeats, selectedSeatType, validateSeatTypeSelection]);

  const handleSelectMultipleSeats = useCallback((seats: string[]) => {
    if (seats.length === 0) return;

    const seatType = seatTypeMap[seats[0]]; // Type of the first seat in the couple
    if (!seatType) {
      message.error("Không thể xác định loại ghế!");
      return;
    }

    const isCurrentlySelected = selectedSeats.includes(seats[0]);

    if (isCurrentlySelected) {
      const newSeats = selectedSeats.filter((s) => !seats.includes(s));
      setSelectedSeats(newSeats);
      if (newSeats.length === 0) {
        setSelectedSeatType(null);
      }
      return;
    }

    // Selecting new couple seats
    if (!validateSeatTypeSelection(seatType)) {
      return;
    }

    if (selectedSeatType === null) {
      setSelectedSeatType(seatType);
    }
    setSelectedSeats([...selectedSeats, ...seats]);
  }, [seatTypeMap, selectedSeats, selectedSeatType, validateSeatTypeSelection]);

  // Callback to update sold seats from API data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSeatsLoaded = (seatData: any) => {
    if (seatData?.seats && seatData?.seatLayout) {
      const apiSeatLayout = seatData.seatLayout;
      const seatsData = seatData.seats || [];
      setLayoutCols(apiSeatLayout.cols || 10);
      
      // Tạo map loại ghế sử dụng cùng logic với Seat component
      const typeMap: Record<string, string> = {};
      const occupiedSeats: string[] = [];
      
      // Tạo mapping từ index đến seatId (giống như trong Seat component)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      seatsData.forEach((seatItem: any, index: number) => {
        const row = Math.floor(index / apiSeatLayout.cols);
        const col = index % apiSeatLayout.cols;
        const seatId = `${String.fromCharCode(65 + row)}${col + 1}`;
        
        if (seatItem.type) {
          typeMap[seatId] = seatItem.type;
        }
        
        if (seatItem.status === "occupied" || seatItem.status === "reserved") {
          occupiedSeats.push(seatId);
        }
      });
      
      setHas4dx(Object.values(typeMap).some((t) => t === '4dx'));
      setSoldSeats(occupiedSeats);
      setSeatTypeMap(typeMap);
    }
  };

  return (
    <div
      className={`${
        isDarkMode ? "bg-[#23272f]" : "bg-[#e7ede7]"
      } min-h-screen py-6`}
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-20">
        <SeatLayout
          selectedSeats={selectedSeats}
          soldSeats={soldSeats}
          onSelect={handleSelectSeat}
          onSelectMultiple={handleSelectMultipleSeats}
          selectedSeatPrice={90000}
          showtimeId={showtimeId}
          date={date}
          startTime={apiTime}
          room={room}
          onSeatsLoaded={handleSeatsLoaded}
          is4dxRoom={has4dx}
        />
        <MovieInfo
          movie={{
            ...movie,
            cinema,
            date: date,
            time: displayTime,
            room: room,
            seats: selectedSeats,
            minAge: movie?.minAge,
            seatCols: layoutCols,
            soldSeats: soldSeats,
            format: has4dx ? '4DX' : movie?.format,
          }}
          onContinue={() =>
            navigate("/payment", {
              state: {
                movie: {
                  ...movie,
                },
                seats: selectedSeats,
                cinema,
                date: date,
                time: apiTime,
                room: room,
              },
            })
          }
        />
      </div>
    </div>
  );
};

export default SelectSeat;
