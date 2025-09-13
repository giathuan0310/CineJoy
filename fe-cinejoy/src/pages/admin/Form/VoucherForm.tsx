import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Modal, Form, Input, InputNumber, DatePicker } from 'antd';
import type { InputRef } from 'antd';
import dayjs from 'dayjs';

interface VoucherFormProps {
    voucher?: IVoucher;
    onSubmit: (voucherData: Partial<IVoucher>) => void;
    onCancel: () => void;
}

const VoucherForm: React.FC<VoucherFormProps> = ({ voucher, onSubmit, onCancel }) => {
    const nameInputRef = useRef<InputRef>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        if (voucher) {
            form.setFieldsValue({
                name: voucher.name,
                quantity: voucher.quantity,
                discountPercent: voucher.discountPercent,
                pointToRedeem: voucher.pointToRedeem,
                startDate: voucher.validityPeriod?.startDate ? dayjs(voucher.validityPeriod.startDate) : undefined,
                endDate: voucher.validityPeriod?.endDate ? dayjs(voucher.validityPeriod.endDate) : undefined,
            });
        }
    }, [voucher, form]);

    // Tự động focus vào input tên voucher chỉ khi thêm mới (không phải edit)
    useEffect(() => {
        if (!voucher) {
            const timer = setTimeout(() => {
                if (nameInputRef.current) {
                    nameInputRef.current.focus();
                }
            }, 100);

            return () => clearTimeout(timer);
        }
    }, [voucher]);

    const handleSubmit = async (values: {
        name: string;
        quantity: number;
        discountPercent: number;
        pointToRedeem: number;
        startDate: dayjs.Dayjs;
        endDate: dayjs.Dayjs;
    }) => {
        try {
            const submitData = {
                name: values.name,
                quantity: values.quantity,
                discountPercent: values.discountPercent,
                pointToRedeem: values.pointToRedeem,
                validityPeriod: {
                    startDate: values.startDate ? values.startDate.toISOString() : new Date().toISOString(),
                    endDate: values.endDate ? values.endDate.toISOString() : new Date().toISOString()
                }
            };
            
            onSubmit(submitData);
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <Modal
            open
            title={<div className="text-center text-xl md:text-xl font-semibold">{voucher ? 'Sửa voucher' : 'Thêm voucher mới'}</div>}
            onCancel={onCancel}
            footer={null}
            width={700}
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
                        name="name"
                        label="Tên voucher"
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên voucher!' },
                            { min: 3, message: 'Tên voucher phải có ít nhất 3 ký tự!' },
                            { max: 100, message: 'Tên voucher không được quá 100 ký tự!' }
                        ]}
                    >
                        <Input
                            ref={nameInputRef}
                            placeholder="Ví dụ: Mã giảm giá 15%"
                            size="large"
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
                        name="discountPercent"
                        label="Phần trăm giảm giá (%)"
                        rules={[
                            { required: true, message: 'Vui lòng nhập phần trăm giảm giá!' },
                            { type: 'number', min: 1, max: 100, message: 'Phần trăm giảm giá phải từ 1-100%!' }
                        ]}
                    >
                        <InputNumber
                            placeholder="Nhập phần trăm"
                            size="large"
                            min={1}
                            max={100}
                            style={{ width: '100%' }}
                            addonAfter="%"
                        />
                    </Form.Item>

                    <Form.Item
                        name="pointToRedeem"
                        label="Điểm để đổi"
                        rules={[
                            { required: true, message: 'Vui lòng nhập điểm để đổi!' },
                            { type: 'number', min: 50, message: 'Điểm để đổi phải ít nhất 50 điểm!' }
                        ]}
                    >
                        <InputNumber
                            placeholder="Nhập số điểm"
                            size="large"
                            min={50}
                            max={10000}
                            style={{ width: '100%' }}
                            addonAfter="điểm"
                        />
                    </Form.Item>

                    <Form.Item
                        name="startDate"
                        label="Ngày bắt đầu"
                        rules={[
                            { required: true, message: 'Vui lòng chọn ngày bắt đầu!' }
                        ]}
                    >
                        <DatePicker
                            placeholder="Chọn ngày bắt đầu"
                            size="large"
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="endDate"
                        label="Ngày kết thúc"
                        rules={[
                            { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    const startDate = getFieldValue('startDate');
                                    if (!value || !startDate) {
                                        return Promise.resolve();
                                    }
                                    if (value.isAfter(startDate)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu!'));
                                },
                            }),
                        ]}
                    >
                        <DatePicker
                            placeholder="Chọn ngày kết thúc"
                            size="large"
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            disabledDate={(current) => {
                                const startDate = form.getFieldValue('startDate');
                                return current && (current < dayjs().startOf('day') || (startDate && current <= startDate));
                            }}
                        />
                    </Form.Item>
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
                        {voucher ? 'Cập nhật' : 'Thêm mới'}
                    </motion.button>
                </div>
            </Form>
        </Modal>
    );
};

export default VoucherForm;
