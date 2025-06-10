export { };

declare global {
    interface IBackendResponse<T> {
        status?: string | string[];
        message: string;
        errorCode: number | string;
        data?: T;
    }

    interface IRegister {
        _id: string;
        email: string;
        fullName: string;
    }

    interface ILogin {
        accessToken: string;
        refreshToken: string;
        user: {
            email: string;
            phone: string;
            fullName: string;
            role: string;
            avatar: string;
            id: string;
        }
    }

    interface IRefreshToken {
        accessToken: string;
    }

    interface IUser {
        email: string;
        phone: string;
        fullName: string;
        role: string;
        avatar: string;
        id: string;
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
        showTimes: Array<{
            date: string;
            start: string;
            end: string;
            room: string;
            seats: ISeat[];
            _id: string; // ID suất chiếu
        }>;
    }

    interface ISeat {
        seatId: string; // ID ghế, ví dụ: "A1"
        status: string; // Trạng thái, ví dụ: "available", "reserved", "occupied"
        type: string; // Loại ghế, ví dụ: "normal", "VIP"
        price: number; // Giá vé
    }



    // Voucher
    interface IVoucher {
        _id: string;
        name: string;
        validityPeriod: {
            startDate: string;
            endDate: string;
        };
        quantity: number;
    }


    // Blog
    interface IBlog {
        _id: string;
        title: string;
        postedDate: string;
        content: string;
        image: string;
    }

    // FoodCombo
    interface IFoodCombo {
        _id: string;
        name: string;
        price: number;
    }

    // Region
    interface IRegion {
        _id: string;
        regionId: string;
        name: string;
    }





    // Seat & Showtime
    interface ISeat {
        seatId: string;
        status: string;
        type: string;
        price: number;
    }



    interface IOrder {
        _id: string;
        tenNguoiDung: string;
        createdAt: string;
        tongTien: number;
        trangThaiDonHang: string;
        trangThaiThanhToan: string;
    }
}
