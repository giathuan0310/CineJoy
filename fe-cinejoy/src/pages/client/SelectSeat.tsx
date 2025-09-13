import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import useAppStore from "@/store/app.store";
import MovieInfo from "@/components/movies/booking_seats/MovieInfo";
import SeatLayout from "@/components/movies/booking_seats/SeatLayout";

export const SelectSeat = () => {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [soldSeats, setSoldSeats] = useState<string[]>([]);

  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useAppStore();
  const { movie, cinema, date, time, room, showtimeId } = location.state || {};

  const displayTime = time;
  const getUtcTimeForApi = (vietnamTime: string) => {
    if (!vietnamTime) return vietnamTime;
    const [hour, minute] = vietnamTime.split(":").map(Number);
    const utcHour = (hour - 7 + 24) % 24; // Subtract 7 hours for UTC
    return `${utcHour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  };

  const utcTimeForApi = getUtcTimeForApi(time);

  const handleSelectSeat = (seat: string) => {
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  // Callback to update sold seats from API data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSeatsLoaded = (seatData: any) => {
    if (seatData?.seats) {
      const occupiedSeats = seatData.seats
        .filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (seat: any) =>
            seat.status === "occupied" || seat.status === "reserved"
        )
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((seat: any) => seat.seatId);
      setSoldSeats(occupiedSeats);
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
          selectedSeatPrice={90000}
          showtimeId={showtimeId}
          date={date}
          startTime={utcTimeForApi}
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
                time: utcTimeForApi,
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
