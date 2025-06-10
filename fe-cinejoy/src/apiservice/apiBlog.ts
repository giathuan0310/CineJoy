import axiosClient from "./axiosClient";


export const getBlogs = async (): Promise<IBlog[]> => {
    const res = await axiosClient.get<IBlog[]>("/blogs");
    return res.data;
};

export const getBlogById = async (id: string): Promise<IBlog> => {
    const res = await axiosClient.get<IBlog>(`/blogs/${id}`);
    return res.data;
};

export const addBlog = async (blog: IBlog): Promise<IBlog> => {
    const res = await axiosClient.post<IBlog>("/blogs", blog);
    return res.data;
};

export const updateBlog = async (id: string, blog: IBlog): Promise<IBlog> => {
    const res = await axiosClient.put<IBlog>(`/blogs/${id}`, blog);
    return res.data;
};

export const deleteBlog = async (id: string): Promise<{ message: string }> => {
    const res = await axiosClient.delete<{ message: string }>(`/blogs/${id}`);
    return res.data;
};