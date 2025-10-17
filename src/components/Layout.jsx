import React, { Suspense } from "react";
import { Link, useLocation } from "react-router-dom";

const Layout = ({ children, hideHeader = false }) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  const shouldHideHeader = isHomePage || hideHeader;

  return (
    <div className="min-h-screen">
      {/* Navigation Bar - hide on home page or when hideHeader is true */}
      {!shouldHideHeader && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-white font-semibold text-lg hover:text-purple-300 transition-colors flex items-center gap-2">
                Playground
              </Link>

              <div className="text-sm text-gray-300 font-bold">{location.pathname.replace("/", "").replace("-", " ").toUpperCase() || "HOME"}</div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main>
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
                <p className="text-white text-lg">Loading experience...</p>
              </div>
            </div>
          }
        >
          {children}
        </Suspense>
      </main>
    </div>
  );
};

export default Layout;
