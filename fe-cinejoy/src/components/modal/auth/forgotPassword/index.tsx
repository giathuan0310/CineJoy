import { Modal, Input, Button, Form } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect, useRef } from "react";
import type { InputRef } from 'antd';

interface IProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginModalOpen: () => void;
};

const ModalForgotPassword = (props: IProps) => {
  const [form] = Form.useForm();
  const inputRef = useRef<InputRef>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (props.isOpen) {
      form.resetFields();
    }
  }, [props.isOpen, form]);

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

  const handleBtnBack = () => {
      props.onClose();
      props.onLoginModalOpen();
  }

  const handleSubmit = (values: { emailOrPhone: string }) => {
    console.log("Gửi yêu cầu reset mật khẩu với:", values);
  };

  return (
    <Modal
      open={props.isOpen}
      onCancel={props.onClose}
      footer={null}
      centered
      width={450}
      className="rounded-xl"
      getContainer={false}
      maskClosable={false}
    >
      {/* Header */}
      <div className="flex items-center w-[80px] gap-2 text-sm font-medium text-[#0f1b4c] mb-1 cursor-pointer" onClick={handleBtnBack}>
        <ArrowLeftOutlined className="cursor-pointer" />
        <span className="cursor-pointer">Quay lại</span>
      </div>

      <h2 className="text-center font-semibold text-xl text-[#0f1b4c] mb-4">
        Quên mật khẩu
      </h2>

      <Form layout="vertical" form={form} onFinish={handleSubmit}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
          ]}
        >
          <Input ref={inputRef} style={{ padding: '6px 10px' }} placeholder="Nhập email" />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            size="large"
            className="bg-blue-600 hover:bg-blue-700"
          >
            Gửi yêu cầu
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center text-gray-500 text-sm select-none">
        Hãy kiểm tra email của bạn để thay đổi mật khẩu mới
        <div className="text-xs mt-2">(Lưu ý: kiểm tra thêm mục spam)</div>
        <div className="text-blue-600 text-sm hover:underline cursor-pointer mt-2 mb-1">
          Liên hệ nếu không nhận được email
        </div>
      </div>
    </Modal>
  );
};

export default ModalForgotPassword;
