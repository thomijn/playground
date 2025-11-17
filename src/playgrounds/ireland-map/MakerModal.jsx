import React, { useEffect, useRef } from "react";
import { useMakerStore } from "./makerStore";
import gsap from "gsap";

export const MakerModal = () => {
  const selectedMaker = useMakerStore((state) => state.selectedMaker);
  const setSelectedMaker = useMakerStore((state) => state.setSelectedMaker);
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (selectedMaker && modalRef.current && backdropRef.current && contentRef.current) {
      // Animate modal in
      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );
      gsap.fromTo(
        contentRef.current,
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)", delay: 0.1 }
      );
    }
  }, [selectedMaker]);

  const handleClose = () => {
    if (backdropRef.current && contentRef.current) {
      gsap.to(contentRef.current, {
        scale: 0.8,
        opacity: 0,
        y: 50,
        duration: 0.3,
        ease: "power2.in",
      });
      gsap.to(backdropRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setSelectedMaker(null),
      });
    }
  };

  if (!selectedMaker) return null;

  return (
    <div ref={modalRef} className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={contentRef}
        className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-[#065765] text-white hover:bg-[#065765]/90 transition-colors flex items-center justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#BA902E] to-[#065765] text-white p-8 rounded-t-2xl">
          <div className="flex items-start gap-6">
            <img
              src={selectedMaker.avatar}
              alt={selectedMaker.name}
              className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
            />
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: "'Old Standard TT', serif" }}>
                {selectedMaker.name}
              </h2>
              <div className="flex gap-4 text-sm mb-3">
                <span className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                  {selectedMaker.craftType}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-full backdrop-blur-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {selectedMaker.county}
                </span>
              </div>
              <p className="text-white/90 leading-relaxed">{selectedMaker.bio}</p>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="p-8">
          <h3
            className="text-2xl font-bold text-[#065765] mb-6"
            style={{ fontFamily: "'Old Standard TT', serif" }}
          >
            Featured Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedMaker.products.map((product) => (
              <div
                key={product.id}
                className="border-2 border-[#BA902E]/20 rounded-xl overflow-hidden hover:border-[#BA902E] transition-colors group"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-bold text-[#065765] mb-2">{product.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-[#BA902E]">€{product.price}</span>
                    <button className="px-4 py-2 bg-[#065765] text-white rounded-lg hover:bg-[#065765]/90 transition-colors text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-6 rounded-b-2xl border-t-2 border-[#BA902E]/20">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">
              Interested in {selectedMaker.name}'s work?
            </p>
            <button className="px-6 py-3 bg-[#BA902E] text-white rounded-lg hover:bg-[#BA902E]/90 transition-colors font-medium">
              Contact Maker
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

