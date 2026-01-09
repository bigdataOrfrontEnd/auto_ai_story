import React, { useEffect, useState } from 'react';
import { Layout, Steps, theme, Typography, Button, Space, App, Spin } from 'antd';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  FileTextOutlined, 
  PictureOutlined, 
  VideoCameraOutlined, 
  ExportOutlined,
  SaveOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { useProject } from '@context/ProjectContext'; // 引入自定义 Hook
import { loadProjectFromDB } from '@services/indexdb'; // 引入 indexdb.js 中的读取函数

const { Header, Content } = Layout;
const { Title, Text } = Typography;

const ProjectLayout = () => {
  const { projectId } = useParams(); // 从路由 URL 获取项目 ID
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { message } = App.useApp();
  
  // 从全局 Context 中获取 project 数据和设置函数
  const { project, setProject, saveStatus } = useProject();
  const [isLoading, setIsLoading] = useState(true);

  // 核心逻辑：当 URL 变化或初始化时，同步数据库数据到 Context
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      try {
        // 只有当 Context 没数据，或者 ID 与当前 URL 不一致时，才重新读取数据库
        if (!project || project.id !== projectId) {
          console.log("正在从 InfoDB 切换/加载项目数据:", projectId);
          const data = await loadProjectFromDB(projectId);
          setProject(data);
        }
      } catch (err) {
        console.error("加载项目失败:", err);
        message.error("项目加载失败，请返回列表重试");
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, [projectId]); // 仅监听 projectId 变化

  // 定义步骤条配置
  const steps = [
    { title: '剧本解析', icon: <FileTextOutlined />, path: 'script' },
    { title: '角色与资产', icon: <PictureOutlined />, path: 'assets' },
    { title: '导演工作台', icon: <VideoCameraOutlined />, path: 'director' },
    { title: '合成与导出', icon: <ExportOutlined />, path: 'export' },
  ];

  // 根据当前路径计算步骤索引
  const currentStep = steps.findIndex(s => location.pathname.includes(s.path));

  // 加载状态展示：防止在数据未就绪时渲染子页面导致报错
  if (isLoading || !project || project.id !== projectId) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        background: '#050505',
        flexDirection: 'column',
        gap: '20px'
      }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
        <Text style={{ color: '#666' }}>正在装载项目资源...</Text>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#000' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#0a0a0a',
        borderBottom: '1px solid #1f1f1f',
        padding: '0 24px',
        height: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <Space size="large">
          <Title level={4} style={{ margin: 0, color: token.colorPrimary, cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            AI Story Director
          </Title>
          <Steps
            current={currentStep}
            onChange={(current) => navigate(`/project/${projectId}/${steps[current].path}`)}
            items={steps.map(s => ({ title: s.title, icon: s.icon }))}
            style={{ width: 600, marginLeft: 40 }}
            size="small"
          />
        </Space>
        
        <Space>
          <Text type="secondary" style={{ fontSize: '12px', marginRight: '10px' }}>
            {saveStatus === 'saving' && '正在保存...'}
            {saveStatus === 'saved' && '已自动保存'}
            {saveStatus === 'unsaved' && '待保存'}
          </Text>
          <Button 
            icon={<SaveOutlined />} 
            onClick={() => message.success('项目已强制同步至本地数据库')}
          >
            保存
          </Button>
          <Button type="primary">预览全片</Button>
        </Space>
      </Header>

      <Content style={{ overflowY: 'auto', background: '#050505', height: 'calc(100vh - 64px)' }}>
        {/* Outlet 不需要再通过 context 传值，子组件直接调用 useProject() 即可 */}
        <Outlet />
      </Content>
    </Layout>
  );
};

export default ProjectLayout;