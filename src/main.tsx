
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "@/app/App";
import { LanguageProvider } from "@/lib/i18n";

import "./index.css";

createRoot(document.getElementById("app") as HTMLElement).render(
  <React.StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </React.StrictMode>
);
