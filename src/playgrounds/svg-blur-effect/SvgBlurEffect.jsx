import React, { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';

const SvgBlurEffect = () => {
  const [blurAmount, setBlurAmount] = useState(50);
  const [mousePosition, setMousePosition] = useState({ x: 400, y: 200 });
  const svgRef = useRef(null);
  const mouseCircleRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (svgRef.current && mouseCircleRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        const svgX = ((event.clientX - rect.left) / rect.width) * 800;
        const svgY = ((event.clientY - rect.top) / rect.height) * 400;
        
        // Update state for display purposes
        setMousePosition({ x: svgX, y: svgY });
        
        // Animate the circle using GSAP
        gsap.to(mouseCircleRef.current, {
          attr: { cx: svgX, cy: svgY },
          duration: 1.3,
          ease: "power2.out"
        });
      }
    };

    const svgElement = svgRef.current;
    if (svgElement) {
      svgElement.addEventListener('mousemove', handleMouseMove);
      return () => svgElement.removeEventListener('mousemove', handleMouseMove);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">SVG Blur Effects</h1>
        
        {/* Controls */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl text-white mb-4">Controls</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-white mb-2">Blur Amount: {blurAmount}px</label>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={blurAmount}
                onChange={(e) => setBlurAmount(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="text-gray-300 text-sm">
              Mouse Position: ({Math.round(mousePosition.x)}, {Math.round(mousePosition.y)})
            </div>
          </div>
        </div>

        {/* SVG Canvas */}
        <div className="bg-black p-8 rounded-lg">
          <svg 
            ref={svgRef}
            width="100%" 
            height="400" 
            viewBox="0 0 800 400"
            className="cursor-none"
          >
            {/* Define filters */}
            <defs>
              <filter id="circleBlur" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation={blurAmount} />
              </filter>

            
            </defs>

            {/* Dark background */}
            <rect width="100%" height="100%" fill="#0a0a0a" />

            {/* Static arc */}
            <path
              d="M 50 200 A 300 300 0 0 1 750 200"
              stroke="red"
              strokeWidth="150"
              fill="none"
              filter="url(#circleBlur)"
              opacity="1"
            />
            
            {/* Mouse-following circle */}
            <circle
              ref={mouseCircleRef}
              cx="400"
              cy="200"
              r="120"
              fill="red"
              filter="url(#circleBlur)"
              opacity="0.5"
            />
          </svg>
        </div>

        {/* Info */}
        <div className="mt-8 bg-gray-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-white mb-3">Arc and Circle Blur</h3>
          <p className="text-gray-300">
            Move your mouse over the dark canvas to see a blurred arc and circle that morph together. 
            The arc stays fixed while the circle follows your mouse with smooth GSAP animation, creating a beautiful morphing effect 
            when they overlap. Adjust the blur amount to control how much they blend together.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SvgBlurEffect;
