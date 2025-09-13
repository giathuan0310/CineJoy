import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Modal, Form, Input, InputNumber } from 'antd';
import type { InputRef } from 'antd';

interface FoodComboFormProps {
    combo?: IFoodCombo;
    onSubmit: (comboData: Partial<IFoodCombo>) => void;
    onCancel: () => void;
}

const FoodComboForm: React.FC<FoodComboFormProps> = ({ combo, onSubmit, onCancel }) => {
    const nameInputRef = useRef<InputRef>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        if (combo) {
            form.setFieldsValue({
                name: combo.name,
                price: combo.price,
                description: combo.description,
                quantity: combo.quantity,
            });
        }
    }, [combo, form]);

    // Tự động focus vào input tên combo chỉ khi thêm mới (không phải edit)
    useEffect(() => {
        if (!combo) {
            const timer = setTimeout(() => {
                if (nameInputRef.current) {
                    nameInputRef.current.focus();
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [combo]);

    const handleSubmit = async (values: {
        name: string;
        price: number;
        description: string;
        quantity: number;
    }) => {
        try {
            const submitData = {
                name: values.name,
                price: values.price,
                description: values.description,
                quantity: values.quantity,
            };
            
            onSubmit(submitData);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <Modal
            open
            title={<div className="text-center text-xl md:text-xl font-semibold">{combo ? 'Sửa combo' : 'Thêm combo mới'}</div>}
            onCancel={onCancel}
            footer={null}
            width={600}
            centered
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
            >
                <Form.Item
                    name="name"
                    label="Tên combo"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên combo!' },
                        { min: 3, message: 'Tên combo phải có ít nhất 3 ký tự!' },
                        { max: 100, message: 'Tên combo không được quá 100 ký tự!' }
                    ]}
                >
                    <Input
                        ref={nameInputRef}
                        placeholder="Nhập tên combo"
                        size="large"
                    />
                </Form.Item>

                <Form.Item
                    name="price"
                    label="Giá (VNĐ)"
                    rules={[
                        { required: true, message: 'Vui lòng nhập giá combo!' },
                        { type: 'number', min: 1000, message: 'Giá combo phải ít nhất 1,000 VNĐ!' }
                    ]}
                >
                    <InputNumber
                        placeholder="Nhập giá combo"
                        size="large"
                        min={1000}
                        max={1000000}
                        step={1000}
                        style={{ width: '100%' }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        // @ts-expect-error: Ant Design InputNumber parser type constraint
                        parser={(value) => Number(value!.replace(/\$\s?|(,*)/g, '')) || 1000}
                        addonAfter="VNĐ"
                    />
                </Form.Item>

                <Form.Item
                    name="quantity"
                    label="Số lượng"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số lượng!' },
                        { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' }
                    ]}
                >
                    <InputNumber
                        placeholder="Nhập số lượng"
                        size="large"
                        min={1}
                        max={10000}
                        style={{ width: '100%' }}
                    />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mô tả combo!' },
                        { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự!' },
                        { max: 500, message: 'Mô tả không được quá 500 ký tự!' }
                    ]}
                >
                    <Input.TextArea
                        placeholder="Ví dụ: Gồm 1 Bắp + 1 Nước có gaz + 1 Snack Oishi"
                        rows={4}
                        size="large"
                        showCount
                        maxLength={500}
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
                        {combo ? 'Cập nhật' : 'Thêm mới'}
                    </motion.button>
                </div>
            </Form>
        </Modal>
    );
};

export default FoodComboForm;
