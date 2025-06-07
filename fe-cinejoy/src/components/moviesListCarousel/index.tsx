import { Link } from 'react-router-dom';
import { FaStar } from 'react-icons/fa';
import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';

interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  ageRating: string;
  genres: string[];
  rating: number;
}

interface Size {
    max: number;
    min: number;
}

interface ResponsiveItem {
    breakpoint: Size;
    items: number;
}

interface Responsive {
    [key: string]: ResponsiveItem;
    superLargeDesktop: ResponsiveItem;
    desktop: ResponsiveItem;
    tablet: ResponsiveItem;
    mobile: ResponsiveItem;
}

interface IProps {
  title: string;
  titleColor?: string;
  bg?: boolean;
  starRating?: boolean;
}

const responsive: Responsive = {
  superLargeDesktop: {
    breakpoint: { max: 4000, min: 3000 },
    items: 6,
  },
  desktop: {
    breakpoint: { max: 3000, min: 1200 },
    items: 6,
  },
  tablet: {
    breakpoint: { max: 1200, min: 600 },
    items: 3,
  },
  mobile: {
    breakpoint: { max: 600, min: 0 },
    items: 2,
  },
};

const getRatingBadgeColor = (rating: string): string => {
  if (rating === 'P+') return 'bg-green-600';
  if (rating.includes('18')) return 'bg-red-600';
  if (rating.includes('16')) return 'bg-red-500';
  if (rating.includes('13')) return 'bg-yellow-500';
  return 'bg-yellow-500';
};

const MoviesListCarousel = (props: IProps) => {
  // Fake movie data (replace with API fetch)
  const movies: Movie[] = [
    {
      id: 1,
      title: 'Vây Hãm Tại Đài Bắc',
      posterUrl: 'https://res.cloudinary.com/ddia5yfia/image/upload/v1735969147/50.Va%CC%82y_Ha%CC%83m_Ta%CC%A3i_%C4%90a%CC%80i_Ba%CC%86%CC%81c_lr0jp4_wbdemr.jpg',
      ageRating: '16+',
      genres: ['Hành động', 'Giật gân'],
      rating: 4
    },
    {
      id: 2,
      title: 'Vùng Đất Bị Nguyền Rủa',
      posterUrl: 'https://res.cloudinary.com/ddia5yfia/image/upload/v1735969149/56._A%CC%81c_Quy%CC%89_Truy_Ho%CC%82%CC%80n_xdqdbj_jziajq.webp',
      ageRating: '12+',
      genres: ['Kinh dị', 'Bí ẩn'],
      rating: 4
    },
    {
      id: 3,
      title: 'Robot Hoàng Đã',
      posterUrl: 'https://res.cloudinary.com/ddia5yfia/image/upload/v1742694499/57_Nobita_va%CC%80_Cuo%CC%A3%CC%82c_Phie%CC%82u_Lu%CC%9Bu_Va%CC%80o_The%CC%82%CC%81_Gio%CC%9B%CC%81i_Trong_Tranh_nyf1uc.webp',
      ageRating: '15+',
      genres: ['Khoa học viễn tưởng', 'Phiêu lưu'],
      rating: 4
    },
    {
      id: 4,
      title: 'Tiên Tri Tử Thần',
      posterUrl: 'https://res.cloudinary.com/ddia5yfia/image/upload/v1742732596/58_Quy%CC%89_Nha%CC%A3%CC%82p_Tra%CC%80ng_xsxfca.jpg',
      ageRating: '15+',
      genres: ['Kinh dị', 'Siêu nhiên'],
      rating: 4
    },
    {
      id: 5,
      title: 'Tiếng Gọi Của Oán Hồn',
      posterUrl: 'https://res.cloudinary.com/ddia5yfia/image/upload/v1740891016/23_Emma_Va%CC%80_Vu%CC%9Bo%CC%9Bng_Quo%CC%82%CC%81c_Ti%CC%81_Hon_s3b1ao.webp',
      ageRating: '12+',
      genres: ['Kinh dị', 'Tâm lý'],
      rating: 5
    },
    {
      id: 6,
      title: 'Trò Chơi Sống Còn',
      posterUrl: 'https://res.cloudinary.com/ddia5yfia/image/upload/v1742733309/60_Vietnamese_Concert_Film_hiwmpg.png',
      ageRating: '16+',
      genres: ['Tâm lý', 'Hồi hộp'],
      rating: 5
    }
  ];


  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i <= rating ? "text-yellow-500" : "text-gray-600"} 
          size={16}
        />
      );
    }
    return stars;
  };
  

  return (
    <div className={`${props.bg ? "bg-[#b3c3a726]" : "bg-[url('https://vticinema.web.app/assets/notification_bg-B6yeZWl8.jpg')]"} py-16 px-8`}>
      <div className="container mx-auto px-4 md:px-8">
        <h2 className={`${props.titleColor ? `text-[${props.titleColor}]` : "text-white"} text-3xl font-medium mb-10 text-center`}>{props.title}</h2>
        
        <Carousel 
          responsive={responsive}
          infinite={true}
          centerMode={false}
          removeArrowOnDeviceType={["tablet", "mobile"]}
          itemClass="px-2"
          containerClass="pb-12"
        >
          {movies.map((movie) => (
            <div
                key={movie.id}
                className="relative group cursor-pointer overflow-hidden rounded-md transition-all duration-300 hover:scale-110 hover:z-999"
            >
                {/* Number Badge */}
                <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/80 border-2 border-red-600 text-white flex items-center justify-center font-bold z-10">
                    {movie.id}
                </div>
                
                {/* Age Rating Badge */}
                <div className={`absolute top-4 right-4 ${getRatingBadgeColor(movie.ageRating)} text-white px-2 py-1 rounded font-bold z-1`}>
                    {movie.ageRating}
                </div>
                
                {/* Movie Poster */}
                <Link to={`/movies/${movie.id}`}>
                <div className="relative aspect-[2/3]">
                    <img
                        className="w-full h-full object-cover border border-white rounded-xl"
                        src={movie.posterUrl}
                        alt={movie.title}
                    />
                    
                    {/* Play button overlay for video trailer movies - shown on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                            </svg>
                            </div>
                        </div>
                    </div>
                </div>
                </Link>
                
                {/* Movie Info */}
                <div className="mt-3">
                    <h3 className={`${props.titleColor ? "text-[#0f1b4c]" : "text-yellow-500"} font-semibold text-lg truncate`}>{movie.title}</h3>
                    <p className="text-gray-400 text-sm truncate">{movie.genres.join(', ')}</p>
                    {props.starRating && (
                      <div className="flex items-center mt-1">
                        {renderStars(movie.rating)}
                      </div>
                    )}
                </div>
            </div>
            ))}
        </Carousel>
      </div>
    </div>
  );
};

export default MoviesListCarousel;