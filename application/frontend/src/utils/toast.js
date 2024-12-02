import React, { createContext, useContext, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

const ToastContext = createContext();

export const useToast = () => {
  return useContext(ToastContext);
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, variant) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, variant }]);

    setTimeout(() => {
      handleDismiss(id);
    }, 3000);
  };

  const handleDismiss = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <ToastContainer position="bottom-center" className="p-3">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            onClose={() => handleDismiss(toast.id)}
            delay={1000}
            animation
            className={`bg-${toast.variant === "error" ? "danger" : "success"} text-white`} // Apply variant class
          >
            <Toast.Header>
              <strong className="me-auto">{toast.variant === "error" ? "Error" : "Success"}</strong>
            </Toast.Header>
            <Toast.Body className="me-auto">{toast.message}</Toast.Body>
          </Toast>
        ))}
      </ToastContainer>
    </ToastContext.Provider>
  );
};