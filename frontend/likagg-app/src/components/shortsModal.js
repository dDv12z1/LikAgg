import React from 'react';
import SingleShortPlayer from './singleShortPlayer';

const ShortsModal = ({ shortData, onClose }) => {
    if (!shortData) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', // Nền tối đậm kiểu rạp phim
            zIndex: 10000,
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            backdropFilter: 'blur(5px)'
        }} onClick={onClose}>
            
            {/* Nút đóng */}
            <button onClick={onClose} style={{
                position: 'absolute', top: '20px', right: '30px',
                background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', 
                borderRadius:'50%', width:'48px', height:'48px', fontSize:'24px', 
                cursor:'pointer', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
            }} onMouseOver={e => e.target.style.background='rgba(255,255,255,0.2)'}
               onMouseOut={e => e.target.style.background='rgba(255,255,255,0.1)'}
            >✕</button>

            {/* Container Video */}
            <div style={{
                height: '85vh', // Chiều cao cố định tương đối
                aspectRatio: '9/16', // Giữ tỷ lệ điện thoại
                maxWidth: '500px', // Không quá to
                width: '100%',
                backgroundColor: '#000', 
                borderRadius: '16px', 
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 0 30px rgba(0,0,0,0.5)',
                display: 'flex',
            }} onClick={e => e.stopPropagation()}>
                <SingleShortPlayer shortData={shortData} isActive={true} autoPlay={true} isModalMode={true} />
            </div>
        </div>
    );
};

export default ShortsModal;