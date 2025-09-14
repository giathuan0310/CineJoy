import { Request, Response } from 'express';
import SeatService from '../services/SeatService';
import { successResponse as createSuccessResponse, errorResponse as createErrorResponse } from '../utils/apiResponse';

// Helper functions for sending responses
const successResponse = (res: Response, statusCode: number, message: string, data?: any) => {
    res.status(statusCode).json(createSuccessResponse(message, data));
};

const errorResponse = (res: Response, statusCode: number, message: string) => {
    res.status(statusCode).json(createErrorResponse(message, statusCode));
};

class SeatController {
    // Get all seats
    async getAllSeats(req: Request, res: Response) {
        try {
            const seats = await SeatService.getAllSeats();
 successResponse(res, 200, 'Lấy danh sách ghế ngồi thành công', seats);
        } catch (error: unknown) {
            console.error('Lỗi khi lấy danh sách ghế ngồi:', error);
 errorResponse(res, 500, 'Lỗi server khi lấy danh sách ghế ngồi');
        }
    }

    // Get seats by room
    async getSeatsByRoom(req: Request, res: Response) {
        try {
            const { roomId } = req.params;
            const seats = await SeatService.getSeatsByRoom(roomId);
 successResponse(res, 200, 'Lấy danh sách ghế ngồi theo phòng thành công', seats);
        } catch (error: unknown) {
            console.error('Lỗi khi lấy danh sách ghế ngồi theo phòng:', error);
 errorResponse(res, 500, 'Lỗi server khi lấy danh sách ghế ngồi theo phòng');
        }
    }

    // Get seat by ID
    async getSeatById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const seat = await SeatService.getSeatById(id);
            
            if (!seat) {
 errorResponse(res, 404, 'Không tìm thấy ghế ngồi');
            }
            
 successResponse(res, 200, 'Lấy thông tin ghế ngồi thành công', seat);
        } catch (error: unknown) {
            console.error('Lỗi khi lấy thông tin ghế ngồi:', error);
 errorResponse(res, 500, 'Lỗi server khi lấy thông tin ghế ngồi');
        }
    }

    // Create new seat
    async createSeat(req: Request, res: Response) {
        try {
            const { seatId, room, row, number, type, price, status, position } = req.body;

            // Validate required fields
            if (!room || !row || !number || !position) {
 errorResponse(res, 400, 'Vui lòng cung cấp đầy đủ thông tin ghế ngồi');
            }

            // Check if seat ID already exists in this room
            const generatedSeatId = seatId || `${row}${number}`;
            const isSeatExists = await SeatService.isSeatIdExists(room, generatedSeatId);
            if (isSeatExists) {
 errorResponse(res, 400, 'Ghế ngồi đã tồn tại trong phòng này');
            }

            const seatData = {
                seatId: generatedSeatId,
                room,
                row,
                number,
                type: type || 'normal',
                price: price || 75000,
                status: status || 'available',
                position
            };

            const newSeat = await SeatService.createSeat(seatData);
 successResponse(res, 201, 'Tạo ghế ngồi thành công', newSeat);
        } catch (error: unknown) {
            console.error('Lỗi khi tạo ghế ngồi:', error);
            
            if (error instanceof Error && error.message.includes('validation')) {
 errorResponse(res, 400, 'Dữ liệu ghế ngồi không hợp lệ');
            }
            
 errorResponse(res, 500, 'Lỗi server khi tạo ghế ngồi');
        }
    }

    // Create multiple seats
    async createMultipleSeats(req: Request, res: Response) {
        try {
            const { seats } = req.body;

            if (!seats || !Array.isArray(seats) || seats.length === 0) {
 errorResponse(res, 400, 'Vui lòng cung cấp danh sách ghế ngồi');
            }

            const newSeats = await SeatService.createMultipleSeats(seats);
 successResponse(res, 201, 'Tạo ghế ngồi hàng loạt thành công', newSeats);
        } catch (error: unknown) {
            console.error('Lỗi khi tạo ghế ngồi hàng loạt:', error);
            
            if (error instanceof Error && error.message.includes('duplicate')) {
 errorResponse(res, 400, 'Một số ghế ngồi đã tồn tại');
            }
            
 errorResponse(res, 500, 'Lỗi server khi tạo ghế ngồi hàng loạt');
        }
    }

    // Generate seat layout
    async generateSeatLayout(req: Request, res: Response) {
        try {
            const { roomId } = req.params;
            const { rows, seatsPerRow, seatTypes } = req.body;

            if (!rows || !Array.isArray(rows) || rows.length === 0) {
 errorResponse(res, 400, 'Vui lòng cung cấp danh sách hàng ghế');
            }

            if (!seatsPerRow || !Array.isArray(seatsPerRow) || seatsPerRow.length === 0) {
 errorResponse(res, 400, 'Vui lòng cung cấp số ghế cho mỗi hàng');
            }

            // Delete existing seats in room first
            await SeatService.deleteAllSeatsInRoom(roomId);

            // Generate new seat layout
            const seats = await SeatService.generateSeatLayout(roomId, rows, seatsPerRow, seatTypes || {});
            
 successResponse(res, 201, 'Tạo bố cục ghế ngồi thành công', seats);
        } catch (error: unknown) {
            console.error('Lỗi khi tạo bố cục ghế ngồi:', error);
 errorResponse(res, 500, 'Lỗi server khi tạo bố cục ghế ngồi');
        }
    }

    // Update seat
    async updateSeat(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { seatId, room, row, number, type, price, status, position } = req.body;

            // Check if seat exists
            const existingSeat = await SeatService.getSeatById(id);
            if (!existingSeat) {
 errorResponse(res, 404, 'Không tìm thấy ghế ngồi');
            }

            // Check if new seat ID already exists (excluding current seat)
            if (seatId && room) {
                const isSeatExists = await SeatService.isSeatIdExists(room, seatId, id);
                if (isSeatExists) {
 errorResponse(res, 400, 'Ghế ngồi đã tồn tại trong phòng này');
                }
            }

            const updateData = {
                ...(seatId && { seatId }),
                ...(room && { room }),
                ...(row && { row }),
                ...(number && { number }),
                ...(type && { type }),
                ...(price !== undefined && { price }),
                ...(status && { status }),
                ...(position && { position })
            };

            const updatedSeat = await SeatService.updateSeat(id, updateData);
 successResponse(res, 200, 'Cập nhật ghế ngồi thành công', updatedSeat);
        } catch (error: unknown) {
            console.error('Lỗi khi cập nhật ghế ngồi:', error);
            
            if (error instanceof Error && error.message.includes('validation')) {
 errorResponse(res, 400, 'Dữ liệu ghế ngồi không hợp lệ');
            }
            
 errorResponse(res, 500, 'Lỗi server khi cập nhật ghế ngồi');
        }
    }

    // Delete seat
    async deleteSeat(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Check if seat exists
            const existingSeat = await SeatService.getSeatById(id);
            if (!existingSeat) {
 errorResponse(res, 404, 'Không tìm thấy ghế ngồi');
            }

            const isDeleted = await SeatService.deleteSeat(id);
            
            if (isDeleted) {
 successResponse(res, 200, 'Xóa ghế ngồi thành công');
            } else {
 errorResponse(res, 500, 'Không thể xóa ghế ngồi');
            }
        } catch (error: unknown) {
            console.error('Lỗi khi xóa ghế ngồi:', error);
 errorResponse(res, 500, 'Lỗi server khi xóa ghế ngồi');
        }
    }

    // Delete all seats in room
    async deleteAllSeatsInRoom(req: Request, res: Response) {
        try {
            const { roomId } = req.params;

            const isDeleted = await SeatService.deleteAllSeatsInRoom(roomId);
            
            if (isDeleted) {
 successResponse(res, 200, 'Xóa tất cả ghế trong phòng thành công');
            } else {
 successResponse(res, 200, 'Không có ghế nào để xóa trong phòng này');
            }
        } catch (error: unknown) {
            console.error('Lỗi khi xóa tất cả ghế trong phòng:', error);
 errorResponse(res, 500, 'Lỗi server khi xóa tất cả ghế trong phòng');
        }
    }

    // Get seat statistics for a room
    async getSeatStatistics(req: Request, res: Response) {
        try {
            const { roomId } = req.params;
            const statistics = await SeatService.getSeatStatistics(roomId);
 successResponse(res, 200, 'Lấy thống kê ghế ngồi thành công', statistics);
        } catch (error: unknown) {
            console.error('Lỗi khi lấy thống kê ghế ngồi:', error);
 errorResponse(res, 500, 'Lỗi server khi lấy thống kê ghế ngồi');
        }
    }
}

export default new SeatController();
