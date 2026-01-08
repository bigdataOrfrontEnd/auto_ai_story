import React, { useState } from 'react';
import { List, Card, Button, Input, Progress, Badge, Empty, Space } from 'antd';
import { useOutletContext } from 'react-router-dom';
import { VideoCameraAddOutlined, PlayCircleOutlined, PictureOutlined } from '@ant-design/icons';

const StageDirector = () => {
  const { project, setProject } = useOutletContext();

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between' }}>
        <Space size="middle">
           <Typography.Title level={4} style={{ margin: 0 }}>导演工作台</Typography.Title>
           <Badge count={project.shots.length} overflowCount={999} color="#6366f1" />
        </Space>
        <Button type="primary" size="large" icon={<VideoCameraAddOutlined />}>批量渲染全片</Button>
      </div>

      <List
        grid={{ gutter: 16, column: 2 }} // 左右两列排布分镜
        dataSource={project.shots}
        renderItem={(shot, index) => (
          <List.Item>
            <Card 
              styles={{ body: { padding: 0 } }} 
              style={{ background: '#0a0a0a', overflow: 'hidden' }}
              title={`Shot ${index + 1}: ${shot.type}`}
            >
              {/* 视频容器 */}
              <div style={{ height: 240, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {shot.videoUrl ? (
                  <video src={shot.videoUrl} controls style={{ width: '100%', height: '100%' }} />
                ) : (
                  <div style={{ textAlign: 'center' }}>
                    <PlayCircleOutlined style={{ fontSize: 48, color: '#333' }} />
                    <div style={{ marginTop: 8, color: '#444' }}>分镜未渲染</div>
                  </div>
                )}
              </div>

              {/* 描述与设置 */}
              <div style={{ padding: 16 }}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>分镜描述</Typography.Text>
                <Input.TextArea 
                  value={shot.description} 
                  rows={3} 
                  style={{ marginTop: 8, background: '#141414' }} 
                />
                
                <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                  <Space>
                    <Button size="small" icon={<PictureOutlined />}>关键帧</Button>
                    <Button size="small">时长: {shot.duration}s</Button>
                  </Space>
                  <Button type="primary" size="small">渲染当前分镜</Button>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};