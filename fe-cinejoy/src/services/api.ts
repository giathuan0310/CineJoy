import createInstanceAxios from 'services/axios.customize';

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

export const registerApi = async (data: { email: string, password: string, fullName: string, dateOfBirth: string, avatar?: string, gender: string, role?: string, phoneNumber: string }) => {
    const response = await axios.post<IBackendResponse<IRegister>>('/v1/api/auth/register', data)
    return response.data;
};

export const loginApi = async (data: { email: string, password: string }) => {
    const response = await axios.post<IBackendResponse<ILogin>>('/v1/api/auth/login', data, {
        headers: {
            delay: 2000
        }
    });
    return response.data;
};

export const logoutApi = async () => {
    const response = await axios.post<IBackendResponse<null>>('/v1/api/auth/logout');
    return response.data;
};

export const forgotPasswordApi = async (data: { email: string }) => {
    const response = await axios.post<IBackendResponse<null>>('/v1/api/auth/forgotPassword', data);
    return response.data;
};

export const verifyOtpApi = async (data: { email: string; otp: string }) => {
    const response = await axios.post<IBackendResponse<null>>('/v1/api/auth/verifyOtp', data);
    return response.data;
};

export const resetPasswordApi = async (data: { email: string; newPassword: string }) => {
    const response = await axios.post<IBackendResponse<null>>('/v1/api/auth/resetPassword', data);
    return response.data;
};

export const fetchAccountApi = async () => {
    const response = await axios.get<IBackendResponse<IFetchAccount>>('/v1/api/auth/account', {
        headers: {
            delay: 1000
        }
    });
    return response.data;
};

export const updateUserApi = async (id: string, data: { fullName?: string; phoneNumber?: string; gender?: string; avatar?: string; dateOfBirth?: string; role?: string; isActive?: boolean, settings?: { darkMode: boolean}}) => {
    const response = await axios.put<IBackendResponse<IUser>>(`/v1/api/user/${id}`, data);
    return response.data;
};

export const uploadAvatarApi = async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);
    const response = await axios.post<IBackendResponse<IUpload | null>>('/v1/api/upload', formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
    });
    return response.data;
};