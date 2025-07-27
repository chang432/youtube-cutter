// AlertContext.jsx
import React, { createContext, useContext, useState } from "react";

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({ message: "", visible: false });

  const showAlert = (message) => {
    setAlert({ message, visible: true });
  };

  const closeAlert = () => {
    setAlert({ ...alert, visible: false });
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alert.visible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[9999]">
          <div className="bg-white shadow-lg p-6 max-w-sm w-full flex flex-col items-center">
            <p className="mb-4 text-lg">{alert.message}</p>
            <button
              onClick={closeAlert}
              className="bg-black text-white w-20 h-10"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
};

export default AlertProvider;