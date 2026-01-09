import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { saveProjectToDB } from '@services/indexdb';
import { App } from 'antd';

const ProjectContext = createContext(undefined);

export const ProjectProvider = ({ children }) => {
  const [project, setProject] = useState(null);
  const [saveStatus, setSaveStatus] = useState('saved'); // saved | unsaved | saving
  const saveTimeoutRef = useRef(null);
  const { message } = App.useApp();

  // 自动保存逻辑：监听 project 对象的变化
  useEffect(() => {
    // 如果 project 为空（初始状态或加载中），不执行保存
    if (!project) return;

    setSaveStatus('unsaved');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        await saveProjectToDB(project);
        setSaveStatus('saved');
        console.log("项目已自动保存到 InfoDB");
      } catch (e) {
        console.error("自动保存失败:", e);
        setSaveStatus('error');
        message.error("自动保存失败，请检查本地存储空间");
      }
    }, 1500); // 1.5秒防抖，避免频繁写入硬盘

    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [project, message]);

  return (
    <ProjectContext.Provider value={{ project, setProject, saveStatus }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) throw new Error("useProject 必须在 ProjectProvider 内部使用");
  return context;
};