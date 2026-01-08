import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button, Typography, Tag, Space, Popconfirm, message } from 'antd';
import { PlusOutlined, DeleteOutlined, RightOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getAllProjectsMetadata, createNewProjectState, deleteProjectFromDB } from '@services/indexdb';

const { Title, Text } = Typography;

const Dashboard = () => {
  const [projects, setProjects] = useState([]);
  const navigate = useNavigate();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const loadData = async () => {
    const list = await getAllProjectsMetadata();
    setProjects(list);
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = () => {
    setIsModalVisible(false);
    const newProj = createNewProjectState();
    // 初始项目默认进入剧本阶段
    navigate(`/project/${newProj.id}/script`);
  };

  const handleOpen = (proj) => {
    // 关键逻辑：根据后端存储的项目 stage 状态跳转到对应路由
    navigate(`/project/${proj.id}/${proj.stage || 'script'}`);
  };

  return (
    <div style={{ padding: '40px 60px', background: '#050505', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 40 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>我的创作序列</Title>
          <Text type="secondary">Digital AI Director - 数字化导演工作台</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} 
        onClick={handleCreate}
        >
          新建漫剧项目
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {projects.map(proj => (
          <Col xs={24} sm={12} md={8} xl={6} key={proj.id}>
            <Card
              hoverable
              className="project-card"
              style={{ background: '#0a0a0a', borderColor: '#1a1a1a' }}
              actions={[
                <Popconfirm title="确定删除？" 
                onConfirm={() => deleteProjectFromDB(proj.id).then(loadData)}
                >
                  <DeleteOutlined key="delete" style={{ color: '#ff4d4f' }} />
                </Popconfirm>,
                <div 
                onClick={() => handleOpen(proj)}
                >进入 <RightOutlined /></div>
              ]}
            >
              <Tag color="indigo" style={{ marginBottom: 12 }}>{proj.stage.toUpperCase()}</Tag>
              <Card.Meta
                title={<span style={{ color: '#fff' }}>{proj.title}</span>} 
                description={<Text type="secondary" style={{ fontSize: 12 }}><ClockCircleOutlined /> {new Date(proj.lastModified).toLocaleDateString()}</Text>}
              />
            </Card>
          </Col>
        ))}
      </Row>
      {/* 使用提取的 Modal 组件 */}
      <CreateProjectModal 
        visible={isModalVisible} 
        onCancel={() => setIsModalVisible(false)} 
        onCreate={handleCreateConfirm} 
      />
    </div>
  );
};

export default Dashboard;