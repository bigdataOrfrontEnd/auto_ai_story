import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '@layouts/RootLayout';
import ProjectLayout from '@layouts/ProjectLayout';
import Dashboard from '@pages/Dashboard';
import StageScript from '@components/StageScript';
// import StageAssets from '@components/StageAssets';
// import StageDirector from '@components/StageDirector';
// import StageExport from '@components/StageExport';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />, // 第一层：鉴权守卫
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />, // 全屏显示：项目大厅
      },
      {
        path: 'project/:projectId',
        element: <ProjectLayout />, // 第二层：带 Sider 的工作台布局
        children: [
          { path: 'script', element: <StageScript /> },
          // { path: 'assets', element: <StageAssets /> },
          // { path: 'director', element: <StageDirector /> },
          // { path: 'export', element: <StageExport /> },
        ],
      },
    ],
  },
]);