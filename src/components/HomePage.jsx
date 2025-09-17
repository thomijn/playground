import React from 'react';
import { Link } from 'react-router-dom';
import { playgrounds, getCategories, getPlaygroundsByCategory } from '../router/playgroundRoutes';

const HomePage = () => {
  const categories = getCategories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Creative Playground
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore interactive experiments, 3D visualizations, and creative coding projects
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">{playgrounds.length}</div>
            <div className="text-gray-300">Total Experiments</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">{categories.length}</div>
            <div className="text-gray-300">Categories</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="text-3xl font-bold text-white mb-2">∞</div>
            <div className="text-gray-300">Possibilities</div>
          </div>
        </div>

        {/* Playgrounds by Category */}
        {categories.map(category => (
          <div key={category} className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8 flex items-center">
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {category}
              </span>
              <div className="ml-4 flex-1 h-px bg-gradient-to-r from-purple-400/50 to-transparent"></div>
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getPlaygroundsByCategory(category).map(playground => (
                <Link
                  key={playground.id}
                  to={playground.path}
                  className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:bg-white/10"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-semibold text-white group-hover:text-purple-300 transition-colors">
                      {playground.name}
                    </h3>
                    <div className="text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 leading-relaxed">
                    {playground.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="inline-block bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full">
                      {playground.category}
                    </span>
                    <span className="text-xs text-gray-500 group-hover:text-purple-400 transition-colors">
                      Click to explore →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Quick Access */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Access</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {playgrounds.slice(0, 6).map(playground => (
              <Link
                key={playground.id}
                to={playground.path}
                className="inline-block bg-gradient-to-r from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 text-white px-4 py-2 rounded-full text-sm transition-all duration-300 hover:scale-105 border border-white/10 hover:border-white/20"
              >
                {playground.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-gray-400 text-sm">
          <p>Built with React, Three.js, and creative passion ✨</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
