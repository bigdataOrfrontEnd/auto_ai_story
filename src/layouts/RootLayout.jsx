import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { ConfigProvider, theme, } from 'antd';

const RootLayout = () => {
  // 预留：此处可接入 Token 检查或 API Key 登录逻辑
  const [isAuthorized] = useState(true); 

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm, // 保持电影创作工具的暗色质感
        token: {
          colorPrimary: '#6366f1', // Indigo 风格
          borderRadius: 4,
        },
      }}
    >
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
          {isAuthorized ? <Outlet /> : <div>请先登录</div>}
        </div>
    </ConfigProvider>
  );
};

export default RootLayout;