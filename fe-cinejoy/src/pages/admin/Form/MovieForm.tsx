import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Modal, Form, Input, InputNumber, Select, DatePicker } from 'antd';
import type { InputRef } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface MovieFormProps {
    movie?: IMovie;
    onSubmit: (movieData: Partial<IMovie>) => void;
    onCancel: () => void;
}

const MovieForm: React.FC<MovieFormProps> = ({ movie, onSubmit, onCancel }) => {
    const titleInputRef = useRef<InputRef>(null);
    const [form] = Form.useForm();
    const [imagePreview, setImagePreview] = useState<string>('');
    const [posterPreview, setPosterPreview] = useState<string>('');
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
    const [posterPreviewUrl, setPosterPreviewUrl] = useState<string>('');

    useEffect(() => {
        if (movie) {
            form.setFieldsValue({
                title: movie.title,
                image: movie.image,
                posterImage: movie.posterImage,
                releaseDate: movie.releaseDate ? dayjs(movie.releaseDate) : undefined,
                duration: movie.duration,
                actors: movie.actors?.join(', '),
                genre: movie.genre?.[0],
                director: movie.director,
                status: movie.status,
                language: movie.language?.[0],
                description: movie.description,
                trailer: movie.trailer,
                ageRating: movie.ageRating,
            });
            // Set image previews
            setImagePreview(movie.image || '');
            setPosterPreview(movie.posterImage || '');
        }
    }, [movie, form]);

    useEffect(() => {
        if (!movie) {
            const timer = setTimeout(() => {
                if (titleInputRef.current) {
                    titleInputRef.current.focus();
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [movie]);

    // Cleanup effect for preview URLs
    useEffect(() => {
        return () => {
            if (imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            }
            if (posterPreviewUrl) {
                URL.revokeObjectURL(posterPreviewUrl);
            }
        };
    }, [imagePreviewUrl, posterPreviewUrl]);

    const languages = [
        'Vietnamese',
        'English',
        'Korean',
        'Japanese',
        'Chinese',
        'French',
        'German',
        'Spanish'
    ];

    const genres = [
        'Action',
        'Adventure',
        'Comedy',
        'Drama',
        'Horror',
        'Sci-Fi',
        'Romance',
        'Thriller',
        'War',
        'Western',
        'Animation',
    ];

    const ageRestrictions = ['T13+', 'T16+', 'T18+', 'P'];

    const handleSubmit = async (values: {
        title: string;
        image: string;
        posterImage: string;
        releaseDate: dayjs.Dayjs;
        duration: number;
        actors: string;
        genre: string;
        director: string;
        status: string;
        language: string;
        description: string;
        trailer: string;
        ageRating: string;
    }) => {
        try {
            const submitData = {
                title: values.title,
                image: values.image,
                posterImage: values.posterImage,
                releaseDate: values.releaseDate ? values.releaseDate.toISOString() : '',
                duration: values.duration,
                actors: values.actors ? values.actors.split(',').map((item: string) => item.trim()) : [],
                genre: values.genre ? [values.genre] : [],
                director: values.director,
                status: values.status,
                language: values.language ? [values.language] : [],
                description: values.description,
                trailer: values.trailer,
                ageRating: values.ageRating,
            };
            
            onSubmit(submitData);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const handleImageChange = (fieldName: string) => (info: { file: { originFileObj?: File; }; }) => {
        const file = info.file.originFileObj;
        if (file instanceof File) {
            // Cleanup previous preview URL if exists
            if (fieldName === 'image' && imagePreviewUrl) {
                URL.revokeObjectURL(imagePreviewUrl);
            } else if (fieldName === 'posterImage' && posterPreviewUrl) {
                URL.revokeObjectURL(posterPreviewUrl);
            }
            
            // Create preview URL immediately
            const previewUrl = URL.createObjectURL(file);
            
            // Update preview state immediately
            if (fieldName === 'image') {
                setImagePreviewUrl(previewUrl);
                setImagePreview(previewUrl);
            } else if (fieldName === 'posterImage') {
                setPosterPreviewUrl(previewUrl);
                setPosterPreview(previewUrl);
            }
            
            // Convert to base64 for form data
            const reader = new FileReader();
            reader.onloadend = () => {
                const imageUrl = reader.result as string;
                form.setFieldsValue({
                    [fieldName]: imageUrl
                });
                
                // Update preview to base64 URL and cleanup object URL
                if (fieldName === 'image') {
                    setImagePreview(imageUrl);
                    URL.revokeObjectURL(previewUrl);
                    setImagePreviewUrl('');
                } else if (fieldName === 'posterImage') {
                    setPosterPreview(imageUrl);
                    URL.revokeObjectURL(previewUrl);
                    setPosterPreviewUrl('');
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Modal
            open
            title={<div className="text-center text-xl md:text-xl font-semibold">{movie ? 'Sửa phim' : 'Thêm phim mới'}</div>}
            onCancel={onCancel}
            footer={null}
            width={900}
            centered
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
            >
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="title"
                        label="Tên phim"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên phim!' },
                            { min: 2, message: 'Tên phim phải có ít nhất 2 ký tự!' },
                            { max: 200, message: 'Tên phim không được quá 200 ký tự!' }
                        ]}
                    >
                        <Input
                            ref={titleInputRef}
                            placeholder="Nhập tên phim"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="director"
                        label="Đạo diễn"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên đạo diễn!' },
                            { min: 2, message: 'Tên đạo diễn phải có ít nhất 2 ký tự!' }
                        ]}
                    >
                        <Input
                            placeholder="Nhập tên đạo diễn"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="duration"
                        label="Thời lượng (phút)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập thời lượng!' },
                            { type: 'number', min: 30, max: 300, message: 'Thời lượng phải từ 30-300 phút!' }
                        ]}
                    >
                        <InputNumber
                            placeholder="Nhập thời lượng"
                            size="large"
                            min={30}
                            max={300}
                            style={{ width: '100%' }}
                            addonAfter="phút"
                        />
                    </Form.Item>

                    <Form.Item
                        name="releaseDate"
                        label="Ngày phát hành"
                        rules={[
                            { required: true, message: 'Vui lòng chọn ngày phát hành!' }
                        ]}
                    >
                        <DatePicker
                            placeholder="Chọn ngày phát hành"
                            size="large"
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                        />
                    </Form.Item>

                    <Form.Item
                        name="genre"
                        label="Thể loại"
                        rules={[
                            { required: true, message: 'Vui lòng chọn thể loại!' }
                        ]}
                    >
                        <Select
                            placeholder="Chọn thể loại"
                            size="large"
                            options={genres.map(genre => ({ value: genre, label: genre }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="language"
                        label="Ngôn ngữ"
                        rules={[
                            { required: true, message: 'Vui lòng chọn ngôn ngữ!' }
                        ]}
                    >
                        <Select
                            placeholder="Chọn ngôn ngữ"
                            size="large"
                            options={languages.map(lang => ({ value: lang, label: lang }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="status"
                        label="Trạng thái"
                        rules={[
                            { required: true, message: 'Vui lòng chọn trạng thái!' }
                        ]}
                    >
                        <Select
                            placeholder="Chọn trạng thái"
                            size="large"
                            options={[
                                { value: 'nowShowing', label: 'Now Showing' },
                                { value: 'upcoming', label: 'Upcoming' },
                                { value: 'special', label: 'Special' }
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="ageRating"
                        label="Độ tuổi"
                        rules={[
                            { required: true, message: 'Vui lòng chọn độ tuổi!' }
                        ]}
                    >
                        <Select
                            placeholder="Chọn độ tuổi"
                            size="large"
                            options={ageRestrictions.map(age => ({ value: age, label: age }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="actors"
                        label="Diễn viên (phân cách bằng dấu phẩy)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập diễn viên!' },
                            { min: 2, message: 'Danh sách diễn viên quá ngắn!' }
                        ]}
                    >
                        <Input
                            placeholder="Ví dụ: Tom Hanks, Leonardo DiCaprio"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="trailer"
                        label="Link trailer"
                        rules={[
                            { required: true, message: 'Vui lòng nhập link trailer!' },
                            { type: 'url', message: 'Link trailer không hợp lệ!' }
                        ]}
                    >
                        <Input
                            placeholder="https://www.youtube.com/watch?v=..."
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="image"
                        label="Ảnh thumbnail"
                        rules={[
                            { required: !movie?.image, message: 'Vui lòng tải lên ảnh thumbnail!' }
                        ]}
                    >
                        <div className="space-y-2">
                            {imagePreview && (
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={imagePreview}
                                        alt="Thumbnail preview"
                                        className="w-20 h-20 object-cover rounded border"
                                    />
                                    <span className="text-sm text-gray-600">Ảnh hiện tại</span>
                                </div>
                            )}
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleImageChange('image')({ file: { originFileObj: file } });
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                    id="image-input"
                                />
                                <Input
                                    placeholder={imagePreview ? "Chọn ảnh mới" : "Chọn ảnh thumbnail"}
                                    size="large"
                                    suffix={<UploadOutlined />}
                                    readOnly
                                    onClick={() => {
                                        const input = document.getElementById('image-input') as HTMLInputElement;
                                        input?.click();
                                    }}
                                    style={{ cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </Form.Item>

                    <Form.Item
                        name="posterImage"
                        label="Ảnh poster"
                        rules={[
                            { required: !movie?.posterImage, message: 'Vui lòng tải lên ảnh poster!' }
                        ]}
                    >
                        <div className="space-y-2">
                            {posterPreview && (
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={posterPreview}
                                        alt="Poster preview"
                                        className="w-20 h-20 object-cover rounded border"
                                    />
                                    <span className="text-sm text-gray-600">Ảnh hiện tại</span>
                                </div>
                            )}
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleImageChange('posterImage')({ file: { originFileObj: file } });
                                        }
                                    }}
                                    style={{ display: 'none' }}
                                    id="poster-input"
                                />
                                <Input
                                    placeholder={posterPreview ? "Chọn ảnh mới" : "Chọn ảnh poster"}
                                    size="large"
                                    suffix={<UploadOutlined />}
                                    readOnly
                                    onClick={() => {
                                        const input = document.getElementById('poster-input') as HTMLInputElement;
                                        input?.click();
                                    }}
                                    style={{ cursor: 'pointer' }}
                                />
                            </div>
                        </div>
                    </Form.Item>
                </div>

                <Form.Item
                    name="description"
                    label="Mô tả"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mô tả phim!' },
                        { min: 20, message: 'Mô tả phải có ít nhất 20 ký tự!' },
                        { max: 1000, message: 'Mô tả không được quá 1000 ký tự!' }
                    ]}
                >
                    <Input.TextArea
                        placeholder="Nhập mô tả phim..."
                        rows={4}
                        size="large"
                        showCount
                        maxLength={1000}
                    />
                </Form.Item>

                <div className="flex justify-end gap-4 mt-6">
                    <motion.button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Hủy
                    </motion.button>
                    <motion.button
                        type="submit"
                        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 cursor-pointer"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {movie ? 'Cập nhật' : 'Thêm mới'}
                    </motion.button>
                </div>
            </Form>
        </Modal>
    );
};

export default MovieForm;