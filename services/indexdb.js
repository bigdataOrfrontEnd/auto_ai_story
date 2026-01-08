const DB_NAME = 'CineGenDB';
const DB_VERSION = 1;
const STORE_NAME = 'projects';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

export const saveProjectToDB = async (project) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);

    const p = { ...project, lastModified: Date.now() };
    const request = store.put(p);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const loadProjectFromDB = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        reject(new Error('Project not found'));
      }
    };

    request.onerror = () => reject(request.error);
  });
};

export const getAllProjectsMetadata = async () => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const projects = request.result;
      // 按 lastModified 倒序
      projects.sort((a, b) => b.lastModified - a.lastModified);
      resolve(projects);
    };

    request.onerror = () => reject(request.error);
  });
};

export const deleteProjectFromDB = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// 新建项目
// @services/indexdb
export const createNewProjectState = async(formValues) => {
  const newProject = {
    id: crypto.randomUUID(), // 生成唯一ID
    title: formValues.title || '未命名项目',
    ratio: formValues.ratio,
    description: formValues.description,
    stage: 'script', // 数据流初始节点：剧本阶段
    lastModified: Date.now(),
    createdAt: Date.now(),
    // 预留给 LTX-2 的工作流配置空间
    config: {
      resolution: formValues.ratio === '16:9' ? [1280, 720] : [720, 1280],
      fps: 25
    }
  };

  // 假设这里执行了真正的数据库写入逻辑
  await saveProjectToDB(newProject);
  
  return newProject;
};
