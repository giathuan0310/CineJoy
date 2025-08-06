import { useState } from "react";
import { useLocation } from "react-router-dom";
import useAppStore from '@/store/app.store';

const combos = [
  {
    name: "VTI Combo",
    desc: "Gồm 1 Bắp + 1 Nước có gaz + 1 Snack Oishi",
    price: 49000,
    key: "vti"
  },
  {
    name: "Sweet Combo",
    desc: "Gồm 2 Bắp + 2 Nước có gaz + 1 Snack Oishi",
    price: 89000,
    key: "sweet"
  },
  {
    name: "Family Combo",
    desc: "Gồm 2 Bắp + 4 Nước có gaz + 2 Snack Oishi",
    price: 139000,
    key: "family"
  }
] as const;

type ComboKey = typeof combos[number]["key"];

const vouchers = [
  { label: "Mã giảm giá 20.000đ", value: 20000 },
  { label: "Mã giảm giá 50.000đ", value: 50000 },
  { label: "Không có", value: 0 }
];

const PaymentPage = () => {
  const location = useLocation();
  const { isDarkMode, user } = useAppStore();
  const {
    movie = {},
    seats = [],
    cinema = "",
    date = "",
    time = "",
    room = "",
  } = location.state || {};

  // State cho số lượng combo
  const [comboCounts, setComboCounts] = useState<Record<ComboKey, number>>({ vti: 0, sweet: 0, family: 0 });
  const [voucher, setVoucher] = useState(vouchers[0].value);

  // Tính tổng tiền combo
  const comboTotal = combos.reduce((sum, c) => sum + comboCounts[c.key] * c.price, 0);
  // Giá vé 1 ghế (cứng mẫu)
  const seatPrice = 90000;
  const ticketTotal = seats.length * seatPrice;
  const total = ticketTotal + comboTotal - voucher;

  return (
    <div className={`${isDarkMode ? 'bg-[#181A20] text-[#f1f1f1]' : 'bg-[#e7ede7] text-[#162d5a]'} min-h-screen py-8`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Thông tin thanh toán */}
        <div className={`${isDarkMode ? 'bg-[#23272f] border border-[#3a3d46] text-[#f1f1f1]' : 'bg-[#e7ede7] text-[#162d5a]'} flex-1 rounded-2xl p-6 mb-6 md:mb-0 shadow-lg transition-colors duration-200`}>
          <h2 className={`text-xl font-bold text-center mb-6 ${isDarkMode ? 'text-cyan-400' : 'text-blue-700'}`}>Thông tin thanh toán</h2>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
            <div className="flex-1 flex flex-col items-center">
              <span className="font-bold text-lg mb-2">Họ tên</span>
              <div className={`${isDarkMode ? 'bg-[#232c3b] text-white border border-[#3a3d46]' : 'bg-[#dde6e9] border border-blue-200'} min-w-[220px] text-center rounded-xl px-4 py-2 mb-2 font-medium shadow-sm`}>{user?.fullName || "Không có"}</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="font-bold text-lg mb-2">Điện thoại</span>
              <div className={`${isDarkMode ? 'bg-[#232c3b] text-white border border-[#3a3d46]' : 'bg-[#dde6e9] border border-blue-200'} min-w-[220px] text-center rounded-xl px-4 py-2 mb-2 font-medium shadow-sm`}>{user?.phoneNumber || "Không có"}</div>
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="font-bold text-lg mb-2">Email</span>
              <div className={`${isDarkMode ? 'bg-[#232c3b] text-white border border-[#3a3d46]' : 'bg-[#dde6e9] border border-blue-200'} min-w-[220px] text-center rounded-xl px-4 py-2 mb-2 font-medium shadow-sm`}>{user?.email || "Không có"}</div>
            </div>
          </div>

          {/* Dịch vụ kèm */}
          <h3 className={`text-lg font-bold text-center mb-2 ${isDarkMode ? 'text-orange-400' : 'text-blue-700'}`}>Dịch vụ kèm</h3>
          <table className="w-full mb-4">
            <thead>
              <tr className="text-left">
                <th className="py-1">Tên combo</th>
                <th className="py-1">Mô tả</th>
                <th className="py-1 text-center">Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {combos.map((c) => (
                <tr key={c.key} className={isDarkMode ? 'hover:bg-[#232c3b]' : ''}>
                  <td className="py-1 font-semibold">{c.name}</td>
                  <td className="py-1 text-sm">{c.desc} (<span className={isDarkMode ? 'text-cyan-300' : ''}>{c.price.toLocaleString()}VNĐ</span>)</td>
                  <td className="py-1 text-center">
                    <button onClick={() => setComboCounts(prev => ({ ...prev, [c.key]: Math.max(0, prev[c.key] - 1) }))} className={`px-2 rounded ${isDarkMode ? 'bg-[#232c3b] border border-[#3a3d46] text-cyan-300 hover:bg-[#1a1d23]' : 'bg-gray-200 hover:bg-gray-300'}`}>-</button>
                    <span className="mx-2 font-bold">{comboCounts[c.key]}</span>
                    <button onClick={() => setComboCounts(prev => ({ ...prev, [c.key]: prev[c.key] + 1 }))} className={`px-2 rounded ${isDarkMode ? 'bg-[#232c3b] border border-[#3a3d46] text-orange-300 hover:bg-[#1a1d23]' : 'bg-gray-200 hover:bg-gray-300'}`}>+</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Voucher */}
          <h3 className={`text-lg font-bold text-center mb-2 ${isDarkMode ? 'text-cyan-400' : 'text-blue-700'}`}>Giảm giá</h3>
          <div className="flex items-center gap-4 mb-2">
            <label htmlFor="voucher" className="font-semibold">Mã voucher</label>
            <select id="voucher" value={voucher} onChange={e => setVoucher(Number(e.target.value))} className={`border rounded px-2 py-1 ${isDarkMode ? 'bg-[#232c3b] text-white border-[#3a3d46]' : ''}`}>
              {vouchers.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
            </select>
          </div>
          <div className="mb-2">Số tiền được giảm: <span className="font-bold text-green-400">{voucher.toLocaleString()} VNĐ</span></div>
          <div className="mb-4 text-lg font-bold">Số tiền cần thanh toán: <span className="text-red-400">{total.toLocaleString()} VNĐ</span></div>
          <div className="text-center text-red-400 mb-2">Vui lòng kiểm tra lại thông tin</div>
          <div className="text-center text-xs text-red-300 mb-4">* Vé mua rồi không hoàn trả lại dưới mọi hình thức</div>
          <div className="text-center text-lg font-bold text-orange-400 mb-2">Thời gian đặt vé còn lại: <span className="bg-[#2d2f36] text-red-300 px-2 py-1 rounded font-bold">3:26</span></div>
        </div>

        {/* Thông tin phim */}
        <div className={`${isDarkMode ? 'bg-[#23272f] border border-[#3a3d46] text-[#f1f1f1]' : 'bg-[#e7ede7] text-[#162d5a]'} w-full md:w-[340px] rounded-2xl shadow-lg p-6 flex flex-col items-center transition-colors duration-200`}>
          <img src={movie.poster} alt={movie.title} className="w-32 h-44 object-cover rounded mb-3 border border-[#3a3d46]" />
          <div className={`text-lg font-semibold text-center mb-2 ${isDarkMode ? 'text-cyan-400' : 'text-blue-700'}`}>{movie.title}</div>
          <div className="text-sm mb-1"><b>Hình thức:</b> <span className={isDarkMode ? 'text-gray-200' : ''}>{movie.format}</span></div>
          <div className="text-sm mb-1"><b>Thể loại:</b> <span className={isDarkMode ? 'text-gray-200' : ''}>{movie.genre}</span></div>
          <div className="text-sm mb-1"><b>Thời lượng:</b> <span className={isDarkMode ? 'text-gray-200' : ''}>{movie.duration} phút</span></div>
          <div className="text-sm mb-1"><b>Rạp chiếu:</b> <span className={isDarkMode ? 'text-gray-200' : ''}>{cinema}</span></div>
          <div className="text-sm mb-1"><b>Ngày chiếu:</b> <span className={isDarkMode ? 'text-gray-200' : ''}>{date}</span></div>
          <div className="text-sm mb-1"><b>Giờ chiếu:</b> <span className={isDarkMode ? 'text-gray-200' : ''}>{time}</span></div>
          <div className="text-sm mb-1"><b>Phòng chiếu:</b> <span className={isDarkMode ? 'text-gray-200' : ''}>{room}</span></div>
          <div className="text-sm mb-3"><b>Ghế ngồi:</b> <span className={isDarkMode ? 'text-gray-200' : ''}>{seats && seats.length > 0 ? seats.join(", ") : ""}</span></div>
          <button
            className={`mt-2 px-6 py-2 rounded font-semibold transition-all duration-200 cursor-pointer ${isDarkMode ? 'bg-cyan-400 hover:bg-cyan-300 text-[#23272f]' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
            onClick={() => alert("Thanh toán thành công! (Demo)")}
          >
            Thanh toán
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 