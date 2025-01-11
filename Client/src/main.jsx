import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { SocketProvider } from "./context/SocketContext";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")).render(
  <SocketProvider>
    <App />
    <Toaster closeButton />
  </SocketProvider>
);