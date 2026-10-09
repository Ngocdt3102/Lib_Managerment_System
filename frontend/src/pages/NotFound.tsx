import React from 'react';
import { Result, Button, Card } from 'antd';
import { FileQuestion, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const NotFound: React.FC = () => {
  const { defaultPath } = useAuth();
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }} className="animate-fade-in-up">
      <Card
        style={{
          maxWidth: 560,
          width: '100%',
          borderRadius: 16,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
          textAlign: 'center',
          border: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748b',
            }}
          >
            <FileQuestion size={42} />
          </div>
        </div>

        <Result
          status="404"
          title="404 - Không Tìm Thấy Trang"
          subTitle="Đường dẫn bạn đang tìm kiếm không tồn tại hoặc đã được chuyển sang vị trí khác."
          extra={
            <Button
              type="primary"
              size="large"
              icon={<Home size={16} />}
              onClick={() => navigate(defaultPath)}
              style={{ borderRadius: 8, height: 44, padding: '0 24px', fontWeight: 600 }}
            >
              Về Trang Chủ Của Bạn
            </Button>
          }
        />
      </Card>
    </div>
  );
};
