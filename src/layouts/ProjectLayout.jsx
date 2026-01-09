import React, { useState, useEffect } from 'react';
import { Layout, Steps, theme, Typography, Button, Space, App } from 'antd';
import { Outlet, useNavigate, useLocation, useParams } from 'react-router-dom';
import { 
  FileTextOutlined, 
  PictureOutlined, 
  VideoCameraOutlined, 
  ExportOutlined,
  SaveOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title } = Typography;

const ProjectLayout = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = theme.useToken();
  const { message } = App.useApp();

  // 1. 初始化全局项目状态
  const [project, setProject] = useState({
    id: projectId,
    name: '未命名故事',
    stage: 'script', // script | assets | director | export
    scriptData: {
      story: '',
      characters: [],
      scenes: [],
      language: 'zh'
    },
    shots: [],
    lastModified: Date.now()
  });

  // 2. 自动保存逻辑
  useEffect(() => {
    const saveData = () => {
      localStorage.setItem(`project_${projectId}`, JSON.stringify(project));
      // 这里未来可以扩展为调用后端 API
    };
    saveData();
  }, [project, projectId]);

  // 3. 定义步骤条
  const steps = [
    { title: '剧本解析', icon: <FileTextOutlined />, path: 'script' },
    { title: '角色与资产', icon: <PictureOutlined />, path: 'assets' },
    { title: '导演工作台', icon: <VideoCameraOutlined />, path: 'director' },
    { title: '合成与导出', icon: <ExportOutlined />, path: 'export' },
  ];

  const currentStep = steps.findIndex(s => location.pathname.includes(s.path));

  return (
    <Layout style={{ minHeight: '100vh', background: '#000' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: '#0a0a0a',
        borderBottom: '1px solid #1f1f1f',
        padding: '0 24px',
        height: '64px'
      }}>
        <Space size="large">
          <Title level={4} style={{ margin: 0, color: token.colorPrimary }}>AI Story Director</Title>
          <Steps
            current={currentStep}
            onChange={(current) => navigate(`/project/${projectId}/${steps[current].path}`)}
            items={steps.map(s => ({ title: s.title, icon: s.icon }))}
            style={{ width: 600, marginLeft: 40 }}
            size="small"
          />
        </Space>
        
        <Space>
          <Button icon={<SaveOutlined />} onClick={() => message.success('项目已手动保存')}>保存</Button>
          <Button type="primary">预览全片</Button>
        </Space>
      </Header>

      <Content style={{ overflowY: 'auto', background: '#050505' }}>
        {/* 重要：通过 Context 将状态传递给子组件 */}
        <Outlet context={{ project, setProject }} />
      </Content>
    </Layout>
  );
};

export default ProjectLayout;