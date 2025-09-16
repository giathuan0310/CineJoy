import { Request, Response } from 'express';
import RoomService from '../services/RoomService';
import { successResponse as createSuccessResponse, errorResponse as createErrorResponse } from '../utils/apiResponse';

// Helper functions for sending responses
const successResponse = (res: Response, statusCode: number, message: string, data?: any) => {
    res.status(statusCode).json(createSuccessResponse(message, data));
};

const errorResponse = (res: Response, statusCode: number, message: string) => {
    res.status(statusCode).json(createErrorResponse(message, statusCode));
};

class RoomController {
    // Get all rooms
    async getAllRooms(req: Request, res: Response) {
        try {
            const rooms = await RoomService.getAllRooms();
            successResponse(res, 200, 'Lấy danh sách phòng chiếu thành công', rooms);
        } catch (error: unknown) {
            console.error('Lỗi khi lấy danh sách phòng chiếu:', error);
            errorResponse(res, 500, 'Lỗi server khi lấy danh sách phòng chiếu');
        }
    }

    // Get rooms by theater
    async getRoomsByTheater(req: Request, res: Response) {
        try {
            const { theaterId } = req.params;
            const rooms = await RoomService.getRoomsByTheater(theaterId);
 successResponse(res, 200, 'Lấy danh sách phòng chiếu theo rạp thành công', rooms);
        } catch (error: unknown) {
            console.error('Lỗi khi lấy danh sách phòng chiếu theo rạp:', error);
 errorResponse(res, 500, 'Lỗi server khi lấy danh sách phòng chiếu theo rạp');
        }
    }

    // Get room by ID
    async getRoomById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const room = await RoomService.getRoomById(id);
            
            if (!room) {
 errorResponse(res, 404, 'Không tìm thấy phòng chiếu');
            }
            
 successResponse(res, 200, 'Lấy thông tin phòng chiếu thành công', room);
        } catch (error: unknown) {
            console.error('Lỗi khi lấy thông tin phòng chiếu:', error);
 errorResponse(res, 500, 'Lỗi server khi lấy thông tin phòng chiếu');
        }
    }

    // Create new room
    async createRoom(req: Request, res: Response) {
        try {
            const { name, theater, capacity, roomType, status, description, seatLayout } = req.body;

            // Validate required fields
            if (!name || !theater || !capacity) {
 errorResponse(res, 400, 'Vui lòng cung cấp đầy đủ thông tin phòng chiếu');
            }

            // Check if room name already exists in this theater
            const isNameExists = await RoomService.isRoomNameExists(theater, name);
            if (isNameExists) {
 errorResponse(res, 400, 'Tên phòng chiếu đã tồn tại trong rạp này');
            }

            const roomData = {
                name,
                theater,
                capacity,
                roomType: roomType || 'Standard',
                status: status || 'active',
                description,
                seatLayout // ✅ Include seatLayout in roomData
            };

            console.log('🎬 Creating room with data:', roomData);
            console.log('🎯 SeatLayout received:', seatLayout);
            console.log('🎯 SeatLayout type:', typeof seatLayout);
            console.log('🎯 SeatLayout details:', seatLayout ? {
                rows: seatLayout.rows,
                cols: seatLayout.cols,
                seatsCount: Object.keys(seatLayout.seats || {}).length
            } : 'null/undefined');
            const newRoom = await RoomService.createRoom(roomData);
            console.log('Room created successfully:', newRoom._id);
 successResponse(res, 201, 'Tạo phòng chiếu thành công', newRoom);
        } catch (error: unknown) {
            console.error('Lỗi khi tạo phòng chiếu:', error);
            
            if (error instanceof Error && error.message.includes('validation')) {
                return errorResponse(res, 400, 'Dữ liệu phòng chiếu không hợp lệ');
            }
            
            return errorResponse(res, 500, 'Lỗi server khi tạo phòng chiếu');
        }
    }

    // Update room
    async updateRoom(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { name, theater, capacity, roomType, status, description } = req.body;

            // Check if room exists
            const existingRoom = await RoomService.getRoomById(id);
            if (!existingRoom) {
 errorResponse(res, 404, 'Không tìm thấy phòng chiếu');
            }

            // Check if new name already exists (excluding current room)
            if (name && theater) {
                const isNameExists = await RoomService.isRoomNameExists(theater, name, id);
                if (isNameExists) {
 errorResponse(res, 400, 'Tên phòng chiếu đã tồn tại trong rạp này');
                }
            }

            const updateData = {
                ...(name && { name }),
                ...(theater && { theater }),
                ...(capacity && { capacity }),
                ...(roomType && { roomType }),
                ...(status && { status }),
                ...(description !== undefined && { description })
            };

            const updatedRoom = await RoomService.updateRoom(id, updateData);
 successResponse(res, 200, 'Cập nhật phòng chiếu thành công', updatedRoom);
        } catch (error: unknown) {
            console.error('Lỗi khi cập nhật phòng chiếu:', error);
            
            if (error instanceof Error && error.message.includes('validation')) {
 errorResponse(res, 400, 'Dữ liệu phòng chiếu không hợp lệ');
            }
            
 errorResponse(res, 500, 'Lỗi server khi cập nhật phòng chiếu');
        }
    }

    // Delete room
    async deleteRoom(req: Request, res: Response) {
        try {
            const { id } = req.params;

            // Check if room exists
            const existingRoom = await RoomService.getRoomById(id);
            if (!existingRoom) {
                return errorResponse(res, 404, 'Không tìm thấy phòng chiếu');
            }

            const isDeleted = await RoomService.deleteRoom(id);
            
            if (isDeleted) {
                return successResponse(res, 200, 'Xóa phòng chiếu thành công');
            } else {
                return errorResponse(res, 500, 'Không thể xóa phòng chiếu');
            }
        } catch (error: unknown) {
            console.error('Lỗi khi xóa phòng chiếu:', error);
            return errorResponse(res, 500, 'Lỗi server khi xóa phòng chiếu');
        }
    }

    // Get active rooms by theater
    async getActiveRoomsByTheater(req: Request, res: Response) {
        try {
            const { theaterId } = req.params;
            const rooms = await RoomService.getActiveRoomsByTheater(theaterId);
 successResponse(res, 200, 'Lấy danh sách phòng chiếu hoạt động thành công', rooms);
        } catch (error: unknown) {
            console.error('Lỗi khi lấy danh sách phòng chiếu hoạt động:', error);
 errorResponse(res, 500, 'Lỗi server khi lấy danh sách phòng chiếu hoạt động');
        }
    }
}

export default new RoomController();
