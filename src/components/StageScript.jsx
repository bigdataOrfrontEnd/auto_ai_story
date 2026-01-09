import React, { useState, useRef } from 'react';
import { Input, Button, Card, Typography, App } from 'antd';
import { useNavigate } from 'react-router-dom'; // 移除已失效的 useOutletContext
import { ExperimentOutlined, SendOutlined } from '@ant-design/icons';
// 1. 引入我们定义的全局 Hook
import { useProject } from '@context/ProjectContext'; 

const { TextArea } = Input;
const { Title, Paragraph } = Typography;

const StageScript = () => {
  // 2. 修改此处：使用 useProject 代替 useOutletContext
  const { project, setProject } = useProject(); 
  
  const [loading, setLoading] = useState(false);
  const [aiText, setAiText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const navigate = useNavigate();
  const { message } = App.useApp();
  const outputRef = useRef(null);

  // 校验 project 是否已由 Layout 加载完成
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
  
      // 延迟导航，确保用户看到流式输出的最后结果
      setTimeout(() => {
        navigate(`/project/${project.id}/assets`);
      }, 1500); 
  
    } catch (err) {
      console.error("Analysis Error:", err);
      message.error('剧本分析失败，请检查后端服务');
    } finally {
      setLoading(false);
    }
  };
  
  const analyzeWithStream = async (targetProject) => {
    // 1️⃣ POST 剧本给后端
    console.log("Submitting script for analysis...", targetProject);
    
    const res = await fetch('/api/script/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        story: targetProject.scriptData.story, 
        projectId: targetProject.id 
      })
    });
    
    if (!res.ok) throw new Error('提交剧本失败');

    // 2️⃣ SSE 监听分析过程
    return new Promise((resolve, reject) => {
      const es = new EventSource(`/api/script/analyze/stream?projectId=${targetProject.id}`);
      
      // 接收流式日志 (流水显示效果)
      es.addEventListener('log', (e) => {
        setAiText(prev => prev + `▶ ${e.data}\n`);
        requestAnimationFrame(() => {
          if (outputRef.current) {
            outputRef.current.scrollTop = outputRef.current.scrollHeight;
          }
        });
      });

      // 接收最终结果并存入全局 Context
      es.addEventListener('result', (e) => {
        const data = JSON.parse(e.data);
        setProject(prev => ({
          ...prev,
          stage: 'assets', // 更新阶段标记
          lastModified: Date.now(),
          scriptData: {
            ...prev.scriptData,
            characters: data.characters,
            scenes: data.scenes
          }
        }));
      });

      es.addEventListener('done', () => {
        es.close();
        resolve();
      });

      es.onerror = (err) => {
        es.close();
        reject(err);
      };
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
                color: '#33ff33', // 终端绿色，增强流水感
                whiteSpace: 'pre-wrap',
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