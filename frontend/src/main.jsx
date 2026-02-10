import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { UserProvider } from "./context/UserContext";
import { TimelineProvider } from "./context/TimelineContext";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <UserProvider>
      <TimelineProvider>
  <App />
</TimelineProvider>

    </UserProvider>
  </StrictMode>
);
