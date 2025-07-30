import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Polyfill Buffer for browser environment
import { Buffer } from 'buffer';
(globalThis as any).Buffer = Buffer;

createRoot(document.getElementById("root")!).render(<App />);
