import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Modal, Button, Typography, Row, Col } from "antd";
import { validateVoucherApi } from "@/services/api";
import { getFoodCombos } from "@/apiservice/apiFoodCombo";
import useAppStore from "@/store/app.store";

const { Title, Text } = Typography;

// Interface tạm thời cho voucher response
interface VoucherResponse {
  status: boolean;
  error: number;
  message: string;
  data?: {
    voucher: unknown;
    userVoucher: unknown;
    discount: number;
  };
}

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, user, setIsModalOpen } = useAppStore();
  const {
    movie = {},
    seats = [],
    cinema = "",
    date = "",
    time = "",
    room = "",
  } = location.state || {};
  const [combos, setCombos] = useState<IFoodCombo[]>([]);
  const [combosLoading, setCombosLoading] = useState<boolean>(true);
  const [comboCounts, setComboCounts] = useState<Record<string, number>>({});
  const [editableUserInfo, setEditableUserInfo] = useState({
    fullName: user?.fullName || "",
    phoneNumber: user?.phoneNumber || "",
    email: user?.email || "",
  });
  const [timeLeft, setTimeLeft] = useState<number>(600);
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    discountPercent: number;
    discountAmount: number;
  } | null>(null);
  const [voucherLoading, setVoucherLoading] = useState<boolean>(false);
  const [voucherError, setVoucherError] = useState<string>("");
  const [isModalPaymentOpen, setIsModalPaymentOpen] = useState<boolean>(false);
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadFoodCombos = async () => {
      try {
        setCombosLoading(true);
        const data = await getFoodCombos();
        setCombos(data);
        // Khởi tạo combo counts với ID từ database
        const initialCounts: Record<string, number> = {};
        data.forEach((combo) => {
          initialCounts[combo._id] = 0;
        });
        setComboCounts(initialCounts);
      } catch (error) {
        console.error("Lỗi khi tải food combos:", error);
        setCombos([]);
      } finally {
        setCombosLoading(false);
      }
    };

    loadFoodCombos();
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return dateString;

    // Nếu dateString đã ở format DD/MM/YYYY thì return luôn
    if (dateString.includes("/")) return dateString;

    // Nếu dateString ở format YYYY-MM-DD hoặc các format khác
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Nếu không parse được thì return nguyên

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      setVoucherError("Vui lòng nhập mã voucher");
      return;
    }

    setVoucherLoading(true);
    setVoucherError("");

    const response = await validateVoucherApi(voucherCode, user?._id);

    if (!response) {
      setVoucherError("Có lỗi xảy ra khi kiểm tra voucher");
      setAppliedVoucher(null);
      setVoucherLoading(false);
      return;
    }

    const voucherResponse = response as unknown as VoucherResponse;

    if (voucherResponse.status && voucherResponse.data) {
      const discountPercent = voucherResponse.data.discount || 0;

      setAppliedVoucher({
        code: voucherCode,
        discountPercent: discountPercent,
        discountAmount: 0, // Sẽ được tính lại tự động
      });
      setVoucherError("");
    } else {
      setVoucherError(voucherResponse.message || "Mã voucher không hợp lệ");
      setAppliedVoucher(null);
    }

    setVoucherLoading(false);
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherError("");
  };

  const handleOpenModal = () => {
    if (!editableUserInfo.fullName.trim()) {
      alert("Vui lòng nhập họ tên");
      return;
    }
    if (!editableUserInfo.phoneNumber.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }
    if (!editableUserInfo.email.trim()) {
      alert("Vui lòng nhập email");
      return;
    }
    setIsModalOpen(true);
    setIsModalPaymentOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalPaymentOpen(false);
  };

  const handlePayment = async () => {
    setIsPaymentLoading(true);

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // TODO: Implement actual payment logic here
      console.log("Payment processing...", {
        movie,
        seats,
        cinema,
        date,
        time,
        room,
        combos: comboCounts,
        userInfo: editableUserInfo,
        voucher: appliedVoucher,
        total,
      });

      alert("Thanh toán thành công!");
      setIsModalOpen(false);
      setIsModalPaymentOpen(false);
    } catch (error) {
      console.error("Payment error:", error);
      alert("Có lỗi xảy ra trong quá trình thanh toán!");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  // Tính tổng tiền combo
  const comboTotal = combos.reduce(
    (sum, c) => sum + comboCounts[c._id] * c.price,
    0
  );

  // Giá vé 1 ghế (cứng mẫu)
  const seatPrice = 90000;
  const ticketTotal = seats.length * seatPrice;

  // Tính lại discount khi combo total thay đổi
  const currentSubTotal = ticketTotal + comboTotal;
  const voucherDiscount = appliedVoucher
    ? Math.round((currentSubTotal * appliedVoucher.discountPercent) / 100)
    : 0;

  const total = currentSubTotal - voucherDiscount;

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          // Thời gian hết, có thể thêm logic chuyển hướng hoặc thông báo
          alert("Hết thời gian đặt vé! Vui lòng thực hiện lại.");
          navigate("/");
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, navigate]);

  return (
    <>
      <div
        className={`${
          isDarkMode
            ? "bg-[#181A20] text-[#f1f1f1]"
            : "bg-[#e7ede7] text-[#162d5a]"
        } min-h-screen py-8`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
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
                  name="fullName"
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
                      : "bg-[#7caed921]"
                  } min-w-[250px] text-center rounded-lg px-3.5 py-1.5 mb-2 shadow-sm focus:outline-none focus:ring-1 ${
                    isDarkMode ? "focus:ring-cyan-400" : "focus:ring-blue-400"
                  }`}
                />
              </div>
              <div className="flex-1 flex flex-col items-center">
                <span className="font-bold text-lg mb-2">Điện thoại</span>
                <input
                  type="tel"
                  name="phoneNumber"
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
                      : "bg-[#7caed921]"
                  } min-w-[250px] text-center rounded-lg px-3.5 py-1.5 mb-2 shadow-sm focus:outline-none focus:ring-1 ${
                    isDarkMode ? "focus:ring-cyan-400" : "focus:ring-blue-400"
                  }`}
                />
              </div>
              <div className="flex-1 flex flex-col items-center">
                <span className="font-bold text-lg mb-2">Email</span>
                <input
                  type="email"
                  name="email"
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
                      : "bg-[#7caed921]"
                  } min-w-[250px] text-center rounded-lg px-3.5 py-1.5 mb-2 shadow-sm focus:outline-none focus:ring-1 ${
                    isDarkMode ? "focus:ring-cyan-400" : "focus:ring-blue-400"
                  }`}
                />
              </div>
            </div>

            {/* Dịch vụ kèm */}
            <h3
              className={`text-lg font-bold text-center mb-2 ${
                isDarkMode ? "text-cyan-400" : "text-blue-700"
              }`}
            >
              Dịch vụ kèm
            </h3>
            {combosLoading ? (
              <div className="text-center py-4">
                <span
                  className={isDarkMode ? "text-gray-300" : "text-gray-600"}
                >
                  Đang tải combo...
                </span>
              </div>
            ) : combos.length > 0 ? (
              <div
                className={`rounded-lg overflow-hidden mb-4 ${
                  isDarkMode ? "bg-[#23272f]" : "bg-white"
                } shadow-sm border ${
                  isDarkMode ? "border-gray-700" : "border-gray-200"
                }`}
              >
                <table className={`w-full ${isDarkMode ? "" : "bg-[#e7ede7]"}`}>
                  <thead>
                    <tr
                      className={`text-left select-none border-b ${
                        isDarkMode ? "border-gray-600" : "border-gray-300"
                      }`}
                    >
                      <th
                        className={`py-3 text-center font-bold ${
                          isDarkMode ? "text-white" : ""
                        }`}
                      >
                        Tên combo
                      </th>
                      <th
                        className={`py-3 text-center font-bold ${
                          isDarkMode ? "text-white" : ""
                        }`}
                      >
                        Mô tả & Giá
                      </th>
                      <th
                        className={`py-3 text-center font-bold ${
                          isDarkMode ? "text-white" : ""
                        }`}
                      >
                        Chọn số lượng
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {combos.map((c) => (
                      <tr
                        key={c._id}
                        className={`select-none transition-colors duration-200 ${
                          c.quantity === 0 ? "opacity-60" : ""
                        }`}
                      >
                        <td className="py-4 font-semibold text-center">
                          <div
                            className={`text-base ${
                              c.quantity === 0 ? "text-gray-500" : ""
                            }`}
                          >
                            {c.name}
                          </div>
                        </td>
                        <td className="py-4 text-sm text-center">
                          <div className="flex flex-col items-center gap-1">
                            <span
                              className={
                                c.quantity === 0 ? "text-gray-500" : ""
                              }
                            >
                              {c.description}
                            </span>
                            <span
                              className={`font-bold text-base ${
                                c.quantity === 0
                                  ? "text-gray-500"
                                  : isDarkMode
                                  ? "text-green-400"
                                  : "text-green-600"
                              }`}
                            >
                              {c.price.toLocaleString()} VNĐ
                            </span>
                          </div>
                        </td>
                        <td className="py-1 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                setComboCounts((prev) => ({
                                  ...prev,
                                  [c._id]: Math.max(0, (prev[c._id] || 0) - 1),
                                }))
                              }
                              disabled={(comboCounts[c._id] || 0) <= 0}
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                                (comboCounts[c._id] || 0) <= 0
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : isDarkMode
                                  ? "bg-red-600 hover:bg-red-500 text-white shadow-lg hover:shadow-xl cursor-pointer"
                                  : "bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl cursor-pointer"
                              }`}
                            >
                              −
                            </button>

                            <div className="flex flex-col items-center min-w-[40px]">
                              <span
                                className={`text-lg font-bold ${
                                  isDarkMode ? "text-white" : "text-gray-800"
                                }`}
                              >
                                {comboCounts[c._id] || 0}
                              </span>
                            </div>

                            <button
                              onClick={() =>
                                setComboCounts((prev) => ({
                                  ...prev,
                                  [c._id]: Math.min(
                                    c.quantity,
                                    (prev[c._id] || 0) + 1
                                  ),
                                }))
                              }
                              disabled={(comboCounts[c._id] || 0) >= c.quantity}
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-200 ${
                                (comboCounts[c._id] || 0) >= c.quantity
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : isDarkMode
                                  ? "bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-xl cursor-pointer"
                                  : "bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl cursor-pointer"
                              }`}
                            >
                              +
                            </button>
                          </div>

                          {(comboCounts[c._id] || 0) >= c.quantity &&
                            c.quantity > 0 && (
                              <div className="text-xs text-orange-500 mt-1 font-medium">
                                Đã đạt giới hạn
                              </div>
                            )}

                          {c.quantity === 0 && (
                            <div className="text-xs text-red-500 mt-1 font-medium">
                              Hết hàng
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <span
                  className={isDarkMode ? "text-gray-300" : "text-gray-600"}
                >
                  Không có combo nào
                </span>
              </div>
            )}

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
                <div className="flex items-center justify-center gap-3.5 mb-3">
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
                    className={`w-[300px] border rounded-md px-2.5 py-1.5 ${
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
                        Bạn được giảm {appliedVoucher.discountPercent}%
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

            <div className="text-right mb-2 mt-6">
              Số tiền được giảm:{" "}
              <span className="font-bold text-green-400">
                {voucherDiscount.toLocaleString()} VNĐ
              </span>
            </div>
            <div className="text-right mb-4 text-[18px] font-bold">
              Số tiền cần thanh toán:{" "}
              <span className="text-red-400">{total.toLocaleString()} VNĐ</span>
            </div>
            <div className="flex justify-between items-center mb-4 mt-6 px-20">
              <div className="text-center">
                <div className="text-red-500 text-[14px] mb-2">
                  Vui lòng kiểm tra lại thông tin
                </div>
                <div className="text-[14px] text-red-500">
                  * Vé mua rồi không hoàn trả lại dưới mọi hình thức
                </div>
              </div>
              <div className="flex flex-col items-center">
                <div className="text-md font-bold text-orange-400 mb-1">
                  Thời gian đặt vé còn lại:
                </div>
                <span
                  className={`px-4 py-1 mt-1 rounded font-bold ${
                    timeLeft <= 60
                      ? "bg-red-600 text-white animate-pulse"
                      : isDarkMode
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "bg-[#fff] text-red-600"
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
          </div>

          {/* Thông tin phim */}
          <div
            className={`${
              isDarkMode
                ? "bg-[#23272f] border border-[#3a3d46] text-[#f1f1f1]"
                : "bg-[#e7ede7] text-[#162d5a]"
            } w-full md:w-[340px] rounded-2xl shadow-lg p-6 transition-colors duration-200`}
          >
            <div className="detail_movie_container">
              <img
                src={movie.poster || movie.image}
                alt={movie.title || movie.movie_name}
                className="detail_movie_img w-32 h-44 object-cover rounded mb-3 border border-[#3a3d46] mx-auto block"
              />
              <p
                className={`detail_movie_title text-lg font-semibold text-center mb-4 ${
                  isDarkMode ? "text-cyan-400" : "text-blue-700"
                }`}
              >
                {movie.title || movie.movie_name}
              </p>
              <div className="detail_movie_info space-y-2">
                <div className="row flex justify-between text-sm">
                  <p className="label font-bold">Hình thức:</p>
                  <p className={`value ${isDarkMode ? "text-gray-200" : ""}`}>
                    2D, Phụ đề Tiếng Việt
                  </p>
                </div>
                <div className="row flex justify-between text-sm">
                  <p className="label font-bold">Thể loại:</p>
                  <p className={`value ${isDarkMode ? "text-gray-200" : ""}`}>
                    {movie.genre}
                  </p>
                </div>
                <div className="row flex justify-between text-sm">
                  <p className="label font-bold">Thời lượng:</p>
                  <p className={`value ${isDarkMode ? "text-gray-200" : ""}`}>
                    {movie.duration} phút
                  </p>
                </div>
                <div className="row flex justify-between text-sm">
                  <p className="label font-bold">Rạp chiếu:</p>
                  <p className={`value ${isDarkMode ? "text-gray-200" : ""}`}>
                    {cinema}
                  </p>
                </div>
                <div className="row flex justify-between text-sm">
                  <p className="label font-bold">Ngày chiếu:</p>
                  <p className={`value ${isDarkMode ? "text-gray-200" : ""}`}>
                    {date}
                  </p>
                </div>
                <div className="row flex justify-between text-sm">
                  <p className="label font-bold">Giờ chiếu:</p>
                  <p className={`value ${isDarkMode ? "text-gray-200" : ""}`}>
                    {time}
                  </p>
                </div>
                <div className="row flex justify-between text-sm">
                  <p className="label font-bold">Phòng chiếu:</p>
                  <p className={`value ${isDarkMode ? "text-gray-200" : ""}`}>
                    {room || "P1"}
                  </p>
                </div>
                <div className="row flex justify-between text-sm">
                  <p className="label font-bold">Ghế ngồi:</p>
                  <p className={`value ${isDarkMode ? "text-gray-200" : ""}`}>
                    {seats && seats.length > 0 ? seats.join(", ") : ""}
                  </p>
                </div>
              </div>
              <button
                className={`mt-6 w-full px-6 py-2 rounded font-semibold transition-all duration-200 cursor-pointer ${
                  isDarkMode
                    ? "bg-cyan-400 hover:bg-cyan-300 text-[#23272f]"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                onClick={handleOpenModal}
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận thanh toán */}
      <Modal
        title={
          <Title
            level={4}
            style={{
              color: "#e74c3c",
              margin: 0,
              textAlign: "center",
              marginBottom: "20px",
            }}
          >
            Xác nhận thông tin
          </Title>
        }
        open={isModalPaymentOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Hủy
          </Button>,
          <Button
            key="confirm"
            type="primary"
            loading={isPaymentLoading}
            onClick={handlePayment}
          >
            Xác nhận
          </Button>,
        ]}
        width={500}
        centered
        getContainer={false}
      >
        <div className="text-[14px] leading-[1.6]">
          {/* Thông tin phim */}
          <div className="mb-[20px]">
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>Phim:</Text>
              </Col>
              <Col span={16}>
                <Text>{movie.title}</Text>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>Rạp chiếu:</Text>
              </Col>
              <Col span={16}>
                <Text>{cinema}</Text>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>Ngày chiếu:</Text>
              </Col>
              <Col span={16}>
                <Text>{formatDate(date)}</Text>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>Giờ chiếu:</Text>
              </Col>
              <Col span={16}>
                <Text>{time}</Text>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>Phòng chiếu:</Text>
              </Col>
              <Col span={16}>
                <Text>{room}</Text>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>Ghế ngồi:</Text>
              </Col>
              <Col span={16}>
                <Text>
                  {seats && seats.length > 0
                    ? seats.join(", ")
                    : "Chưa chọn ghế"}
                </Text>
              </Col>
            </Row>
          </div>

          {/* Thông tin khách hàng */}
          <div className="mb-[20px]">
            <Title level={5} style={{ textAlign: "center" }}>
              Thông tin khách hàng
            </Title>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>Họ tên:</Text>
              </Col>
              <Col span={16}>
                <Text>{editableUserInfo.fullName}</Text>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>Điện thoại:</Text>
              </Col>
              <Col span={16}>
                <Text>{editableUserInfo.phoneNumber}</Text>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Text strong>Email:</Text>
              </Col>
              <Col span={16}>
                <Text>{editableUserInfo.email}</Text>
              </Col>
            </Row>
          </div>

          {/* Dịch vụ kèm */}
          <div className="mb-[20px]">
            <Row gutter={16}>
              <Col span={6}>
                <Text strong style={{ textAlign: "left" }}>
                  Dịch vụ kèm:
                </Text>
              </Col>
              <Col span={18}>
                <div className="text-right mr-[10px]">
                  {Object.values(comboCounts).some((count) => count > 0) ? (
                    combos.map((combo) => {
                      if (comboCounts[combo._id] > 0) {
                        return (
                          <Text
                            key={combo._id}
                            style={{
                              display: "block",
                              fontSize: "14px",
                              marginBottom: "4px",
                            }}
                          >
                            {combo.name} - {comboCounts[combo._id]} x{" "}
                            {new Intl.NumberFormat("vi-VN").format(combo.price)}{" "}
                            VNĐ
                          </Text>
                        );
                      }
                      return null;
                    })
                  ) : (
                    <Text
                      style={{
                        fontSize: "14px",
                        color: "#999",
                        fontStyle: "italic",
                      }}
                    >
                      Không có dịch vụ nào
                    </Text>
                  )}
                </div>
              </Col>
            </Row>
          </div>

          {/* Voucher */}
          {appliedVoucher && (
            <div style={{ marginBottom: "20px" }}>
              <Title level={5} style={{ textAlign: "center" }}>
                Mã giảm giá
              </Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Text>Mã voucher: {appliedVoucher.code}</Text>
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  <Text style={{ color: "#52c41a" }}>
                    -{voucherDiscount.toLocaleString()} VNĐ
                  </Text>
                </Col>
              </Row>
            </div>
          )}

          {/* Tổng thanh toán */}
          <div className="border-t border-gray-200 pt-[15px] mt-[20px] text-right">
            <Title level={4} style={{ margin: 0, color: "#e74c3c" }}>
              Tổng thanh toán: {total.toLocaleString()} VNĐ
            </Title>
          </div>

          <div className="mt-[10px] text-[13px] text-center text-red-600 select-none">
            (Khi bấm xác nhận sẽ chuyển đến trang thanh toán)
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PaymentPage;
