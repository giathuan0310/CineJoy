import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Modal } from 'antd';

interface MovieFormProps {
    movie?: IMovie;
    onSubmit: (movieData: Partial<IMovie>) => void;
    onCancel: () => void;
}

const MovieForm: React.FC<MovieFormProps> = ({ movie, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState<Partial<IMovie>>({
        title: '',
        image: '',
        posterImage: '',
        releaseDate: '',
        duration: 0,
        actors: [],
        genre: [],
        director: '',
        status: '',
        language: [],
        description: '',
        trailer: '',
        ageRating: ''
    });

    // Hàm chuyển đổi ngày sang format YYYY-MM-DD cho input date
    const formatDateForInput = (dateString: string): string => {
        if (!dateString) return '';

        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return '';

            // Chuyển sang format YYYY-MM-DD
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        } catch (error) {
            console.error('Error formatting date:', error);
            return '';
        }
    };

    useEffect(() => {
        if (movie) {
            setFormData({
                ...movie,
                // Chuyển đổi ngày sang format phù hợp cho input date
                releaseDate: formatDateForInput(movie.releaseDate || '')
            });
        }
    }, [movie]);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value.split(',').map(item => item.trim())
        }));
    };

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: [value]
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Chuyển đổi ngày về format ISO khi submit (nếu cần)
        const submitData = {
            ...formData,
            releaseDate: formData.releaseDate ? new Date(formData.releaseDate).toISOString() : ''
        };

        onSubmit(submitData);
    };

    return (
        <Modal
            open
            title={<div className="text-center text-xl md:text-xl font-semibold">{movie ? 'Sửa phim' : 'Thêm phim mới'}</div>}
            onCancel={onCancel}
            footer={null}
            width={800}
            centered
            destroyOnClose
        >
            <form onSubmit={handleSubmit} method='post' className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tên phim
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ảnh thumbnail
                            </label>
                            <div className="flex items-center space-x-4">
                                {formData.image && (
                                    <img
                                        src={formData.image}
                                        alt="Thumbnail preview"
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    image: reader.result as string
                                                }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                                    required={!formData.image}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ảnh poster
                            </label>
                            <div className="flex items-center space-x-4">
                                {formData.posterImage && (
                                    <img
                                        src={formData.posterImage}
                                        alt="Poster preview"
                                        className="w-20 h-20 object-cover rounded"
                                    />
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    posterImage: reader.result as string
                                                }));
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                                    required={!formData.posterImage}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngày phát hành
                            </label>
                            <input
                                type="date"
                                name="releaseDate"
                                value={formData.releaseDate}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thời lượng (phút)
                            </label>
                            <input
                                type="number"
                                name="duration"
                                value={formData.duration}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Diễn viên (phân cách bằng dấu phẩy)
                            </label>
                            <input
                                type="text"
                                name="actors"
                                value={formData.actors?.join(', ')}
                                onChange={handleArrayChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Thể loại
                            </label>
                            <select
                                name="genre"
                                value={formData.genre?.[0] || ''}
                                onChange={handleSelectChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                                required
                            >
                                <option value="">Chọn Thể Loại</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Đạo diễn
                            </label>
                            <input
                                type="text"
                                name="director"
                                value={formData.director}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Trạng Thái
                            </label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                                required
                            >
                                <option value="">Select status</option>
                                <option value="nowShowing">Now Showing</option>
                                <option value="upcoming">Upcoming</option>
                                <option value="special">Special</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ngôn ngữ
                            </label>
                            <select
                                name="language"
                                value={formData.language?.[0] || ''}
                                onChange={handleSelectChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                                required
                            >
                                <option value="">Chọn ngôn ngữ</option>
                                {languages.map(lang => (
                                    <option key={lang} value={lang}>{lang}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Độ tuổi
                            </label>
                            <select
                                name="ageRating"
                                value={formData.ageRating}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                                required
                            >
                                <option value="">Chọn độ tuổi</option>
                                {ageRestrictions.map(age => (
                                    <option key={age} value={age}>{age}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Link trailer
                            </label>
                            <input
                                type="text"
                                name="trailer"
                                value={formData.trailer}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mô tả
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-black"
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <motion.button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Hủy
                        </motion.button>
                        <motion.button
                            type="submit"
                            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {movie ? 'Cập nhật' : 'Thêm mới'}
                        </motion.button>
                    </div>
                </form>
        </Modal>
    );
};

export default MovieForm;