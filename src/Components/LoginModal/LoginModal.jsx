import React, { useState } from 'react';
import './LoginModal.css';

const LoginModal = ({ isOpen, onLogin }) => {
  const [user, setUser] = useState(''); // Cambiado de email a user
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onLogin(user, password); // Llama a la función handleLogin con los parámetros
  };

  if (!isOpen) return null;

  return (
    <div className="login-modal-container">
      <div className="modal-content">
        <h2>Log in</h2>
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Username" 
            value={user} // Cambiado de email a user
            onChange={(e) => setUser(e.target.value)} // Cambiado de email a user
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
          <button type="submit">Log in</button>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
