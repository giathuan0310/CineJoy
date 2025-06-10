import axiosClient from "./axiosClient";


export const getVouchers = async (): Promise<IVoucher[]> => {
    const res = await axiosClient.get<IVoucher[]>("/vouchers");
    return res.data;
};

export const getVoucherById = async (id: string): Promise<IVoucher> => {
    const res = await axiosClient.get<IVoucher>(`/vouchers/${id}`);
    return res.data;
};

export const addVoucher = async (voucher: IVoucher): Promise<IVoucher> => {
    const res = await axiosClient.post<IVoucher>("/vouchers", voucher);
    return res.data;
};

export const updateVoucher = async (id: string, voucher: IVoucher): Promise<IVoucher> => {
    const res = await axiosClient.put<IVoucher>(`/vouchers/${id}`, voucher);
    return res.data;
};

export const deleteVoucher = async (id: string): Promise<{ message: string }> => {
    const res = await axiosClient.delete<{ message: string }>(`/vouchers/${id}`);
    return res.data;
};