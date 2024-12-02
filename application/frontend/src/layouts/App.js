import React, {useState} from 'react';
import Table from '../main';
import {Login, Register} from '../components/forms/loginforms';
import {ToastProvider} from '../utils/toast';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false) 
  const [isRegistering, setIsRegistering] = useState(false);
  
  const handleLogout = () => {
    setIsLoggedIn(false); 
    setIsRegistering(false);
    localStorage.setItem('token', '');
    localStorage.setItem('username', '')    
  };

  return (
    <ToastProvider>
      <div className="page-container d-flex flex-column vh-100">
        <div className="container-fluid p-4 flex-grow-1 d-flex flex-column justify-content-center">
          {isLoggedIn ? (
            <Table onLogout={handleLogout} />
          ) : isRegistering ? ( // Check if registering
            <Register onLogin={() => setIsLoggedIn(true)} setIsRegistering={setIsRegistering} />
          ) : (
            <Login onLogin={() => setIsLoggedIn(true)} setIsRegistering={setIsRegistering} />
          )}
        </div>
      </div>
    </ToastProvider>
  );
}

export default App;