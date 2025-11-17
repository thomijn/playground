import React, { useEffect, useRef, useState } from "react";
import { useMakerStore } from "./makerStore";
import { craftTypes, counties } from "./makerData";
import gsap from "gsap";

export const FilterBar = () => {
  const {
    searchQuery,
    selectedCraftType,
    selectedCounty,
    setSearchQuery,
    setSelectedCraftType,
    setSelectedCounty,
  } = useMakerStore();

  const barRef = useRef(null);
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [showTypologyMenu, setShowTypologyMenu] = useState(false);
  const [showGridView, setShowGridView] = useState(false);

  // Animate bar in on mount
  useEffect(() => {
    if (barRef.current) {
      gsap.fromTo(
        barRef.current,
        {
          y: 100,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          delay: 3,
          ease: "back.out(1.7)",
        }
      );
    }
  }, []);

  return (
    <div
      ref={barRef}
      className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 opacity-0"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="bg-white rounded-md shadow-lg border border-gray-200 px-3 py-2 flex items-center gap-2">
        {/* Grid Toggle Button */}
        <button
          onClick={() => setShowGridView(!showGridView)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Grid view"
        >
          <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="5" cy="5" r="1.5" />
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="19" cy="5" r="1.5" />
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="19" cy="12" r="1.5" />
            <circle cx="5" cy="19" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
            <circle cx="19" cy="19" r="1.5" />
          </svg>
        </button>

        {/* Divider */}
        <div className="w-px h-6 bg-gray-200" />

        {/* Search Input */}
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="What are you looking for?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-4 pr-10 py-1.5 w-64 h-[34px] rounded-md border border-gray-300 focus:border-gray-400 focus:outline-none bg-white text-gray-700 placeholder-gray-400 text-sm transition-colors"
          />
          <button className="absolute right-2 p-1 hover:bg-gray-100 rounded-full transition-colors">
            <svg
              className="w-4 h-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

