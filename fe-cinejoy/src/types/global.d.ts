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
        settings: {
            darkMode: boolean;
        }
        point?: number;
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

    interface IUpload {
        url: string;
        filename: string;
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
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
        movieId: IMovie;
        theaterId: ITheater;
        showDate: {
            start: string;
            end: string;
        };
        showTimes: Array<{
            date: string;
            start: string;
            end: string;
            room: string;
            seats: Array<{
                seatId: string;
                status: string;
                type: string;
                price: number;
            }>;
        }>;
    }

    interface ISeat {
        _id: string;
        row: string;
        number: number;
        status: 'available' | 'reserved' | 'sold';
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




