import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Modal, Form, Input, InputNumber, Spin, Select, Button, Card, Space, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';

const { Option } = Select;

interface FoodComboFormProps {
    combo?: IFoodCombo;
    onSubmit: (comboData: Partial<IFoodCombo>) => Promise<void>;
    onCancel: () => void;
}

const FoodComboForm: React.FC<FoodComboFormProps> = ({ combo, onSubmit, onCancel }) => {
    const nameInputRef = useRef<InputRef>(null);
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [productType, setProductType] = useState<'single' | 'combo'>('single');
    const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
    const [availableProducts, setAvailableProducts] = useState<IFoodCombo[]>([]);
    const [itemMaxQuantities, setItemMaxQuantities] = useState<{[key: number]: number}>({});

    useEffect(() => {
        if (combo) {
            const type = combo.type || 'single';
            setProductType(type);
            if (combo.discountType) {
                setDiscountType(combo.discountType);
            }
            
            // Xử lý items để đảm bảo productId là string
            const processedItems = (combo.items || []).map((item: IComboItem & { productId: string | { _id: string } }) => ({
                ...item,
                productId: typeof item.productId === 'object' ? (item.productId as { _id: string })._id : item.productId
            }));

            form.setFieldsValue({
                name: combo.name,
                price: combo.price,
                description: combo.description,
                quantity: combo.quantity,
                type: type,
                category: combo.category,
                items: processedItems,
                discountType: combo.discountType || 'percent',
                discountValue: combo.discountValue || 0,
            });

            // Cập nhật max quantities cho các items khi edit
            if (type === 'combo' && processedItems.length > 0) {
                const maxQuantities: {[key: number]: number} = {};
                processedItems.forEach((item, index) => {
                    const product = availableProducts.find(p => p._id === item.productId);
                    if (product) {
                        maxQuantities[index] = product.quantity;
                    }
                });
                setItemMaxQuantities(maxQuantities);
            }
        }
    }, [combo, form, availableProducts]);

    // Load available single products for combo creation
    useEffect(() => {
        if (productType === 'combo') {
            loadSingleProducts();
        }
    }, [productType]);

    // Load available products when editing combo
    useEffect(() => {
        if (combo && combo.type === 'combo') {
            loadSingleProducts();
        }
    }, [combo]);

    // Reset discount value when discount type changes (only for new combos)
    useEffect(() => {
        if (productType === 'combo' && !combo) {
            form.setFieldValue('discountValue', discountType === 'percent' ? 10 : 0);
        }
    }, [discountType, productType, form, combo]);

    const loadSingleProducts = async () => {
        try {
            const { getSingleProducts } = await import('@/apiservice/apiFoodCombo');
            const products = await getSingleProducts();
            console.log('Available products loaded:', products);
            setAvailableProducts(products);
        } catch (error) {
            console.error('Error loading single products:', error);
            setAvailableProducts([]);
        }
    };

    // Function để cập nhật max quantity cho một item
    const updateItemMaxQuantity = (itemIndex: number, productId: string) => {
        const selectedProduct = availableProducts.find(p => p._id === productId);
        if (selectedProduct) {
            setItemMaxQuantities(prev => ({
                ...prev,
                [itemIndex]: selectedProduct.quantity
            }));
        }
    };

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

        const handleSubmit = async (values: Partial<IFoodCombo>) => {
        try {
            setIsLoading(true);
            
            if (productType === 'single') {
                const submitData: Partial<IFoodCombo> = {
                    name: values.name,
                    price: values.price,
                    description: values.description,
                    quantity: values.quantity,
                    type: 'single',
                    category: values.category,
                };
                await onSubmit(submitData);
            } else {
                // Combo type
                const submitData: Partial<IFoodCombo> = {
                    name: values.name,
                    description: values.description,
                    items: values.items || [],
                    discountType: values.discountType,
                    discountValue: values.discountValue,
                    type: 'combo',
                };
                await onSubmit(submitData);
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <Modal
            open
            title={<div className="text-center text-xl md:text-xl font-semibold">
                {combo ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}
            </div>}
            onCancel={onCancel}
            footer={null}
            width={800}
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
                {/* Product Type Selection */}
                <Form.Item
                    name="type"
                    label="Loại sản phẩm"
                    rules={[{ required: true, message: 'Vui lòng chọn loại sản phẩm!' }]}
                    initialValue="single"
                >
                    <Select
                        size="large"
                        placeholder="Chọn loại sản phẩm"
                        onChange={(value) => setProductType(value)}
                        disabled={!!combo} // Disable when editing
                    >
                        <Option value="single">Sản phẩm đơn lẻ</Option>
                        <Option value="combo">Combo</Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="name"
                    label={productType === 'single' ? 'Tên sản phẩm' : 'Tên combo'}
                    rules={[
                        { required: true, message: `Vui lòng nhập tên ${productType === 'single' ? 'sản phẩm' : 'combo'}!` },
                        { min: 3, message: `Tên ${productType === 'single' ? 'sản phẩm' : 'combo'} phải có ít nhất 3 ký tự!` },
                        { max: 100, message: `Tên ${productType === 'single' ? 'sản phẩm' : 'combo'} không được quá 100 ký tự!` }
                    ]}
                >
                    <Input
                        ref={nameInputRef}
                        placeholder={`Nhập tên ${productType === 'single' ? 'sản phẩm' : 'combo'}`}
                        size="large"
                    />
                </Form.Item>

                {productType === 'single' && (
                    <>
                        <Form.Item
                            name="category"
                            label="Danh mục"
                            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
                        >
                            <Select
                                size="large"
                                placeholder="Chọn danh mục sản phẩm"
                            >
                                <Option value="Popcorn">Bắp rang</Option>
                                <Option value="Drink">Nước uống</Option>
                                <Option value="Snack">Snack</Option>
                                <Option value="Other">Khác</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="price"
                            label="Giá (VNĐ)"
                            rules={[
                                { required: true, message: 'Vui lòng nhập giá sản phẩm!' },
                                { type: 'number', min: 1000, message: 'Giá sản phẩm phải ít nhất 1,000 VNĐ!' }
                            ]}
                        >
                            <InputNumber
                                placeholder="Nhập giá sản phẩm"
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
                                { required: true, message: 'Vui lòng nhập mô tả sản phẩm!' },
                                { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự!' },
                                { max: 500, message: 'Mô tả không được quá 500 ký tự!' }
                            ]}
                        >
                            <Input.TextArea
                                placeholder="Ví dụ: Bắp ngô rang thơm ngon, béo ngậy"
                                rows={4}
                                size="large"
                                showCount
                                maxLength={500}
                            />
                        </Form.Item>
                    </>
                )}

                {productType === 'combo' && (
                    <>
                        <Divider orientation="left">Thành phần combo</Divider>
                        <Form.List name="items">
                            {(fields, { add, remove }) => (
                                <div>
                                    {fields.map(({ key, name, ...restField }) => (
                                        <Card key={key} size="small" className="mb-3">
                                            <Space.Compact style={{ width: '100%' }}>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'productId']}
                                                    rules={[{ required: true, message: 'Chọn sản phẩm!' }]}
                                                    style={{ flex: 1 }}
                                                >
                                                    <Select
                                                        placeholder="Chọn sản phẩm"
                                                        showSearch
                                                        optionFilterProp="children"
                                                        filterOption={(input, option) =>
                                                            String(option?.children || '').toLowerCase().includes(input.toLowerCase())
                                                        }
                                                        onChange={(value) => updateItemMaxQuantity(name, value)}
                                                    >
                                                        {availableProducts.map(product => (
                                                            <Option key={product._id} value={product._id}>
                                                                {product.name} - {product.price.toLocaleString()}đ
                                                            </Option>
                                                        ))}
                                                    </Select>
                                                </Form.Item>
                                                <Form.Item
                                                    {...restField}
                                                    name={[name, 'quantity']}
                                                    rules={[{ required: true, message: 'Nhập số lượng!' }]}
                                                    style={{ width: 120 }}
                                                >
                                                    <InputNumber
                                                        placeholder="Số lượng"
                                                        min={1}
                                                        max={itemMaxQuantities[name] || 10}
                                                        style={{ width: '100%' }}
                                                    />
                                                </Form.Item>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => remove(name)}
                                                />
                                            </Space.Compact>
                                        </Card>
                                    ))}
                                    <Button
                                        type="dashed"
                                        onClick={() => {
                                            add();
                                            // Reset max quantity cho item mới
                                            const newIndex = fields.length;
                                            setItemMaxQuantities(prev => ({
                                                ...prev,
                                                [newIndex]: 10 // Default max
                                            }));
                                        }}
                                        block
                                        icon={<PlusOutlined />}
                                        className="mb-4"
                                    >
                                        Thêm sản phẩm vào combo
                                    </Button>
                                </div>
                            )}
                        </Form.List>

                        <Divider orientation="left">Giảm giá</Divider>
                            <Form.Item
                                name="discountType"
                                label="Loại giảm giá"
                                rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá!' }]}
                            >
                                <Select 
                                    size="large" 
                                    placeholder="Chọn loại giảm giá"
                                    onChange={(value) => {
                                        setDiscountType(value);
                                        // Only reset discount value when creating new combo, not when editing
                                        if (!combo) {
                                            form.setFieldValue('discountValue', value === 'percent' ? 10 : 0);
                                        }
                                    }}
                                >
                                    <Option value="percent">Phần trăm (%)</Option>
                                    <Option value="fixed">Số tiền cố định (VNĐ)</Option>
                                </Select>
                            </Form.Item>

                        <Form.Item
                            name="discountValue"
                            label="Giá trị giảm giá"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập giá trị giảm giá!' },
                                    {
                                        type: 'number',
                                        min: discountType === 'percent' ? 10 : 0,
                                        max: discountType === 'percent' ? 30 : 1000000,
                                        message: discountType === 'percent'
                                            ? 'Giá trị giảm giá phải từ 10% đến 30%!'
                                            : 'Giá trị giảm giá phải >= 0 và không quá 1,000,000 VNĐ!'
                                    }
                                ]}
                        >
                            <InputNumber
                                placeholder="Nhập giá trị giảm giá"
                                size="large"
                                min={discountType === 'percent' ? 10 : 0}
                                max={discountType === 'percent' ? 30 : 1000000}
                                style={{ width: '100%' }}
                                formatter={(value) => {
                                    if (!value) return '';
                                    return discountType === 'fixed' 
                                        ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                        : `${value}`;
                                }}
                                // @ts-expect-error: Ant Design InputNumber parser type constraint
                                parser={(value) => Number(value!.replace(/\$\s?|(,*)|%/g, '')) || 0}
                                addonAfter={discountType === 'percent' ? '%' : 'VNĐ'}
                            />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Mô tả combo"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mô tả combo!' },
                                { min: 10, message: 'Mô tả phải có ít nhất 10 ký tự!' },
                                { max: 500, message: 'Mô tả không được quá 500 ký tự!' }
                            ]}
                        >
                            <Input.TextArea
                                placeholder="Ví dụ: Combo bắp rang + 2 nước ngọt, tiết kiệm 20%"
                                rows={4}
                                size="large"
                                showCount
                                maxLength={500}
                            />
                        </Form.Item>
                    </>
                )}

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
                            ? (combo ? 'Đang cập nhật...' : 'Đang thêm...') 
                            : (combo ? 'Cập nhật' : 'Thêm mới')
                        }
                    </motion.button>
                </div>
            </Form>
        </Modal>
    );
};

export default FoodComboForm;
