import React, { useState } from 'react';
import { Input, Button, Card, Space, Typography, message, App } from 'antd';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { SendOutlined, ExperimentOutlined } from '@ant-design/icons';
import { parseScriptToData } from '../services/geminiService';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const StageScript = () => {
  const { project, setProject } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { message: antdMsg } = App.useApp();

  const handleAnalyze = async () => {
    if (!project.scriptData.story.trim()) {
      return antdMsg.warning('请输入剧本故事内容');
    }

    setLoading(true);
    try {
      // 1. 调用 AI 接口进行剧本解析
      const scriptData = await parseScriptToData(project.scriptData.story, project.scriptData.language);
      
      // 2. 更新项目数据并切换到下一阶段
      setProject({
        ...project,
        scriptData: { ...project.scriptData, ...scriptData },
        stage: 'assets', // 逻辑自动进入下一阶段
        lastModified: Date.now()
      });

      antdMsg.success('剧本分析完成，正在进入资产生成阶段...');
      navigate(`/project/${project.id}/assets`);
    } catch (error) {
      antdMsg.error('解析失败，请检查网络或 API Key');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: 1000, margin: '0 auto' }}>
      <Card bordered={false} style={{ background: '#0a0a0a' }}>
        <Title level={4}>
          <ExperimentOutlined /> 创意与剧本解析
        </Title>
        <Paragraph type="secondary">
          粘贴你的故事构想或剧本片段，AI 将自动提取其中的角色、场景并生成分镜脚本。
        </Paragraph>
        
        <TextArea
          value={project.scriptData.story}
          onChange={(e) => setProject({
            ...project, 
            scriptData: { ...project.scriptData, story: e.target.value }
          })}
          placeholder="在这里输入你的故事..."
          autoSize={{ minRows: 12, maxRows: 20 }}
          style={{ marginBottom: 24, fontSize: '16px', background: '#141414' }}
        />

        <div style={{ textAlign: 'right' }}>
          <Button 
            type="primary" 
            size="large" 
            icon={<SendOutlined />} 
            loading={loading}
            onClick={handleAnalyze}
            style={{ width: 180 }}
          >
            解析剧本
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default StageScript;