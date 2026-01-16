import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Card, Typography, App } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ExperimentOutlined, SendOutlined } from '@ant-design/icons';
import { useProject } from '@context/ProjectContext';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const StageScript = () => {
  const { project, setProject } = useProject();
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const outputRef = useRef(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [aiText]);

  if (!project) return null;

  const handleAnalyze = async () => {
    if (!project.scriptData.story.trim()) {
      return message.warning('请输入剧本故事内容');
    }

    setAnalyzing(true);
    setLoading(true);
    setAiText('');

    try {
      await analyzeWithStream(project);
      message.success('剧本分析完成！');
      
      setTimeout(() => {
        navigate(`/project/${project.id}/director`);
      }, 1500);

    } catch (err) {
      console.error("Analysis Error:", err);
      message.error(err.message || '剧本分析失败，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };

  const analyzeWithStream = (targetProject) => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/script/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            story: targetProject.scriptData.story,
            projectId: targetProject.id,
          }),
        });

        if (!response.ok) {
          throw new Error(`请求失败，状态码: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const messages = buffer.split('\n\n');
          buffer = messages.pop(); // Keep incomplete message in buffer

          for (const msg of messages) {
            if (!msg.startsWith('data:')) continue;

            const jsonStr = msg.substring(5).trim();
            const parsed = JSON.parse(jsonStr);
            const { event, data } = parsed;
            
            switch (event) {
              case 'stage':
                setAiText(prev => prev + `\n[STAGE] ${data}\n`);
                break;
              case 'log':
                setAiText(prev => prev + `[LOG] ${data}\n`);
                break;
              case 'token':
                setAiText(prev => prev + data);
                break;
              case 'result':
                setProject(prev => ({
                  ...prev,
                  stage: 'director', // Move to next stage
                  lastModified: Date.now(),
                  scriptData: {
                    ...prev.scriptData,
                    rawText: data.rawText,
                    characters: data.characters,
                    scenes: data.scenes,
                    shots: data.shots,
                  },
                }));
                break;
              case 'error':
                throw new Error(`后端分析出错: ${data}`);
            }
          }
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  };

  return (
    <div style={{ padding: 40, maxWidth: 1200, margin: '0 auto' }}>
      <Title level={4}>
        <ExperimentOutlined /> 创意工作台
      </Title>
      <Paragraph type="secondary">
        输入故事构想，AI 将自动进行角色提取与分镜拆解
      </Paragraph>

      <div style={{ display: 'flex', gap: 24, transition: 'all .4s ease' }}>
        {/* 左侧：输入区 */}
        <div style={{ flex: analyzing ? '0 0 45%' : '1', transition: 'all .4s ease' }}>
          <Card variant={false} style={{ background: '#0a0a0a', border: '1px solid #1f1f1f' }}>
            <TextArea
              value={project?.scriptData?.story || ''}
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
              placeholder="在这里输入你的故事，例如：在一个遥远的星球上，有一位孤独的机械师..."
              style={{ fontSize: 16, background: '#141414', color: '#fff', border: '1px solid #333' }}
            />

            <div style={{ textAlign: 'right', marginTop: 16 }}>
              <Button
                type="primary"
                size="large"
                icon={<SendOutlined />}
                loading={loading}
                onClick={handleAnalyze}
              >
                开启智能解析
              </Button>
            </div>
          </Card>
        </div>

        {/* 右侧：AI 分析流水显示区 */}
        <div
          style={{
            flex: analyzing ? '1' : '0',
            opacity: analyzing ? 1 : 0,
            transform: analyzing ? 'translateX(0)' : 'translateX(40px)',
            transition: 'all .4s ease',
            pointerEvents: analyzing ? 'auto' : 'none',
            minWidth: analyzing ? 300 : 0
          }}
        >
          <Card variant={false} style={{ height: '100%', background: '#0f0f0f', border: '1px solid #1f1f1f' }}>
            <Paragraph type="secondary" style={{ color: '#00ff00', fontFamily: 'monospace' }}>
              [AI ENGINE ONLINE] 分析中...
            </Paragraph>

            <pre
              ref={outputRef}
              style={{
                margin: 0,
                maxHeight: 400,
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 1.6,
                color: '#33ff33',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
                background: '#000',
                padding: '12px',
                borderRadius: '4px'
              }}
            >
              {aiText}
              {loading && <span className="streaming-cursor">█</span>}
            </pre>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StageScript;