import { IShowtime, Showtime } from "../models/Showtime";

class ShowtimeService {
  async getShowtimes(): Promise<IShowtime[]> {
    try {
      const showtimes = await Showtime.find()
        .populate("movieId", "title")
        .populate("theaterId", "name");
      return showtimes;
    } catch (error) {
      throw error;
    }
  }

  async getShowtimeById(id: string): Promise<IShowtime | null> {
    try {
      const showtime = await Showtime.findById(id)
        .populate("movieId", "title")
        .populate("theaterId", "name");
      return showtime;
    } catch (error) {
      throw error;
    }
  }

  async addShowtime(showtimeData: Partial<IShowtime>): Promise<IShowtime> {
    try {
      const newShowtime = new Showtime(showtimeData);
      await newShowtime.save();
      return newShowtime;
    } catch (error) {
      throw error;
    }
  }

  async updateShowtime(
    id: string,
    showtimeData: Partial<IShowtime>
  ): Promise<IShowtime | null> {
    try {
      const updatedShowtime = await Showtime.findByIdAndUpdate(
        id,
        showtimeData,
        { new: true }
      );
      return updatedShowtime;
    } catch (error) {
      throw error;
    }
  }

  async deleteShowtime(id: string): Promise<IShowtime | null> {
    try {
      const deletedShowtime = await Showtime.findByIdAndDelete(id);
      return deletedShowtime;
    } catch (error) {
      throw error;
    }
  }

  async getShowtimesByTheaterMovie(
    theaterId: string,
    movieId: string
  ): Promise<IShowtime[]> {
    try {
      const showtimes = await Showtime.find({
        theaterId,
        movieId,
      })
        .populate("movieId", "title")
        .populate("theaterId", "name");
      return showtimes;
    } catch (error) {
      throw error;
    }
  }

  async getShowtimesByTheater(theaterId: string): Promise<IShowtime[]> {
    try {
      const showtimes = await Showtime.find({
        theaterId,
      })
        .populate("movieId", "title ageRating genre")
        .populate("theaterId", "name");
      return showtimes;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách ghế cho suất chiếu cụ thể
  async getSeatsForShowtime(
    showtimeId: string,
    date: string,
    startTime: string,
    room?: string
  ): Promise<any> {
    try {
      const showtime = await Showtime.findById(showtimeId)
        .populate("movieId", "title duration")
        .populate("theaterId", "name location");

      if (!showtime) {
        return null;
      }

      // Tìm suất chiếu cụ thể trong array showTimes
      const targetDate = new Date(date);

      console.log("Target search:", {
        date,
        startTime,
        room,
        targetDate: targetDate.toDateString(),
      });

      const specificShowtime = showtime.showTimes.find((st) => {
        // So sánh ngày
        const showDate = new Date(st.date);
        const targetDate = new Date(date);
        const dateMatch = showDate.toDateString() === targetDate.toDateString();

        // So sánh thời gian
        let timeMatch = false;
        if (startTime.includes("T")) {
          // Nếu startTime là ISO string đầy đủ
          const showStartTime = new Date(st.start);
          const targetStartTime = new Date(startTime);
          timeMatch =
            Math.abs(showStartTime.getTime() - targetStartTime.getTime()) <
            60000;
        } else if (startTime.includes(" ")) {
          // Format 12-hour như "03:00 PM"
          const showStartTime = new Date(st.start);
          const targetTimeStr = `${date} ${startTime}`;
          const targetStartTime = new Date(targetTimeStr);
          timeMatch =
            Math.abs(showStartTime.getTime() - targetStartTime.getTime()) <
            60000;
        } else {
          // Nếu startTime chỉ là thời gian (HH:mm) 24-hour format
          const showStartTime = new Date(st.start);
          const showTimeHour = showStartTime.getUTCHours();
          const showTimeMin = showStartTime.getUTCMinutes();
          const [targetHour, targetMin] = startTime.split(":").map(Number);
          timeMatch = showTimeHour === targetHour && showTimeMin === targetMin;

          console.log("Time comparison details:", {
            showTimeHour,
            showTimeMin,
            targetHour,
            targetMin,
            timeMatch,
          });
        }

        // So sánh phòng
        const roomMatch = room ? st.room === room : true;

        console.log("Comparing showtime:", {
          showDate: showDate.toDateString(),
          targetDate: targetDate.toDateString(),
          dateMatch,
          showStart: st.start,
          targetStart: startTime,
          timeMatch,
          roomMatch,
          room: st.room,
        });

        return dateMatch && timeMatch && roomMatch;
      });

      console.log("Specific showtime found:", specificShowtime ? "YES" : "NO");

      if (!specificShowtime) {
        // Không tìm thấy suất chiếu phù hợp - trả về null thay vì fake data
        console.log("No matching showtime found for the given parameters");
        return null;
      }

      // Trả về thông tin ghế cùng với metadata
      let seatData;
      if (!specificShowtime.seats || specificShowtime.seats.length === 0) {
        // Nếu chưa có ghế trong database, tạo ghế mặc định (all available)
        console.log(
          "No seats in database, generating and saving default available seats"
        );
        seatData = this.generateDefaultSeats();

        // Tự động lưu ghế mặc định vào database
        const showtimeIndex = showtime.showTimes.findIndex((st) => {
          const showDate = new Date(st.date);
          const targetDate = new Date(date);
          const dateMatch =
            showDate.toDateString() === targetDate.toDateString();

          let timeMatch = false;
          if (startTime.includes("T")) {
            const showStartTime = new Date(st.start);
            const targetStartTime = new Date(startTime);
            timeMatch =
              Math.abs(showStartTime.getTime() - targetStartTime.getTime()) <
              60000;
          } else if (startTime.includes(" ")) {
            const showStartTime = new Date(st.start);
            const targetTimeStr = `${date} ${startTime}`;
            const targetStartTime = new Date(targetTimeStr);
            timeMatch =
              Math.abs(showStartTime.getTime() - targetStartTime.getTime()) <
              60000;
          } else {
            const showTimeHour = new Date(st.start).getHours();
            const showTimeMin = new Date(st.start).getMinutes();
            const [targetHour, targetMin] = startTime.split(":").map(Number);
            timeMatch =
              showTimeHour === targetHour && showTimeMin === targetMin;
          }

          const roomMatch = room ? st.room === room : true;
          return dateMatch && timeMatch && roomMatch;
        });

        if (showtimeIndex !== -1) {
          showtime.showTimes[showtimeIndex].seats = seatData;
          await showtime.save();
          console.log("Auto-saved default seats to database");
        }
      } else {
        // Sử dụng dữ liệu ghế thật từ database
        console.log("Using actual seat data from database");
        seatData = specificShowtime.seats;
      }

      return {
        showtimeInfo: {
          _id: showtime._id,
          movie: showtime.movieId,
          theater: showtime.theaterId,
          date: specificShowtime.date,
          startTime: specificShowtime.start,
          endTime: specificShowtime.end,
          room: specificShowtime.room,
        },
        seats: seatData,
        seatLayout: this.generateSeatLayout(seatData),
      };
    } catch (error) {
      throw error;
    }
  }

  // Tạo layout ghế theo hàng (A, B, C, D, E, F, G, H)
  private generateSeatLayout(seats: any[]): any {
    const layout: any = {};
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];

    // Group seats by row
    seats.forEach((seat) => {
      const seatNumber = parseInt(seat.seatId.substring(1)); // Extract number from A1, B2, etc.
      const row = seat.seatId.charAt(0); // Extract letter A, B, C, etc.

      if (!layout[row]) {
        layout[row] = [];
      }

      layout[row].push({
        seatId: seat.seatId,
        number: seatNumber,
        status: seat.status, // available, occupied, selected, reserved
        type: seat.type, // standard, vip, couple
        price: seat.price,
      });
    });

    // Sort seats in each row by number
    Object.keys(layout).forEach((row) => {
      layout[row].sort((a: any, b: any) => a.number - b.number);
    });

    return {
      rows: rows.filter((row) => layout[row]), // Only include rows that have seats
      layout: layout,
      totalSeats: seats.length,
      availableSeats: seats.filter((seat) => seat.status === "available")
        .length,
      occupiedSeats: seats.filter((seat) => seat.status === "occupied").length,
    };
  }

  // Helper method để so sánh thời gian linh hoạt
  private compareTime(showTimeStart: Date, targetTime: string): boolean {
    // Nếu targetTime là ISO string đầy đủ
    if (targetTime.includes("T")) {
      const targetStartTime = new Date(targetTime);
      return (
        Math.abs(showTimeStart.getTime() - targetStartTime.getTime()) < 60000
      );
    }

    // Nếu targetTime chỉ là thời gian (HH:mm) 24-hour format
    if (targetTime.includes(":")) {
      const showTimeHour = showTimeStart.getHours();
      const showTimeMin = showTimeStart.getMinutes();
      const [targetHour, targetMin] = targetTime.split(":").map(Number);
      return showTimeHour === targetHour && showTimeMin === targetMin;
    }

    return false;
  }

  // Helper method để so sánh ngày
  private compareDates(showDate: Date, targetDateStr: string): boolean {
    const showDateStr = new Date(showDate).toDateString();
    const targetDate = new Date(targetDateStr).toDateString();
    return showDateStr === targetDate;
  }

  // Đặt ghế
  async bookSeats(
    showtimeId: string,
    date: string,
    startTime: string,
    room: string,
    seatIds: string[],
    status: "reserved" | "occupied" = "reserved"
  ): Promise<any> {
    try {
      const showtime = await Showtime.findById(showtimeId);
      if (!showtime) {
        throw new Error("Không tìm thấy suất chiếu");
      }

      // Tìm suất chiếu cụ thể
      const targetDate = new Date(date);

      const showtimeIndex = showtime.showTimes.findIndex((st) => {
        const showDate = new Date(st.date).toDateString();
        const targetDateStr = targetDate.toDateString();
        const dateMatch = showDate === targetDateStr;

        // So sánh thời gian
        let timeMatch = false;
        if (startTime.includes("T")) {
          // Nếu startTime là ISO string đầy đủ
          const showStartTime = new Date(st.start);
          const targetStartTime = new Date(startTime);
          timeMatch =
            Math.abs(showStartTime.getTime() - targetStartTime.getTime()) <
            60000;
        } else if (startTime.includes(" ")) {
          // Format 12-hour như "03:00 PM"
          const showStartTime = new Date(st.start);
          const targetTimeStr = `${date} ${startTime}`;
          const targetStartTime = new Date(targetTimeStr);
          timeMatch =
            Math.abs(showStartTime.getTime() - targetStartTime.getTime()) <
            60000;
        } else {
          // Nếu startTime chỉ là thời gian (HH:mm) 24-hour format
          const showStartTime = new Date(st.start);
          const showTimeHour = showStartTime.getUTCHours();
          const showTimeMin = showStartTime.getUTCMinutes();
          const [targetHour, targetMin] = startTime.split(":").map(Number);
          timeMatch = showTimeHour === targetHour && showTimeMin === targetMin;
        }

        const roomMatch = st.room === room;

        return dateMatch && timeMatch && roomMatch;
      });

      if (showtimeIndex === -1) {
        throw new Error("Không tìm thấy suất chiếu cụ thể");
      }

      // Kiểm tra ghế có sẵn không
      const specificShowtime = showtime.showTimes[showtimeIndex];
      const unavailableSeats: string[] = [];

      seatIds.forEach((seatId) => {
        const seat = specificShowtime.seats.find((s) => s.seatId === seatId);
        if (!seat) {
          unavailableSeats.push(seatId + " (không tồn tại)");
        } else if (seat.status !== "available") {
          unavailableSeats.push(seatId + " (đã được đặt)");
        }
      });

      if (unavailableSeats.length > 0) {
        throw new Error(`Ghế không khả dụng: ${unavailableSeats.join(", ")}`);
      }

      // Cập nhật trạng thái ghế thành 'reserved' (tạm giữ) hoặc 'occupied' (đã đặt)
      seatIds.forEach((seatId) => {
        const seatIndex = specificShowtime.seats.findIndex(
          (s) => s.seatId === seatId
        );
        if (seatIndex !== -1) {
          showtime.showTimes[showtimeIndex].seats[seatIndex].status = status;
        }
      });

      await showtime.save();

      return {
        message: "Đặt ghế thành công",
        bookedSeats: seatIds,
        showtimeId: showtimeId,
        reservationTime: new Date(),
        // Reservation expires after 10 minutes
        reservationExpires: new Date(Date.now() + 10 * 60 * 1000),
      };
    } catch (error) {
      throw error;
    }
  }

  // Release ghế (đặt lại trạng thái về available)
  async releaseSeats(
    showtimeId: string,
    date: string,
    startTime: string,
    room: string,
    seatIds: string[]
  ): Promise<any> {
    try {
      const showtime = await Showtime.findById(showtimeId);
      if (!showtime) {
        throw new Error("Không tìm thấy suất chiếu");
      }

      // Tìm suất chiếu cụ thể
      const targetDate = new Date(date);
      const targetStartTime = new Date(startTime);

      const showtimeIndex = showtime.showTimes.findIndex((st) => {
        const showDate = new Date(st.date).toDateString();
        const showStartTime = new Date(st.start).getTime();
        const targetDateStr = targetDate.toDateString();
        const targetTimeMs = targetStartTime.getTime();

        const dateMatch = showDate === targetDateStr;
        const timeMatch = Math.abs(showStartTime - targetTimeMs) < 60000;
        const roomMatch = st.room === room;

        return dateMatch && timeMatch && roomMatch;
      });

      if (showtimeIndex === -1) {
        throw new Error("Không tìm thấy suất chiếu cụ thể");
      }

      // Cập nhật trạng thái ghế về 'available'
      const specificShowtime = showtime.showTimes[showtimeIndex];
      seatIds.forEach((seatId) => {
        const seatIndex = specificShowtime.seats.findIndex(
          (s) => s.seatId === seatId
        );
        if (seatIndex !== -1) {
          showtime.showTimes[showtimeIndex].seats[seatIndex].status =
            "available";
        }
      });

      await showtime.save();

      return {
        message: "Release ghế thành công",
        releasedSeats: seatIds,
        showtimeId: showtimeId,
        releaseTime: new Date(),
      };
    } catch (error) {
      throw error;
    }
  }

  // Tạo dữ liệu ghế mặc định khi seats array rỗng
  private generateDefaultSeats(): any[] {
    const seats: any[] = [];
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const seatsPerRow = 10;

    rows.forEach((row) => {
      for (let i = 1; i <= seatsPerRow; i++) {
        const seatId = `${row}${i}`;
        let seatType = "standard";
        let price = 75000;

        // VIP seats (rows E, F, G, H)
        if (["E", "F", "G", "H"].includes(row)) {
          seatType = "vip";
          price = 100000;
        }

        // Couple seats (middle seats in VIP rows)
        if (["F", "G"].includes(row) && [4, 5, 6, 7].includes(i)) {
          seatType = "couple";
          price = 150000;
        }

        seats.push({
          seatId,
          status: "available", // available,  , selected, reserved
          type: seatType,
          price,
        });
      }
    });

    // All seats are available by default
    return seats;
  }

  // Method để khởi tạo ghế vào database cho một showtime cụ thể
  async initializeSeatsForShowtime(
    showtimeId: string,
    date: string,
    startTime: string,
    room?: string
  ): Promise<boolean> {
    try {
      const showtime = await Showtime.findById(showtimeId);
      if (!showtime) {
        throw new Error("Không tìm thấy suất chiếu");
      }

      // Tìm showtime cụ thể trong array
      const showtimeIndex = showtime.showTimes.findIndex((st) => {
        const showDate = new Date(st.date);
        const targetDate = new Date(date);
        const dateMatch = showDate.toDateString() === targetDate.toDateString();

        let timeMatch = false;
        if (startTime.includes("T")) {
          const showStartTime = new Date(st.start);
          const targetStartTime = new Date(startTime);
          timeMatch =
            Math.abs(showStartTime.getTime() - targetStartTime.getTime()) <
            60000;
        } else if (startTime.includes(" ")) {
          const showStartTime = new Date(st.start);
          const targetTimeStr = `${date} ${startTime}`;
          const targetStartTime = new Date(targetTimeStr);
          timeMatch =
            Math.abs(showStartTime.getTime() - targetStartTime.getTime()) <
            60000;
        } else {
          const showTimeHour = new Date(st.start).getHours();
          const showTimeMin = new Date(st.start).getMinutes();
          const [targetHour, targetMin] = startTime.split(":").map(Number);
          timeMatch = showTimeHour === targetHour && showTimeMin === targetMin;
        }

        const roomMatch = room ? st.room === room : true;
        return dateMatch && timeMatch && roomMatch;
      });

      if (showtimeIndex === -1) {
        throw new Error("Không tìm thấy suất chiếu cụ thể");
      }

      // Nếu đã có ghế thì không khởi tạo lại
      if (
        showtime.showTimes[showtimeIndex].seats &&
        showtime.showTimes[showtimeIndex].seats.length > 0
      ) {
        return true;
      }

      // Tạo dữ liệu ghế mặc định
      const defaultSeats = this.generateDefaultSeats();
      showtime.showTimes[showtimeIndex].seats = defaultSeats;

      await showtime.save();
      console.log(
        `Initialized ${defaultSeats.length} seats for showtime ${showtimeId}`
      );
      return true;
    } catch (error) {
      console.error("Error initializing seats:", error);
      throw error;
    }
  }
}

export default ShowtimeService;
