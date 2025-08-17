// src/pages/client/Contact.tsx

import React, { useState } from 'react';

// === HÌNH ẢNH VÉ DỊCH VỤ NHỎ BÊN TRÁI ===
import ticketMuaVeNhom from '../../assets/bg_contact_1.png';
import ticketThueRap from '../../assets/bg_contact_2.png';
import ticketQuangCao from '../../assets/bg_contact_3.png';
import ticketQuaTang from '../../assets/bg_contact_4.png';

// === HÌNH ẢNH NỀN CHO KHUNG NỘI DUNG LỚN ===
import contentBgRed from '../../assets/bg_contact_1.png';
import contentBgGreen from '../../assets/bg_contact_2.png';
import contentBgOrange from '../../assets/bg_contact_3.png';
import contentBgDarkOrange from '../../assets/bg_contact_4.png';

// === HÌNH ẢNH CHO CÁC PHẦN KHÁC ===
import cinemaImage1 from '../../assets/Image1.jpg';
import cinemaImage2 from '../../assets/image2.jpg';
import promoBannerImage from '../../assets/image3.jpg';

// Hợp nhất dữ liệu vào một mảng duy nhất
const services = [
  {
    id: 'mua-ve-nhom',
    title: 'MUA VÉ NHÓM',
    smallImage: ticketMuaVeNhom,
    largeImage: contentBgRed,
    content: [
      'Áp dụng cho đoàn từ 20 khách trở lên, áp dụng chiết khấu cao với hợp đồng dài hạn của doanh nghiệp.',
      'Hoạt động gắn kết tinh thần tập thể, giúp các thành viên xích lại gần nhau hơn.',
      'Liên hệ ngay với CineJoy để được tư vấn và hỗ trợ nhanh nhất.',
    ]
  },
  {
    id: 'thue-rap',
    title: 'THUÊ RẠP TỔ CHỨC SỰ KIỆN',
    smallImage: ticketThueRap,
    largeImage: contentBgGreen,
    content: [
      'Kiến tạo không gian chuyên nghiệp cho sự kiện ra mắt sản phẩm, họp công ty, hội nghị khách hàng.',
      'Hỗ trợ sảnh rạp tổ chức đón khách, chụp hình thảm đỏ, tương tác với truyền thông tại chỗ.',
      'Có nhiều kinh nghiệm tổ chức họp báo ra mắt phim, ra mắt MV.',
      'CineJoy sẽ giúp bạn đưa sản phẩm tới công chúng gần hơn.',
      'Liên hệ tư vấn vui lòng để thông tin ở bên dưới hoặc inbox fanpage CineJoy.',
      'Chúng tôi sẽ liên hệ sớm nhất có thể.',
    ]
  },
  {
    id: 'quang-cao',
    title: 'QUẢNG CÁO TẠI RẠP',
    smallImage: ticketQuangCao,
    largeImage: contentBgOrange,
    content: [
      'Tiếp cận hàng ngàn khách hàng tiềm năng mỗi ngày thông qua màn ảnh rộng.',
      'Hiệu ứng quảng cáo vượt trội với hình ảnh sắc nét và âm thanh vòm Dolby Atmos.',
      'Nhiều hình thức quảng cáo đa dạng: TVC, booth sự kiện, sampling sản phẩm tại sảnh chờ.',
    ]
  },
  {
    id: 'qua-tang',
    title: 'MUA PHIẾU QUÀ TẶNG / E-CODE',
    smallImage: ticketQuaTang,
    largeImage: contentBgDarkOrange,
    content: [
      'Món quà ý nghĩa và tiện lợi dành cho đối tác, khách hàng và nhân viên.',
      'Phiếu quà tặng và E-code có thể sử dụng tại tất cả các cụm rạp CineJoy trên toàn quốc.',
      'Chiết khấu hấp dẫn cho các đơn hàng số lượng lớn. Liên hệ để nhận báo giá tốt nhất.',
    ]
  },
];


const Contact = () => {
  const [activeServiceId, setActiveServiceId] = useState('thue-rap');
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', service: '', area: '', cinema: '', details: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form Data:', formData);
    alert('Thông tin đã được gửi đi!');
  };

  const selectedService = services.find(service => service.id === activeServiceId) || services[0];

  return (
    <div className="bg-white font-sans">

      <section className="bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="relative flex flex-col lg:flex-row gap-8">
            <div className="flex-grow bg-white p-8 shadow-lg rounded-lg">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="w-full md:w-1/3 flex flex-col gap-6">
                  <img src={cinemaImage1} alt="Rạp chiếu phim" className="w-full h-auto rounded-lg shadow-md" />
                  <img src={cinemaImage2} alt="Màn hình rạp chiếu phim" className="w-full h-auto rounded-lg shadow-md" />
                </div>
                <div className="w-full md:w-2/3">
                  <h1 className="text-2xl md:text-3xl font-bold text-red-700 uppercase leading-tight mb-8">
                    Liên hệ quảng cáo tại rạp / Mua vé nhóm <br />
                    Thuê rạp tổ chức sự kiện / Mua phiếu quà tặng
                  </h1>
                  <p className="text-gray-700 mb-4 text-base">Bạn có nhu cầu quảng cáo trên màn hình cực lớn tại rạp, tiếp cận đông đảo khách xem phim tại rạp.</p>
                  <p className="text-gray-700 mb-4 text-base">Bạn cần tăng cường nhận diện thương hiệu, tạo ra doanh thu lợi nhuận cho công ty.</p>
                  <p className="text-gray-700 mb-4 text-base">Bạn cần thưởng thức các bộ phim bom tấn riêng tư cùng gia đình, bạn bè, đồng nghiệp.</p>
                  <p className="text-gray-700 mb-4 text-base">Bạn cần một địa điểm tổ chức sự kiện, họp báo ra mắt dự án, tổ chức fan offline, đào tạo tập trung Bạn đang tìm kiếm quà tặng gửi tới người thân yêu.</p>
                  <p className="text-gray-700 my-8 text-base">Hãy liên hệ ngay với CineJoy để được hỗ trợ ngay.</p>
                  <div className="text-lg">
                    <p><strong className="text-gray-800">Email:</strong> cineJoy@gmail.com</p>
                    <p><strong className="text-gray-800">Hotline:</strong> 1900 1999</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-16 text-[#0B245B]">DỊCH VỤ CỦA CHÚNG TÔI</h2>
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">
          <div className="w-full lg:w-[25%] flex lg:flex-col justify-around items-center relative py-4">
            <div className="absolute left-1/2 lg:left-auto lg:right-0 top-0 lg:top-8 h-full lg:h-[calc(100%-4rem)] w-px lg:w-auto border-l-2 lg:border-l-0 lg:border-t-2 border-dotted border-gray-300"></div>
            {services.map((service) => (
              <div key={service.id} className="relative z-10 w-full flex flex-row-reverse lg:flex-col items-center justify-center lg:mb-8">
                <button onClick={() => setActiveServiceId(service.id)} className="relative group transform hover:scale-105 transition-transform duration-300">
                  <img src={service.smallImage} alt={service.title} className="w-40 md:w-48 group-hover:brightness-75 transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-none">
                    <h3 className="text-white text-lg md:text-xl font-bold uppercase text-center drop-shadow-md leading-tight">
                      {service.title.split(' / ')[0].split(' ').map((word, index, arr) => (
                        index === Math.floor(arr.length / 2) ? <React.Fragment key={index}>{word}<br /></React.Fragment> : `${word} `
                      ))}
                      {service.title.split(' / ')[1] && <span className="text-base block">/ {service.title.split(' / ')[1]}</span>}
                    </h3>
                  </div>
                </button>
                <div className="relative w-12 h-12 lg:w-auto lg:h-auto lg:absolute lg:right-[-1.25rem] lg:top-1/2 lg:-translate-y-1/2">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${activeServiceId === service.id ? 'bg-purple-600' : 'bg-white border-2 border-red-400'}`}>
                    {activeServiceId === service.id && (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="w-full lg:w-[75%]">
            <div
              className="bg-no-repeat bg-cover bg-center p-8 md:p-12 min-h-[380px] text-white flex items-center justify-center transition-all duration-500" // <-- ĐÃ THÊM justify-center
              style={{ backgroundImage: `url(${selectedService.largeImage})` }}
            >
              <div className="max-w-xl">
                <h3 className="text-2xl font-bold mb-4 text-white/95">{selectedService.title}</h3>
                <ul className="space-y-3 list-disc list-inside text-sm text-white/90">
                  {selectedService.content.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              </div>
            </div>
            <div className="mt-10">
              <h3 className="text-xl font-bold text-center mb-6 text-[#0B245B]">LẬP KẾ HOẠCH CÙNG CINEJOY NGAY</h3>
              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" name="name" placeholder="Họ và Tên" className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="tel" name="phone" placeholder="Số điện thoại" className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                  <input type="email" name="email" placeholder="Email" className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
                  <select name="service" defaultValue="Thuê rạp tổ chức sự kiện" className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-700">
                    <option value="">Chọn dịch vụ</option>
                    <option value="Mua vé nhóm">Mua vé nhóm</option>
                    <option value="Thuê rạp tổ chức sự kiện">Thuê rạp tổ chức sự kiện</option>
                    <option value="Quảng cáo tại rạp">Quảng cáo tại rạp</option>
                    <option value="Mua phiếu quà tặng">Mua phiếu quà tặng / E-code</option>
                  </select>
                  <select name="area" className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-500">
                    <option value="">Chọn khu vực</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                  </select>
                  <select name="cinema" className="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-500">
                    <option value="">Chọn rạp</option>
                    <option value="CineJoy Ba Đình">CineJoy Quận Gò Vấp</option>
                    <option value="CineJoy Cầu Giấy">CineJoy Quận 1</option>
                  </select>
                </div>
                <div className="mt-6 relative">
                  <textarea name="details" placeholder="Thông tin chi tiết" rows={5} maxLength={300} onChange={handleInputChange} className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none resize-none"></textarea>
                  <span className="absolute bottom-2 right-3 text-sm text-gray-400">{formData.details.length}/300</span>
                </div>
                <div className="mt-6 text-center">
                  <button type="submit" className="bg-[#0B245B] text-white font-bold py-3 px-12 rounded-lg hover:bg-opacity-90 transition-colors duration-300">
                    GỬI THÔNG TIN
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto py-16 px-10">
        <img src={promoBannerImage} alt="CineJoy Promotion" className="w-full h-auto rounded-lg shadow-xl" />
      </section>
    </div>
  );
};

export default Contact;