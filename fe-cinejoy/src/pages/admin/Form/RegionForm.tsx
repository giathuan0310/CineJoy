import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Modal, Form, Input, Spin } from 'antd';
import type { InputRef } from 'antd';

interface RegionFormProps {
    region?: IRegion;
    onSubmit: (regionData: Partial<IRegion>) => Promise<void>;
    onCancel: () => void;
}

const RegionForm: React.FC<RegionFormProps> = ({ region, onSubmit, onCancel }) => {
    const nameInputRef = useRef<InputRef>(null);
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useEffect(() => {
        if (region) {
            form.setFieldsValue({
                name: region.name
            });
        } else {
            form.resetFields();
        }
    }, [region, form]);

    useEffect(() => {
        if (!region) {
            // Auto focus chỉ khi thêm mới
            setTimeout(() => {
                nameInputRef.current?.focus();
            }, 100);
        }
    }, [region]);

    const handleSubmit = async (values: { name: string }) => {
        try {
            setIsLoading(true);
            await onSubmit(values);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            open
            title={
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {region ? 'Sửa khu vực' : 'Thêm khu vực mới'}
                    </h3>
                </div>
            }
            onCancel={onCancel}
            footer={null}
            width={500}
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
                    label="🌍 Tên khu vực"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên khu vực!' },
                        { min: 2, message: 'Tên khu vực phải có ít nhất 2 ký tự!' },
                        { max: 50, message: 'Tên khu vực không được quá 50 ký tự!' },
                        {
                            pattern: /^[a-zA-ZÀ-ỹ\s.,-]+$/,
                            message: 'Tên khu vực chỉ được chứa chữ cái, dấu cách và dấu câu!'
                        }
                    ]}
                >
                    <Input
                        ref={nameInputRef}
                        placeholder="Ví dụ: Hà Nội, TP.HCM, Đà Nẵng..."
                        size="large"
                        showCount
                        maxLength={50}
                    />
                </Form.Item>

                <div className="flex justify-end gap-4 mt-6">
                    <motion.button
                        type="button"
                        onClick={onCancel}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Hủy
                    </motion.button>
                    <motion.button
                        type="submit"
                        disabled={isLoading}
                        className={`px-6 py-2 text-white rounded-lg cursor-pointer transition-colors flex items-center gap-2 ${
                            isLoading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700'
                        }`}
                        whileHover={!isLoading ? { scale: 1.05 } : {}}
                        whileTap={!isLoading ? { scale: 0.95 } : {}}
                    >
                        {isLoading && <Spin size="small" />}
                        {isLoading 
                            ? (region ? 'Đang cập nhật...' : 'Đang thêm...') 
                            : (region ? '✏️ Cập nhật' : '➕ Thêm khu vực')
                        }
                    </motion.button>
                </div>
            </Form>
        </Modal>
    );
};

export default RegionForm;
