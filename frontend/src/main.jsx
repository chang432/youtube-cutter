import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import { AlertProvider } from "./components/AlertProvider.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
        <AlertProvider>
            <App />
        </AlertProvider>
    </React.StrictMode>
);
