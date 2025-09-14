// src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import "antd/dist/reset.css";
import { AuthProvider } from './contexts/AuthProvider.tsx';
import { BrowserRouter } from 'react-router-dom';

// 1. Import สิ่งที่จำเป็นสำหรับภาษาไทย
import { ConfigProvider } from 'antd';
import thTH from 'antd/locale/th_TH';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

// 2. ตั้งค่าให้ dayjs รู้จักและใช้ภาษาไทยเป็นหลัก
dayjs.locale('th');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 3. ครอบ Provider ทั้งหมดด้วย ConfigProvider */}
    <ConfigProvider locale={thTH}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
);