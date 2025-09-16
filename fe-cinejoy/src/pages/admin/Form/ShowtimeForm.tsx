/* */
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Modal, Form, Select, DatePicker, TimePicker, Button, Card, Spin, message } from 'antd';
import axiosClient from '@/apiservice/axiosClient';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getMovies } from '@/apiservice/apiMovies';
import { getTheaters } from '@/apiservice/apiTheater';
import { createShowtime, updateShowtime, getShowtimesByRoomAndDateApi } from '@/apiservice/apiShowTime';
import { getRegions } from '@/apiservice/apiRegion';
import { getActiveRoomsByTheaterApi } from '@/apiservice/apiRoom';
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
    const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);
    const [rooms, setRooms] = useState<{_id: string; name: string; theater: {_id: string}}[]>([]);
    const [selectedTheaterId, setSelectedTheaterId] = useState<string>('');
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showSessions, setShowSessions] = useState<IShowSession[]>([]);


    useEffect(() => {
        const fetchData = async () => {
            try {
                const [moviesRes, theatersRes, regionsRes, sessionsRes] = await Promise.all([
                    getMovies(),
                    getTheaters(),
                    getRegions(),
                    axiosClient.get('/show-sessions')
                ]);
                setMovies(Array.isArray(moviesRes) ? moviesRes : []);
                setAllTheaters(theatersRes || []);
                setRegions(regionsRes || []);
                setShowSessions((sessionsRes.data as { data: IShowSession[] }).data || []);
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
        const loadEditData = async () => {
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
                
                // Load rooms cho rạp khi edit TRƯỚC KHI set form values
                try {
                    const theaterRooms = await getActiveRoomsByTheaterApi(editData.theaterId._id);
                    setRooms(theaterRooms);
                    setSelectedTheaterId(editData.theaterId._id);
                    
                    // Sau khi load rooms xong, set form values
                    form.setFieldsValue({
                        movieId: editData.movieId._id,
                        regionId: regions.find(region => 
                            selectedTheater?.location.city.toLowerCase().includes(region.name.toLowerCase()) ||
                            region.name.toLowerCase().includes(selectedTheater?.location.city.toLowerCase() || '')
                        )?._id,
                        theaterId: editData.theaterId._id,
                        showTimes: (editData.showTimes as Array<{ 
                            date: string; 
                            start: string; 
                            end: string; 
                            room: string | { _id: string; name: string }; 
                            showSessionId?: string | { _id: string; name: string } 
                        }>).map((st) => ({
                            date: dayjs(st.date),
                            startTime: dayjs(st.start),
                            endTime: dayjs(st.end),
                            room: typeof st.room === 'object' ? st.room._id : st.room,
                            sessionId: typeof st.showSessionId === 'object' ? st.showSessionId._id : st.showSessionId
                        }))
                    });
                } catch (error) {
                    console.error('Error loading rooms for edit:', error);
                    setRooms([]);
                }
            } else {
                // Set default showtime when creating new
                form.setFieldsValue({
                    showTimes: [{
                        date: undefined,
                        startTime: undefined,
                        endTime: undefined,
                        room: undefined,
                        sessionId: undefined
                    }]
                });
            }
        };
        
        loadEditData();
    }, [editData, form, allTheaters, regions]);

    // Handler cho việc chọn khu vực
    const handleRegionChange = (regionId: string) => {
        setSelectedRegionId(regionId);
        // Reset theater và room khi chọn khu vực mới
        form.setFieldValue('theaterId', undefined);
        setSelectedTheaterId('');
        setRooms([]);
    };

    // Handler cho việc chọn phim
    const handleMovieChange = (movieId: string) => {
        const movie = movies.find(m => m._id === movieId);
        setSelectedMovie(movie || null);
    };

    // Set selectedMovie khi edit
    useEffect(() => {
        if (editData && movies.length > 0) {
            const movie = movies.find(m => m._id === editData.movieId._id);
            if (movie) {
                setSelectedMovie(movie);
            }
        }
    }, [editData, movies]);

    // Handler cho việc chọn rạp chiếu
    const handleTheaterChange = async (theaterId: string) => {
        setSelectedTheaterId(theaterId);
        
        // Chỉ reset room values khi KHÔNG đang edit (tạo mới)
        if (!editData) {
            const currentShowTimes = form.getFieldValue('showTimes') || [];
            const updatedShowTimes = currentShowTimes.map((showTime: {
                date?: dayjs.Dayjs;
                startTime?: dayjs.Dayjs;
                endTime?: dayjs.Dayjs;
                room?: string;
            }) => ({
                ...showTime,
                room: undefined // Reset room value chỉ khi tạo mới
            }));
            form.setFieldValue('showTimes', updatedShowTimes);
        }
        
        try {
            // Load rooms cho rạp này sử dụng API chuyên biệt
            const theaterRooms = await getActiveRoomsByTheaterApi(theaterId);
            setRooms(theaterRooms);
        } catch (error) {
            console.error('Error loading rooms:', error);
            toast.error('Không thể tải danh sách phòng chiếu');
            setRooms([]);
        }
    };

    // Helper: tính time theo phút
    const toMinutes = (t: string) => {
        const [h, m] = t.split(':').map(Number); return h * 60 + m;
    };
    const minutesToDayjs = (base: dayjs.Dayjs, minutes: number) => {
        const h = Math.floor(minutes / 60) % 24; const m = minutes % 60;
        return base.hour(h).minute(m).second(0).millisecond(0);
    };

    // Khi chọn ca chiếu cho 1 showTime item
    const onChangeSessionForRow = async (rowIndex: number, sessionId: string) => {
        const session = showSessions.find(s => s._id === sessionId) || null;
        // set selected session for the row
        const rows: Array<{ date?: dayjs.Dayjs; room?: string; startTime?: dayjs.Dayjs; endTime?: dayjs.Dayjs; sessionId?: string; }> = form.getFieldValue('showTimes') || [];
        const row = rows[rowIndex];
        if (!row?.date || !row?.room || !session) {
            message.warning('Vui lòng chọn ngày và phòng trước');
            return;
        }
        const dateStr = dayjs(row.date).format('YYYY-MM-DD');
        const existing = await getShowtimesByRoomAndDateApi(row.room, dateStr);
        // lọc suất trong cùng ca
        const sStart = toMinutes(session.startTime); const sEnd = toMinutes(session.endTime) + (session.endTime <= session.startTime ? 24*60 : 0);
        const listInSession = existing.filter(e => {
            const st = toMinutes(e.startTime); let en = toMinutes(e.endTime); if (en <= st) en += 24*60;
            return st >= sStart && st < sEnd;
        });
        let nextStartMin = sStart;
        if (listInSession.length > 0) {
            // sort endTime asc
            const last = listInSession.sort((a,b)=>{
                const ae = toMinutes(a.endTime) + (a.endTime <= a.startTime ? 24*60:0);
                const be = toMinutes(b.endTime) + (b.endTime <= b.startTime ? 24*60:0);
                return ae - be;
            })[listInSession.length-1];
            nextStartMin = (toMinutes(last.endTime) + 20) % (24*60); // +20p vệ sinh
        }
        rows[rowIndex].startTime = minutesToDayjs(dayjs(row.date), nextStartMin);
        // auto compute end theo duration phim
        if (selectedMovie?.duration) {
            const endMin = nextStartMin + selectedMovie.duration + 20;
            rows[rowIndex].endTime = minutesToDayjs(dayjs(row.date), endMin % (24*60));
            // validate vượt ca (trừ ca đêm)
            if (!(session.name.includes('đêm'))) {
                const over = endMin > (sEnd % (24*60));
                if (over) {
                    message.error('Suất này vượt quá ca, hãy chọn phim ngắn hơn hoặc ca khác');
                    rows[rowIndex].startTime = undefined;
                    rows[rowIndex].endTime = undefined;
                }
            }
        }
        rows[rowIndex].sessionId = sessionId;
        form.setFieldValue('showTimes', rows);
    };

    const handleSubmit = async (values: {
        movieId: string;
        regionId: string;
        theaterId: string;
        showTimes: Array<{
            date: dayjs.Dayjs;
            startTime: dayjs.Dayjs;
            endTime: dayjs.Dayjs;
            room: string;
        }>;
    }) => {
        try {
            setIsLoading(true);
            // Backend sẽ khởi tạo ghế sau; không gửi mảng ghế từ frontend

            const formattedData = {
                movieId: values.movieId,
                theaterId: values.theaterId,
                showTimes: (values.showTimes as Array<{ date: dayjs.Dayjs; startTime: dayjs.Dayjs; endTime: dayjs.Dayjs; room: string; sessionId?: string }>).map((st) => ({
                    date: st.date.toISOString(),
                    start: st.startTime.toISOString(),
                    end: st.endTime.toISOString(),
                    room: st.room,
                    // lưu kèm ca chiếu để backend có thể kiểm soát nếu cần
                    showSessionId: st.sessionId
                }))
            };

            if (editData) {
                await updateShowtime(editData._id, formattedData as unknown as IShowtime);
                toast.success('Cập nhật suất chiếu thành công!');
            } else {
                await createShowtime(formattedData as unknown as IShowtime);
                toast.success('Thêm suất chiếu thành công!');
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving showtime:', error);
            toast.error(editData ? 'Cập nhật suất chiếu thất bại!' : 'Thêm suất chiếu thất bại!');
        } finally {
            setIsLoading(false);
        }
    };

    // Validation cho ngày chiếu: phải nằm trong khoảng startDate và endDate của phim
    const validateMovieShowDate = (_: unknown, value: dayjs.Dayjs) => {
        if (!value || !selectedMovie) {
            return Promise.resolve();
        }
        
        const movieStartDate = dayjs(selectedMovie.startDate);
        const movieEndDate = dayjs(selectedMovie.endDate);
        
        if (value.isBefore(movieStartDate, 'day')) {
            return Promise.reject(new Error(`Ngày chiếu phải từ ${movieStartDate.format('DD/MM/YYYY')} (ngày khởi chiếu phim)`));
        }
        
        if (value.isAfter(movieEndDate, 'day')) {
            return Promise.reject(new Error(`Ngày chiếu phải trước ${movieEndDate.format('DD/MM/YYYY')} (ngày kết thúc chiếu phim)`));
        }
        
        if (value.isBefore(dayjs(), 'day')) {
            return Promise.reject(new Error('Ngày chiếu không được là ngày đã qua'));
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
                            onChange={handleMovieChange}
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
                            onChange={handleTheaterChange}
                            options={filteredTheaters.map(theater => ({ 
                                value: theater._id, 
                                label: theater.name 
                            }))}
                            notFoundContent={selectedRegionId ? "Không có rạp nào trong khu vực này" : "Vui lòng chọn khu vực trước"}
                        />
                    </Form.Item>
                        </div>


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
                                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'date']}
                                                        label="Ngày chiếu"
                                                        rules={[
                                                            { required: true, message: 'Vui lòng chọn ngày chiếu!' },
                                                            { validator: validateMovieShowDate }
                                                        ]}
                                                    >
                                                        <DatePicker
                                                            placeholder="Chọn ngày chiếu"
                                                            size="large"
                                                            style={{ width: '100%' }}
                                                            format="DD/MM/YYYY"
                                                            disabled={!selectedMovie}
                                                            disabledDate={(current) => {
                                                                if (!selectedMovie) return true;
                                                                const movieStart = dayjs(selectedMovie.startDate);
                                                                const movieEnd = dayjs(selectedMovie.endDate);
                                                                return current && (current.isBefore(movieStart, 'day') || current.isAfter(movieEnd, 'day') || current.isBefore(dayjs(), 'day'));
                                                            }}
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
                                                            placeholder={selectedTheaterId ? "Chọn phòng chiếu" : "Chọn rạp chiếu trước"}
                                                            size="large"
                                                            allowClear
                                                            showSearch
                                                            optionFilterProp="children"
                                                            filterOption={(input, option) =>
                                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                            }
                                                            disabled={!selectedTheaterId}
                                                            value={form.getFieldValue(['showTimes', name, 'room'])}
                                                            options={rooms.map(room => ({
                                                                value: room._id,
                                                                label: `🎬 ${room.name}`
                                                            }))}
                                                            notFoundContent={selectedTheaterId ? "Không có phòng chiếu nào" : "Vui lòng chọn rạp chiếu trước"}
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        // Re-render this block when date or room in this row changes
                                                        shouldUpdate={(prev, cur) => {
                                                            const p = prev?.showTimes?.[name] || {};
                                                            const c = cur?.showTimes?.[name] || {};
                                                            return p.date !== c.date || p.room !== c.room;
                                                        }}
                                                        noStyle
                                                    >
                                                        {() => (
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'sessionId']}
                                                                label="Ca chiếu"
                                                                rules={[{ required: true, message: 'Vui lòng chọn ca chiếu!' }]}
                                                            >
                                                                <Select
                                                                    placeholder={
                                                                        form.getFieldValue(['showTimes', name, 'date']) && form.getFieldValue(['showTimes', name, 'room'])
                                                                            ? 'Chọn ca chiếu'
                                                                            : 'Vui lòng chọn Ngày chiếu và Phòng trước'
                                                                    }
                                                                    size="large"
                                                                    showSearch
                                                                    optionFilterProp="children"
                                                                    filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
                                                                    value={form.getFieldValue(['showTimes', name, 'sessionId'])}
                                                                    options={showSessions.map(s => ({ value: s._id, label: `${s.name} (${s.startTime} - ${s.endTime})` }))}
                                                                    onChange={(val)=> onChangeSessionForRow(name, val)}
                                                                    disabled={
                                                                        !(
                                                                            form.getFieldValue(['showTimes', name, 'date']) &&
                                                                            form.getFieldValue(['showTimes', name, 'room'])
                                                                        )
                                                                    }
                                                                />
                                                            </Form.Item>
                                                        )}
                                                    </Form.Item>
                                    </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'startTime']}
                                                        label="Thời gian bắt đầu"
                                                        rules={[
                                                            { required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }
                                                        ]}
                                                    >
                                                        <TimePicker
                                                            placeholder="Chọn giờ bắt đầu"
                                                            size="large"
                                                            style={{ width: '100%' }}
                                                            format="HH:mm"
                                                            minuteStep={15}
                                                            disabled={!selectedMovie}
                                                            onChange={(time) => {
                                                                if (time && selectedMovie) {
                                                                    // Tự động tính thời gian kết thúc
                                                                    const endTime = time.add(selectedMovie.duration + 20, 'minute');
                                                                    const currentShowTimes = form.getFieldValue('showTimes') || [];
                                                                    currentShowTimes[name] = {
                                                                        ...currentShowTimes[name],
                                                                        startTime: time,
                                                                        endTime: endTime
                                                                    };
                                                                    form.setFieldValue('showTimes', currentShowTimes);
                                                                    form.setFieldValue(['showTimes', name, 'endTime'], endTime);
                                                                }
                                                            }}
                                                        />
                                                    </Form.Item>

                                                    <Form.Item
                                                        {...restField}
                                                        name={[name, 'endTime']}
                                                        label={`Thời gian kết thúc ${selectedMovie ? `(+${selectedMovie.duration + 20} phút)` : ''}`}
                                                    >
                                                        <TimePicker
                                                            placeholder="Tự động tính toán"
                                                            size="large"
                                                            style={{ width: '100%' }}
                                                            format="HH:mm"
                                                            disabled
                                                        />
                                                    </Form.Item>
                                    </div>
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
                            disabled={isLoading}
                            className={`px-4 py-2 text-white rounded cursor-pointer flex items-center gap-2 ${
                                isLoading 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-black hover:bg-gray-800'
                            }`}
                            whileHover={!isLoading ? { scale: 1.05 } : {}}
                            whileTap={!isLoading ? { scale: 0.95 } : {}}
                        >
                            {isLoading && <Spin size="small" />}
                            {isLoading 
                                ? (editData ? 'Đang cập nhật...' : 'Đang thêm...') 
                                : (editData ? 'Cập nhật' : 'Thêm suất chiếu')
                            }
                        </motion.button>
                    </div>
            </Form>
        </Modal>
    );
};

export default ShowtimeForm; 