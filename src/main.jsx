import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import HomePage from "./components/HomePage.jsx";
import Layout from "./components/Layout.jsx";
import { playgrounds } from "./router/playgroundRoutes.js";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Home route */}
          <Route path="/" element={<HomePage />} />
          
          {/* Dynamic playground routes */}
          {playgrounds.map(playground => (
            <Route 
              key={playground.id}
              path={playground.path} 
              element={<playground.component />} 
            />
          ))}
          
          {/* Catch-all route - redirect to home */}
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </StrictMode>
);
