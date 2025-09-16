import React, { useEffect, useRef, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, message } from 'antd';
import type { InputRef } from 'antd';
import type { IRoom, ICreateRoomData } from '../../../apiservice/apiRoom';
import { getSeatsByRoomApi } from '@/services/api';

interface RoomFormProps {
    room?: IRoom;
    theaters: Array<{ _id: string; name: string; address: string; location: { city: string }; regionId: string }>;
    regions: Array<{ _id: string; name: string }>;
    onSubmit: (roomData: ICreateRoomData) => void;
    onCancel: () => void;
    loading?: boolean;
}

// Seat layout types
interface SeatLayout {
    rows: number;
    cols: number;
    seats: { [key: string]: { type: 'normal' | 'vip' | 'couple' | '4dx'; status: 'available' | 'maintenance' } }; // "A1": {type: "vip", status: "available"}
}

// Helper function to generate seat ID
const generateSeatId = (row: number, col: number): string => {
    const rowLetter = String.fromCharCode(65 + row); // A, B, C...
    return `${rowLetter}${col + 1}`;
};

// Create default seat template for 2D rooms
const createDefaultSeatTemplate = (rows: number, cols: number) => {
    const seats: { [key: string]: { type: 'normal' | 'vip' | 'couple' | '4dx'; status: 'available' | 'maintenance' } } = {};
    
    for (let row = 0; row < rows; row++) {
        // Determine how many columns for this row
        let colsForThisRow = cols;
        
        // For the last row, ensure even number of seats for couple seats
        if (row === rows - 1) {
            colsForThisRow = cols % 2 === 0 ? cols : cols - 1;
        }
        
        for (let col = 0; col < colsForThisRow; col++) {
            const seatId = generateSeatId(row, col);
            
            let seatType: 'normal' | 'vip' | 'couple' | '4dx';
            
            // First 3 rows: normal seats
            if (row < 3) {
                seatType = 'normal';
            }
            // Next 4 rows (3-6): VIP seats  
            else if (row < 7) {
                seatType = 'vip';
            }
            // ONLY the very last row: couple seats (always even number now)
            else if (row === rows - 1) {
                seatType = 'couple';
            }
            // All other rows after row 6: VIP seats
            else {
                seatType = 'vip';
            }
            
            seats[seatId] = { type: seatType, status: 'available' };
        }
    }
    
    return seats;
};

// Create seat template for 4DX rooms (all 4DX seats)
const create4DXSeatTemplate = (rows: number, cols: number) => {
    const seats: { [key: string]: { type: 'normal' | 'vip' | 'couple' | '4dx'; status: 'available' | 'maintenance' } } = {};
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const seatId = generateSeatId(row, col);
            seats[seatId] = { type: '4dx', status: 'available' }; // All seats are 4DX type
        }
    }
    
    return seats;
};

const RoomForm: React.FC<RoomFormProps> = ({ room, theaters, regions, onSubmit, onCancel, loading = false }) => {
    const nameInputRef = useRef<InputRef>(null);
    const [form] = Form.useForm();
    const [selectedRegion, setSelectedRegion] = useState<string>('');
    const [filteredTheaters, setFilteredTheaters] = useState(theaters);
    const [seatLayout, setSeatLayout] = useState<SeatLayout>({ rows: 8, cols: 10, seats: {} });
    const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; seatId: string }>({
        visible: false, x: 0, y: 0, seatId: ''
    });
    const [selectedRoomType, setSelectedRoomType] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    useEffect(() => {
        // Reset submitting state when room changes
        setIsSubmitting(false);
        
        if (room) {
            // Find region for the theater when editing
            const theater = theaters.find(t => t._id === room.theater._id);
            if (theater) {
                const regionName = theater.location.city;
                const region = regions.find(r => r.name.toLowerCase() === regionName.toLowerCase());
                if (region) {
                    setSelectedRegion(region._id);
                }
            }
            
            form.setFieldsValue({
                name: room.name,
                region: theater ? regions.find(r => r.name.toLowerCase() === theater.location.city.toLowerCase())?._id : '',
                theater: room.theater._id,
                roomType: room.roomType,
                status: room.status,
                description: room.description || ''
            });
            
            setSelectedRoomType(room.roomType);
            
            // Load existing seat layout when editing
            loadRoomSeats(room._id);
        } else {
            form.resetFields();
            setSelectedRegion('');
            setFilteredTheaters([]);
            setSelectedRoomType('2D');
            
            // Set default values for new room
            form.setFieldsValue({
                roomType: '2D',
                status: 'active'
            });
            
            // Apply default template for 2D room
            const defaultSeats = createDefaultSeatTemplate(8, 10);
            setSeatLayout({ 
                rows: 8, 
                cols: 10, 
                seats: defaultSeats 
            });
            console.log('Default 2D template created:', Object.keys(defaultSeats).length, 'seats');
        }
    }, [room, form, theaters, regions]);

    // Filter theaters based on selected region
    useEffect(() => {
        if (selectedRegion) {
            const region = regions.find(r => r._id === selectedRegion);
            if (region) {
                console.log('Selected region:', region);
                console.log('All theaters:', theaters);
                
                const regionTheaters = theaters.filter(theater => {
                    // Check if theater belongs to selected region by regionId
                    const regionMatch = theater.regionId === selectedRegion;
                    console.log(`Theater: ${theater.name}, Theater RegionId: ${theater.regionId}, Selected Region: ${selectedRegion}, Match: ${regionMatch}`);
                    return regionMatch;
                });
                
                console.log('Filtered theaters:', regionTheaters);
                setFilteredTheaters(regionTheaters);
            }
        } else {
            setFilteredTheaters([]);
        }
    }, [selectedRegion, theaters, regions]);

    useEffect(() => {
        if (!room) {
            const timer = setTimeout(() => {
                if (nameInputRef.current) {
                    nameInputRef.current.focus();
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [room]);

    const handleRegionChange = (regionId: string) => {
        setSelectedRegion(regionId);
        // Reset theater selection when region changes
        form.setFieldValue('theater', undefined);
    };

    // Load seats for a room
    const loadRoomSeats = async (roomId: string) => {
        try {
            console.log('Loading seats for room:', roomId);
            console.log('Full room object:', room);
            const response = await getSeatsByRoomApi(roomId);
            console.log('API Response:', response);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const seats = (response as any).data || [];
            console.log('Parsed seats:', seats);
            
            if (seats.length > 0) {
                console.log('Found existing seats:', seats.length);
                
                // Convert seats array to seat layout format
                const existingSeats: { [key: string]: { type: 'normal' | 'vip' | 'couple' | '4dx'; status: 'available' | 'maintenance' } } = {};
                
                seats.forEach((seat: {seatId: string; type: string; status: string}) => {
                    existingSeats[seat.seatId] = {
                        type: seat.type as 'normal' | 'vip' | 'couple' | '4dx',
                        status: seat.status as 'available' | 'maintenance'
                    };
                });
                
                // Calculate rows and cols from existing seats
                let maxRow = 0;
                let maxCol = 0;
                
                Object.keys(existingSeats).forEach(seatId => {
                    const row = seatId.charCodeAt(0) - 65; // A=0, B=1, etc.
                    const col = parseInt(seatId.substring(1)) - 1; // 1=0, 2=1, etc.
                    maxRow = Math.max(maxRow, row);
                    maxCol = Math.max(maxCol, col);
                });
                
                setSeatLayout({
                    rows: maxRow + 1,
                    cols: maxCol + 1,
                    seats: existingSeats
                });
                
                console.log('Loaded seat layout:', maxRow + 1, 'rows,', maxCol + 1, 'cols,', Object.keys(existingSeats).length, 'seats');
            } else {
                // No existing seats, create default layout
                console.log('No existing seats found, creating default layout');
                const defaultSeats = createDefaultSeatTemplate(8, 10);
                setSeatLayout({ 
                    rows: 8, 
                    cols: 10, 
                    seats: defaultSeats 
                });
            }
        } catch (error) {
            console.error('Error loading room seats:', error);
            // Fallback to default layout
            const defaultSeats = createDefaultSeatTemplate(8, 10);
            setSeatLayout({ 
                rows: 8, 
                cols: 10, 
                seats: defaultSeats 
            });
        }
    };

    // Seat layout handlers
    const handleRowsChange = (value: number | null) => {
        const constraints = getRoomConstraints(selectedRoomType);
        if (value && value >= constraints.minRows && value <= constraints.maxRows) {
            if (selectedRoomType === '2D') {
                // Apply default template for 2D rooms
                const defaultSeats = createDefaultSeatTemplate(value, seatLayout.cols);
                setSeatLayout(prev => ({ ...prev, rows: value, seats: defaultSeats }));
            } else {
                // 4DX rooms: apply normal seat template
                const defaultSeats = create4DXSeatTemplate(value, seatLayout.cols);
                setSeatLayout(prev => ({ ...prev, rows: value, seats: defaultSeats }));
            }
        }
    };

    const handleColsChange = (value: number | null) => {
        const constraints = getRoomConstraints(selectedRoomType);
        if (value && value >= constraints.minCols && value <= constraints.maxCols) {
            if (selectedRoomType === '2D') {
                // Apply default template for 2D rooms
                const defaultSeats = createDefaultSeatTemplate(seatLayout.rows, value);
                setSeatLayout({ rows: seatLayout.rows, cols: value, seats: defaultSeats });
            } else {
                // 4DX rooms: apply normal seat template
                const defaultSeats = create4DXSeatTemplate(seatLayout.rows, value);
                setSeatLayout(prev => ({ ...prev, cols: value, seats: defaultSeats }));
            }
        }
    };


    const handleSeatRightClick = (e: React.MouseEvent, seatId: string) => {
        e.preventDefault();
        
        // Calculate menu dimensions (approximate)
        const menuWidth = 200;
        const menuHeight = 300;
        
        // Get viewport dimensions
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Calculate optimal position
        let x = e.clientX;
        let y = e.clientY;
        
        // Adjust X position if menu would overflow right
        if (x + menuWidth > viewportWidth) {
            x = viewportWidth - menuWidth - 10;
        }
        
        // Adjust Y position if menu would overflow bottom
        if (y + menuHeight > viewportHeight) {
            y = viewportHeight - menuHeight - 10;
        }
        
        // Ensure minimum margins
        x = Math.max(10, x);
        y = Math.max(10, y);
        
        setContextMenu({
            visible: true,
            x,
            y,
            seatId
        });
    };

    const handleSeatTypeChange = (seatId: string, type: 'normal' | 'vip' | 'couple' | '4dx') => {
        const [rowLetter] = seatId;
        const rowIndex = rowLetter.charCodeAt(0) - 65;
        
        // Rule 1: First 3 rows (A-C) must be normal seats
        if (rowIndex < 3 && type !== 'normal') {
            message.error('3 dòng đầu tiên (A-C) bắt buộc phải là ghế thường!');
            setContextMenu({ visible: false, x: 0, y: 0, seatId: '' });
            return;
        }
        
        // Rule 2: Last row must be couple seats
        if (rowIndex === seatLayout.rows - 1 && type !== 'couple') {
            message.error('Dòng cuối cùng bắt buộc phải là ghế cặp đôi!');
            setContextMenu({ visible: false, x: 0, y: 0, seatId: '' });
            return;
        }
        
        // Rule 3: Couple seats only in last row
        if (type === 'couple' && rowIndex !== seatLayout.rows - 1) {
            message.error('Ghế cặp đôi chỉ được phép ở dòng cuối cùng!');
            setContextMenu({ visible: false, x: 0, y: 0, seatId: '' });
            return;
        }
        
        // Rule 4: 4DX seats only in 4DX rooms
        if (type === '4dx' && selectedRoomType !== '4DX') {
            message.error('Ghế 4DX chỉ được phép trong phòng 4DX!');
            setContextMenu({ visible: false, x: 0, y: 0, seatId: '' });
            return;
        }
        
        // Rule 5: Auto-cascade to prevent mixing patterns
        // When setting a row to VIP, all subsequent rows should also become VIP
        // When setting a row to Normal, all previous rows (from row 3) should also become Normal
        if (rowIndex >= 3 && rowIndex < seatLayout.rows - 1) {
            let cascadeMessage = '';
            
            if (type === 'vip') {
                // Check if any subsequent rows are Normal - they need to be cascaded to VIP
                for (let checkRow = rowIndex + 1; checkRow < seatLayout.rows - 1; checkRow++) {
                    const checkSeatId = generateSeatId(checkRow, 0);
                    const checkRowType = seatLayout.seats[checkSeatId]?.type;
                    if (checkRowType === 'normal') {
                        cascadeMessage = `Các dòng từ ${String.fromCharCode(65 + checkRow)} trở về sau sẽ được tự động chuyển thành ghế VIP để tránh xen kẽ.`;
                        break;
                    }
                }
            } else if (type === 'normal') {
                // Check if any previous rows (from row 3) are VIP - they need to be cascaded to Normal
                for (let checkRow = 3; checkRow < rowIndex; checkRow++) {
                    const checkSeatId = generateSeatId(checkRow, 0);
                    const checkRowType = seatLayout.seats[checkSeatId]?.type;
                    if (checkRowType === 'vip') {
                        cascadeMessage = `Các dòng từ ${String.fromCharCode(65 + checkRow)} đến ${String.fromCharCode(65 + rowIndex - 1)} sẽ được tự động chuyển thành ghế thường để tránh xen kẽ.`;
                        break;
                    }
                }
            }
            
            if (cascadeMessage) {
                message.info(cascadeMessage);
            }
        }
        
        // Info message for couple seats
        if (type === 'couple') {
            message.info('Dòng cuối sẽ được tự động điều chỉnh để có số ghế chẵn cho ghế cặp đôi.');
        }
        
        // Set entire row to the same type (prevents mixing within same row)
        const newSeats = { ...seatLayout.seats };
        
        // Cascade logic to prevent mixing patterns
        if (rowIndex >= 3 && rowIndex < seatLayout.rows - 1) {
            if (type === 'vip') {
                // When setting to VIP, cascade all subsequent rows to VIP
                for (let cascadeRow = rowIndex + 1; cascadeRow < seatLayout.rows - 1; cascadeRow++) {
                    const checkSeatId = generateSeatId(cascadeRow, 0);
                    if (seatLayout.seats[checkSeatId]?.type === 'normal') {
                        // Convert this row to VIP
                        for (let col = 0; col < seatLayout.cols; col++) {
                            const cascadeSeatId = generateSeatId(cascadeRow, col);
                            if (newSeats[cascadeSeatId]) {
                                newSeats[cascadeSeatId] = { ...newSeats[cascadeSeatId], type: 'vip' };
                            }
                        }
                    }
                }
            } else if (type === 'normal') {
                // When setting to Normal, cascade all previous rows (from row 3) to Normal
                for (let cascadeRow = 3; cascadeRow < rowIndex; cascadeRow++) {
                    const checkSeatId = generateSeatId(cascadeRow, 0);
                    if (seatLayout.seats[checkSeatId]?.type === 'vip') {
                        // Convert this row to Normal
                        for (let col = 0; col < seatLayout.cols; col++) {
                            const cascadeSeatId = generateSeatId(cascadeRow, col);
                            if (newSeats[cascadeSeatId]) {
                                newSeats[cascadeSeatId] = { ...newSeats[cascadeSeatId], type: 'normal' };
                            }
                        }
                    }
                }
            }
        }
        
        // Determine how many seats this row should have
        let colsForThisRow = seatLayout.cols;
        if (rowIndex === seatLayout.rows - 1 && type === 'couple') {
            // For couple seats in last row, ensure even number
            colsForThisRow = seatLayout.cols % 2 === 0 ? seatLayout.cols : seatLayout.cols - 1;
        }
        
        // Clear all seats in this row first
        for (let col = 0; col < seatLayout.cols; col++) {
            const currentSeatId = generateSeatId(rowIndex, col);
            delete newSeats[currentSeatId];
        }
        
        // Set seats for this row with the appropriate count
        for (let col = 0; col < colsForThisRow; col++) {
            const currentSeatId = generateSeatId(rowIndex, col);
            newSeats[currentSeatId] = { type, status: 'available' };
        }
        
        setSeatLayout(prev => ({ ...prev, seats: newSeats }));
        setContextMenu({ visible: false, x: 0, y: 0, seatId: '' });
    };

    const handleSeatStatusChange = (seatId: string, status: 'available' | 'maintenance') => {
        // Only change status of the specific seat (not the whole row)
        const newSeats = { ...seatLayout.seats };
        
        if (newSeats[seatId]) {
            newSeats[seatId] = { ...newSeats[seatId], status };
        }
        
        setSeatLayout(prev => ({ ...prev, seats: newSeats }));
        setContextMenu({ visible: false, x: 0, y: 0, seatId: '' });
    };

    const getSeatType = (seatId: string): 'normal' | 'vip' | 'couple' | '4dx' => {
        const seat = seatLayout.seats[seatId];
        if (!seat) {
            console.warn(`Seat ${seatId} not found in layout, defaulting to normal`);
            return 'normal';
        }
        return seat.type;
    };

    const getSeatStatus = (seatId: string): 'available' | 'maintenance' => {
        const seat = seatLayout.seats[seatId];
        if (!seat) {
            return 'available';
        }
        return seat.status;
    };

    const getSeatColor = (seatId: string): string => {
        const type = getSeatType(seatId);
        const status = getSeatStatus(seatId);
        
        // Status colors take priority
        if (status === 'maintenance') return 'bg-gray-600 border-gray-800';
        
        // Default type colors for available seats
        switch (type) {
            case 'vip': return 'bg-yellow-400 border-yellow-600';
            case 'couple': return 'bg-pink-400 border-pink-600';
            case '4dx': return 'bg-purple-400 border-purple-600';
            default: return 'bg-gray-300 border-gray-500';
        }
    };

    // Get room type constraints
    const getRoomConstraints = (roomType: string) => {
        switch (roomType) {
            case '2D':
                return { minRows: 8, maxRows: 12, minCols: 10, maxCols: 13, allowSeatTypes: true };
            case '4DX':
                return { minRows: 6, maxRows: 8, minCols: 8, maxCols: 10, allowSeatTypes: false };
            default:
                return { minRows: 8, maxRows: 8, minCols: 10, maxCols: 10, allowSeatTypes: true };
        }
    };


    const handleRoomTypeChange = (roomType: string) => {
        setSelectedRoomType(roomType);
        form.setFieldValue('roomType', roomType);
        
        // Reset seat layout when room type changes
        const constraints = getRoomConstraints(roomType);
        const newRows = Math.max(constraints.minRows, Math.min(seatLayout.rows, constraints.maxRows));
        const newCols = Math.max(constraints.minCols, Math.min(seatLayout.cols, constraints.maxCols));
        
        if (roomType === '2D') {
            // Apply default template for 2D rooms
            const defaultSeats = createDefaultSeatTemplate(newRows, newCols);
            setSeatLayout({ 
                rows: newRows, 
                cols: newCols, 
                seats: defaultSeats 
            });
        } else {
            // 4DX rooms: all seats normal (no customization)
            const defaultSeats = create4DXSeatTemplate(newRows, newCols);
            setSeatLayout({ 
                rows: newRows, 
                cols: newCols, 
                seats: defaultSeats 
            });
        }
    };

    const handleSubmit = async (values: {
        name: string;
        theater: string;
        roomType: '2D' | '4DX';
        status: 'active' | 'maintenance' | 'inactive';
        description?: string;
    }) => {
        // Prevent double submission
        if (isSubmitting) {
            console.log('Form is already submitting, ignoring duplicate submission');
            return;
        }
        
        try {
            setIsSubmitting(true);
            console.log('RoomForm: Starting submit process');
            
            // Auto-calculate capacity from seat layout (considering last row adjustment)
            let capacity = seatLayout.rows * seatLayout.cols;
            
            // Subtract 1 if last row had odd columns (for 2D rooms with couple seats)
            if (values.roomType === '2D' && seatLayout.cols % 2 !== 0) {
                capacity = capacity - 1; // Last row loses 1 seat to make it even
            }
            
            const submitData: ICreateRoomData = {
                name: values.name,
                theater: values.theater,
                capacity: capacity,
                roomType: values.roomType,
                status: values.status,
                description: values.description,
                seatLayout: seatLayout
            };
            
            console.log('RoomForm: Calling onSubmit with data:', submitData);
            console.log('SeatLayout details:', {
                rows: seatLayout.rows,
                cols: seatLayout.cols,
                seatsCount: Object.keys(seatLayout.seats).length,
                sampleSeats: Object.keys(seatLayout.seats).slice(0, 5)
            });
            onSubmit(submitData);
            
        } catch (error) {
            console.error('Error submitting room form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const roomTypes = [
        { value: '2D', label: '2D' },
        { value: '4DX', label: '4DX' }
    ];

    const statusOptions = [
        { value: 'active', label: 'Hoạt động' },
        { value: 'maintenance', label: 'Bảo trì' },
        { value: 'inactive', label: 'Không hoạt động' }
    ];

    return (
        <Modal
            open
            title={
                <div className="text-center text-xl font-semibold">
                    {room ? 'Sửa phòng chiếu' : 'Thêm phòng chiếu mới'}
                </div>
            }
            onCancel={onCancel}
            footer={null}
            width={650}
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
                <Form.Item
                    name="name"
                    label="Tên phòng chiếu"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên phòng chiếu!' },
                        { min: 2, message: 'Tên phòng chiếu phải có ít nhất 2 ký tự!' },
                        { max: 50, message: 'Tên phòng chiếu không được quá 50 ký tự!' }
                    ]}
                >
                    <Input
                        ref={nameInputRef}
                        placeholder="VD: Room 1"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    name="region"
                    label="Khu vực"
                    rules={[
                        { required: true, message: 'Vui lòng chọn khu vực!' }
                    ]}
                >
                    <Select
                        placeholder="Chọn khu vực"
                        size="large"
                        onChange={handleRegionChange}
                        options={regions.map(region => ({
                            value: region._id,
                            label: region.name
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="theater"
                    label="Rạp chiếu"
                    rules={[
                        { required: true, message: 'Vui lòng chọn rạp chiếu!' }
                    ]}
                >
                    <Select
                        placeholder={selectedRegion ? "Chọn rạp chiếu" : "Vui lòng chọn khu vực trước"}
                        size="large"
                        showSearch
                        disabled={!selectedRegion || filteredTheaters.length === 0}
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={filteredTheaters.map(theater => ({
                            value: theater._id,
                            label: `${theater.name} - ${theater.address}`
                        }))}
                    />
                </Form.Item>

                <Form.Item
                        name="roomType"
                        label="Loại phòng"
                        rules={[
                            { required: true, message: 'Vui lòng chọn loại phòng!' }
                        ]}
                    >
                        <Select
                            placeholder="Chọn loại phòng"
                            size="large"
                            onChange={handleRoomTypeChange}
                            options={roomTypes}
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
                        options={statusOptions}
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả (tùy chọn)"
                    rules={[
                        { max: 500, message: 'Mô tả không được quá 500 ký tự!' }
                    ]}
                >
                    <Input.TextArea
                        placeholder="Mô tả thêm về phòng chiếu..."
                        rows={3}
                        size="large"
                        showCount
                        maxLength={500}
                    />
                </Form.Item>

                {/* Seat Layout Section */}
                <div className="mt-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h3 className="text-lg font-semibold mb-4">Thiết kế sơ đồ ghế ngồi</h3>
                    
                    {!selectedRoomType && (
                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-sm text-yellow-800">
                                ⚠️ Vui lòng chọn loại phòng trước để thiết kế sơ đồ ghế ngồi.
                            </p>
                        </div>
                    )}
                    
                    {/* Layout Controls */}
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-2 min-h-[40px] flex items-start">
                                <span>
                                    Số dòng (A, B, C...)
                                    {selectedRoomType && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {selectedRoomType}: {getRoomConstraints(selectedRoomType).minRows}-{getRoomConstraints(selectedRoomType).maxRows} dòng
                                        </div>
                                    )}
                                </span>
                            </label>
                            <InputNumber
                                value={seatLayout.rows}
                                onChange={handleRowsChange}
                                min={selectedRoomType ? getRoomConstraints(selectedRoomType).minRows : 8}
                                max={selectedRoomType ? getRoomConstraints(selectedRoomType).maxRows : 8}
                                size="large"
                                placeholder="Số dòng"
                                style={{ width: '100%' }}
                                disabled={!selectedRoomType}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-sm font-medium mb-2 min-h-[40px] flex items-start">
                                <span>
                                    Số ghế mỗi dòng
                                    {selectedRoomType && (
                                        <div className="text-xs text-gray-500 mt-1">
                                            {selectedRoomType}: {getRoomConstraints(selectedRoomType).minCols}-{getRoomConstraints(selectedRoomType).maxCols} ghế
                                        </div>
                                    )}
                                </span>
                            </label>
                            <InputNumber
                                value={seatLayout.cols}
                                onChange={handleColsChange}
                                min={selectedRoomType ? getRoomConstraints(selectedRoomType).minCols : 10}
                                max={selectedRoomType ? getRoomConstraints(selectedRoomType).maxCols : 10}
                                size="large"
                                placeholder="Số ghế"
                                style={{ width: '100%' }}
                                disabled={!selectedRoomType}
                            />
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 text-justify">
                                💡 <strong>Hướng dẫn:</strong> {
                                    selectedRoomType === '4DX' 
                                        ? 'Phòng 4DX tất cả ghế đều giống nhau, không thể thay đổi loại ghế.'
                                        : 'Phòng 2D có quy tắc: 3 dòng đầu (A-C) bắt buộc là ghế thường, dòng cuối bắt buộc là ghế cặp đôi. Các dòng giữa có tính năng auto-cascade để tránh xen kẽ. Nhấp chuột phải để thay đổi loại ghế (cả dòng) hoặc trạng thái ghế (từng ghế). Ghế bảo trì sẽ có dấu X đỏ đè lên.'
                                }
                        </p>
                    </div>

                    {/* Seat Legend */}
                    {selectedRoomType && (
                        <div className="mb-4">
                            {/* Seat Types Legend */}
                            <div className="mb-3">
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Loại ghế:</h4>
                                <div className="flex gap-4">
                                    {selectedRoomType === '2D' && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-gray-300 border border-gray-500 rounded"></div>
                                                <span className="text-sm">Ghế thường</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-yellow-400 border border-yellow-600 rounded"></div>
                                                <span className="text-sm">Ghế VIP</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 bg-pink-400 border border-pink-600 rounded"></div>
                                                <span className="text-sm">Ghế đôi</span>
                                            </div>
                                        </>
                                    )}
                                    {selectedRoomType === '4DX' && (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 bg-purple-400 border border-purple-600 rounded"></div>
                                            <span className="text-sm">Ghế 4DX</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            {/* Seat Status Legend */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-700 mb-2">Trạng thái ghế:</h4>
                                <div className="flex gap-4 flex-wrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gray-600 border border-gray-800 rounded relative flex items-center justify-center">
                                            <span className="text-red-600 text-sm font-bold">✕</span>
                                        </div>
                                        <span className="text-sm">Bảo trì</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Seat Grid */}
                    <div className="bg-white p-4 rounded-lg border border-gray-200 max-h-100 overflow-auto w-full">
                        <div className="text-center mb-4">
                            <div className="inline-block bg-gray-800 text-white px-8 py-2 rounded-lg">
                                MÀN HÌNH
                            </div>
                        </div>
                        
                        <div className="space-y-2 w-full">
                            {Array.from({ length: seatLayout.rows }, (_, rowIndex) => {
                                // Check if this is the last row and should be centered
                                const isLastRow = rowIndex === seatLayout.rows - 1;
                                const firstSeatId = generateSeatId(rowIndex, 0);
                                const isCoupleSeatRow = getSeatType(firstSeatId) === 'couple';
                                
                                // Count actual seats in this row (for couple rows with odd total columns)
                                const actualSeatsInRow = Array.from({ length: seatLayout.cols }, (_, colIndex) => {
                                    const seatId = generateSeatId(rowIndex, colIndex);
                                    return seatId in seatLayout.seats;
                                }).filter(Boolean).length;
                                
                                // Center couple rows in last row when they have fewer seats than total columns
                                const shouldCenter = isLastRow && isCoupleSeatRow && actualSeatsInRow < seatLayout.cols;
                                
                                if (shouldCenter) {
                                    // Render last row with centering (flex layout) - couple seats grouped in pairs
                                    return (
                                        <div key={`row-${rowIndex}`} className="w-full flex justify-center gap-3">
                                            {Array.from({ length: Math.ceil(actualSeatsInRow / 2) }, (_, pairIndex) => (
                                                <div key={`pair-${pairIndex}`} className="flex gap-1">
                                                    {[0, 1].map(seatInPair => {
                                                        const colIndex = pairIndex * 2 + seatInPair;
                                                        const seatId = generateSeatId(rowIndex, colIndex);
                                                        const seatExists = seatId in seatLayout.seats;
                                                        
                                                        if (!seatExists) {
                                                            return null; // Don't render missing seat
                                                        }
                                                        
                                                        const seatType = getSeatType(seatId);
                                                        const seatStatus = getSeatStatus(seatId);
                                                        const seatColor = getSeatColor(seatId);
                                                        
                                                        return (
                                                            <div
                                                                key={seatId}
                                                                className={`w-8 h-8 ${seatColor} border-2 rounded cursor-pointer flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity relative`}
                                                                onContextMenu={(e) => handleSeatRightClick(e, seatId)}
                                                                title={`${seatId} - ${seatType} - ${seatStatus}`}
                                                            >
                                                                {seatId}
                                                                {seatStatus === 'maintenance' && (
                                                                    <div className="absolute inset-0 flex items-center justify-center text-red-600 text-lg font-bold pointer-events-none">
                                                                        ✕
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    }).filter(Boolean)}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                } else {
                                    // Render normal rows - couple seats grouped in pairs, others as grid
                                    const firstSeatType = getSeatType(generateSeatId(rowIndex, 0));
                                    const isCoupleSeatRowNormal = firstSeatType === 'couple';
                                    
                                    if (isCoupleSeatRowNormal) {
                                        // Render couple seats as pairs
                                        return (
                                            <div key={`row-${rowIndex}`} className="w-full flex justify-center gap-3">
                                                {Array.from({ length: Math.ceil(seatLayout.cols / 2) }, (_, pairIndex) => (
                                                    <div key={`pair-${pairIndex}`} className="flex gap-1">
                                                        {[0, 1].map(seatInPair => {
                                                            const colIndex = pairIndex * 2 + seatInPair;
                                                            const seatId = generateSeatId(rowIndex, colIndex);
                                                            const seatExists = seatId in seatLayout.seats;
                                                            
                                                            if (!seatExists) {
                                                                return null; // Don't render missing seat
                                                            }
                                                            
                                                            const seatType = getSeatType(seatId);
                                                            const seatStatus = getSeatStatus(seatId);
                                                            const seatColor = getSeatColor(seatId);
                                                            
                                                            return (
                                                                <div
                                                                    key={seatId}
                                                                    className={`w-8 h-8 ${seatColor} border-2 rounded cursor-pointer flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity relative`}
                                                                    onContextMenu={(e) => handleSeatRightClick(e, seatId)}
                                                                    title={`${seatId} - ${seatType} - ${seatStatus}`}
                                                                >
                                                                    {seatId}
                                                                    {seatStatus === 'maintenance' && (
                                                                        <div className="absolute inset-0 flex items-center justify-center text-red-600 text-lg font-bold pointer-events-none">
                                                                            ✕
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        }).filter(Boolean)}
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    } else {
                                        // Render normal seats as grid
                                        return (
                                            <div 
                                                key={`row-${rowIndex}`} 
                                                className="w-full grid gap-2"
                                                style={{ gridTemplateColumns: `repeat(${seatLayout.cols}, 1fr)` }}
                                            >
                                            {Array.from({ length: seatLayout.cols }, (_, colIndex) => {
                                                const seatId = generateSeatId(rowIndex, colIndex);
                                                const seatExists = seatId in seatLayout.seats;
                                                
                                                if (!seatExists) {
                                                    // Return empty placeholder for grid alignment
                                                    return (
                                                        <div
                                                            key={seatId}
                                                            className="w-8 h-8 border-2 border-dashed border-gray-300 rounded opacity-30"
                                                        >
                                                        </div>
                                                    );
                                                }
                                                
                                                const seatType = getSeatType(seatId);
                                                const seatStatus = getSeatStatus(seatId);
                                                const seatColor = getSeatColor(seatId);
                                                
                                                return (
                                                    <div
                                                        key={seatId}
                                                        className={`w-8 h-8 ${seatColor} border-2 rounded cursor-pointer flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity relative`}
                                                        onContextMenu={(e) => handleSeatRightClick(e, seatId)}
                                                        title={`${seatId} - ${seatType} - ${seatStatus}`}
                                                    >
                                                        {seatId}
                                                        {seatStatus === 'maintenance' && (
                                                            <div className="absolute inset-0 flex items-center justify-center text-red-600 text-lg font-bold pointer-events-none">
                                                                ✕
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                            </div>
                                        );
                                    }
                                }
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <Button
                        type="default"
                        onClick={onCancel}
                        size="large"
                        disabled={loading || isSubmitting}
                    >
                        Hủy
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        size="large"
                        loading={loading || isSubmitting}
                        disabled={loading || isSubmitting}
                        className="bg-black hover:bg-gray-800"
                    >
                        {loading || isSubmitting ? (room ? 'Đang cập nhật...' : 'Đang thêm...') : (room ? 'Cập nhật' : 'Thêm mới')}
                    </Button>
                </div>
            </Form>

            {/* Context Menu */}
            {contextMenu.visible && (
                <div
                    className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 py-2 min-w-48"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onMouseLeave={() => setContextMenu({ visible: false, x: 0, y: 0, seatId: '' })}
                >
                    {/* Seat Type Section - Only show for 2D rooms */}
                    {selectedRoomType === '2D' && (
                        <>
                            <div className="px-3 py-1 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                Loại ghế
                            </div>
                            <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                onClick={() => handleSeatTypeChange(contextMenu.seatId, 'normal')}
                            >
                                🪑 Ghế thường
                            </button>
                            <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                onClick={() => handleSeatTypeChange(contextMenu.seatId, 'vip')}
                            >
                                ⭐ Ghế VIP
                            </button>
                            <button
                                className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                                onClick={() => handleSeatTypeChange(contextMenu.seatId, 'couple')}
                            >
                                💕 Ghế đôi
                            </button>
                            
                            {/* Divider */}
                            <div className="border-t border-gray-200 my-1"></div>
                        </>
                    )}
                    
                    {/* Seat Status Section */}
                    <div className="px-3 py-1 bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                        Trạng thái ghế
                    </div>
                    <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        onClick={() => handleSeatStatusChange(contextMenu.seatId, 'available')}
                    >
                        ✅ Có thể đặt
                    </button>
                    <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
                        onClick={() => handleSeatStatusChange(contextMenu.seatId, 'maintenance')}
                    >
                        🔧 Bảo trì
                    </button>
                </div>
            )}
        </Modal>
    );
};

export default RoomForm;
