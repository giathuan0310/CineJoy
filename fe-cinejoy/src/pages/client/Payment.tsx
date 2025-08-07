import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import useAppStore from "@/store/app.store";

const combos = [
  {
    name: "VTI Combo",
    desc: "Gồm 1 Bắp + 1 Nước có gaz + 1 Snack Oishi",
    price: 49000,
    key: "vti",
  },
  {
    name: "Sweet Combo",
    desc: "Gồm 2 Bắp + 2 Nước có gaz + 1 Snack Oishi",
    price: 89000,
    key: "sweet",
  },
  {
    name: "Family Combo",
    desc: "Gồm 2 Bắp + 4 Nước có gaz + 2 Snack Oishi",
    price: 139000,
    key: "family",
  },
] as const;

type ComboKey = (typeof combos)[number]["key"];

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
  const [comboCounts, setComboCounts] = useState<Record<ComboKey, number>>({
    vti: 0,
    sweet: 0,
    family: 0,
  });
  const [editableUserInfo, setEditableUserInfo] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    email: user?.email || "",
  });
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Thời gian hết, có thể thêm logic chuyển hướng hoặc thông báo
          alert("Hết thời gian đặt vé! Vui lòng thực hiện lại.");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState("");

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Vui lòng nhập mã voucher");
      return;
    }

    setVoucherLoading(true);
    setVoucherError("");

    try {
      // TODO: Gọi API kiểm tra voucher
      // const response = await validateVoucher(voucherCode);

      // Demo: giả lập việc kiểm tra voucher
      setTimeout(() => {
        if (voucherCode === "DEMO20K") {
          setAppliedVoucher({ code: voucherCode, discount: 20000 });
          setVoucherError("");
        } else if (voucherCode === "DEMO50K") {
          setAppliedVoucher({ code: voucherCode, discount: 50000 });
          setVoucherError("");
        } else {
          setVoucherError("Mã voucher không hợp lệ");
          setAppliedVoucher(null);
        }
        setVoucherLoading(false);
      }, 1000);
    } catch (error) {
      console.log("Error validating voucher:", error);
      setVoucherError("Có lỗi xảy ra khi kiểm tra voucher");
      setAppliedVoucher(null);
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
  };

  // Tính tổng tiền combo
  const comboTotal = combos.reduce(
    (sum, c) => sum + comboCounts[c.key] * c.price,
    0
  );
  // Giá vé 1 ghế (cứng mẫu)
  const seatPrice = 90000;
  const ticketTotal = seats.length * seatPrice;
  const voucherDiscount = appliedVoucher?.discount || 0;
  const total = ticketTotal + comboTotal - voucherDiscount;

  return (
    <div
      className={`${
        isDarkMode
          ? "bg-[#181A20] text-[#f1f1f1]"
          : "bg-[#e7ede7] text-[#162d5a]"
      } min-h-screen py-8`}
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Thông tin thanh toán */}
        <div
          className={`${
            isDarkMode
              ? "bg-[#23272f] border border-[#3a3d46] text-[#f1f1f1]"
              : "bg-[#e7ede7] text-[#162d5a]"
          } flex-1 rounded-2xl p-6 mb-6 md:mb-0 shadow-lg transition-colors duration-200`}
        >
          <h2
            className={`text-xl font-bold text-center mb-6 ${
              isDarkMode ? "text-cyan-400" : "text-blue-700"
            }`}
          >
            Thông tin thanh toán
          </h2>
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-6">
            <div className="flex-1 flex flex-col items-center">
              <span className="font-bold text-lg mb-2">Họ tên</span>
              <input
                type="text"
                value={editableUserInfo.fullName}
                onChange={(e) =>
                  setEditableUserInfo((prev) => ({
                    ...prev,
                    fullName: e.target.value,
                  }))
                }
                placeholder="Nhập họ tên"
                className={`${
                  isDarkMode
                    ? "bg-[#232c3b] text-white border border-[#3a3d46] placeholder-gray-400"
                    : "bg-[#dde6e9] border border-blue-200"
                } min-w-[220px] text-center rounded-lg px-4 py-2 mb-2 font-medium shadow-sm focus:outline-none focus:ring-2 ${
                  isDarkMode ? "focus:ring-cyan-400" : "focus:ring-blue-400"
                }`}
              />
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="font-bold text-lg mb-2">Điện thoại</span>
              <input
                type="tel"
                value={editableUserInfo.phoneNumber}
                onChange={(e) =>
                  setEditableUserInfo((prev) => ({
                    ...prev,
                    phoneNumber: e.target.value,
                  }))
                }
                placeholder="Nhập số điện thoại"
                className={`${
                  isDarkMode
                    ? "bg-[#232c3b] text-white border border-[#3a3d46] placeholder-gray-400"
                    : "bg-[#dde6e9] border border-blue-200"
                } min-w-[220px] text-center rounded-lg px-4 py-2 mb-2 font-medium shadow-sm focus:outline-none focus:ring-2 ${
                  isDarkMode ? "focus:ring-cyan-400" : "focus:ring-blue-400"
                }`}
              />
            </div>
            <div className="flex-1 flex flex-col items-center">
              <span className="font-bold text-lg mb-2">Email</span>
              <input
                type="email"
                value={editableUserInfo.email}
                onChange={(e) =>
                  setEditableUserInfo((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                placeholder="Nhập email"
                className={`${
                  isDarkMode
                    ? "bg-[#232c3b] text-white border border-[#3a3d46] placeholder-gray-400"
                    : "bg-[#dde6e9] border border-blue-200"
                } min-w-[220px] text-center rounded-lg px-4 py-2 mb-2 font-medium shadow-sm focus:outline-none focus:ring-2 ${
                  isDarkMode ? "focus:ring-cyan-400" : "focus:ring-blue-400"
                }`}
              />
            </div>
          </div>

          {/* Dịch vụ kèm */}
          <h3
            className={`text-lg font-bold text-center mb-2 ${
              isDarkMode ? "text-orange-400" : "text-blue-700"
            }`}
          >
            Dịch vụ kèm
          </h3>
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
                <tr
                  key={c.key}
                  className={isDarkMode ? "hover:bg-[#232c3b]" : ""}
                >
                  <td className="py-1 font-semibold">{c.name}</td>
                  <td className="py-1 text-sm">
                    {c.desc} (
                    <span className={isDarkMode ? "text-cyan-300" : ""}>
                      {c.price.toLocaleString()}VNĐ
                    </span>
                    )
                  </td>
                  <td className="py-1 text-center">
                    <button
                      onClick={() =>
                        setComboCounts((prev) => ({
                          ...prev,
                          [c.key]: Math.max(0, prev[c.key] - 1),
                        }))
                      }
                      className={`px-2 rounded cursor-pointer ${
                        isDarkMode
                          ? "bg-[#232c3b] border border-[#3a3d46] text-cyan-300 hover:bg-[#1a1d23]"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      -
                    </button>
                    <span className="mx-2 font-bold">{comboCounts[c.key]}</span>
                    <button
                      onClick={() =>
                        setComboCounts((prev) => ({
                          ...prev,
                          [c.key]: prev[c.key] + 1,
                        }))
                      }
                      className={`px-2 rounded cursor-pointer ${
                        isDarkMode
                          ? "bg-[#232c3b] border border-[#3a3d46] text-orange-300 hover:bg-[#1a1d23]"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      +
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Voucher */}
          <h3
            className={`text-lg font-bold text-center mb-3 ${
              isDarkMode ? "text-cyan-400" : "text-blue-700"
            }`}
          >
            Giảm giá
          </h3>

          {!appliedVoucher ? (
            // Chưa áp dụng voucher - hiển thị form nhập
            <div className="mb-4">
              <div className="flex items-center justify-center gap-6 mb-3">
                <input
                  type="text"
                  value={voucherCode}
                  onChange={(e) => {
                    setVoucherCode(e.target.value.toUpperCase());
                    if (e.target.value.trim() === "") {
                      setVoucherError("");
                    }
                  }}
                  placeholder="Nhập mã voucher"
                  className={`w-[300px] border rounded px-2.5 py-1.5 ${
                    isDarkMode
                      ? "bg-[#232c3b] text-white border-[#3a3d46] placeholder-gray-400"
                      : "border-gray-300"
                  }`}
                />
                <button
                  onClick={handleApplyVoucher}
                  disabled={voucherLoading || !voucherCode.trim()}
                  className={`px-3.5 py-1.5 rounded font-semibold transition-all duration-200 ${
                    voucherLoading || !voucherCode.trim()
                      ? "bg-gray-400 text-gray-600 cursor-not-allowed"
                      : isDarkMode
                      ? "bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer"
                      : "bg-blue-600 hover:bg-blue-500 text-white cursor-pointer"
                  }`}
                >
                  {voucherLoading ? "Đang kiểm tra..." : "Áp dụng"}
                </button>
              </div>

              {voucherError && (
                <div className="text-red-500 text-sm text-center mb-2 select-none">
                  {voucherError}
                </div>
              )}

              {/* <div className="text-sm text-gray-500">
                Mã demo: DEMO20K (giảm 20.000đ), DEMO50K (giảm 50.000đ)
              </div> */}
            </div>
          ) : (
            // Đã áp dụng voucher - hiển thị thông tin voucher
            <div className="mb-4">
              <div
                className={`border rounded p-3 mb-2 ${
                  isDarkMode
                    ? "bg-[#232c3b] border-[#3a3d46]"
                    : "bg-green-50 border-green-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold text-green-600">
                      ✓ Mã voucher: {appliedVoucher.code}
                    </div>
                    <div className="text-sm">
                      Giảm: {appliedVoucher.discount.toLocaleString()} VNĐ
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveVoucher}
                    className="text-red-500 hover:text-red-700 font-semibold text-sm cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="mb-2 mt-6">
            Số tiền được giảm:{" "}
            <span className="font-bold text-green-400">
              {voucherDiscount.toLocaleString()} VNĐ
            </span>
          </div>
          <div className="mb-4 text-lg font-bold">
            Số tiền cần thanh toán:{" "}
            <span className="text-red-400">{total.toLocaleString()} VNĐ</span>
          </div>
          <div className="text-center text-red-400 mb-2">
            Vui lòng kiểm tra lại thông tin
          </div>
          <div className="text-center text-xs text-red-300 mb-4">
            * Vé mua rồi không hoàn trả lại dưới mọi hình thức
          </div>
          <div className="text-center text-lg font-bold text-orange-400 mb-2">
            Thời gian đặt vé còn lại:{" "}
            <span
              className={`px-2 py-1 rounded font-bold ${
                timeLeft <= 60
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-[#2d2f36] text-red-300"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* Thông tin phim */}
        <div
          className={`${
            isDarkMode
              ? "bg-[#23272f] border border-[#3a3d46] text-[#f1f1f1]"
              : "bg-[#e7ede7] text-[#162d5a]"
          } w-full md:w-[340px] rounded-2xl shadow-lg p-6 flex flex-col items-center transition-colors duration-200`}
        >
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-32 h-44 object-cover rounded mb-3 border border-[#3a3d46]"
          />
          <div
            className={`text-lg font-semibold text-center mb-2 ${
              isDarkMode ? "text-cyan-400" : "text-blue-700"
            }`}
          >
            {movie.title}
          </div>
          <div className="text-sm mb-1">
            <b>Hình thức:</b>{" "}
            <span className={isDarkMode ? "text-gray-200" : ""}>
              {movie.format}
            </span>
          </div>
          <div className="text-sm mb-1">
            <b>Thể loại:</b>{" "}
            <span className={isDarkMode ? "text-gray-200" : ""}>
              {movie.genre}
            </span>
          </div>
          <div className="text-sm mb-1">
            <b>Thời lượng:</b>{" "}
            <span className={isDarkMode ? "text-gray-200" : ""}>
              {movie.duration} phút
            </span>
          </div>
          <div className="text-sm mb-1">
            <b>Rạp chiếu:</b>{" "}
            <span className={isDarkMode ? "text-gray-200" : ""}>{cinema}</span>
          </div>
          <div className="text-sm mb-1">
            <b>Ngày chiếu:</b>{" "}
            <span className={isDarkMode ? "text-gray-200" : ""}>{date}</span>
          </div>
          <div className="text-sm mb-1">
            <b>Giờ chiếu:</b>{" "}
            <span className={isDarkMode ? "text-gray-200" : ""}>{time}</span>
          </div>
          <div className="text-sm mb-1">
            <b>Phòng chiếu:</b>{" "}
            <span className={isDarkMode ? "text-gray-200" : ""}>{room}</span>
          </div>
          <div className="text-sm mb-3">
            <b>Ghế ngồi:</b>{" "}
            <span className={isDarkMode ? "text-gray-200" : ""}>
              {seats && seats.length > 0 ? seats.join(", ") : ""}
            </span>
          </div>
          <button
            className={`mt-2 px-6 py-2 rounded font-semibold transition-all duration-200 cursor-pointer ${
              isDarkMode
                ? "bg-cyan-400 hover:bg-cyan-300 text-[#23272f]"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
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
