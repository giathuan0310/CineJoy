import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';
import useAppStore from '@/store/app.store';
import error from 'assets/error.gif';
import 'styles/error.css';

const ErrorPage: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useAppStore();

  return (
    <div className={isDarkMode ? "error-bg-stars min-h-screen w-full flex flex-col items-center justify-center" : "error-bg-day min-h-screen w-full flex flex-col items-center justify-center"}>
      {!isDarkMode && (
        <>
          <div className="sun"></div>
          <div className="cloud cloud-1"></div>
          <div className="cloud cloud-2"></div>
          <div className="cloud cloud-3"></div>
          <div className="cloud cloud-4"></div>
          <div className="cloud cloud-5"></div>
        </>
      )}
      <img
        src={error}
        alt="404"
        className="z-10"
        style={{ maxWidth: 250, width: '90vw', height: 'auto' }}
      />
      <div className="z-10 flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-2 text-white drop-shadow" style={!isDarkMode ? { color: '#222', textShadow: '0 2px 8px #fff8' } : {}}>Trang bạn tìm kiếm không tồn tại hoặc đã bị di chuyển</h2>
        <Button
          type="primary"
          size="large"
          style={
            isDarkMode
              ? {
                  background: 'linear-gradient(90deg, #1976d2 0%, #21a1ff 100%)',
                  borderColor: '#1976d2',
                  color: '#fff',
                  fontWeight: 600,
                  borderRadius: 10,
                  padding: '0 25px',
                  fontSize: 18,
                  marginTop: 12,
                }
              : {
                  background: 'linear-gradient(90deg, #ffe259 0%, #ffa751 100%)',
                  borderColor: '#ffe259',
                  color: '#fff',
                  fontWeight: 600,
                  borderRadius: 10,
                  padding: '0 25px',
                  fontSize: 18,
                  marginTop: 12,
                }
          }
          onClick={() => navigate('/')}
        >
          Quay về trang chủ
        </Button>
      </div>
    </div>
  );
};

export default ErrorPage; 