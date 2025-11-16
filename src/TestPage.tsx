import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#333' }}>🎉 HabitForge Test Page</h1>
      <p>If you can see this, the React app is working!</p>
      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h2>✅ App Status: WORKING</h2>
        <ul>
          <li>✅ React is rendering</li>
          <li>✅ TypeScript is compiling</li>
          <li>✅ Vite dev server is running</li>
        </ul>
      </div>
      <button 
        onClick={() => alert('Button clicked! 🎯')}
        style={{ 
          marginTop: '20px', 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Test Button
      </button>
    </div>
  );
};

export default TestPage;