export {};

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
}
