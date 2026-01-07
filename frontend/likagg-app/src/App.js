import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar from './components/navBar';
import HomePage from './pages/homePage';
import Login from './pages/login';
import Register from './pages/register';
import CreatePost from './pages/createPost';
import PostDetailPage from './pages/postDetailPage';
import CreateCommunity from './pages/createCommunity';
import UserProfile from './pages/userProfile';
import UserSettings from './pages/userSetting';

// Import các trang mới
import AboutPage from './pages/aboutPage';
import InfoPage from './pages/infoPage'; // Trang dùng chung

import './App.css'; // Giữ import CSS cũ nếu cần

function App() {
  return (
    <>
      <Navbar />
      <div style={{ width: '100%' }}>
        <Routes>
          {/* Các Route chính */}
          <Route path="/" element={<HomePage />} />
          <Route path="/popular" element={<HomePage />} />
          <Route path="/r/:communityName" element={<HomePage />} />
          <Route path="/create-community" element={<CreateCommunity />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/submit" element={<CreatePost />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="/u/:username" element={<UserProfile />} />
          <Route path="/settings" element={<UserSettings />} />

          {/* --- CÁC ROUTE RESOURCE MỚI --- */}
          <Route path="/about" element={<AboutPage />} />
          
          {/* Sử dụng InfoPage tái sử dụng cho các trang text */}
          <Route path="/help" element={<InfoPage type="help" />} />
          <Route path="/terms" element={<InfoPage type="terms" />} />
          <Route path="/privacy" element={<InfoPage type="privacy" />} />
          <Route path="/content-policy" element={<InfoPage type="terms" />} /> {/* Dùng chung Terms tạm thời */}
          <Route path="/advertise" element={<InfoPage type="advertise" />} />
          
          {/* Các trang chưa làm nội dung, dùng default của InfoPage */}
          <Route path="/blog" element={<InfoPage type="default" />} />
          <Route path="/careers" element={<InfoPage type="default" />} />
          <Route path="/press" element={<InfoPage type="default" />} />

        </Routes>
      </div>
    </>
  );
}

export default App;