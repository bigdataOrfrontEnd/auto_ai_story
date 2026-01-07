import React, { useState } from 'react';
import { Layout, Menu, Button, ConfigProvider, theme } from 'antd';
import { Outlet } from 'react-router';
import { useNavigate } from 'react-router-dom';
import {
  HomeOutlined,
  UserOutlined,
  SettingOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Header, Sider, Content, Footer } = Layout;

const items = [
  { key: '/', icon: <HomeOutlined />, label: '首页' },
  { key: '/', icon: <HomeOutlined />, label: '剧本阶段' },
  {
    key: '/system',
    icon: <SettingOutlined />,
    label: '资产生成',
    children: [
      { key: '/system/User', icon: <UserOutlined />, label: '角色管理' },
    { key: '/system/f', icon: <UserOutlined />, label: '场景管理' },
    ]
  },
  { key: '/alarm', icon: <WarningOutlined />, label: '导演工作台' },
  { key: '/history', icon: <HomeOutlined />, label: '导出阶段' }
];

function App() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  const { token } = theme.useToken();

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorBgLayout: '#fff',
          colorBgContainer: '#fff'
        }
      }}
    >
      {/* 外层：锁死高度 + 禁止整体滚动 */}
      <Layout style={{ height: '100vh', overflow: 'hidden' }}>
        {/* Header */}
        <Header
          style={{
            background: token.colorBgLayout,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ marginRight: 16 }}
          />
          <span style={{ fontWeight: 600 }}>auto_ai_story</span>
        </Header>

        {/* 中间区域 */}
        <Layout style={{ flex: 1, overflow: 'hidden' }}>
          {/* Sider */}
          <Sider
            collapsible
            collapsed={collapsed}
            trigger={null}
            width={200}
            style={{
              background: '#fff',
              borderRight: '1px solid #f0f0f0'
            }}
          >
            <Menu
              mode="inline"
              items={items}
              defaultSelectedKeys={['/']}
              onClick={(e) => navigate(e.key)}
              style={{ borderRight: 0 }}
            />
          </Sider>

          {/* Content：唯一允许滚动的地方 */}
          <Content
            style={{
              padding: 16,
              background: '#fff',
              overflow: 'auto'
            }}
          >
            <Outlet />
          </Content>
        </Layout>

        {/* Footer */}
        <Footer
          style={{
            textAlign: 'center',
            background: '#fff',
            borderTop: '1px solid #f0f0f0',
            padding: '8px 0'
          }}
        >
          v1.0.0
        </Footer>
      </Layout>
    </ConfigProvider>
  );
}

export default App;
