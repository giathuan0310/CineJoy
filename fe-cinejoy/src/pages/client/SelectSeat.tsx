import { useState, useCallback, useRef } from "react";
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
  const lastMessageRef = useRef<string>("");

  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useAppStore();
  const { movie, cinema, date, time, room, showtimeId } = location.state || {};


  const displayTime = time;
  // Không cần chuyển đổi UTC vì time đã là giờ địa phương
  const apiTime = time; // Sử dụng trực tiếp time từ location.state

  // Helper function to validate seat type selection
  const validateSeatTypeSelection = useCallback((newSeatType: string): boolean => {
    console.log("validateSeatTypeSelection called with:", newSeatType, "current:", selectedSeatType);
    
    if (selectedSeatType === null) {
      return true; // Allow selection if no seats are selected
    }
    
    if (selectedSeatType === newSeatType) {
      return true; // Allow selection if same type
    }
    
    // Different type - show warning message (only if not already shown)
    const seatTypeNames: Record<string, string> = {
      'normal': 'Ghế thường',
      'vip': 'Ghế VIP', 
      'couple': 'Ghế cặp đôi',
      '4dx': 'Ghế 4DX'
    };
    const currentTypeName = seatTypeNames[selectedSeatType] || selectedSeatType;
    const newTypeName = seatTypeNames[newSeatType] || newSeatType;
    
    const messageText = `Bạn chỉ có thể chọn ${currentTypeName}. Vui lòng bỏ chọn ghế ${currentTypeName} trước khi chọn ${newTypeName}.`;
    
    // Only show message if it's different from the last one
    if (lastMessageRef.current !== messageText) {
      console.log("Showing warning message for:", currentTypeName, "->", newTypeName);
      lastMessageRef.current = messageText;
      message.warning(messageText);
    } else {
      console.log("Skipping duplicate message");
    }
    
    return false;
  }, [selectedSeatType]);

  const handleSelectSeat = useCallback((seat: string) => {
    console.log("handleSelectSeat called with seat:", seat);
    const seatType = seatTypeMap[seat];
    
    if (!seatType) {
      message.error("Không thể xác định loại ghế! Vui lòng tải lại trang.");
      return;
    }

    setSelectedSeats((prev) => {
      const isCurrentlySelected = prev.includes(seat);
      
      if (isCurrentlySelected) {
        // Bỏ chọn ghế
        const newSeats = prev.filter((s) => s !== seat);
        // Nếu không còn ghế nào được chọn, reset loại ghế
        if (newSeats.length === 0) {
          setSelectedSeatType(null);
        }
        return newSeats;
      } else {
        // Chọn ghế mới - validate seat type
        if (!validateSeatTypeSelection(seatType)) {
          return prev; // Don't select if validation fails
        }
        
        // Set seat type if this is the first selection
        if (selectedSeatType === null) {
          setSelectedSeatType(seatType);
        }
        
        return [...prev, seat];
      }
    });
  }, [seatTypeMap, validateSeatTypeSelection, selectedSeatType]);

  const handleSelectMultipleSeats = useCallback((seats: string[]) => {
    console.log("handleSelectMultipleSeats called with seats:", seats);
    if (seats.length === 0) return;
    
    const seatType = seatTypeMap[seats[0]]; // Lấy loại ghế từ ghế đầu tiên
    
    if (!seatType) {
      message.error("Không thể xác định loại ghế!");
      return;
    }

    setSelectedSeats((prev) => {
      const isCurrentlySelected = prev.includes(seats[0]);
      
      if (isCurrentlySelected) {
        // Bỏ chọn tất cả ghế trong cặp
        const newSeats = prev.filter((s) => !seats.includes(s));
        // Nếu không còn ghế nào được chọn, reset loại ghế
        if (newSeats.length === 0) {
          setSelectedSeatType(null);
        }
        return newSeats;
      } else {
        // Chọn ghế mới - validate seat type
        if (!validateSeatTypeSelection(seatType)) {
          return prev; // Don't select if validation fails
        }
        
        // Set seat type if this is the first selection
        if (selectedSeatType === null) {
          setSelectedSeatType(seatType);
        }
        
        return [...prev, ...seats];
      }
    });
  }, [seatTypeMap, validateSeatTypeSelection, selectedSeatType]);

  // Callback to update sold seats from API data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSeatsLoaded = (seatData: any) => {
    if (seatData?.seats && seatData?.seatLayout) {
      const apiSeatLayout = seatData.seatLayout;
      const seatsData = seatData.seats || [];
      
      // Tạo map loại ghế sử dụng cùng logic với Seat component
      const typeMap: Record<string, string> = {};
      const occupiedSeats: string[] = [];
      
      // Tạo mapping từ index đến seatId (giống như trong Seat component)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      seatsData.forEach((seatItem: any, index: number) => {
        // Calculate seat position based on index (same logic as Seat component)
        const row = Math.floor(index / apiSeatLayout.cols);
        const col = index % apiSeatLayout.cols;
        const seatId = `${String.fromCharCode(65 + row)}${col + 1}`;
        
        // Lưu loại ghế
        if (seatItem.type) {
          typeMap[seatId] = seatItem.type;
        }
        
        // Lưu ghế đã bán/giữ
        if (seatItem.status === "occupied" || seatItem.status === "reserved") {
          occupiedSeats.push(seatId);
        }
      });
      
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
        />
        <MovieInfo
          movie={{
            ...movie,
            cinema,
            date: date,
            time: displayTime,
            room: room,
            seats: selectedSeats,
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
