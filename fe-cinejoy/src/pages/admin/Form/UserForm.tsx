import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Modal, Form, Input, Select, DatePicker, Switch } from 'antd';
import type { InputRef } from 'antd';
import { uploadAvatarApi } from '@/services/api';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

interface UserFormProps {
    user?: IUser;
    onSubmit: (userData: Partial<IUser>) => void;
    onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSubmit, onCancel }) => {
    const fullNameInputRef = useRef<InputRef>(null);
    const [form] = Form.useForm();
    const [avatarPreview, setAvatarPreview] = useState<string>('');
    const [uploading, setUploading] = useState<boolean>(false);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [isActiveState, setIsActiveState] = useState<boolean>(true);
    const [previewUrl, setPreviewUrl] = useState<string>(''); // Track preview URL for cleanup


    useEffect(() => {
        if (user) {
            const isActiveValue = Boolean(user.isActive);
            setIsActiveState(isActiveValue);
            form.setFieldsValue({
                fullName: user.fullName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                gender: user.gender,
                avatar: user.avatar,
                dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
                role: user.role,
                isActive: isActiveValue,
                point: user.point
            });
            setAvatarPreview(user.avatar || '');
        } else {
            setIsActiveState(true);
            form.resetFields();
            form.setFieldsValue({
                role: 'USER',
                isActive: true,
                point: 50
            });
            setAvatarPreview('');
        }
    }, [user, form]);

    useEffect(() => {
        if (!user) {
            // Auto focus chỉ khi thêm mới
            setTimeout(() => {
                fullNameInputRef.current?.focus();
            }, 100);
        }
    }, [user]);

    // Cleanup effect for preview URL
    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleAvatarChange = async (info: { file: { originFileObj?: File; }; }) => {
        const file = info.file.originFileObj;
        
        if (file instanceof File) {
            // Cleanup previous preview URL if exists
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            
            // Hiển thị preview ngay lập tức
            const newPreviewUrl = URL.createObjectURL(file);
            setPreviewUrl(newPreviewUrl);
            setAvatarPreview(newPreviewUrl);
            
            setUploading(true);
            try {
                const uploadResult = await uploadAvatarApi(file);
                if (uploadResult.status && uploadResult.data) {
                    const avatarUrl = uploadResult.data.url;
                    form.setFieldsValue({ avatar: avatarUrl });
                    setAvatarPreview(avatarUrl); // Cập nhật với URL từ server
                    toast.success('Tải ảnh đại diện thành công!');
                    
                    // Cleanup preview URL
                    URL.revokeObjectURL(newPreviewUrl);
                    setPreviewUrl('');
                } else {
                    toast.error('Tải ảnh thất bại!');
                    // Revert preview on failure
                    setAvatarPreview(user?.avatar || '');
                    URL.revokeObjectURL(newPreviewUrl);
                    setPreviewUrl('');
                }
            } catch (error) {
                console.error('Upload error:', error);
                toast.error('Lỗi khi tải ảnh!');
                // Revert preview on error
                setAvatarPreview(user?.avatar || '');
                URL.revokeObjectURL(newPreviewUrl);
                setPreviewUrl('');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleSubmit = async (values: {
        fullName: string;
        email: string;
        password?: string;
        phoneNumber: string;
        gender: string;
        avatar: string;
        dateOfBirth: dayjs.Dayjs;
        role: string;
        isActive: boolean;
        point: number;
    }) => {
        setSubmitting(true);
        try {
            const formattedData = {
                ...values,
                dateOfBirth: values.dateOfBirth.toISOString(),
            };

            // Chỉ gửi password khi tạo mới
            if (!user) {
                formattedData.password = values.password || '123456'; // Default password
            }

            await onSubmit(formattedData);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal
            open
            title={
                <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-800">
                        {user ? 'Sửa thông tin người dùng' : 'Thêm người dùng mới'}
                    </h3>
                </div>
            }
            onCancel={submitting ? undefined : onCancel}
            footer={null}
            width={800}
            centered
            destroyOnClose
            closable={!submitting}
            maskClosable={!submitting}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                autoComplete="off"
            >
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[
                            { required: true, message: 'Vui lòng nhập họ và tên!' },
                            { min: 2, message: 'Họ và tên phải có ít nhất 2 ký tự!' },
                            { max: 50, message: 'Họ và tên không được quá 50 ký tự!' }
                        ]}
                    >
                        <Input
                            ref={fullNameInputRef}
                            placeholder="Ví dụ: Nguyễn Văn A"
                            size="large"
                            showCount
                            maxLength={50}
                        />
                    </Form.Item>

                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input
                            placeholder="Ví dụ: user@example.com"
                            size="large"
                            disabled={!!user} // Không cho sửa email khi edit
                        />
                    </Form.Item>

                    {!user && (
                        <Form.Item
                            name="password"
                            label="Mật khẩu"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                            ]}
                        >
                            <Input.Password
                                placeholder="Nhập mật khẩu"
                                size="large"
                            />
                        </Form.Item>
                    )}

                    <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số điện thoại!' },
                            { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại phải có 10-11 chữ số!' }
                        ]}
                    >
                        <Input
                            placeholder="Ví dụ: 0123456789"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="gender"
                        label="Giới tính"
                        rules={[
                            { required: true, message: 'Vui lòng chọn giới tính!' }
                        ]}
                    >
                        <Select
                            placeholder="Chọn giới tính"
                            size="large"
                            options={[
                                { value: 'Nam', label: 'Nam' },
                                { value: 'Nữ', label: 'Nữ' },
                                { value: 'Khác', label: 'Khác' }
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="dateOfBirth"
                        label="Ngày sinh"
                        rules={[
                            { required: true, message: 'Vui lòng chọn ngày sinh!' }
                        ]}
                    >
                        <DatePicker
                            placeholder="Chọn ngày sinh"
                            size="large"
                            style={{ width: '100%' }}
                            format="DD/MM/YYYY"
                            disabledDate={(current) => current && current > dayjs().endOf('day')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="Vai trò"
                        rules={[
                            { required: true, message: 'Vui lòng chọn vai trò!' }
                        ]}
                    >
                        <Select
                            placeholder="Chọn vai trò"
                            size="large"
                            options={[
                                { value: 'USER', label: 'Người dùng' },
                                { value: 'ADMIN', label: 'Quản trị viên' }
                            ]}
                        />
                    </Form.Item>

                    <Form.Item
                        name="point"
                        label="Điểm tích lũy"
                        rules={[
                            { required: true, message: 'Vui lòng nhập điểm!' }
                        ]}
                    >
                        <Input
                            placeholder="Nhập số điểm"
                            size="large"
                            type="number"
                            min={0}
                        />
                    </Form.Item>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="avatar"
                        label="Ảnh đại diện"
                        rules={[
                            { required: true, message: 'Vui lòng chọn ảnh đại diện!' }
                        ]}
                    >
                        <div className="space-y-2">
                            {avatarPreview && (
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                    <img 
                                        src={avatarPreview} 
                                        alt="Avatar preview" 
                                        className="w-16 h-16 object-cover rounded-full border-2 border-gray-300"
                                    />
                                        {uploading && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                                                <div className="animate-spin text-white text-lg">⏳</div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm text-gray-600">
                                            {uploading ? 'Đang tải lên...' : (user ? 'Ảnh hiện tại' : 'Ảnh đã chọn')}
                                        </span>
                                        {uploading && (
                                            <span className="text-xs text-blue-600">Vui lòng đợi...</span>
                                        )}
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                {/* Completely hidden file input */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleAvatarChange({ file: { originFileObj: file } });
                                        }
                                    }}
                                    disabled={uploading}
                                    style={{ display: 'none' }}
                                    id="avatar-input"
                                />
                                
                                {/* Main button */}
                                <button
                                    type="button"
                                    onClick={() => {
                                        const input = document.getElementById('avatar-input') as HTMLInputElement;
                                        input?.click();
                                    }}
                                    disabled={uploading}
                                    className="w-full px-4 py-3 text-base bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin">⏳</div>
                                            Đang tải ảnh...
                                        </>
                                    ) : (
                                        <>
                                            Chọn ảnh từ máy tính
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </Form.Item>

                    <Form.Item
                        name="isActive"
                        label="Trạng thái hoạt động"
                        valuePropName="checked"
                    >
                        <Switch 
                            size="default"
                            checked={isActiveState}
                            onChange={(checked) => {
                                setIsActiveState(checked);
                                form.setFieldValue('isActive', checked);
                            }}
                        />
                    </Form.Item>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <motion.button
                        type="button"
                        onClick={onCancel}
                        disabled={submitting}
                        className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={!submitting ? { scale: 1.05 } : {}}
                        whileTap={!submitting ? { scale: 0.95 } : {}}
                    >
                        Hủy
                    </motion.button>
                    <motion.button
                        type="submit"
                        disabled={submitting || uploading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={!submitting && !uploading ? { scale: 1.05 } : {}}
                        whileTap={!submitting && !uploading ? { scale: 0.95 } : {}}
                    >
                        {submitting ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin">⏳</div>
                                {user ? 'Đang cập nhật...' : 'Đang thêm...'}
                            </div>
                        ) : (
                            user ? 'Cập nhật' : 'Thêm người dùng'
                        )}
                    </motion.button>
                </div>
            </Form>
        </Modal>
    );
};

export default UserForm;
