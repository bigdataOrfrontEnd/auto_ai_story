import React from 'react';
import { Row, Col, Card, Statistic, Progress, Button, List, Typography } from 'antd';
import { useOutletContext } from 'react-router-dom';
import { CloudDownloadOutlined, CheckCircleOutlined, VideoCameraOutlined } from '@ant-design/icons';

const StageExport = () => {
  const { project } = useOutletContext();
  const completedCount = project.shots.filter((s) => !!s.videoUrl).length;
  const progress = Math.round((completedCount / project.shots.length) * 100);

  return (
    <div style={{ padding: '40px' }}>
      <Row gutter={24}>
        <Col span={8}>
          <Card style={{ background: '#0a0a0a', textAlign: 'center' }}>
            <Progress type="circle" percent={progress} strokeColor="#6366f1" />
            <div style={{ marginTop: 20 }}>
              <Typography.Title level={3}>渲染进度</Typography.Title>
              <Typography.Text type="secondary">共 {project.shots.length} 个分镜，已完成 {completedCount} 个</Typography.Text>
            </div>
          </Card>
        </Col>
        
        <Col span={16}>
          <Card title="渲染统计" style={{ background: '#0a0a0a' }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="预计总时长" value={project.shots.length * 3} suffix="秒" />
              </Col>
              <Col span={12}>
                <Statistic title="文件大小预估" value={project.shots.length * 5} suffix="MB" />
              </Col>
            </Row>
            <div style={{ marginTop: 40 }}>
              <Button type="primary" size="large" block icon={<CloudDownloadOutlined />} disabled={progress < 100}>
                导出最终成片 (MP4)
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};