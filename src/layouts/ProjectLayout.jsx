import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
// import { saveProjectToDB } from '../services/storageService';
import { App } from 'antd';


const ProjectContext = createContext(undefined);

export const ProjectProvider= ({ children }) => {
  const [project, setProject] = useState<ProjectState | null>(null);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved');
  const saveTimeoutRef = useRef(null);
  const { message } = App.useApp();

  // 自动保存逻辑
  useEffect(() => {
    if (!project) return;

    setSaveStatus('unsaved');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(async () => {
      setSaveStatus('saving');
      try {
        // await saveProjectToDB(project);
        setSaveStatus('saved');
      } catch (e) {
        console.error("Auto-save failed", e);
        message.error("自动保存失败，请检查网络或本地存储");
      }
    }, 1500); // 1.5秒防抖

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
  if (!context) throw new Error("useProject must be used within ProjectProvider");
  return context;
};