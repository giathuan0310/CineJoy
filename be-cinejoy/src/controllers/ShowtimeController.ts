import { Request, Response } from "express";
import ShowtimeService from "../services/ShowtimeService";
const showtimeService = new ShowtimeService();

export default class ShowtimeController {
  async getShowtimes(req: Request, res: Response): Promise<void> {
    try {
      const showtimes = await showtimeService.getShowtimes();
      res.status(200).json(showtimes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching showtimes", error });
    }
  }

  async getShowtimeById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const showtime = await showtimeService.getShowtimeById(id);
      if (!showtime) {
        res.status(404).json({ message: "Showtime not found" });
        return;
      }
      res.status(200).json(showtime);
    } catch (error) {
      res.status(500).json({ message: "Error fetching showtime", error });
    }
  }

  async addShowtime(req: Request, res: Response): Promise<void> {
    try {
      const newShowtime = await showtimeService.addShowtime(req.body);
      res.status(201).json(newShowtime);
    } catch (error) {
      res.status(500).json({ message: "Error adding showtime", error });
    }
  }

  async updateShowtime(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const updatedShowtime = await showtimeService.updateShowtime(
        id,
        req.body
      );
      if (!updatedShowtime) {
        res.status(404).json({ message: "Showtime not found" });
        return;
      }
      res.status(200).json(updatedShowtime);
    } catch (error) {
      res.status(500).json({ message: "Error updating showtime", error });
    }
  }

  async deleteShowtime(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    try {
      const deletedShowtime = await showtimeService.deleteShowtime(id);
      if (!deletedShowtime) {
        res.status(404).json({ message: "Showtime not found" });
        return;
      }
      res.status(200).json({ message: "Showtime deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting showtime", error });
    }
  }

  async getShowtimesByTheaterMovie(req: Request, res: Response): Promise<void> {
    const { theaterId, movieId } = req.query;
    if (!theaterId || !movieId) {
      res
        .status(400)
        .json({ message: "Missing theaterId, movieId, or showDate" });
      return;
    }
    try {
      const showtimes = await showtimeService.getShowtimesByTheaterMovie(
        theaterId as string,
        movieId as string
      );
      res.status(200).json(showtimes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching showtimes", error });
    }
  }

  async getShowtimesByTheater(req: Request, res: Response): Promise<void> {
    const { theaterId } = req.params;
    if (!theaterId) {
      res.status(400).json({ message: "Missing theaterId" });
      return;
    }
    try {
      const showtimes = await showtimeService.getShowtimesByTheater(
        theaterId as string
      );
      res.status(200).json(showtimes);
    } catch (error) {
      res.status(500).json({ message: "Error fetching showtimes", error });
    }
  }

  // Lấy danh sách ghế theo suất chiếu cụ thể
  async getSeatsForShowtime(req: Request, res: Response): Promise<void> {
    try {
      const { id: showtimeId } = req.params;
      const { date, startTime, room } = req.query;

      console.log("Controller received params:", {
        showtimeId,
        date,
        startTime,
        room,
      });

      if (!showtimeId) {
        res.status(400).json({
          status: false,
          error: 400,
          message: "Thiếu thông tin showtimeId",
          data: null,
        });
        return;
      }

      if (!date || !startTime) {
        res.status(400).json({
          status: false,
          error: 400,
          message: "Thiếu thông tin date hoặc startTime",
          data: null,
        });
        return;
      }

      const seats = await showtimeService.getSeatsForShowtime(
        showtimeId as string,
        date as string,
        startTime as string,
        room as string
      );

      if (!seats) {
        res.status(404).json({
          status: false,
          error: 404,
          message: "Không tìm thấy suất chiếu",
          data: null,
        });
        return;
      }

      res.status(200).json({
        status: true,
        error: 0,
        message: "Lấy danh sách ghế thành công",
        data: seats,
      });
    } catch (error) {
      console.error("Get seats for showtime error:", error);
      res.status(500).json({
        status: false,
        error: 500,
        message: "Lỗi server",
        data: null,
      });
    }
  }

  // Đặt ghế (cập nhật trạng thái ghế)
  async bookSeats(req: Request, res: Response): Promise<void> {
    try {
      const { id: showtimeId } = req.params;
      const { date, startTime, room, seats } = req.body;

      console.log("BookSeats controller received:", {
        showtimeId,
        date,
        startTime,
        room,
        seats,
      });

      if (
        !showtimeId ||
        !date ||
        !startTime ||
        !seats ||
        !Array.isArray(seats)
      ) {
        res.status(400).json({
          status: false,
          error: 400,
          message: "Thiếu thông tin bắt buộc",
          data: null,
        });
        return;
      }

      const result = await showtimeService.bookSeats(
        showtimeId,
        date,
        startTime,
        room as string,
        seats.map((seat: any) => seat.seatNumber)
      );

      if (!result) {
        res.status(404).json({
          status: false,
          error: 404,
          message: "Không thể đặt ghế",
          data: null,
        });
        return;
      }

      res.status(200).json({
        status: true,
        error: 0,
        message: "Đặt ghế thành công",
        data: result,
      });
    } catch (error) {
      console.error("Book seats error:", error);
      res.status(500).json({
        status: false,
        error: 500,
        message: error instanceof Error ? error.message : "Lỗi server",
        data: null,
      });
    }
  }

  // Khởi tạo ghế cho showtime
  async initializeSeats(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { date, startTime, room } = req.body;

      if (!date || !startTime) {
        res.status(400).json({
          status: false,
          error: 1,
          message: "Thiếu thông tin ngày và giờ bắt đầu",
          data: null,
        });
        return;
      }

      const result = await showtimeService.initializeSeatsForShowtime(
        id,
        date,
        startTime,
        room
      );

      res.status(200).json({
        status: true,
        error: 0,
        message: "Khởi tạo ghế thành công",
        data: { initialized: result },
      });
    } catch (error: any) {
      console.error("Error initializing seats:", error);
      res.status(500).json({
        status: false,
        error: 1,
        message: error.message || "Lỗi khởi tạo ghế",
        data: null,
      });
    }
  }
}
