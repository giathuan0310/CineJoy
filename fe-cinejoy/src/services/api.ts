import createInstanceAxios from "services/axios.customize";

const axios = createInstanceAxios(import.meta.env.VITE_BACKEND_URL);

export const registerApi = async (data: {
  email: string;
  password: string;
  fullName: string;
  dateOfBirth: string;
  avatar?: string;
  gender: string;
  role?: string;
  phoneNumber: string;
}) => {
  const response = await axios.post<IBackendResponse<IRegister>>(
    "/v1/api/auth/register",
    data
  );
  return response.data;
};

export const loginApi = async (data: { email: string; password: string }) => {
  const response = await axios.post<IBackendResponse<ILogin>>(
    "/v1/api/auth/login",
    data,
    {
      headers: {
        delay: 2000,
      },
    }
  );
  return response.data;
};

export const logoutApi = async () => {
  const response = await axios.post<IBackendResponse<null>>(
    "/v1/api/auth/logout"
  );
  return response.data;
};

export const forgotPasswordApi = async (data: { email: string }) => {
  const response = await axios.post<IBackendResponse<null>>(
    "/v1/api/auth/forgotPassword",
    data
  );
  return response.data;
};

export const verifyOtpApi = async (data: { email: string; otp: string }) => {
  const response = await axios.post<IBackendResponse<null>>(
    "/v1/api/auth/verifyOtp",
    data
  );
  return response.data;
};

export const resetPasswordApi = async (data: {
  email: string;
  newPassword: string;
}) => {
  const response = await axios.post<IBackendResponse<null>>(
    "/v1/api/auth/resetPassword",
    data
  );
  return response.data;
};

export const fetchAccountApi = async () => {
  const response = await axios.get<IBackendResponse<IFetchAccount>>(
    "/v1/api/auth/account",
    {
      headers: {
        delay: 1000,
      },
    }
  );
  return response.data;
};

export const getAllUsersApi = async () => {
  const response = await axios.get<IBackendResponse<IUser[]>>(
    "/v1/api/user"
  );
  return response.data;
};

export const getUserByIdApi = async (id: string) => {
  const response = await axios.get<IBackendResponse<IUser>>(
    `/v1/api/user/${id}`
  );
  return response.data;
};

export const createUserApi = async (data: {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  gender: string;
  avatar: string;
  dateOfBirth: string;
  role: string;
  isActive?: boolean;
}) => {
  const response = await axios.post<IBackendResponse<IUser>>(
    "/v1/api/user",
    data
  );
  return response.data;
};

export const updateUserApi = async (
  id: string,
  data: {
    fullName?: string;
    phoneNumber?: string;
    gender?: string;
    avatar?: string;
    dateOfBirth?: string;
    role?: string;
    isActive?: boolean;
    settings?: { darkMode: boolean };
  }
) => {
  const response = await axios.put<IBackendResponse<IUser>>(
    `/v1/api/user/${id}`,
    data
  );
  return response.data;
};

export const deleteUserApi = async (id: string) => {
  const response = await axios.delete<IBackendResponse<null>>(
    `/v1/api/user/${id}`
  );
  return response.data;
};

export const uploadAvatarApi = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await axios.post<IBackendResponse<IUpload | null>>(
    "/v1/api/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    }
  );
  return response.data;
};

export const getMyVouchersApi = async () => {
  const response = await axios.get<IBackendResponse<IUserVoucher[]>>(
    "/vouchers/my-vouchers"
  );
  return response.data;
};

export const redeemVoucherApi = async (voucherId: string) => {
  const response = await axios.post<IBackendResponse<IUserVoucher>>(
    "/vouchers/redeem",
    {
      voucherId,
    }
  );
  return response.data;
};

export const searchMoviesApi = async (keyword: string) => {
  const response = await axios.get<IBackendResponse<IMovie[]>>(
    `/movies/search?q=${keyword}`
  );
  return response.data;
};

export const validateVoucherApi = async (code: string, userId?: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const response = await axios.post<IBackendResponse<any>>(
    "/v1/user-vouchers/validate",
    {
      code,
      userId,
    }
  );
  return response.data;
};

export const applyVoucherApi = async (
  code: string,
  orderTotal: number,
  userId?: string
) => {
  const response = await axios.post<
    IBackendResponse<{
      discountAmount: number;
      finalTotal: number;
      userVoucherId: string;
    }>
  >("/v1/user-vouchers/apply", { code, orderTotal, userId });
  return response.data;
};

export const markVoucherAsUsedApi = async (
  code?: string,
  userVoucherId?: string
) => {
  const response = await axios.put<IBackendResponse<unknown>>(
    "/v1/user-vouchers/mark-used",
    {
      code,
      userVoucherId,
    }
  );
  return response.data;
};
