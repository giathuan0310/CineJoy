import { Button, Input, Modal, Form, Select, DatePicker } from 'antd';
import { useEffect, useRef } from 'react';
import type { InputRef } from 'antd';

type FieldType = {
    fullName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    dateOfBirth: string;
    password: string;
    confirmPassword: string;
};

interface IProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginModalOpen: () => void;
};

const ModalRegister = (props: IProps) => {
    const [form] = Form.useForm();
    const inputRef = useRef<InputRef>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (props.isOpen) {
          timeoutRef.current = setTimeout(() => {
            inputRef.current?.focus();
          }, 300);
        }
      
        return () => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
          }
        };
      }, [props.isOpen]);

    useEffect(() => {
        form.resetFields();
    }, [props.isOpen, form]);

    const handleLoginModalOpen = () => {
        props.onClose();
        props.onLoginModalOpen();
    };

    return (
        <>
            <Modal
                open={props.isOpen}
                onCancel={props.onClose}
                footer={null}
                centered
                width={450}
                getContainer={false}
            >
                <div className="text-center font-semibold text-xl text-[#0f1b4c] mt-2 mb-3 select-none">Đăng ký tài khoản</div>

                <Form layout="vertical" form={form} style={{ padding: '0 20px' }}>
                    <Form.Item<FieldType>
                        label="Họ và tên"
                        name="fullName"
                        rules={[
                            { required: true, message: "Vui lòng nhập họ và tên!" },
                        ]}
                        style={{
                            margin: '10px 0'
                        }}
                    >
                        <Input ref={inputRef} style={{ padding: '6px 10px' }} placeholder="Họ và tên" />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: "Vui lòng nhập email!" },
                            { type: "email", message: "Email không hợp lệ!" }
                        ]}
                        style={{
                            margin: '10px 0'
                        }}
                    >
                        <Input style={{ padding: '6px 10px' }} placeholder="Email" />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Số điện thoại"
                        name="phoneNumber"
                        rules={[
                            { required: true, message: "Vui lòng nhập số điện thoại!" },
                        ]}
                        style={{
                            margin: '10px 0'
                        }}
                    >
                        <Input style={{ padding: '6px 10px' }} placeholder="Số điện thoại" />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Giới tính"
                        name="gender"
                        rules={[{ required: true, message: "Vui lòng chọn giới tính!" }]}
                        style={{
                            margin: '10px 0'
                        }}
                    >
                        <Select placeholder="Chọn giới tính">
                            <Select.Option value="male">Nam</Select.Option>
                            <Select.Option value="female">Nữ</Select.Option>
                            <Select.Option value="other">Khác</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Ngày sinh"
                        name="dateOfBirth"
                        rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
                        style={{
                            margin: '10px 0'
                        }}
                    >
                    <DatePicker
                        format="DD/MM/YYYY"
                        style={{ width: '100%', padding: '6px 10px' }}
                        placeholder="Chọn ngày sinh"
                    />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Mật khẩu"
                        name="password"
                        rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
                        style={{
                            margin: '10px 0'
                        }}
                    >
                        <Input.Password style={{ padding: '6px 10px' }} placeholder="Mật khẩu" />
                    </Form.Item>

                    <Form.Item<FieldType>
                        label="Nhập lại mật khẩu"
                        name="confirmPassword"
                        dependencies={['password']}
                        rules={[
                            { required: true, message: 'Vui lòng nhập lại mật khẩu!' },
                            ({ getFieldValue }) => ({
                                validator(_, value) {
                                    if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                    }
                                    return Promise.reject(new Error('Mật khẩu không khớp!'));
                                }
                            }),
                        ]}
                        style={{ margin: '10px 0' }}
                    >
                        <Input.Password style={{ padding: '6px 10px' }} placeholder="Nhập lại mật khẩu" />
                    </Form.Item>

                    <Form.Item<FieldType>>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            className="bg-blue-600 hover:bg-blue-700 mt-2"
                            size='large'
                        >
                            Đăng ký
                        </Button>
                    </Form.Item>
                </Form>

                <div className="text-center text-sm mt-3 mb-3">
                    Bạn đã có tài khoản?{" "}
                    <button className="text-blue-600 cursor-pointer hover:underline" onClick={handleLoginModalOpen}>
                        Đăng nhập
                    </button>
                </div>
            </Modal>
        </>
    );
};

export default ModalRegister;