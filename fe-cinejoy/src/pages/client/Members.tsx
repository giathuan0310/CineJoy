import { useEffect, useState } from 'react';
import { FaSave, FaUpload } from 'react-icons/fa';
import { Input, Select, DatePicker, Button, Form } from 'antd';
import type { FormProps } from 'antd';
import dayjs from 'dayjs';
import useAppStore from '@/store/app.store';
import clsx from 'clsx';
import 'styles/members.css';

type FieldType = {
  email: string;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
};

const MembersPage = () => {
  const { user, setUser, isDarkMode } = useAppStore();
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : undefined,
        gender: user.gender || '',
      });
    }
  }, [user, form]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl font-semibold mb-4">Bạn chưa đăng nhập!</div>
        <div className="text-gray-500">Vui lòng đăng nhập để xem thông tin cá nhân.</div>
      </div>
    );
  }

  const handleSubmit: FormProps<FieldType>['onFinish'] = async (values) => {
    setIsSubmit(true);
      console.log('submit: ', values); 
    setIsSubmit(false); 
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSaveImage = () => {
    // TODO: upload ảnh lên server ở đây
    setSelectedImage(null);
    setPreviewImage(null);
  };

  return (
    <div className={clsx("min-h-[80vh] flex justify-center items-center py-10", isDarkMode ? "bg-[#181c24]" : "bg-white") }>
      <div
        className={clsx(
          "w-full max-w-2xl rounded-2xl shadow-xl p-8 mx-2",
          isDarkMode ? "text-white" : "text-[#0f1b4c]"
        )}
        style={{
          background: isDarkMode
            ? 'linear-gradient(180deg, #23272f 0%, #23272f 60%, #23272f 100%)'
            : 'linear-gradient(180deg, #e0f7fa 0%, #b2ebf2 100%)'
        }}
      >
        <h2 className="text-2xl font-bold text-center mb-6" style={{ color: isDarkMode ? '#f9ca24' : '#a05a1c' }}>Thông tin cá nhân</h2>
        <div className="flex flex-col items-center mb-6">
          <img
            src={previewImage || user.avatar}
            alt="Avatar"
            className={clsx("w-30 h-30 rounded-full object-cover border-3 shadow-lg mb-4", isDarkMode ? "border-gray-700" : "border-white")}
          />
          <div className="flex gap-2">
            <label style={{ cursor: 'pointer' }}>
              <div
                className={clsx(
                  'flex items-center justify-center gap-2 rounded font-semibold',
                  'transition-colors duration-150 select-none',
                  'shadow',
                  isDarkMode ? 'bg-orange-600 hover:bg-orange-700 text-white' : 'bg-orange-500 hover:bg-orange-600 text-white',
                )}
                style={{ fontWeight: 600, borderRadius: 6, userSelect: 'none', minWidth: 140, height: 38, fontSize: 17, padding: '0 20px' }}
              >
                <FaUpload className="inline mr-1" /> Tải ảnh lên
              </div>
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </label>
            {selectedImage && (
              <Button
                type="primary"
                icon={<FaSave />}
                style={{ background: isDarkMode ? '#27ae60' : '#43a047', borderColor: isDarkMode ? '#27ae60' : '#43a047', fontWeight: 600, borderRadius: 6, minWidth: 140, height: 38, fontSize: 17, padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onClick={handleSaveImage}
              >
                Lưu ảnh
              </Button>
            )}
          </div>
        </div>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6"
        >
          <Form.Item
            label={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Email</span>}
            name="email"
            style={{ marginBottom: 0, gridColumn: 'span 2' }}
          >
            <Input
              size="large"
              disabled
              style={isDarkMode
                ? { backgroundColor: '#2d323b', color: '#e0e0e0', borderColor: '#666', opacity: 1 }
                : { backgroundColor: '#f3f4f6', color: '#6b7280', borderColor: '#e5e7eb', opacity: 1 }
              }
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Họ tên</span>}
            name="fullName"
            rules={[
              { required: true, message: 'Vui lòng nhập họ tên!' },
              { min: 2, message: 'Họ tên phải có ít nhất 2 ký tự!' },
            ]}
            style={{ marginBottom: 0 }}
          >
            <Input
              size="large"
              style={isDarkMode
                ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#666', opacity: 1 }
                : undefined
              }
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Số điện thoại</span>}
            name="phoneNumber"
            rules={[
              { required: true, message: 'Vui lòng nhập số điện thoại!' },
              { pattern: /^0[0-9]{9}$/, message: 'Số điện thoại phải có 10 chữ số và bắt đầu bằng số 0!' },
            ]}
            style={{ marginBottom: 0 }}
          >
            <Input
              size="large"
              style={isDarkMode
                ? { backgroundColor: '#23272f', color: '#fff', borderColor: '#666', opacity: 1 }
                : undefined
              }
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Ngày sinh</span>}
            name="dateOfBirth"
            rules={[
              { required: true, message: 'Vui lòng chọn ngày sinh!' },
            ]}
            style={{ marginBottom: 0 }}
          >
            <DatePicker
              format="DD-MM-YYYY"
              size="large"
              style={isDarkMode
                ? { width: '100%', backgroundColor: '#23272f', color: '#fff', borderColor: '#666', opacity: 1 }
                : { width: '100%' }
              }
              allowClear
              popupStyle={isDarkMode ? { background: '#23272f', color: '#fff' } : undefined}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: isDarkMode ? '#fff' : undefined }}>Giới tính</span>}
            name="gender"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính!' }]}
            style={{ marginBottom: 0 }}
          >
            <Select
              size="large"
              className={isDarkMode ? 'cinejoy-dark-select' : ''}
              style={isDarkMode
                ? { width: '100%', color: '#fff', borderColor: '#666', opacity: 1 }
                : { width: '100%' }
              }
              dropdownStyle={isDarkMode ? { background: '#23272f', color: '#fff', border: '1px solid #666' } : undefined}
              optionLabelProp="label"
              getPopupContainer={trigger => trigger.parentNode}
            >
              <Select.Option
                value="Nam"
                label="Nam"
                style={isDarkMode ? { color: '#fff', background: '#23272f' } : {}}
              >
                <span style={isDarkMode ? { color: '#fff' } : {}}>Nam</span>
              </Select.Option>
              <Select.Option
                value="Nữ"
                label="Nữ"
                style={isDarkMode ? { color: '#fff', background: '#23272f' } : {}}
              >
                <span style={isDarkMode ? { color: '#fff' } : {}}>Nữ</span>
              </Select.Option>
              <Select.Option
                value="Khác"
                label="Khác"
                style={isDarkMode ? { color: '#fff', background: '#23272f' } : {}}
              >
                <span style={isDarkMode ? { color: '#fff' } : {}}>Khác</span>
              </Select.Option>
            </Select>
          </Form.Item>
          <div className="md:col-span-2 flex justify-end">
            <a href="#" className="text-blue-600 hover:underline text-sm">Đổi mật khẩu?</a>
          </div>
          <Form.Item className="md:col-span-2 flex justify-center mt-2 mb-0" style={{ marginBottom: 0 }}>
            <Button type="primary" size="large" style={{ padding: '0px 32px' }} className="font-semibold px-8 text-lg" htmlType="submit" loading={isSubmit}>
              Cập nhật
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default MembersPage; 