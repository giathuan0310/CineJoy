/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Modal, Form, Input, InputNumber, DatePicker, Spin, Select, message, Popconfirm } from 'antd';
import type { InputRef } from 'antd';
import dayjs from 'dayjs';
import { getFoodCombos } from '@/apiservice/apiFoodCombo';

interface VoucherFormProps {
    voucher?: IVoucher;
    onSubmit: (voucherData: Partial<IVoucher>) => Promise<void>;
    onCancel: () => void;
}

const VoucherForm: React.FC<VoucherFormProps> = ({ voucher, onSubmit, onCancel }) => {
    const nameInputRef = useRef<InputRef>(null);
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [showDetails, setShowDetails] = useState<boolean>(false);
    const [foodCombos, setFoodCombos] = useState<IFoodCombo[]>([]);

    // Load danh sách sản phẩm/combo
    useEffect(() => {
        const loadFoodCombos = async () => {
            try {
                const data = await getFoodCombos();
                setFoodCombos(data);
            } catch (error) {
                console.error('Error loading food combos:', error);
                setFoodCombos([]);
            }
        };
        loadFoodCombos();
    }, []);

    // Bơm CSS ẩn scrollbar một lần nếu chưa có
    useEffect(() => {
        const styleId = 'global-hide-scrollbar-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.innerHTML = `
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `;
            document.head.appendChild(style);
        }
    }, []);

    useEffect(() => {
        if (voucher) {
            const isTicket = voucher.applyType === 'ticket';
            const line = voucher.lines?.[0];
            
            console.log('Edit voucher:', voucher);
            console.log('Edit line:', line);
            console.log('Edit line.condition:', line?.condition);
            console.log('Edit comboName:', line?.condition?.comboName);
            console.log('Edit comboId:', line?.condition?.comboId);
            
            form.setFieldsValue({
                name: voucher.name,
                startDate: voucher.validityPeriod?.startDate ? dayjs(voucher.validityPeriod.startDate) : undefined,
                endDate: voucher.validityPeriod?.endDate ? dayjs(voucher.validityPeriod.endDate) : undefined,
                status: voucher.status || 'hoạt động',
                applyType: voucher.applyType || 'voucher',
                description: line?.description || (isTicket ? '' : `Giảm ${voucher.discountPercent || 0}% toàn hóa đơn`),
                // Chỉ load cho voucher/combo
                pointToRedeem: isTicket ? undefined : (line?.condition?.points || voucher.pointToRedeem),
                quantity: isTicket ? undefined : (line?.condition?.quantity || voucher.quantity),
                discountType: isTicket ? 'percent' : (line?.discount?.type || 'percent'),
                discountValue: line?.discount?.value || voucher.discountPercent,
                maxValue: isTicket ? undefined : (line?.discount?.maxValue || 30000),
                // Cho ticket và combo
                seatType: isTicket ? line?.condition?.seatType : undefined,
                comboName: voucher.applyType === 'combo' ? line?.condition?.comboName : undefined,
                comboId: voucher.applyType === 'combo' ? line?.condition?.comboId : undefined,
                buyItem: (isTicket || voucher.applyType === 'combo') ? line?.details?.[0]?.buyItem : undefined,
                buyQuantity: (isTicket || voucher.applyType === 'combo') ? line?.details?.[0]?.buyQuantity : undefined,
                rewardItem: (isTicket || voucher.applyType === 'combo') ? line?.details?.[0]?.rewardItem : undefined,
                rewardItemId: (isTicket || voucher.applyType === 'combo') ? line?.details?.[0]?.rewardItemId : undefined,
                rewardQuantity: (isTicket || voucher.applyType === 'combo') ? line?.details?.[0]?.rewardQuantity : undefined,
                rewardType: (isTicket || voucher.applyType === 'combo') ? line?.details?.[0]?.rewardType : undefined,
                rewardDiscountPercent: (isTicket || voucher.applyType === 'combo') ? line?.details?.[0]?.rewardDiscountPercent : undefined,
            });
            
            // Nếu có details thì hiển thị form chi tiết
            if ((isTicket && line?.details?.[0]) || (voucher.applyType === 'combo' && line?.details?.[0])) {
                setShowDetails(true);
            }
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

    // Tự động reset loại giảm giá khi thay đổi loại voucher
    const handleApplyTypeChange = (value: string) => {
        if (value === 'voucher') {
            form.setFieldValue('discountType', 'percent');
        }
    };

    // Tự động reset giá trị giảm giá khi thay đổi loại giảm giá
    const handleDiscountTypeChange = () => {
        // Reset giá trị giảm giá khi thay đổi loại
        form.setFieldValue('discountValue', undefined);
    };

    const handleSubmit = async (values: {
        name: string;
        startDate: dayjs.Dayjs;
        endDate: dayjs.Dayjs;
        status: 'hoạt động' | 'không hoạt động';
        applyType: 'voucher' | 'combo' | 'ticket';
        description: string;
        pointToRedeem?: number;
        quantity?: number;
        discountType?: 'percent' | 'amount';
        discountValue?: number;
        maxValue?: number;
        seatType?: 'normal' | 'vip' | 'couple' | '4dx';
        buyItem?: string;
        buyQuantity?: number;
        rewardItem?: string;
        rewardItemId?: string;
        rewardQuantity?: number;
        rewardType?: 'free' | 'discount';
        rewardDiscountPercent?: number;
        // Cho combo
        comboId?: string;
        comboName?: string;
    }) => {
        try {
            setIsLoading(true);
            const isTicket = values.applyType === 'ticket';
            
            const submitData: Partial<IVoucher> = {
                name: values.name,
                validityPeriod: {
                    startDate: values.startDate ? values.startDate.toDate() : new Date(),
                    endDate: values.endDate ? values.endDate.toDate() : new Date()
                },
                status: values.status,
                applyType: values.applyType,
            };

            if (isTicket) {
                // Logic cho ticket
                submitData.lines = [{
                    description: values.description,
                    condition: {
                        seatType: values.seatType
                    },
                    discount: {
                        type: 'percent' as 'percent' | 'amount',
                        value: values.discountValue || 0
                    },
                    details: showDetails ? [{
                        buyItem: values.buyItem,
                        buyQuantity: values.buyQuantity,
                        rewardItem: values.rewardItem,
                        rewardItemId: values.rewardItemId,
                        rewardQuantity: values.rewardQuantity,
                        rewardType: values.rewardType,
                        rewardDiscountPercent: values.rewardDiscountPercent
                    } as any] : []
                }];
            } else if (values.applyType === 'combo') {
                // Logic cho combo - giống ticket
                console.log('Combo values:', values);
                console.log('ComboName:', values.comboName);
                console.log('ComboId:', values.comboId);
                submitData.lines = [{
                    description: values.description,
                    condition: {
                        comboName: values.comboName,
                        comboId: values.comboId
                    },
                    discount: {
                        type: values.discountType as 'percent' | 'amount',
                        value: values.discountValue || 0
                    },
                    details: showDetails ? [{
                        buyItem: values.buyItem,
                        buyQuantity: values.buyQuantity,
                        rewardItem: values.rewardItem,
                        rewardItemId: values.rewardItemId,
                        rewardQuantity: values.rewardQuantity,
                        rewardType: values.rewardType,
                        rewardDiscountPercent: values.rewardDiscountPercent
                    } as any] : []
                }];
            } else {
                // Logic cho voucher/combo
                submitData.lines = [{
                    description: values.description,
                    condition: {
                        points: values.pointToRedeem,
                        quantity: values.quantity
                    },
                    discount: {
                        type: values.discountType!,
                        value: values.discountValue!,
                        maxValue: values.maxValue
                    },
                    details: []
                }];
                // Các trường cũ để tương thích với backend
                submitData.quantity = values.quantity;
                submitData.discountPercent = values.discountValue;
                submitData.pointToRedeem = values.pointToRedeem;
            }
            
            await onSubmit(submitData);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal
            open
            title={<div className="text-center text-xl md:text-xl font-semibold">{voucher ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi mới'}</div>}
            onCancel={onCancel}
            footer={null}
            width={700}
            centered
            destroyOnClose
            style={{ marginTop: '2vh', marginBottom: '2vh' }}
            bodyStyle={{
                maxHeight: '70vh',
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
            >
                {/* 1. Tên Khuyến mãi */}
                <Form.Item
                    name="name"
                    label="Tên khuyến mãi"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên khuyến mãi!' },
                        { min: 3, message: 'Tên khuyến mãi phải có ít nhất 3 ký tự!' },
                        { max: 100, message: 'Tên khuyến mãi không được quá 100 ký tự!' }
                    ]}
                >
                    <Input
                        ref={nameInputRef}
                        placeholder="Ví dụ: Mã giảm giá 15%"
                        size="large"
                    />
                </Form.Item>

                {/* 2. Startday, 3. Enday */}
                <div className="grid grid-cols-2 gap-4">
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
                                    if (value.isSame(startDate, 'day') || value.isAfter(startDate)) {
                                        return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Ngày kết thúc không được trước ngày bắt đầu!'));
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
                                return current && (current < dayjs().startOf('day') || (startDate && current < startDate));
                            }}
                        />
                    </Form.Item>
                </div>

                {/* 4. Trạng thái, 5. Loại */}
                <div className="grid grid-cols-2 gap-4">
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
                            options={[
                                { value: 'hoạt động', label: 'Hoạt động' },
                                { value: 'không hoạt động', label: 'Không hoạt động' }
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="applyType"
                        label="Loại"
                        rules={[
                            { required: true, message: 'Vui lòng chọn loại!' }
                        ]}
                    >
                        <Select
                            placeholder="Chọn loại"
                            size="large"
                            options={[
                                { value: 'voucher', label: 'Voucher' },
                                { value: 'combo', label: 'Combo' },
                                { value: 'ticket', label: 'Ticket' }
                            ]}
                            onChange={handleApplyTypeChange}
                        />
                    </Form.Item>
                </div>

                {/* 6. Mô tả */}
                <Form.Item
                    name="description"
                    label="Mô tả khuyến mãi"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mô tả khuyến mãi!' },
                        { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự!' },
                        { max: 200, message: 'Mô tả không được quá 200 ký tự!' }
                    ]}
                >
                    <Input.TextArea
                        placeholder="Ví dụ: Giảm 15% toàn hóa đơn"
                        size="large"
                        rows={3}
                    />
                </Form.Item>

                {/* 7. Điểm, 8. Số lượng - Chỉ hiển thị cho voucher/combo */}
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.applyType !== currentValues.applyType}>
                    {({ getFieldValue }) => {
                        const applyType = getFieldValue('applyType');
                        if (applyType === 'ticket' || applyType === 'combo') {
                            return null; // Ẩn cho ticket và combo
                        }
                        return (
                <div className="grid grid-cols-2 gap-4">
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
                </div>
                        );
                    }}
                </Form.Item>

                {/* 7.1. Các trường cho ticket/combo */}
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.applyType !== currentValues.applyType}>
                    {({ getFieldValue }) => {
                        const applyType = getFieldValue('applyType');
                        if (applyType !== 'ticket' && applyType !== 'combo') {
                            return null; // Chỉ hiển thị cho ticket và combo
                        }
                        return (
                            <div className="space-y-1">
                                <Form.Item
                                    name={applyType === 'combo' ? "comboName" : "seatType"}
                                    label={applyType === 'combo' ? "Tên combo" : "Loại ghế"}
                                    rules={[
                                        { required: true, message: applyType === 'combo' ? 'Vui lòng chọn combo!' : 'Vui lòng chọn loại ghế!' }
                                    ]}
                                    style={{ marginBottom: '8px' }}
                                >
                                    {applyType === 'combo' ? (
                                        <Select
                                            placeholder="Chọn combo"
                                            size="large"
                                            showSearch
                                            optionFilterProp="children"
                                            filterOption={(input, option) =>
                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                            }
                                            options={foodCombos.filter(item => item.type === 'combo').map(item => ({
                                                value: item.name,
                                                label: item.name,
                                                data: item
                                            }))}
                                            onChange={(value, option: any) => {
                                                // Lưu ID của combo được chọn
                                                console.log('Combo selected:', value, option);
                                                if (option && option.data) {
                                                    console.log('Setting comboId:', option.data._id);
                                                    form.setFieldValue('comboId', option.data._id);
                                                    form.setFieldValue('comboName', value);
                                                    // Nếu đã mở phần chi tiết và đã chọn "Mua combo" khác trước đó thì đồng bộ lại
                                                    const buyItem = form.getFieldValue('buyItem');
                                                    if (buyItem && buyItem !== value) {
                                                        form.setFieldValue('buyItem', value);
                                                    }
                                                }
                                            }}
                                        />
                                    ) : (
                                        <Select
                                            placeholder="Chọn loại ghế"
                                            size="large"
                                            options={[
                                                { value: 'normal', label: 'Ghế thường' },
                                                { value: 'vip', label: 'Ghế VIP' },
                                                { value: 'couple', label: 'Ghế đôi' },
                                                { value: '4dx', label: 'Ghế 4DX' }
                                            ]}
                                            onChange={(value) => {
                                                // Đồng bộ loại vé trong chi tiết nếu đang mở
                                                const labelMap: Record<string, string> = {
                                                    normal: 'Vé thường',
                                                    vip: 'Vé Vip',
                                                    couple: 'Vé Cặp đôi',
                                                    '4dx': 'Vé 4DX'
                                                };
                                                if (showDetails) {
                                                    form.setFieldValue('buyItem', labelMap[value]);
                                                }
                                            }}
                                        />
                                    )}
                                </Form.Item>
                                
                                {/* Hidden field để lưu comboId cho combo */}
                                {applyType === 'combo' && (
                                    <Form.Item name="comboId" style={{ display: 'none' }}>
                                        <Input />
                                    </Form.Item>
                                )}

                                {/* Loại giảm giá và Giá trị giảm giá cho ticket */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Form.Item
                                        name="discountType"
                                        label="Loại giảm giá"
                                        style={{ marginBottom: '8px' }}
                                    >
                                        <Select
                                            placeholder="Chọn loại giảm giá"
                                            size="large"
                                            defaultValue="percent"
                                            options={[
                                                { value: 'percent', label: 'Phần trăm (%)' }
                                            ]}
                                            disabled
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="discountValue"
                                        label="Giá trị giảm giá"
                                        rules={[
                                            { required: true, message: 'Vui lòng nhập giá trị giảm giá!' },
                                            { type: 'number', min: 0, max: 100, message: 'Giá trị phải từ 0 đến 100!' }
                                        ]}
                                        style={{ marginBottom: '8px' }}
                                    >
                                        <InputNumber
                                            placeholder="Nhập phần trăm"
                                            size="large"
                                            min={0}
                                            max={100}
                                            style={{ width: '100%' }}
                                            addonAfter="%"
                                        />
                                    </Form.Item>
                                </div>

                                {/* Nút Thêm chi tiết - chỉ hiển thị cho ticket */}
                                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.applyType !== currentValues.applyType}>
                                    {({ getFieldValue }) => {
                                        const applyType = getFieldValue('applyType');
                                        if ((applyType === 'ticket' || applyType === 'combo') && !showDetails) {
                                            return (
                                                <div className="flex justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowDetails(true)}
                                                        className="border border-dashed border-gray-300 rounded-md px-4 py-2 text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1 bg-white"
                                                    >
                                                        <span className="text-sm">+</span>
                                                        <span className="text-sm">Thêm chi tiết</span>
                                                    </button>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                </Form.Item>

                                {/* Form chi tiết - chỉ hiển thị cho ticket khi showDetails = true */}
                                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.applyType !== currentValues.applyType}>
                                    {({ getFieldValue }) => {
                                        const applyType = getFieldValue('applyType');
                                        if ((applyType === 'ticket' || applyType === 'combo') && showDetails) {
                                            return (
                                                <div className="space-y-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-base font-medium text-gray-700">Chi tiết quà tặng</h4>
                                                        <Popconfirm
                                                            title="Xóa chi tiết quà tặng"
                                                            description="Bạn có chắc muốn xóa chi tiết quà tặng?"
                                                            okText="Xóa"
                                                            cancelText="Hủy"
                                                            onConfirm={() => {
                                                                setShowDetails(false);
                                                                form.setFieldsValue({
                                                                    buyItem: undefined,
                                                                    buyQuantity: undefined,
                                                                    rewardItem: undefined,
                                                                    rewardItemId: undefined,
                                                                    rewardQuantity: undefined,
                                                                    rewardType: undefined
                                                                });
                                                                message.success('Đã xóa chi tiết quà tặng');
                                                            }}
                                                        >
                                                            <button
                                                                type="button"
                                                                className="text-gray-400 hover:text-red-600 text-lg"
                                                            >
                                                                ×
                                                            </button>
                                                        </Popconfirm>
                                                    </div>
                                                    
                                                    {/* Form cho ticket/combo */}
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Form.Item shouldUpdate={(prev, cur) => prev.comboName !== cur.comboName || prev.seatType !== cur.seatType}>
                                                            {({ getFieldValue }) => (
                                                                <Form.Item
                                                                    name="buyItem"
                                                                    label={applyType === 'combo' ? "Mua combo" : "Mua sản phẩm"}
                                                                >
                                                                    {applyType === 'combo' ? (
                                                                        <Select
                                                                            placeholder={getFieldValue('comboName') ? "Chọn combo" : "Chọn Tên combo trước"}
                                                                            size="large"
                                                                            showSearch
                                                                            optionFilterProp="children"
                                                                            filterOption={(input, option) =>
                                                                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                                            }
                                                                            disabled={!getFieldValue('comboName')}
                                                                            options={foodCombos
                                                                                .filter(item => item.type === 'combo' && (!getFieldValue('comboName') || item.name === getFieldValue('comboName')))
                                                                                .map(item => ({
                                                                                    value: item.name,
                                                                                    label: item.name,
                                                                                    data: item
                                                                                }))}
                                                                            onChange={(value, option: any) => {
                                                                                // Ràng buộc: phải chọn Tên combo trước
                                                                                const selectedComboName = getFieldValue('comboName');
                                                                                if (!selectedComboName) {
                                                                                    message.warning('Vui lòng chọn Tên combo trước.');
                                                                                    // Reset lựa chọn không hợp lệ
                                                                                    form.setFieldValue('buyItem', undefined);
                                                                                    return;
                                                                                }
                                                                                // Ràng buộc: Mua combo phải trùng Tên combo
                                                                                if (value !== selectedComboName) {
                                                                                    message.error('Mua combo phải trùng với Tên combo đã chọn.');
                                                                                    form.setFieldValue('buyItem', selectedComboName);
                                                                                    return;
                                                                                }
                                                                                // Lưu ID của combo được chọn
                                                                                if (option && option.data) {
                                                                                    form.setFieldValue('rewardItemId', option.data._id);
                                                                                    form.setFieldValue('buyItem', value);
                                                                                }
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <Select
                                                                            placeholder={getFieldValue('seatType') ? "Chọn loại vé" : "Chọn Loại ghế trước"}
                                                                            size="large"
                                                                            disabled={!getFieldValue('seatType')}
                                                                            options={(function(){
                                                                                const seatType = getFieldValue('seatType');
                                                                                const labelMap: Record<string, string> = {
                                                                                    normal: 'Vé thường',
                                                                                    vip: 'Vé Vip',
                                                                                    couple: 'Vé Cặp đôi',
                                                                                    '4dx': 'Vé 4DX'
                                                                                };
                                                                                if (!seatType) return [];
                                                                                const label = labelMap[seatType as string];
                                                                                return [{ value: label, label }];
                                                                            })()}
                                                                            onChange={(value) => {
                                                                                const seatType = getFieldValue('seatType');
                                                                                const labelMap: Record<string, string> = {
                                                                                    normal: 'Vé thường',
                                                                                    vip: 'Vé Vip',
                                                                                    couple: 'Vé Cặp đôi',
                                                                                    '4dx': 'Vé 4DX'
                                                                                };
                                                                                const expected = seatType ? labelMap[seatType as string] : undefined;
                                                                                if (!seatType) {
                                                                                    message.warning('Vui lòng chọn Loại ghế trước.');
                                                                                    form.setFieldValue('buyItem', undefined);
                                                                                    return;
                                                                                }
                                                                                if (expected && value !== expected) {
                                                                                    message.error('Loại vé phải trùng với Loại ghế đã chọn.');
                                                                                    form.setFieldValue('buyItem', expected);
                                                                                }
                                                                            }}
                                                                        />
                                                                    )}
                                                                </Form.Item>
                                                            )}
                                                        </Form.Item>
                                                        
                                                        

                                                        <Form.Item
                                                            name="buyQuantity"
                                                            label="Số lượng mua"
                                                            rules={[
                                                                { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' }
                                                            ]}
                                                        >
                                                            <InputNumber
                                                                placeholder="Nhập số lượng"
                                                                size="large"
                                                                min={1}
                                                                max={10}
                                                                style={{ width: '100%' }}
                                                            />
                                                        </Form.Item>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Form.Item
                                                            name="rewardItem"
                                                            label="Sản phẩm tặng"
                                                        >
                                                            <Select
                                                                placeholder="Chọn sản phẩm/combo"
                                                                size="large"
                                                                showSearch
                                                                optionFilterProp="children"
                                                                filterOption={(input, option) =>
                                                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                                                }
                                                                options={foodCombos.map(item => ({
                                                                    value: item.name,
                                                                    label: `${item.name} (${item.type === 'combo' ? 'Combo' : 'Sản phẩm'})`,
                                                                    data: item
                                                                }))}
                                                                onChange={(value, option: any) => {
                                                                    // Lưu ID của sản phẩm/combo được chọn
                                                                    if (option && option.data) {
                                                                        form.setFieldValue('rewardItemId', option.data._id);
                                                                        form.setFieldValue('rewardItem', value);
                                                                    }
                                                                }}
                                                            />
                                                        </Form.Item>
                                                        
                                                        {/* Hidden field để lưu rewardItemId */}
                                                        <Form.Item name="rewardItemId" style={{ display: 'none' }}>
                                                            <Input />
                                                        </Form.Item>
                                                        

                                                        <Form.Item
                                                            name="rewardQuantity"
                                                            label="Số lượng tặng"
                                                            rules={[
                                                                { type: 'number', min: 1, message: 'Số lượng phải lớn hơn 0!' }
                                                            ]}
                                                        >
                                                            <InputNumber
                                                                placeholder="Nhập số lượng"
                                                                size="large"
                                                                min={1}
                                                                max={10}
                                                                style={{ width: '100%' }}
                                                            />
                                                        </Form.Item>
                                                    </div>

                                                    <Form.Item
                                                        name="rewardType"
                                                        label="Loại tặng"
                                                    >
                                                        <Select
                                                            placeholder="Chọn loại tặng"
                                                            size="large"
                                                            options={[
                                                                { value: 'free', label: 'Miễn phí' },
                                                                { value: 'discount', label: 'Giảm giá' }
                                                            ]}
                                                            onChange={(value) => {
                                                                if (value !== 'discount') {
                                                                    form.setFieldValue('rewardDiscountPercent', undefined);
                                                                }
                                                            }}
                                                        />
                                                    </Form.Item>

                                                    {/* Phần trăm giảm cho chi tiết khi chọn Giảm giá */}
                                                    <Form.Item shouldUpdate={(prev, cur) => prev.rewardType !== cur.rewardType}>
                                                        {({ getFieldValue }) => {
                                                            const rewardType = getFieldValue('rewardType');
                                                            if (rewardType !== 'discount') return null;
                                                            return (
                                                                <Form.Item
                                                                    name="rewardDiscountPercent"
                                                                    label="Phần trăm giảm cho chi tiết"
                                                                    rules={[{ required: true, message: 'Nhập phần trăm giảm!' }]}
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
                                                            );
                                                        }}
                                                    </Form.Item>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                </Form.Item>


                            </div>
                        );
                    }}
                </Form.Item>

                {/* 9. Loại giảm giá - Chỉ hiển thị cho voucher/combo */}
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.applyType !== currentValues.applyType}>
                    {({ getFieldValue }) => {
                        const applyType = getFieldValue('applyType');
                        if (applyType === 'ticket' || applyType === 'combo') {
                            return null; // Ẩn cho ticket và combo
                        }
                        return (
                <Form.Item
                    name="discountType"
                    label="Loại giảm giá"
                    rules={[
                        { required: true, message: 'Vui lòng chọn loại giảm giá!' }
                    ]}
                >
                    <Select
                        placeholder="Chọn loại"
                        size="large"
                                    options={applyType === 'voucher' 
                                        ? [{ value: 'percent', label: 'Phần trăm (%)' }]
                                        : [
                            { value: 'percent', label: 'Phần trăm (%)' },
                            { value: 'amount', label: 'Số tiền (VNĐ)' }
                        ]}
                                    value={getFieldValue('discountType')}
                                    disabled={applyType === 'voucher'}
                                    onChange={(value) => {
                                        // Tự động reset về 'percent' khi chọn voucher
                                        if (applyType === 'voucher' && value !== 'percent') {
                                            form.setFieldValue('discountType', 'percent');
                                        }
                                        // Reset giá trị giảm giá khi thay đổi loại
                                        handleDiscountTypeChange();
                                    }}
                                />
                            </Form.Item>
                        );
                    }}
                </Form.Item>

                {/* 10. Giá trị giảm giá */}
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.applyType !== currentValues.applyType || prevValues.discountType !== currentValues.discountType}>
                    {({ getFieldValue }) => {
                        const applyType = getFieldValue('applyType');
                        const discountType = getFieldValue('discountType');
                        
                        if (applyType === 'ticket' || applyType === 'combo') {
                            return null; // Ẩn cho ticket và combo
                        }
                        
                        return (
                <Form.Item
                    name="discountValue"
                    label="Giá trị giảm giá"
                    rules={[
                        { required: true, message: 'Vui lòng nhập giá trị giảm giá!' },
                                    {
                            validator(_, value) {
                                if (!value) return Promise.resolve();
                                
                                if (discountType === 'percent') {
                                    if (value < 1 || value > 100) {
                                        return Promise.reject(new Error('Giá trị giảm giá phải từ 1-100%!'));
                                    }
                                } else if (discountType === 'amount') {
                                    if (value < 1000) {
                                        return Promise.reject(new Error('Giá trị giảm giá phải ít nhất 1,000 VNĐ!'));
                                    }
                                }
                                return Promise.resolve();
                            },
                                    },
                    ]}
                >
                            <InputNumber
                                placeholder={discountType === 'percent' ? "Nhập phần trăm" : "Nhập số tiền"}
                                size="large"
                                min={discountType === 'percent' ? 1 : 1000}
                                max={discountType === 'percent' ? 100 : 1000000}
                                style={{ width: '100%' }}
                                addonAfter={discountType === 'percent' ? '%' : 'VNĐ'}
                                formatter={discountType === 'amount' ? value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : undefined}
                                parser={discountType === 'amount' ? value => {
                                    const num = Number(value!.replace(/\$\s?|(,*)/g, ''));
                                    return Math.max(1000, Math.min(1000000, num)) as 1000 | 1000000;
                                } : undefined}
                            />
                            </Form.Item>
                        );
                    }}
                </Form.Item>

                {/* 11. Giảm tối đa - hiển thị riêng để có thể ẩn/hiện */}
                <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.applyType !== currentValues.applyType || prevValues.discountType !== currentValues.discountType}>
                    {({ getFieldValue }) => {
                        const applyType = getFieldValue('applyType');
                        const discountType = getFieldValue('discountType');
                        
                        if (applyType === 'ticket' || applyType === 'combo' || discountType === 'amount') {
                            return null; // Ẩn cho ticket, combo hoặc khi discountType là 'amount'
                        }
                        return (
                            <Form.Item
                                name="maxValue"
                                label={<span>Giảm tối đa (VNĐ) <span className="text-red-500">*</span></span>}
                                rules={[
                                    { required: true, message: 'Vui lòng nhập giá trị tối đa!' },
                                    {
                                        validator(_, value) {
                                            if (!value) return Promise.resolve();
                                            if (value < 1000) {
                                                return Promise.reject(new Error('Giá trị tối đa phải ít nhất 1,000 VNĐ!'));
                                            }
                                            return Promise.resolve();
                                        },
                                    },
                                ]}
                            >
                            <InputNumber
                                placeholder="Nhập giá trị tối đa"
                                size="large"
                                min={1000}
                                max={1000000}
                                style={{ width: '100%' }}
                                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={value => {
                                    const num = Number(value!.replace(/\$\s?|(,*)/g, ''));
                                    return Math.max(1000, Math.min(1000000, num)) as 1000 | 1000000;
                                }}
                                addonAfter="VNĐ"
                            />
                            </Form.Item>
                        );
                    }}
                </Form.Item>

                <div className="flex justify-end gap-4 mt-3">
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
                            ? (voucher ? 'Đang cập nhật...' : 'Đang thêm...') 
                            : (voucher ? 'Cập nhật' : 'Thêm mới')
                        }
                    </motion.button>
                </div>
            </Form>
        </Modal>
    );
};

export default VoucherForm;
