import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, theme, App as AntdApp } from 'antd';
import { ProjectProvider } from '@context/ProjectContext';
import { router } from '@router/router';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 配置 Ant Design 主题 */}
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          colorBgBase: '#000', // 全局极黑背景
        },
      }}
    >
      {/* AntdApp 允许我们使用 useApp() 钩子 */}
      <AntdApp>
        {/* 加载数据大脑 */}
        <ProjectProvider>
          {/* 渲染路由地图 */}
          <RouterProvider router={router} />
        </ProjectProvider>
      </AntdApp>
    </ConfigProvider>
  </React.StrictMode>
);