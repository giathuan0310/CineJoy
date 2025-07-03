import { useEffect, useState } from 'react';
import useAppStore from '@/store/app.store';
import { FaUserEdit, FaSave, FaTimes, FaKey } from 'react-icons/fa';
import { updateUser } from '@/services/api';

const ProfilePage = () => {
  const { user, isDarkMode, setUser } = useAppStore();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [pwError, setPwError] = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        phoneNumber: user.phoneNumber || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : '',
        gender: user.gender || '',
      });
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-2xl font-semibold mb-4">Bạn chưa đăng nhập!</div>
        <div className="text-gray-500">Vui lòng đăng nhập để xem thông tin cá nhân.</div>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    setForm({
      fullName: user.fullName || '',
      phoneNumber: user.phoneNumber || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().slice(0, 10) : '',
      gender: user.gender || '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await updateUser(user._id, {
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        dateOfBirth: form.dateOfBirth,
        gender: form.gender,
      });
      if (res.data && res.status) {
        setUser(res.data);
        setSuccess('Cập nhật thành công!');
        setIsEditing(false);
      } else {
        setError('Cập nhật thất bại!');
      }
    } catch {
      setError('Cập nhật thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = () => {
    setShowChangePassword(true);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPwError('');
    setPwSuccess('');
  };

  const handleCloseChangePassword = () => {
    setShowChangePassword(false);
    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    setPwError('');
    setPwSuccess('');
  };

  const handlePasswordInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleSavePassword = async () => {
    setPwLoading(true);
    setPwError('');
    setPwSuccess('');
    // TODO: Gọi API đổi mật khẩu ở đây
    setTimeout(() => {
      setPwLoading(false);
      setPwSuccess('Đổi mật khẩu thành công! (Demo UI)');
      setShowChangePassword(false);
    }, 1200);
  };

  return (
    <div className={`min-h-[75vh] flex justify-center items-center ${isDarkMode ? 'bg-[#23272f]' : 'bg-[#f5f6fa]'}`}>
      <div className={`w-full max-w-2xl rounded-2xl shadow-lg p-8 mx-2 ${isDarkMode ? 'bg-[#282a36] text-white' : 'bg-white text-[#0f1b4c]'}`}>
        <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
          <img
            src={user.avatar}
            alt="Avatar"
            className="w-32 h-32 rounded-full object-cover border-4 border-blue-500 shadow-md"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  className={`text-3xl font-bold w-full rounded px-2 py-1 border ${isDarkMode ? 'bg-[#23272f] text-white border-gray-600' : 'bg-white border-gray-300'} focus:outline-none`}
                  style={{ maxWidth: 320 }}
                />
              ) : (
                <h2 className="text-3xl font-bold">{user.fullName}</h2>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'ADMIN' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>{user.role}</span>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow cursor-pointer ${isDarkMode ? 'bg-[#23272f] text-white hover:bg-blue-900' : 'bg-gray-100 text-blue-900 hover:bg-blue-200'} transition`}
                onClick={isEditing ? handleCancel : handleEdit}
                title={isEditing ? 'Hủy' : 'Chỉnh sửa thông tin'}
                disabled={loading}
              >
                {isEditing ? <FaTimes size={20} /> : <FaUserEdit size={20} />}
                {isEditing ? 'Hủy' : 'Chỉnh sửa'}
              </button>
              {isEditing && (
                <button
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow cursor-pointer ${isDarkMode ? 'bg-blue-700 text-white hover:bg-blue-900' : 'bg-blue-500 text-white hover:bg-blue-700'} transition`}
                  onClick={handleSave}
                  disabled={loading}
                  title="Lưu thay đổi"
                >
                  <FaSave size={20} />
                  {loading ? 'Đang lưu...' : 'Lưu'}
                </button>
              )}
              <button
                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow cursor-pointer ${isDarkMode ? 'bg-[#23272f] text-white hover:bg-yellow-700' : 'bg-yellow-100 text-yellow-900 hover:bg-yellow-200'} transition`}
                onClick={handleChangePassword}
                title="Đổi mật khẩu"
              >
                <FaKey size={20} />
                Đổi mật khẩu
              </button>
            </div>
            {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
            {success && <div className="text-green-500 mt-2 text-sm">{success}</div>}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <div className="mb-2 text-sm text-gray-400">Email</div>
            <div className="font-medium break-all">{user.email}</div>
          </div>
          <div>
            <div className="mb-2 text-sm text-gray-400">Số điện thoại</div>
            {isEditing ? (
              <input
                type="text"
                name="phoneNumber"
                value={form.phoneNumber}
                onChange={handleChange}
                className={`w-full rounded px-2 py-1 border ${isDarkMode ? 'bg-[#23272f] text-white border-gray-600' : 'bg-white border-gray-300'} focus:outline-none`}
              />
            ) : (
              <div className="font-medium">{user.phoneNumber}</div>
            )}
          </div>
          <div>
            <div className="mb-2 text-sm text-gray-400">Ngày sinh</div>
            {isEditing ? (
              <input
                type="date"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleChange}
                className={`w-full rounded px-2 py-1 border ${isDarkMode ? 'bg-[#23272f] text-white border-gray-600' : 'bg-white border-gray-300'} focus:outline-none`}
              />
            ) : (
              <div className="font-medium">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : '-'}</div>
            )}
          </div>
          <div>
            <div className="mb-2 text-sm text-gray-400">Giới tính</div>
            {isEditing ? (
              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className={`w-full rounded px-2 py-1 border ${isDarkMode ? 'bg-[#23272f] text-white border-gray-600' : 'bg-white border-gray-300'} focus:outline-none`}
              >
                <option value="">Chọn giới tính</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            ) : (
              <div className="font-medium">{user.gender}</div>
            )}
          </div>
          <div>
            <div className="mb-2 text-sm text-gray-400">Chế độ Dark Mode</div>
            <div className="font-medium">{user.settings?.darkMode ? 'Bật' : 'Tắt'}</div>
          </div>
          <div>
            <div className="mb-2 text-sm text-gray-400">Trạng thái tài khoản</div>
            <div className={`font-medium ${user.isActive ? 'text-green-500' : 'text-gray-500'}`}>{user.isActive ? 'Đang hoạt động' : 'Đã khóa'}</div>
          </div>
        </div>
      </div>
      {/* Modal đổi mật khẩu */}
      {showChangePassword && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40">
          <div className={`w-full max-w-md rounded-xl shadow-lg p-8 ${isDarkMode ? 'bg-[#23272f] text-white' : 'bg-white text-[#0f1b4c]'}`}> 
            <h3 className="text-xl font-bold mb-4">Đổi mật khẩu</h3>
            <div className="mb-3">
              <label className="block mb-1 text-sm">Mật khẩu cũ</label>
              <input
                type="password"
                name="oldPassword"
                value={passwordForm.oldPassword}
                onChange={handlePasswordInput}
                className={`w-full rounded px-2 py-1 border ${isDarkMode ? 'bg-[#23272f] text-white border-gray-600' : 'bg-white border-gray-300'} focus:outline-none`}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm">Mật khẩu mới</label>
              <input
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordInput}
                className={`w-full rounded px-2 py-1 border ${isDarkMode ? 'bg-[#23272f] text-white border-gray-600' : 'bg-white border-gray-300'} focus:outline-none`}
              />
            </div>
            <div className="mb-3">
              <label className="block mb-1 text-sm">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordInput}
                className={`w-full rounded px-2 py-1 border ${isDarkMode ? 'bg-[#23272f] text-white border-gray-600' : 'bg-white border-gray-300'} focus:outline-none`}
              />
            </div>
            {pwError && <div className="text-red-500 mb-2 text-sm">{pwError}</div>}
            {pwSuccess && <div className="text-green-500 mb-2 text-sm">{pwSuccess}</div>}
            <div className="flex gap-4 mt-4 justify-end">
              <button
                className={`px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'} transition`}
                onClick={handleCloseChangePassword}
                disabled={pwLoading}
              >
                Hủy
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-medium ${isDarkMode ? 'bg-blue-700 text-white hover:bg-blue-900' : 'bg-blue-500 text-white hover:bg-blue-700'} transition`}
                onClick={handleSavePassword}
                disabled={pwLoading}
              >
                {pwLoading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 