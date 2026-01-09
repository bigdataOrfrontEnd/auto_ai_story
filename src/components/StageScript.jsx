import React, { useState, useRef } from 'react';
import { Input, Button, Card, Typography, App } from 'antd';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { ExperimentOutlined, SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

// 模拟 AI 分析流（实际换成你的接口）
async function mockAnalyzeStream(onChar) {
  const text = `
读取故事文本...
分析故事主题...
识别主要角色...
提取关键场景...
构建分镜结构...
校验逻辑一致性...

剧本分析完成
`.trim();

  for (const ch of text) {
    await new Promise(r => setTimeout(r, 28));
    onChar(ch);
  }
}

const StageScript = () => {
  const { project, setProject } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const outputRef = useRef(null);

  const handleAnalyze = async () => {
    if (!project.scriptData.story.trim()) {
      return message.warning('请输入剧本故事内容');
    }

    setAnalyzing(true);
    setLoading(true);
    setAiText('');

    try {
      await mockAnalyzeStream((char) => {
        setAiText(prev => prev + char);
        requestAnimationFrame(() => {
          outputRef.current?.scrollTo({
            top: outputRef.current.scrollHeight
          });
        });
      });

      setProject({
        ...project,
        stage: 'assets',
        lastModified: Date.now()
      });

      setTimeout(() => {
        // navigate(`/project/${project.id}/assets`);
      }, 900);

    } catch {
      message.error('分析失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={4}>
        <ExperimentOutlined /> 创意工作台
      </Title>
      <Paragraph type="secondary">
        输入故事构想，AI 将进行理解与结构分析
      </Paragraph>

      {/* 核心布局 */}
      <div
        style={{
          display: 'flex',
          gap: 24,
          transition: 'all .4s ease'
        }}
      >
        {/* 左侧：输入区 */}
        <div
          style={{
            flex: analyzing ? '0 0 45%' : '1',
            transition: 'all .4s ease'
          }}
        >
          <Card bordered={false} style={{ background: '#0a0a0a' }}>
            <TextArea
              value={project.scriptData.story}
              onChange={(e) =>
                setProject({
                  ...project,
                  scriptData: {
                    ...project.scriptData,
                    story: e.target.value
                  }
                })
              }
              autoSize={{ minRows: 14 }}
              placeholder="在这里输入你的故事..."
              style={{
                fontSize: 16,
                background: '#141414'
              }}
            />

            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Button
                type="primary"
                size="large"
                icon={<SendOutlined />}
                loading={loading}
                onClick={handleAnalyze}
              >
                解析剧本
              </Button>
            </div>
          </Card>
        </div>

        {/* 右侧：AI 分析区 */}
        <div
          style={{
            flex: analyzing ? '1' : '0',
            opacity: analyzing ? 1 : 0,
            transform: analyzing
              ? 'translateX(0)'
              : 'translateX(40px)',
            transition: 'all .4s ease',
            pointerEvents: analyzing ? 'auto' : 'none'
          }}
        >
          <Card
            bordered={false}
            style={{
              height: '100%',
              background: '#0f0f0f'
            }}
          >
            <Paragraph type="secondary">
              AI 正在分析剧本结构
            </Paragraph>

            <pre
              ref={outputRef}
              style={{
                margin: 0,
                maxHeight: 320,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 1.6,
                color: '#9da3af',
                whiteSpace: 'pre-wrap'
              }}
            >
              {aiText}
              {loading && '▍'}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StageScript;
