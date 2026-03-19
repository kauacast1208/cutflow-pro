import { __broken__ } from './__broken_module__';
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import App from "./App.tsx";
import "./index.css";

// Supabase config debug
const sbUrl = import.meta.env.VITE_SUPABASE_URL ?? "(missing)";
const sbKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "(missing)";
console.info("[Boot] SUPABASE_URL:", sbUrl);
console.info("[Boot] PUBLISHABLE_KEY exists:", sbKey !== "(missing)", "| first12:", sbKey.substring(0, 12));

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
