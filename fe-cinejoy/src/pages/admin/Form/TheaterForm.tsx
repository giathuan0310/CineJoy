import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Modal, Form, Input, Select } from 'antd';
import type { InputRef } from 'antd';
import { getRegions } from '@/apiservice/apiRegion';
import { toast } from 'react-toastify';

interface TheaterFormProps {
    theater?: ITheater;
    onSubmit: (theaterData: Partial<ITheater>) => void;
    onCancel: () => void;
    loading?: boolean;
}

const TheaterForm: React.FC<TheaterFormProps> = ({ theater, onSubmit, onCancel, loading = false }) => {
    const nameInputRef = useRef<InputRef>(null);
    const [form] = Form.useForm();
    const [regions, setRegions] = useState<IRegion[]>([]);

    useEffect(() => {
        // Load regions for dropdown
        const loadRegions = async () => {
            try {
                const regionsData = await getRegions();
                setRegions(regionsData || []);
            } catch (error) {
                console.error('Error loading regions:', error);
                toast.error('Không thể tải danh sách khu vực');
            }
        };
        loadRegions();
    }, []);

    useEffect(() => {
        if (theater) {
            form.setFieldsValue({
                name: theater.name,
                location: {
                    city: theater.location.city,
                    address: theater.location.address
                }
            });
        } else {
            form.resetFields();
        }
    }, [theater, form]);

    useEffect(() => {
        if (!theater) {
            // Auto focus chỉ khi thêm mới
            setTimeout(() => {
                nameInputRef.current?.focus();
            }, 100);
        }
    }, [theater]);

    const handleSubmit = async (values: {
        name: string;
        location: {
            city: string;
            address: string;
        };
    }) => {
        await onSubmit(values);
    };

    return (
        <Modal
            open
            title={
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {theater ? 'Sửa rạp chiếu' : 'Thêm rạp chiếu mới'}
                    </h3>
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
                    label="🏢 Tên rạp"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên rạp!' },
                        { min: 3, message: 'Tên rạp phải có ít nhất 3 ký tự!' },
                        { max: 100, message: 'Tên rạp không được quá 100 ký tự!' }
                    ]}
                >
                    <Input
                        ref={nameInputRef}
                        placeholder="Ví dụ: CGV Vincom Center, Lotte Cinema..."
                        size="large"
                        showCount
                        maxLength={100}
                    />
                </Form.Item>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name={['location', 'city']}
                        label="🌍 Thành phố"
                        rules={[
                            { required: true, message: 'Vui lòng chọn thành phố!' }
                        ]}
                    >
                        <Select
                            placeholder="Chọn thành phố"
                            size="large"
                            showSearch
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={regions.map(region => ({
                                value: region.name,
                                label: region.name
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name={['location', 'address']}
                        label="📍 Địa chỉ"
                        rules={[
                            { required: true, message: 'Vui lòng nhập địa chỉ!' },
                            { min: 10, message: 'Địa chỉ phải có ít nhất 10 ký tự!' },
                            { max: 200, message: 'Địa chỉ không được quá 200 ký tự!' }
                        ]}
                    >
                        <Input
                            placeholder="Ví dụ: Tầng 5, Vincom Center, 191 Bà Triệu..."
                            size="large"
                            showCount
                            maxLength={200}
                        />
                    </Form.Item>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <motion.button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={!loading ? { scale: 1.05 } : {}}
                        whileTap={!loading ? { scale: 0.95 } : {}}
                    >
                        Hủy
                    </motion.button>
                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={!loading ? { scale: 1.05 } : {}}
                        whileTap={!loading ? { scale: 0.95 } : {}}
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin">⏳</div>
                                {theater ? 'Đang cập nhật...' : 'Đang thêm...'}
                            </div>
                        ) : (
                            theater ? '✏️ Cập nhật' : '➕ Thêm rạp'
                        )}
                    </motion.button>
                </div>
            </Form>
        </Modal>
    );
};

export default TheaterForm;
