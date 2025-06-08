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
}
