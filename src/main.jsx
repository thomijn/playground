import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

import HomePage from "./components/HomePage.jsx";
import Layout from "./components/Layout.jsx";
import { playgrounds } from "./router/playgroundRoutes.js";
import GrabbingMachine from "./playgrounds/grabbing-machine/index.jsx";

// Wrapper component to handle individual route layouts
const RouteWrapper = ({ children, hideHeader = false }) => (
  <Layout hideHeader={hideHeader}>
    {children}
  </Layout>
);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    {/* <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <RouteWrapper>
            <HomePage />
          </RouteWrapper>
        } />
        
        {playgrounds.map(playground => (
          <Route 
            key={playground.id}
            path={playground.path} 
            element={
              <RouteWrapper hideHeader={playground.hideHeader}>
                <playground.component />
              </RouteWrapper>
            } 
          />
        ))}
        
        <Route path="*" element={
          <RouteWrapper>
            <HomePage />
          </RouteWrapper>
        } />
      </Routes>
    </BrowserRouter> */}
    <GrabbingMachine />
  </StrictMode>
);
