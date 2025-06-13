import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getMovies } from '@/apiservice/apiMovies';
import { getTheaters } from '@/apiservice/apiTheater';
import { toast } from 'react-toastify';

interface ShowtimeFormProps {
    onCancel: () => void;
    onSuccess: (data: any) => void;
}

const ShowtimeForm: React.FC<ShowtimeFormProps> = ({ onCancel, onSuccess }) => {
    const [movies, setMovies] = useState<IMovie[]>([]);
    const [theaters, setTheaters] = useState<ITheater[]>([]);
    const [formData, setFormData] = useState({
        movieId: '',
        theaterId: '',
        showDate: {
            start: '',
            end: ''
        },
        showTimes: [{
            date: '',
            start: '',
            end: '',
            room: '',
            seats: Array(16).fill(null).map((_, index) => ({
                seatId: `A${index + 1}`,
                status: 'available',
                type: 'normal',
                price: 75000
            }))
        }]
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [moviesData, theatersData] = await Promise.all([
                    getMovies(),
                    getTheaters()
                ]);
                setMovies(Array.isArray(moviesData) ? moviesData : []);
                console.log("movie", moviesData.data);
                setTheaters(theatersData || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Không thể tải dữ liệu phim và rạp');
            }
        };
        fetchData();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Validate form data
        if (!formData.movieId || !formData.theaterId || !formData.showDate.start || !formData.showDate.end) {
            toast.error('Vui lòng điền đầy đủ thông tin cơ bản');
            return;
        }

        // Validate showtimes
        const invalidShowtime = formData.showTimes.find(st =>
            !st.date || !st.start || !st.end || !st.room
        );
        if (invalidShowtime) {
            toast.error('Vui lòng điền đầy đủ thông tin cho tất cả suất chiếu');
            return;
        }

        // Convert dates to ISO strings
        const formattedData = {
            ...formData,
            showDate: {
                start: new Date(formData.showDate.start).toISOString(),
                end: new Date(formData.showDate.end).toISOString()
            },
            showTimes: formData.showTimes.map(st => ({
                ...st,
                date: new Date(st.date).toISOString(),
                start: new Date(`${st.date}T${st.start}`).toISOString(),
                end: new Date(`${st.date}T${st.end}`).toISOString()
            }))
        };

        onSuccess(formattedData);
    };

    const addShowTime = () => {
        setFormData(prev => ({
            ...prev,
            showTimes: [...prev.showTimes, {
                date: '',
                start: '',
                end: '',
                room: '',
                seats: Array(16).fill(null).map((_, index) => ({
                    seatId: `A${index + 1}`,
                    status: 'available',
                    type: 'normal',
                    price: 75000
                }))
            }]
        }));
    };

    const removeShowTime = (index: number) => {
        setFormData(prev => ({
            ...prev,
            showTimes: prev.showTimes.filter((_, i) => i !== index)
        }));
    };

    const updateShowTime = (index: number, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            showTimes: prev.showTimes.map((showTime, i) =>
                i === index ? { ...showTime, [field]: value } : showTime
            )
        }));
    };

    // Thêm hàm kiểm tra ngày
    const validateDate = (date: string, startDate: string, endDate: string) => {
        const dateObj = new Date(date);
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        return dateObj >= startDateObj && dateObj <= endDateObj;
    };

    // Cập nhật hàm xử lý thay đổi ngày bắt đầu
    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newStartDate = e.target.value;
        if (formData.showDate.end && new Date(newStartDate) > new Date(formData.showDate.end)) {
            toast.error('Ngày bắt đầu phải nhỏ hơn ngày kết thúc');
            return;
        }
        setFormData(prev => ({
            ...prev,
            showDate: { ...prev.showDate, start: newStartDate }
        }));
    };

    // Cập nhật hàm xử lý thay đổi ngày kết thúc
    const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newEndDate = e.target.value;
        if (formData.showDate.start && new Date(newEndDate) < new Date(formData.showDate.start)) {
            toast.error('Ngày kết thúc phải lớn hơn ngày bắt đầu');
            return;
        }
        setFormData(prev => ({
            ...prev,
            showDate: { ...prev.showDate, end: newEndDate }
        }));
    };

    // Cập nhật hàm xử lý thay đổi ngày chiếu
    const handleShowTimeDateChange = (index: number, date: string) => {
        if (!formData.showDate.start || !formData.showDate.end) {
            toast.error('Vui lòng chọn ngày bắt đầu và kết thúc trước');
            return;
        }

        if (!validateDate(date, formData.showDate.start, formData.showDate.end)) {
            toast.error('Ngày chiếu phải nằm trong khoảng từ ngày bắt đầu đến ngày kết thúc');
            return;
        }

        updateShowTime(index, 'date', date);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-3/4 max-h-[80vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Thêm suất chiếu mới</h3>
                    <button onClick={onCancel} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phim</label>
                            <select
                                value={formData.movieId}
                                onChange={(e) => setFormData(prev => ({ ...prev, movieId: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                required
                            >
                                <option value="">Chọn phim</option>
                                {movies.map(movie => (
                                    <option key={movie._id} value={movie._id}>{movie.title}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Rạp chiếu</label>
                            <select
                                value={formData.theaterId}
                                onChange={(e) => setFormData(prev => ({ ...prev, theaterId: e.target.value }))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                required
                            >
                                <option value="">Chọn rạp</option>
                                {theaters.map(theater => (
                                    <option key={theater._id} value={theater._id}>{theater.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ngày bắt đầu</label>
                            <input
                                type="date"
                                value={formData.showDate.start}
                                onChange={handleStartDateChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ngày kết thúc</label>
                            <input
                                type="date"
                                value={formData.showDate.end}
                                onChange={handleEndDateChange}
                                min={formData.showDate.start}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-lg font-medium">Danh sách suất chiếu</h4>
                            <motion.button
                                type="button"
                                onClick={addShowTime}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Thêm suất chiếu
                            </motion.button>
                        </div>

                        {formData.showTimes.map((showTime, index) => (
                            <div key={index} className="border p-4 rounded-lg space-y-4">
                                <div className="flex justify-between items-center">
                                    <h5 className="font-medium">Suất chiếu {index + 1}</h5>
                                    {index > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => removeShowTime(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Ngày chiếu</label>
                                        <input
                                            type="date"
                                            value={showTime.date}
                                            onChange={(e) => handleShowTimeDateChange(index, e.target.value)}
                                            min={formData.showDate.start}
                                            max={formData.showDate.end}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Phòng chiếu</label>
                                        <input
                                            type="text"
                                            value={showTime.room}
                                            onChange={(e) => updateShowTime(index, 'room', e.target.value)}
                                            placeholder="Ví dụ: Room 1"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Giờ bắt đầu</label>
                                        <input
                                            type="time"
                                            value={showTime.start}
                                            onChange={(e) => updateShowTime(index, 'start', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Giờ kết thúc</label>
                                        <input
                                            type="time"
                                            value={showTime.end}
                                            onChange={(e) => updateShowTime(index, 'end', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-4 mt-6">
                        <motion.button
                            type="button"
                            onClick={onCancel}
                            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Hủy
                        </motion.button>
                        <motion.button
                            type="submit"
                            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Thêm suất chiếu
                        </motion.button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShowtimeForm; 