import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Select, TimePicker } from 'antd';
import dayjs from 'dayjs';

interface ShowSessionFormProps {
    showSession?: IShowSession;
    onSubmit: (sessionData: Partial<IShowSession>) => void;
    onCancel: () => void;
    loading?: boolean;
}

const ShowSessionForm: React.FC<ShowSessionFormProps> = ({ 
    showSession, 
    onSubmit, 
    onCancel, 
    loading = false 
}) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Danh sách tên ca chiếu mặc định với thời gian gợi ý
    const sessionNameOptions = [
        { value: 'Ca sáng', label: 'Ca sáng', suggestedStart: '08:00', suggestedEnd: '13:00' },
        { value: 'Ca chiều', label: 'Ca chiều', suggestedStart: '13:00', suggestedEnd: '18:00' },
        { value: 'Ca tối', label: 'Ca tối', suggestedStart: '18:00', suggestedEnd: '20:30' },
        { value: 'Ca đêm', label: 'Ca đêm', suggestedStart: '20:30', suggestedEnd: '00:00' }
    ];

    // Handler cho việc chọn tên ca chiếu
    const handleSessionNameChange = (value: string) => {
        const selectedOption = sessionNameOptions.find(option => option.value === value);
        if (selectedOption) {
            // Auto-fill thời gian gợi ý
            form.setFieldsValue({
                startTime: dayjs(selectedOption.suggestedStart, 'HH:mm'),
                endTime: dayjs(selectedOption.suggestedEnd, 'HH:mm')
            });
        }
    };

    useEffect(() => {
        if (showSession) {
            form.setFieldsValue({
                name: showSession.name,
                startTime: dayjs(showSession.startTime, 'HH:mm'),
                endTime: dayjs(showSession.endTime, 'HH:mm')
            });
        } else {
            form.resetFields();
        }
    }, [showSession, form]);

    const handleSubmit = async (values: {
        name: string;
        startTime: dayjs.Dayjs;
        endTime: dayjs.Dayjs;
    }) => {
        // Prevent double submission
        if (isSubmitting) {
            console.log('Form is already submitting, ignoring duplicate submission');
            return;
        }

        try {
            setIsSubmitting(true);
            
            const submitData: Partial<IShowSession> = {
                name: values.name,
                startTime: values.startTime.format('HH:mm'),
                endTime: values.endTime.format('HH:mm')
            };

            console.log('ShowSessionForm: Calling onSubmit with data:', submitData);
            onSubmit(submitData);
            
        } catch (error) {
            console.error('Error submitting show session form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Validation function for time range
    const validateTimeRange = (_: unknown, value: dayjs.Dayjs) => {
        if (!value) {
            return Promise.resolve();
        }
        
        const startTime = form.getFieldValue('startTime');
        const endTime = form.getFieldValue('endTime');
        
        if (startTime && endTime) {
            // Xử lý trường hợp ca đêm qua ngày (VD: 20:30 - 00:00)
            const startHour = startTime.hour();
            const endHour = endTime.hour();
            
            // Nếu bắt đầu sau 20h và kết thúc lúc 0h thì coi như qua ngày
            if (startHour >= 20 && endHour === 0) {
                return Promise.resolve(); // Ca qua ngày là hợp lệ
            }
            
            // Kiểm tra bình thường cho các ca trong ngày
            if (startTime.isSameOrAfter(endTime)) {
                return Promise.reject(new Error('Thời gian kết thúc phải lớn hơn thời gian bắt đầu!'));
            }
        }
        
        return Promise.resolve();
    };

    return (
        <Modal
            open
            title={
                <div className="text-center text-xl font-semibold">
                    {showSession ? 'Sửa ca chiếu' : 'Thêm ca chiếu mới'}
                </div>
            }
            onCancel={onCancel}
            footer={null}
            width={600}
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
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}
            className="hide-scrollbar"
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
                className="mt-4"
            >
                <Form.Item
                    name="name"
                    label="Tên ca chiếu"
                    rules={[
                        { required: true, message: 'Vui lòng chọn tên ca chiếu!' }
                    ]}
                >
                    <Select
                        placeholder="Chọn tên ca chiếu"
                        size="large"
                        showSearch
                        allowClear
                        optionFilterProp="children"
                        filterOption={(input, option) =>
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={sessionNameOptions}
                        onChange={handleSessionNameChange}
                    />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="startTime"
                        label="Thời gian bắt đầu"
                        rules={[
                            { required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }
                        ]}
                    >
                        <TimePicker
                            placeholder="Chọn thời gian bắt đầu"
                            size="large"
                            format="HH:mm"
                            style={{ width: '100%' }}
                            minuteStep={15}
                        />
                    </Form.Item>

                    <Form.Item
                        name="endTime"
                        label="Thời gian kết thúc"
                        rules={[
                            { required: true, message: 'Vui lòng chọn thời gian kết thúc!' },
                            { validator: validateTimeRange }
                        ]}
                    >
                        <TimePicker
                            placeholder="Chọn thời gian kết thúc"
                            size="large"
                            format="HH:mm"
                            style={{ width: '100%' }}
                            minuteStep={15}
                        />
                    </Form.Item>
                </div>

                {/* Instructions */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Hướng dẫn:</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li>• <strong>Ca sáng:</strong> 08:00 - 13:00 (5 tiếng)</li>
                        <li>• <strong>Ca chiều:</strong> 13:00 - 18:00 (5 tiếng)</li>
                        <li>• <strong>Ca tối:</strong> 18:00 - 20:30 (2.5 tiếng)</li>
                        <li>• <strong>Ca đêm:</strong> 20:30 - 00:00 (3.5 tiếng, qua ngày)</li>
                    </ul>
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
                        {loading || isSubmitting ? (showSession ? 'Đang cập nhật...' : 'Đang thêm...') : (showSession ? 'Cập nhật' : 'Thêm mới')}
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default ShowSessionForm;
