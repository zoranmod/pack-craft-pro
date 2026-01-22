import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Polyfill for libraries that expect Node globals in the browser (e.g. @react-pdf/renderer)
import { Buffer } from "buffer";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).Buffer = Buffer;

createRoot(document.getElementById("root")!).render(<App />);
