import axiosClient from "./axiosClient";


export const getFoodCombos = async (): Promise<IFoodCombo[]> => {
    const res = await axiosClient.get<IFoodCombo[]>("/foodcombos");
    return res.data;
};

export const getFoodComboById = async (id: string): Promise<IFoodCombo> => {
    const res = await axiosClient.get<IFoodCombo>(`/foodcombos/${id}`);
    return res.data;
};

export const addFoodCombo = async (combo: IFoodCombo): Promise<IFoodCombo> => {
    const res = await axiosClient.post<IFoodCombo>("/foodcombos/add", combo);
    return res.data;
};

export const updateFoodCombo = async (id: string, combo: IFoodCombo): Promise<IFoodCombo> => {
    const res = await axiosClient.put<IFoodCombo>(`/foodcombos/update/${id}`, combo);
    return res.data;
};

export const deleteFoodCombo = async (id: string): Promise<{ message: string }> => {
    const res = await axiosClient.delete<{ message: string }>(`/foodcombos/delete/${id}`);
    return res.data;
};