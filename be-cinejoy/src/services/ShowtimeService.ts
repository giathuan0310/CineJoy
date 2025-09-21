import { IShowtime, Showtime } from "../models/Showtime";
import ShowSession from "../models/ShowSession";
import SeatModel from "../models/Seat";
import RoomModel from "../models/Room";
import mongoose from "mongoose";

class ShowtimeService {
  private dateKeyUTC(d: Date | string): string {
    const x = new Date(d);
    return `${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, "0")}-${String(x.getUTCDate()).padStart(2, "0")}`;
  }
  async getShowtimes(): Promise<IShowtime[]> {
    try {
      const showtimes = await Showtime.find()
        .populate("movieId", "title")
        .populate("theaterId", "name")
        .populate({
          path: "showTimes.room",
          select: "name"
        })
        .populate({
          path: "showTimes.showSessionId",
          select: "name startTime endTime"
        });
      return showtimes;
    } catch (error) {
      throw error;
    }
  }

  async getShowtimeById(id: string): Promise<IShowtime | null> {
    try {
      const showtime = await Showtime.findById(id)
        .populate("movieId", "title")
        .populate("theaterId", "name")
        .populate({
          path: "showTimes.room",
          select: "name"
        })
        .populate({
          path: "showTimes.showSessionId",
          select: "name startTime endTime"
        });
      return showtime;
    } catch (error) {
      throw error;
    }
  }

  async addShowtime(showtimeData: Partial<IShowtime>): Promise<IShowtime> {
    try {
      if (!showtimeData.movieId || !showtimeData.theaterId || !showtimeData.showTimes || showtimeData.showTimes.length === 0) {
        throw new Error("Thiếu dữ liệu bắt buộc để tạo suất chiếu");
      }

      // Chuẩn hóa mảng showTimes: fill seats nếu thiếu
      const normalizedShowTimes = await Promise.all(
        (showtimeData.showTimes as any[]).map(async (st: any) => {
          if (!st.seats || st.seats.length === 0) {
            const roomSeats = await SeatModel.find({ room: st.room }).select("_id status");
            st.seats = roomSeats.map((s) => ({ seat: s._id as any, status: "available" }));
          }
          return st;
        })
      );

      // Tìm xem đã có document cho cặp movieId + theaterId chưa
      let doc = await Showtime.findOne({ movieId: showtimeData.movieId, theaterId: showtimeData.theaterId });

      if (!doc) {
        // Chưa có → tạo mới một document nhưng vẫn phải validate: tối đa 2 suất/ca và thời gian nằm trong ca
        for (let i = 0; i < normalizedShowTimes.length; i++) {
          const incoming = normalizedShowTimes[i] as any;
          
          // Kiểm tra xem có document nào khác đã có suất chiếu trùng không
          const existingDuplicate = await Showtime.findOne({
            "showTimes.date": { $gte: new Date(incoming.date), $lt: new Date(new Date(incoming.date).getTime() + 24 * 60 * 60 * 1000) },
            "showTimes.room": incoming.room,
            "showTimes.start": { 
              $gte: new Date(new Date(incoming.start).getTime() - 60 * 1000), // -1 phút
              $lte: new Date(new Date(incoming.start).getTime() + 60 * 1000)  // +1 phút
            }
          });
          
          if (existingDuplicate) {
            const roomDoc = await RoomModel.findById(incoming.room).select("name");
            const roomLabel = roomDoc?.name || String(incoming.room);
            const errorMessage = `Suất chiếu này đã tồn tại! Ngày: ${new Date(incoming.date).toLocaleDateString("vi-VN")}, Phòng: ${roomLabel}, Thời gian: ${new Date(incoming.start).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}`;
            throw new Error(errorMessage);
          }
          
          // Tính khung ca
          let sessionStartMin: number | null = null;
          let sessionEndMin: number | null = null;
          let sessionName: string | undefined;
          if (incoming.showSessionId) {
            const session = await ShowSession.findById(incoming.showSessionId);
            if (session) {
              sessionName = session.name;
              const [sh, sm] = session.startTime.split(":").map(Number);
              const [eh, em] = session.endTime.split(":").map(Number);
              sessionStartMin = sh * 60 + sm;
              sessionEndMin = eh * 60 + em;
              if (sessionEndMin <= sessionStartMin) sessionEndMin += 24 * 60;
            }
          }
          if (sessionStartMin === null || sessionEndMin === null) {
            const start = new Date(incoming.start);
            sessionStartMin = start.getHours() * 60 + start.getMinutes();
            sessionEndMin = sessionStartMin + 5 * 60; // fallback
          }

          // Validate start/end nằm trong ca (trừ ca đêm)
          const start = new Date(incoming.start);
          const end = new Date(incoming.end);
          let startMin = start.getHours() * 60 + start.getMinutes();
          let endMin = end.getHours() * 60 + end.getMinutes();
          if (endMin <= startMin) endMin += 24 * 60;
          if (sessionName && !/đêm/i.test(sessionName)) {
            if (startMin < sessionStartMin || startMin >= sessionEndMin) {
              throw new Error("Thời gian bắt đầu không nằm trong khoảng của ca chiếu đã chọn");
            }
            if (endMin > sessionEndMin) {
              throw new Error("Thời gian kết thúc vượt quá thời gian của ca chiếu");
            }
          }

          // Đếm số suất trong cùng ca của cùng ngày/phòng trong batch
          const dateStr = this.dateKeyUTC(incoming.date);
          // Trước đây có kiểm tra giới hạn tối đa 2 suất/ca/phòng trong cùng ngày.
          // Theo yêu cầu hiện tại, bỏ ràng buộc này để cho phép thêm không giới hạn trong một ca.
          // Vẫn giữ nguyên các kiểm tra thời gian hợp lệ và tránh trùng suất chiếu ở phía trên.
          normalizedShowTimes.filter((st: any, idx: number) => {
            if (idx === i) return false;
            const sameDate = this.dateKeyUTC(st.date) === dateStr;
            const sameRoom = st.room.toString() === incoming.room.toString();
            if (!sameDate || !sameRoom) return false;
            const hh = new Date(st.start).getHours();
            const mm = new Date(st.start).getMinutes();
            const stMin = hh * 60 + mm;
            return stMin >= sessionStartMin! && stMin < sessionEndMin!;
          });
        }
        doc = new Showtime({
          movieId: showtimeData.movieId,
          theaterId: showtimeData.theaterId,
          showTimes: normalizedShowTimes,
        } as any);
        await doc.save();
        return doc;
      }

      // Đã có document → gộp các showTimes, tránh thêm trùng
      for (const incoming of normalizedShowTimes) {
        const exists = doc.showTimes.some((st: any) => {
          const sameDate = this.dateKeyUTC(st.date) === this.dateKeyUTC(incoming.date);
          const sameRoom = st.room.toString() === incoming.room.toString();
          const startA = new Date(st.start).getTime();
          const startB = new Date(incoming.start).getTime();
          const sameStart = Math.abs(startA - startB) < 60 * 1000; // 1 phút
          return sameDate && sameRoom && sameStart;
        });

        if (exists) {
          // Nếu đã tồn tại suất chiếu trùng, throw error
          const roomDoc = await RoomModel.findById(incoming.room).select("name");
          const roomLabel = roomDoc?.name || String(incoming.room);
          const errorMessage = `Suất chiếu này đã tồn tại! Ngày: ${new Date(incoming.date).toLocaleDateString("vi-VN")}, Phòng: ${roomLabel}, Thời gian: ${new Date(incoming.start).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}`;
          throw new Error(errorMessage);
        }

        if (!exists) {
          // Kiểm tra giới hạn 2 suất/ca trong ngày/phòng
          // Ưu tiên dùng showSessionId nếu có; nếu không, suy ra theo time range
          let sessionStartMin: number | null = null;
          let sessionEndMin: number | null = null;
          let sessionName: string | undefined;
          if (incoming.showSessionId) {
            const session = await ShowSession.findById(incoming.showSessionId);
            if (session) {
              sessionName = session.name;
              const [sh, sm] = session.startTime.split(":").map(Number);
              const [eh, em] = session.endTime.split(":").map(Number);
              sessionStartMin = sh * 60 + sm;
              sessionEndMin = eh * 60 + em;
              if (sessionEndMin <= sessionStartMin) {
                sessionEndMin += 24 * 60; // qua ngày
              }
            }
          }
          // Nếu không có session, suy ra theo khoảng 5h mặc định quanh giờ bắt đầu (fallback an toàn)
          if (sessionStartMin === null || sessionEndMin === null) {
            const start = new Date(incoming.start);
            sessionStartMin = start.getHours() * 60 + start.getMinutes();
            sessionEndMin = sessionStartMin + 5 * 60;
          }

          const dateStr = this.dateKeyUTC(incoming.date);

          // Validate start/end nằm trong ca (trừ ca đêm)
          const start = new Date(incoming.start);
          const end = new Date(incoming.end);
          let startMin = start.getHours() * 60 + start.getMinutes();
          let endMin = end.getHours() * 60 + end.getMinutes();
          if (endMin <= startMin) endMin += 24 * 60;
          if (sessionName && !/đêm/i.test(sessionName)) {
            if (startMin < (sessionStartMin as number) || startMin >= (sessionEndMin as number)) {
              throw new Error("Thời gian bắt đầu không nằm trong khoảng của ca chiếu đã chọn");
            }
            if (endMin > (sessionEndMin as number)) {
              throw new Error("Thời gian kết thúc vượt quá thời gian của ca chiếu");
            }
          }
          const inThisSession = doc.showTimes.filter((st: any) => {
            const sameDate = this.dateKeyUTC(st.date) === dateStr;
            const sameRoom = st.room.toString() === incoming.room.toString();
            if (!sameDate || !sameRoom) return false;
            let stStart = new Date(st.start);
            let stEnd = new Date(st.end);
            // quy đổi về phút
            let stStartMin = stStart.getHours() * 60 + stStart.getMinutes();
            let stEndMin = stEnd.getHours() * 60 + stEnd.getMinutes();
            if (stEndMin <= stStartMin) stEndMin += 24 * 60;
            return stStartMin >= (sessionStartMin as number) && stStartMin < (sessionEndMin as number);
          });

          // Cộng thêm các incoming khác trong cùng batch thuộc cùng ca
          const alsoIncoming = normalizedShowTimes.filter((st: any) => {
            if (st === incoming) return false;
            const sameDate = this.dateKeyUTC(st.date) === dateStr;
            const sameRoom = st.room.toString() === incoming.room.toString();
            if (!sameDate || !sameRoom) return false;
            const hh = new Date(st.start).getHours();
            const mm = new Date(st.start).getMinutes();
            const startMin = hh * 60 + mm;
            return startMin >= (sessionStartMin as number) && startMin < (sessionEndMin as number);
          });

          // Bỏ giới hạn tối đa 2 suất/ca/phòng. Vẫn tiếp tục thêm suất chiếu nếu không trùng.
          const totalInSession = inThisSession.length + alsoIncoming.length;

          doc.showTimes.push(incoming);
        } else {
          // Nếu đã tồn tại, có thể cập nhật seats nếu doc hiện tại chưa có
          const idx = doc.showTimes.findIndex((st: any) => {
            const sameDate = new Date(st.date).toDateString() === new Date(incoming.date).toDateString();
            const sameRoom = st.room.toString() === incoming.room.toString();
            const sameStart = Math.abs(new Date(st.start).getTime() - new Date(incoming.start).getTime()) < 60 * 1000;
            return sameDate && sameRoom && sameStart;
          });
          if (idx !== -1 && (!doc.showTimes[idx].seats || doc.showTimes[idx].seats.length === 0)) {
            doc.showTimes[idx].seats = incoming.seats;
          }
        }
      }

      await doc.save();
      return doc;
    } catch (error) {
      throw error;
    }
  }

  async updateShowtime(
    id: string,
    showtimeData: Partial<IShowtime>
  ): Promise<IShowtime | null> {
    try {
      // If showTimes updated, ensure seats are present for each new item
      if (Array.isArray((showtimeData as any).showTimes)) {
        const updatedList = await Promise.all(
          (showtimeData as any).showTimes.map(async (st: any) => {
            if (!st.seats || st.seats.length === 0) {
              const roomSeats = await SeatModel.find({ room: st.room }).select("_id status");
              st.seats = roomSeats.map((s) => ({ seat: s._id, status: "available" }));
            }
            return st;
          })
        );
        (showtimeData as any).showTimes = updatedList;
      }

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
        .populate("theaterId", "name")
        .populate({
          path: "showTimes.room",
          select: "name"
        })
        .populate({
          path: "showTimes.showSessionId",
          select: "name startTime endTime"
        });
      return showtimes;
    } catch (error) {
      throw error;
    }
  }

  // Lấy các suất chiếu theo phòng và ngày (lọc trong mảng showTimes)
  async getShowtimesByRoomAndDate(roomId: string, date: string): Promise<{
    showtimeId: string;
    room: string;
    date: string;
    startTime: string;
    endTime: string;
    movieId: string;
  }[]> {
    const items = await Showtime.aggregate([
      { $unwind: "$showTimes" },
      {
        $match: {
          "showTimes.room": new mongoose.Types.ObjectId(roomId),
        },
      },
      {
        $addFields: {
          dateKey: {
            $dateToString: {
              date: "$showTimes.date",
              format: "%Y-%m-%d",
              timezone: "Asia/Ho_Chi_Minh",
            },
          },
        },
      },
      { $match: { dateKey: date } },
      {
        $project: {
          showtimeId: "$_id",
          room: "$showTimes.room",
          date: "$showTimes.date",
          startTime: "$showTimes.start",
          endTime: "$showTimes.end",
          movieId: "$movieId",
        },
      },
      { $sort: { startTime: 1 } },
    ]);
    return items as any;
  }

  async getShowtimesByTheater(theaterId: string): Promise<IShowtime[]> {
    try {
      const showtimes = await Showtime.find({
        theaterId,
      })
        .populate("movieId", "title ageRating genre")
        .populate("theaterId", "name")
        .populate({
          path: "showTimes.room",
          select: "name"
        })
        .populate({
          path: "showTimes.showSessionId",
          select: "name startTime endTime"
        });
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
        .populate("theaterId", "name location")
        .populate({
          path: "showTimes.room",
          select: "name"
        })
        .populate({
          path: "showTimes.showSessionId",
          select: "name startTime endTime"
      });

      if (!showtime) {
        return null;
      }

      // Tìm suất chiếu cụ thể trong array showTimes
      const targetDate = new Date(date);



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
          // Convert UTC time to local time for comparison
          const showTimeHour = showStartTime.getHours(); // Use getHours() instead of getUTCHours()
          const showTimeMin = showStartTime.getMinutes(); // Use getMinutes() instead of getUTCMinutes()
          const [targetHour, targetMin] = startTime.split(":").map(Number);
          timeMatch = showTimeHour === targetHour && showTimeMin === targetMin;

        }

        // So sánh phòng - st.room đã được populate thành object có name
        const roomMatch = room ? (st.room as any)?.name === room : true;


        return dateMatch && timeMatch && roomMatch;
      });


      if (!specificShowtime) {
        // Không tìm thấy suất chiếu phù hợp - trả về null thay vì fake data
        return null;
      }

      // Trả về thông tin ghế cùng với metadata
      let seatData;
      if (!specificShowtime.seats || specificShowtime.seats.length === 0) {
        // Nếu chưa có ghế trong database, tạo ghế mặc định (all available)
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

          const roomMatch = room ? st.room.toString() === room : true;
          return dateMatch && timeMatch && roomMatch;
        });

        if (showtimeIndex !== -1) {
          showtime.showTimes[showtimeIndex].seats = seatData;
          await showtime.save();
        }
      } else {
        // Sử dụng dữ liệu ghế thật từ database
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
        seatLayout: await (async () => {
          const roomLayout = await RoomModel.findById((specificShowtime.room as any)._id).select('seatLayout');
          
          // Check if room has seatLayout, if not, use default values
          if (roomLayout && roomLayout.seatLayout) {
            return {
              rows: roomLayout.seatLayout.rows,
              cols: roomLayout.seatLayout.cols
            };
          } else {
            // Default fallback for old rooms without seatLayout
            return {
              rows: 8,
              cols: 15
            };
          }
        })(),
      };
    } catch (error) {
      throw error;
    }
  }

  // Tạo layout ghế theo hàng (A, B, C, D, E, F, G, H)
  private async generateSeatLayout(seats: any[], roomId: string): Promise<any> {
    
    const layout: any = {};
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];

    // Get room layout from database once
    const room = await RoomModel.findById(roomId).select('seatLayout');
    const seatsPerRow = room?.seatLayout?.cols || 15; // Default to 15 if not found

    // Group seats by row
    for (let i = 0; i < seats.length; i++) {
      const seat = seats[i];
      // Check if we have seat identifier (could be seatId or seat property)
      let seatIdentifier = seat.seatId || seat.seat;
      
      if (!seatIdentifier) {
        continue; // Skip this seat
      }
      
      // If seatIdentifier is ObjectId, generate a default layout
      if (typeof seatIdentifier === 'object' || seatIdentifier.toString().includes('ObjectId') || seatIdentifier.length === 24) {
        // Generate default seat layout based on seat index
        const seatIndex = i;
        
        const rowIndex = Math.floor(seatIndex / seatsPerRow);
        const colIndex = seatIndex % seatsPerRow;
        const row = String.fromCharCode(65 + rowIndex); // A, B, C, D, E, F, G, H
        const seatNumber = colIndex + 1;
        
        if (!layout[row]) {
          layout[row] = [];
        }
        
        layout[row].push({
          seatId: `${row}${seatNumber}`,
          number: seatNumber,
          status: seat.status || "available",
          type: seat.type || "standard",
          price: seat.price || 90000,
        });
        continue;
      }
      
      // Original logic for seatId format like "A1", "B2"
      const seatNumber = parseInt(seatIdentifier.substring(1)); // Extract number from A1, B2, etc.
      const row = seatIdentifier.charAt(0); // Extract letter A, B, C, etc.

      if (!layout[row]) {
        layout[row] = [];
      }

      layout[row].push({
        seatId: seat.seatId,
        number: seatNumber,
        status: seat.status, // available, maintenance
        type: seat.type, // standard, vip, couple
        price: seat.price,
      });
    }

    // Sort seats in each row by number
    Object.keys(layout).forEach((row) => {
      layout[row].sort((a: any, b: any) => a.number - b.number);
    });

    const result = {
      rows: rows.filter((row) => layout[row]), // Only include rows that have seats
      layout: layout,
      totalSeats: seats.length,
      availableSeats: seats.filter((seat) => seat.status === "available")
        .length,
      occupiedSeats: seats.filter((seat) => seat.status === "occupied").length,
    };
    
    
    return result;
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

        const roomMatch = st.room.toString() === room;

        return dateMatch && timeMatch && roomMatch;
      });

      if (showtimeIndex === -1) {
        throw new Error("Không tìm thấy suất chiếu cụ thể");
      }

      // Kiểm tra ghế có sẵn không
      const specificShowtime = showtime.showTimes[showtimeIndex];
      const unavailableSeats: string[] = [];

      seatIds.forEach((seatId) => {
        const seat = specificShowtime.seats.find((s) => s.seat.toString() === seatId);
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
          (s) => s.seat.toString() === seatId
        );
        if (seatIndex !== -1) {
          showtime.showTimes[showtimeIndex].seats[seatIndex].status = status as any;
        }
      });

      await showtime.save();

      return {
        message: "Đặt ghế thành công",
        reservedSeats: seatIds,
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
        const roomMatch = st.room.toString() === room;

        return dateMatch && timeMatch && roomMatch;
      });

      if (showtimeIndex === -1) {
        throw new Error("Không tìm thấy suất chiếu cụ thể");
      }

      // Cập nhật trạng thái ghế về 'available'
      const specificShowtime = showtime.showTimes[showtimeIndex];
      seatIds.forEach((seatId) => {
        const seatIndex = specificShowtime.seats.findIndex(
          (s) => s.seat.toString() === seatId
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
          status: "available", // available, maintenance
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

        const roomMatch = room ? st.room.toString() === room : true;
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
