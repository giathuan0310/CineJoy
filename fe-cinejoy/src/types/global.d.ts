export { };

declare global {
    interface IBackendResponse<T> {
        status?: string | string[];
        message: string;
        error: number | string;
        data?: T;
    }

    interface IUser {
        _id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
        gender: string;
        avatar: string;
        dateOfBirth: string;
        role: string;
        isActive: boolean;
    }
    
    interface IRegister {
        user: IUser;
        accessToken: string;
    }
    interface ILogin {
        user: IUser;
        accessToken: string;
    }

    interface IRefreshToken {
        accessToken: string;
    }

    interface IFetchAccount {
        user: IUser;
    }

    interface IMovie {
        _id: string;
        title: string;
        releaseDate: string; // dạng ISO string, ví dụ "2025-06-07"
        duration: number;
        genre: string[];
        director: string;
        actors: string[];
        language: string[];
        description: string;
        trailer: string;
        status: string;
        image: string;
        posterImage: string;
        ageRating: string;
        reviews: IReview[];
        averageRating: number;
    }

    // Nếu có review:
    interface IReview {
        user: string;
        comment: string;
        rating: number;
        // Thêm các trường khác nếu có
    }

    interface ITheater {
        _id: string;
        name: string;
        regionId: string; // ID của vùng (region)
        location: {
            city: string; // Tên thành phố
            address: string; // Địa chỉ cụ thể
        }

    }

    interface IRegion {
        _id: string;
        name: string; // Tên vùng
    }

    interface IShowtime {
        _id: string;
        movieId: string; // ID của phim
        theaterId: string; // ID của rạp chiếu
        showDate: {
            start: string; // ISO string, ví dụ "2025-06-10T10:00:00Z"
            end: string; // ISO string, ví dụ "2025-06-10T11:36:00Z"
        }
        ; // ISO string, ví dụ "2025-06-10"
        showTime: {
            start: string; // ISO string, ví dụ "2025-06-10T10:00:00Z"
            end: string; // ISO string, ví dụ "2025-06-10T11:36:00Z"
        };
        room: string; // Ví dụ: "Phòng 1"
        seats: ISeat[]; // Danh sách ghế
    }

    interface ISeat {
        seatId: string; // ID ghế, ví dụ: "A1"
        status: string; // Trạng thái, ví dụ: "available", "reserved", "occupied"
        type: string; // Loại ghế, ví dụ: "normal", "VIP"
        price: number; // Giá vé
    }


}
