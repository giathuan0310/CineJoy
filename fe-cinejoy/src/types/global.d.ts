export {};

declare global {
  interface IBackendResponse<T> {
    status: boolean;
    error: number;
    message: string;
    data?: T | null;
  }

  interface IUser {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    gender: string;
    avatar: string;
    dateOfBirth: string;
    role: string;
    isActive: boolean;
    settings: {
      darkMode: boolean;
    };
    point?: number;
    createdAt: Date;
  }

  interface IRegister {
    user: IUser;
    accessToken: string;
  }
  interface ILogin {
    user: IUser;
    accessToken: string;
  }

  interface IRefreshToken {
    accessToken: string;
  }

  interface IFetchAccount {
    user: IUser;
  }

  interface IUpload {
    url: string;
    filename: string;
  }

  interface IMovie {
    _id: string;
    title: string;
    releaseDate: string; // dạng ISO string, ví dụ "2025-06-07"
    duration: number;
    genre: string[];
    director: string;
    actors: string[];
    language: string[];
    description: string;
    trailer: string;
    status: string;
    image: string;
    posterImage: string;
    ageRating: string;
    reviews: IReview[];
    averageRating: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }

  // Nếu có review:
  interface IReview {
    user: string;
    comment: string;
    rating: number;
    // Thêm các trường khác nếu có
  }

  interface ITheater {
    _id: string;
    name: string;
    regionId: string; // ID của vùng (region)
    location: {
      city: string; // Tên thành phố
      address: string; // Địa chỉ cụ thể
    };
  }

  interface IRegion {
    name: string; // Tên vùng
  }

  interface IShowtime {
    _id: string;
    movieId: IMovie;
    theaterId: ITheater;
    showDate: {
      start: string;
      end: string;
    };
    showTimes: Array<{
      _id: string;
      date: string;
      start: string;
      end: string;
      room: string;
      seats: Array<{
        seatId: string;
        status: string;
        type: string;
        price: number;
      }>;
    }>;
  }

  interface ISeat {
    _id: string;
    row: string;
    number: number;
    status: "available" | "reserved" | "sold";
  }

  // Voucher
  interface IVoucher {
    _id: string;
    name: string;
    validityPeriod: {
      startDate: string;
      endDate: string;
    };
    quantity: number;
    discountPercent: number;
    pointToRedeem: number;
  }

  interface IUserVoucher {
    _id: string;
    userId: string;
    voucherId: {
      _id: string;
      name: string;
      validityPeriod: {
        startDate: string;
        endDate: string;
      };
      quantity: number;
      discountPercent: number;
      pointToRedeem: number;
    };
    code: string;
    status: "unused" | "used" | "expired";
    redeemedAt: string;
    usedAt?: string;
  }

  // Blog
  interface IBlog {
    _id: string;
    title: string;
    postedDate: string;
    content: string;
    image: string;
  }

  // FoodCombo
  interface IFoodCombo {
    _id: string;
    name: string;
    price: number;
    description: string;
    quantity: number;
  }

  // Region
  interface IRegion {
    _id: string;
    regionId: string;
    name: string;
  }

  // Seat & Showtime
  interface ISeat {
    seatId: string;
    status: string;
    type: string;
    price: number;
  }

  interface IOrder {
    _id: string;
    tenNguoiDung: string;
    createdAt: string;
    tongTien: number;
    trangThaiDonHang: string;
    trangThaiThanhToan: string;
  }

  // Order & Payment Types
  interface IOrder {
    _id: string;
    orderCode: string;
    userId: string;
    movieId: string;
    theaterId: string;
    showtimeId: string;
    seats: string[];
    foodCombos: Array<{
      comboId: string;
      quantity: number;
      price: number;
    }>;
    voucherId?: string;
    voucherDiscount: number;
    ticketPrice: number;
    comboPrice: number;
    totalAmount: number;
    finalAmount: number;
    paymentMethod: "MOMO" | "VNPAY";
    paymentStatus: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
    orderStatus: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
    customerInfo: {
      fullName: string;
      phoneNumber: string;
      email: string;
    };
    paymentInfo?: {
      transactionId?: string;
      paymentDate?: Date;
      paymentGatewayResponse?: Record<string, unknown>;
    };
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
  }

  interface IPayment {
    _id: string;
    orderId: string;
    paymentMethod: "MOMO" | "VNPAY";
    amount: number;
    status: "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED" | "REFUNDED";
    transactionId?: string;
    gatewayTransactionId?: string;
    gatewayResponse?: Record<string, unknown>;
    refundInfo?: {
      refundAmount: number;
      refundDate: Date;
      refundTransactionId: string;
      reason: string;
    };
    metadata?: {
      returnUrl?: string;
      cancelUrl?: string;
      ipAddress?: string;
      userAgent?: string;
    };
    createdAt: string;
    updatedAt: string;
  }

  interface CreateOrderRequest {
    userId: string;
    movieId: string;
    theaterId: string;
    showtimeId: string;
    seats: string[];
    foodCombos: Array<{
      comboId: string;
      quantity: number;
    }>;
    voucherId?: string;
    paymentMethod: "MOMO" | "VNPAY";
    customerInfo: {
      fullName: string;
      phoneNumber: string;
      email: string;
    };
    seatPrice: number;
  }

  interface CreatePaymentRequest {
    paymentMethod: "MOMO" | "VNPAY";
    returnUrl: string;
    cancelUrl: string;
  }
}
