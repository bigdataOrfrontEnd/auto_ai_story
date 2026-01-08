import React, { useState } from 'react';
import { List, Card, Input, Button, Image, Empty, Space, Typography, App } from 'antd';
import { useOutletContext } from 'react-router-dom';
import { SparklesOutlined, CameraOutlined, DeleteOutlined, LoadingOutlined } from '@ant-design/icons';
import { generateImage } from '../services/geminiService';

const StageAssets = () => {
  const { project, setProject } = useOutletContext();
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const { message } = App.useApp();

  // 合并角色和场景为资产列表
  const assets = [
    ...(project.scriptData.characters || []).map((c) => ({ ...c, _type })),
    ...(project.scriptData.scenes || []).map((s) => ({ ...s, _type }))
  ];

  const handleGenImage = async (id, prompt) => {
    setGeneratingId(id);
    try {
      const url = await generateImage(prompt);
      // 更新对应的角色或场景图片
      const newData = { ...project.scriptData };
      const list = prompt.includes('character') ? newData.characters : newData.scenes;
      const item = list.find((i) => i.id === id);
      if (item) item.imageUrl = url;
      
      setProject({ ...project, scriptData: newData, lastModified: Date.now() });
      message.success('图像生成成功');
    } catch (e) {
      message.error('图像生成失败');
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={4}>角色与场景资产</Typography.Title>
        <Button type="primary" icon={<SparklesOutlined />}>批量生成所有资产</Button>
      </div>

      <List
        dataSource={assets}
        renderItem={(item) => (
          <Card style={{ marginBottom: 16, background: '#0a0a0a' }} className="asset-card">
            <div style={{ display: 'flex', gap: 24 }}>
              {/* 左侧：描述 */}
              <div style={{ flex: 1 }}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>视觉描述 (AI Visual Prompt)</Typography.Text>
                <Input.TextArea
                  rows={5}
                  value={item.visualPrompt}
                  style={{ marginTop: 8, background: '#141414' }}
                  onChange={(e) => {
                    // 实现更新逻辑...
                  }}
                />
              </div>

              {/* 中间：占位符/图片 */}
              <div style={{ 
                width: 200, height: 200, background: '#141414', 
                borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid #333', overflow: 'hidden'
              }}>
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} />
                ) : (
                  generatingId === item.id ? <LoadingOutlined style={{ fontSize: 24 }} /> : <Empty description="暂无预览" />
                )}
              </div>

              {/* 右侧：操作 */}
              <Space direction="vertical" style={{ justifyContent: 'center' }}>
                <Button 
                  icon={<CameraOutlined />} 
                  loading={generatingId === item.id}
                  onClick={() => handleGenImage(item.id, item.visualPrompt)}
                >
                  生成图片
                </Button>
                <Button danger icon={<DeleteOutlined />}>删除资产</Button>
              </Space>
            </div>
          </Card>
        )}
      />
    </div>
  );
};

export default StageAssets;