import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Modal, Form, Select, DatePicker, TimePicker, Button, Card } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getMovies } from '@/apiservice/apiMovies';
import { getTheaters } from '@/apiservice/apiTheater';
import { createShowtime, updateShowtime } from '@/apiservice/apiShowTime';
import { getRegions } from '@/apiservice/apiRegion';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

interface ShowtimeFormProps {
    onCancel: () => void;
    onSuccess: () => void;
    editData?: IShowtime;
}

const ShowtimeForm: React.FC<ShowtimeFormProps> = ({ onCancel, onSuccess, editData }) => {
    const [movies, setMovies] = useState<IMovie[]>([]);
    const [regions, setRegions] = useState<IRegion[]>([]);
    const [allTheaters, setAllTheaters] = useState<ITheater[]>([]);
    const [filteredTheaters, setFilteredTheaters] = useState<ITheater[]>([]);
    const [selectedRegionId, setSelectedRegionId] = useState<string>('');
    const [form] = Form.useForm();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [moviesData, theatersData, regionsData] = await Promise.all([
                    getMovies(),
                    getTheaters(),
                    getRegions()
                ]);
                setMovies(Array.isArray(moviesData) ? moviesData : []);
                setAllTheaters(theatersData || []);
                setRegions(regionsData || []);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Không thể tải dữ liệu phim, rạp và khu vực');
            }
        };
        fetchData();
    }, []);

    // Effect để lọc rạp theo khu vực đã chọn
    useEffect(() => {
        if (selectedRegionId) {
            // Tìm tên khu vực từ ID
            const selectedRegion = regions.find(r => r._id === selectedRegionId);
            if (selectedRegion) {
                // Lọc rạp theo location.city khớp với tên khu vực
                const filtered = allTheaters.filter(theater => 
                    theater.location.city.toLowerCase().includes(selectedRegion.name.toLowerCase()) ||
                    selectedRegion.name.toLowerCase().includes(theater.location.city.toLowerCase())
                );
                setFilteredTheaters(filtered);
            }
        } else {
            setFilteredTheaters([]);
        }
        // Reset theater selection khi thay đổi khu vực
        form.setFieldValue('theaterId', undefined);
    }, [selectedRegionId, allTheaters, regions, form]);

    useEffect(() => {
        if (editData) {
            // Tìm khu vực của rạp được chọn khi edit
            const selectedTheater = allTheaters.find(t => t._id === editData.theaterId._id);
            if (selectedTheater) {
                // Tìm khu vực phù hợp với location.city của rạp
                const matchingRegion = regions.find(region => 
                    selectedTheater.location.city.toLowerCase().includes(region.name.toLowerCase()) ||
                    region.name.toLowerCase().includes(selectedTheater.location.city.toLowerCase())
                );
                if (matchingRegion) {
                    setSelectedRegionId(matchingRegion._id);
                }
            }
            
            form.setFieldsValue({
                movieId: editData.movieId._id,
                regionId: regions.find(region => 
                    selectedTheater?.location.city.toLowerCase().includes(region.name.toLowerCase()) ||
                    region.name.toLowerCase().includes(selectedTheater?.location.city.toLowerCase() || '')
                )?._id,
                theaterId: editData.theaterId._id,
                showDate: [
                    dayjs(editData.showDate.start),
                    dayjs(editData.showDate.end)
                ],
                showTimes: editData.showTimes.map(st => ({
                    date: dayjs(st.date),
                    timeRange: [dayjs(st.start), dayjs(st.end)],
                    room: st.room
                }))
            });
        } else {
            // Set default showtime when creating new
            form.setFieldsValue({
                showTimes: [{
                    date: undefined,
                    timeRange: undefined,
                    room: undefined
                }]
            });
        }
    }, [editData, form, allTheaters, regions]);

    // Handler cho việc chọn khu vực
    const handleRegionChange = (regionId: string) => {
        setSelectedRegionId(regionId);
    };

    const handleSubmit = async (values: {
        movieId: string;
        regionId: string;
        theaterId: string;
        showDate: [dayjs.Dayjs, dayjs.Dayjs];
        showTimes: Array<{
            date: dayjs.Dayjs;
            timeRange: [dayjs.Dayjs, dayjs.Dayjs];
            room: string;
        }>;
    }) => {
        try {
            // Create seats array for each showtime
            const defaultSeats = Array(16).fill(null).map((_, index) => ({
                seatId: `A${index + 1}`,
                status: 'available',
                type: 'normal',
                price: 75000
            }));

            const formattedData = {
                movieId: {
                    _id: values.movieId,
                    title: movies.find(m => m._id === values.movieId)?.title || ''
                },
                theaterId: {
                    _id: values.theaterId,
                    name: filteredTheaters.find(t => t._id === values.theaterId)?.name || ''
                },
                showDate: {
                    start: values.showDate[0].toISOString(),
                    end: values.showDate[1].toISOString()
                },
                showTimes: values.showTimes.map(st => ({
                    date: st.date.toISOString(),
                    start: st.timeRange[0].toISOString(),
                    end: st.timeRange[1].toISOString(),
                    room: st.room,
                    seats: defaultSeats
                }))
            };

            if (editData) {
                await updateShowtime(editData._id, formattedData as Partial<IShowtime>);
                toast.success('Cập nhật suất chiếu thành công!');
            } else {
                await createShowtime(formattedData as Partial<IShowtime>);
                toast.success('Thêm suất chiếu thành công!');
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving showtime:', error);
            toast.error(editData ? 'Cập nhật suất chiếu thất bại!' : 'Thêm suất chiếu thất bại!');
        }
    };

    const validateShowDate = (current: dayjs.Dayjs) => {
        return current && current < dayjs().startOf('day');
    };

    const validateShowTimeDate = (_: unknown, value: dayjs.Dayjs) => {
        const showDateRange = form.getFieldValue('showDate');
        if (!value || !showDateRange) {
            return Promise.resolve();
        }
        
        const [startDate, endDate] = showDateRange;
        if (value.isBefore(startDate, 'day') || value.isAfter(endDate, 'day')) {
            return Promise.reject(new Error('Ngày chiếu phải nằm trong khoảng thời gian chiếu!'));
        }
        return Promise.resolve();
    };

    const validateTimeRange = (_: unknown, value: [dayjs.Dayjs, dayjs.Dayjs]) => {
        if (!value || !value[0] || !value[1]) {
            return Promise.resolve();
        }
        
        if (value[1].isSameOrBefore(value[0])) {
            return Promise.reject(new Error('Thời gian kết thúc phải sau thời gian bắt đầu!'));
        }
        
        const duration = value[1].diff(value[0], 'minutes');
        if (duration < 30) {
            return Promise.reject(new Error('Thời lượng chiếu phải ít nhất 30 phút!'));
        }
        
        return Promise.resolve();
    };

    return (
        <Modal
            open
            title={<div className="text-center text-xl font-semibold">{editData ? 'Sửa suất chiếu' : 'Thêm suất chiếu mới'}</div>}
            onCancel={onCancel}
            footer={null}
            width={900}
            centered
            destroyOnClose
            style={{ 
                marginTop: '2vh',
                marginBottom: '2vh',
                maxHeight: '96vh'
            }}
            bodyStyle={{
                maxHeight: 'calc(96vh - 110px)',
                overflowY: 'auto',
                scrollbarWidth: 'none', // Firefox
                msOverflowStyle: 'none', // IE và Edge
            }}
            className="hide-scrollbar"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
            >
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <Form.Item
                        name="movieId"
                        label="🎬 Phim"
                        rules={[
                            { required: true, message: 'Vui lòng chọn phim!' }
                        ]}
                    >
                        <Select
                            placeholder="Chọn phim"
                            size="large"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={movies.map(movie => ({ 
                                value: movie._id, 
                                label: movie.title 
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="regionId"
                        label="🌍 Khu vực"
                        rules={[
                            { required: true, message: 'Vui lòng chọn khu vực!' }
                        ]}
                    >
                        <Select
                            placeholder="Chọn khu vực"
                            size="large"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            onChange={handleRegionChange}
                            options={regions.map(region => ({ 
                                value: region._id, 
                                label: region.name 
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="theaterId"
                        label="🏢 Rạp chiếu"
                        rules={[
                            { required: true, message: 'Vui lòng chọn rạp chiếu!' }
                        ]}
                    >
                        <Select
                            placeholder={selectedRegionId ? "Chọn rạp chiếu" : "Chọn khu vực trước"}
                            size="large"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            disabled={!selectedRegionId}
                            options={filteredTheaters.map(theater => ({ 
                                value: theater._id, 
                                label: theater.name 
                            }))}
                            notFoundContent={selectedRegionId ? "Không có rạp nào trong khu vực này" : "Vui lòng chọn khu vực trước"}
                        />
                    </Form.Item>
                        </div>

                <Form.Item
                    name="showDate"
                    label="Thời gian chiếu (từ ngày - đến ngày)"
                    rules={[
                        { required: true, message: 'Vui lòng chọn thời gian chiếu!' }
                    ]}
                >
                    <DatePicker.RangePicker
                        placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                        size="large"
                        style={{ width: '100%' }}
                        format="DD/MM/YYYY"
                        disabledDate={validateShowDate}
                    />
                </Form.Item>

                <div className="mb-6">
                    <h4 className="text-lg font-medium mb-4">Danh sách suất chiếu</h4>
                    <Form.List
                        name="showTimes"
                        rules={[
                            {
                                validator: async (_, showTimes) => {
                                    if (!showTimes || showTimes.length < 1) {
                                        return Promise.reject(new Error('Phải có ít nhất 1 suất chiếu!'));
                                    }
                                },
                            },
                        ]}
                    >
                        {(fields, { add, remove }, { errors }) => (
                            <>
                                {fields.map(({ key, name, ...restField }, index) => (
                                    <div key={key} className="mb-3">
                                        <Card
                                            size="small"
                                            title={`Suất chiếu ${index + 1}`}
                                            extra={
                                                fields.length > 1 ? (
                                                    <Button
                                                        type="text"
                                                        danger
                                                        icon={<DeleteOutlined />}
                                                        onClick={() => remove(name)}
                                                    >
                                                        Xóa
                                                    </Button>
                                                ) : null
                                            }
                                        >
                                            <div className="grid grid-cols-3 gap-4">
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'date']}
                                                    label="Ngày chiếu"
                                                    rules={[
                                                        { required: true, message: 'Vui lòng chọn ngày chiếu!' },
                                                        { validator: validateShowTimeDate }
                                                    ]}
                                                >
                                                    <DatePicker
                                                        placeholder="Chọn ngày chiếu"
                                                        size="large"
                                                        style={{ width: '100%' }}
                                                        format="DD/MM/YYYY"
                                                        disabledDate={validateShowDate}
                                                    />
                                                </Form.Item>
    
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'timeRange']}
                                                    label="Thời gian chiếu"
                                                    rules={[
                                                        { required: true, message: 'Vui lòng chọn thời gian chiếu!' },
                                                        { validator: validateTimeRange }
                                                    ]}
                                                >
                                                    <TimePicker.RangePicker
                                                        placeholder={['Giờ bắt đầu', 'Giờ kết thúc']}
                                                        size="large"
                                                        style={{ width: '100%' }}
                                                        format="HH:mm"
                                                        minuteStep={15}
                                                    />
                                                </Form.Item>
    
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'room']}
                                                    label="Phòng chiếu"
                                                    rules={[
                                                        { required: true, message: 'Vui lòng chọn phòng chiếu!' }
                                                    ]}
                                                >
                                                    <Select
                                                        placeholder="Chọn phòng chiếu"
                                                        size="large"
                                                        allowClear
                                                        showSearch={false}
                                                        options={[
                                                            { value: 'Room 1', label: '🎬 Room 1' },
                                                            { value: 'Room 2', label: '🎬 Room 2' },
                                                            { value: 'Room 3', label: '🎬 Room 3' },
                                                            { value: 'Room 4', label: '🎬 Room 4' },
                                                            { value: 'Room 5', label: '🎬 Room 5' }
                                                        ]}
                                                    />
                                                </Form.Item>
                                    </div>
                                        </Card>
                            </div>
                        ))}
                                
                                <Form.Item className="mt-4">
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<PlusOutlined />}
                                        size="large"
                                    >
                                        Thêm suất chiếu
                                    </Button>
                                    <Form.ErrorList errors={errors} />
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                    </div>

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
                            {editData ? 'Cập nhật' : 'Thêm suất chiếu'}
                        </motion.button>
                    </div>
            </Form>
        </Modal>
    );
};

export default ShowtimeForm; 