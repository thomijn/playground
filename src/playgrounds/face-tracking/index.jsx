import React, { useRef, useEffect, useState } from "react";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import Face3D from "./Face3D.jsx";
import { analyzeBlendShapes, getExpressionEmoji, getExpressionColor, analyzeFacialFeatures } from "./ExpressionAnalyzer.js";

const FaceTracking = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
  const [stats, setStats] = useState({
    facesDetected: 0,
    fps: 0,
    landmarks: 0,
  });
  const [currentLandmarks, setCurrentLandmarks] = useState(null);
  const [currentBlendShapes, setCurrentBlendShapes] = useState(null);
  const [currentExpression, setCurrentExpression] = useState(null);
  const [facialFeatures, setFacialFeatures] = useState(null);

  // Performance optimization refs
  const frameCountRef = useRef(0);
  const lastStatsUpdateRef = useRef(0);
  const lastExpressionUpdateRef = useRef(0);

  useEffect(() => {
    const initializeFaceTracking = async () => {
      try {
        // Initialize MediaPipe Tasks Vision FaceLandmarker
        const filesetResolver = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm");

        const faceLandmarkerInstance = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "CPU", // Use CPU for more consistent performance
          },
          outputFaceBlendshapes: true, // Enable BlendShapes for expression detection
          outputFacialTransformationMatrixes: false, // Disable to reduce processing
          runningMode: "VIDEO",
          numFaces: 1,
          minFaceDetectionConfidence: 0.5, // Higher threshold for better performance
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        setFaceLandmarker(faceLandmarkerInstance);

        // Initialize camera stream
        if (videoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 480 },
              height: { ideal: 360 },
              facingMode: "user",
              frameRate: { ideal: 30, max: 30 },
            },
          });

          videoRef.current.srcObject = stream;

          // Wait for video to be ready
          const onVideoReady = () => {
            cleanupPrediction = startPrediction(faceLandmarkerInstance);
          };

          if (videoRef.current.readyState >= 2) {
            onVideoReady();
          } else {
            videoRef.current.addEventListener("loadeddata", onVideoReady, { once: true });
            videoRef.current.addEventListener("canplay", onVideoReady, { once: true });
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error initializing face tracking:", err);
        setError("Failed to initialize face tracking. Please check camera permissions.");
        setIsLoading(false);
      }
    };

    const startPrediction = (faceLandmarkerInstance) => {
      let intervalId;
      let isRunning = true;

      const predictWebcam = async () => {
        if (!isRunning || !videoRef.current || !faceLandmarkerInstance) {
          return;
        }

        // Check if video is ready and has valid dimensions
        if (videoRef.current.readyState >= 2 && videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
          try {
            const currentTime = performance.now();
            const results = await faceLandmarkerInstance.detectForVideo(videoRef.current, currentTime);

            // Process results
            onResults(results);
          } catch (error) {
            console.error("Detection error:", error);
            // Continue despite errors
          }
        }
      };

      // Run MediaPipe detection at 20 FPS using setInterval (much more efficient)
      intervalId = setInterval(predictWebcam, 1000 / 20); // 50ms interval = 20 FPS

      // Return cleanup function
      return () => {
        isRunning = false;
        if (intervalId) {
          clearInterval(intervalId);
        }
      };
    };

    let cleanupPrediction = null;

    const initializeAndStart = async () => {
      await initializeFaceTracking();
      // startPrediction is called inside initializeFaceTracking and returns cleanup function
    };

    initializeAndStart();

    // Cleanup
    return () => {
      if (cleanupPrediction) {
        cleanupPrediction();
      }
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const onResults = (results) => {
    frameCountRef.current++;
    const now = performance.now();

    // Always update landmarks for smooth 3D rendering
    if (results.faceLandmarks && results.faceLandmarks.length > 0) {
      setCurrentLandmarks(results.faceLandmarks[0]);

      // Update stats only every 20 frames (1 time per second at 20 FPS)
      if (frameCountRef.current % 20 === 0) {
        const facesCount = results.faceLandmarks.length;
        const totalLandmarks = results.faceLandmarks[0].length;

        setStats({
          facesDetected: facesCount,
          fps: Math.round(1000 / ((now - lastStatsUpdateRef.current) / 20)) || 20,
          landmarks: totalLandmarks,
        });
        lastStatsUpdateRef.current = now;
      }
    } else {
      setCurrentLandmarks(null);
      if (frameCountRef.current % 10 === 0) {
        setStats((prev) => ({ ...prev, facesDetected: 0, landmarks: 0 }));
      }
    }

    // Update expressions every 10 frames (2 times per second at 20 FPS)
    if (frameCountRef.current % 10 === 0) {
      if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
        setCurrentBlendShapes(results.faceBlendshapes);

        // Analyze expressions using BlendShapes
        const expressionAnalysis = analyzeBlendShapes(results.faceBlendshapes);
        setCurrentExpression(expressionAnalysis);

        // Analyze detailed facial features
        const features = analyzeFacialFeatures(results.faceBlendshapes);
        setFacialFeatures(features);
      } else {
        setCurrentBlendShapes(null);
        setCurrentExpression(null);
        setFacialFeatures(null);
      }
    }

    // Update debug canvas every 4 frames (5 times per second at 20 FPS)
    // if (frameCountRef.current % 4 === 0) {
    //   updateDebugCanvas(results);
    // }
  };

  const updateDebugCanvas = (results) => {
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (results.faceLandmarks && results.faceLandmarks.length > 0) {
        const landmarks = results.faceLandmarks[0];

        // Draw key landmarks
        ctx.fillStyle = "#FF6B6B";
        const keyPoints = [10, 151, 9, 8, 168, 6, 197, 195, 5, 4, 1, 19, 94, 125, 141, 235, 31, 228, 229, 230, 231, 232, 233, 244, 245, 122];

        keyPoints.forEach((index) => {
          if (landmarks[index]) {
            const x = landmarks[index].x * canvas.width;
            const y = landmarks[index].y * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, 2 * Math.PI);
            ctx.fill();
          }
        });
      }
    } catch (error) {
      // Silently handle canvas drawing errors
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-3xl font-bold text-white mb-4">Face Tracking Error</h1>
          <p className="text-red-300 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Hidden video element for MediaPipe */}
      <video
        ref={videoRef}
        className="absolute bottom-4 right-4 w-48 h-36 border border-white/20 rounded z-50 scaleX(1)"
        autoPlay
        muted
        playsInline
        style={{ transform: "scaleX(1)" }}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mb-4"></div>
            <p className="text-white text-lg">Initializing camera and face tracking...</p>
          </div>
        </div>
      )}

      {/* Main 3D View */}
      <div className="h-screen w-full">
        <Face3D landmarks={currentLandmarks} expression={currentExpression} />
      </div>

      {/* Debug Panel - Top Right */}
      <div className="absolute hidden top-20 right-4 bg-black/70 backdrop-blur-sm rounded-lg p-3 min-w-[200px] z-40">
        <h3 className="text-white font-semibold mb-2 text-sm">Debug Info</h3>
        <div className="space-y-1 text-xs text-gray-300">
          <div className="flex justify-between">
            <span>Faces:</span>
            <span className="text-white">{stats.facesDetected}</span>
          </div>
          <div className="flex justify-between">
            <span>Landmarks:</span>
            <span className="text-white">{stats.landmarks}</span>
          </div>
          <div className="flex justify-between">
            <span>FPS:</span>
            <span className="text-white">{stats.fps}</span>
          </div>
          <div className="flex justify-between">
            <span>Status:</span>
            <span className={`${currentLandmarks ? "text-green-400" : "text-red-400"}`}>{currentLandmarks ? "Tracking" : "No Face"}</span>
          </div>
        </div>

        {/* Expression Info */}
        {currentExpression && (
          <div className="mt-3 pt-2 border-t border-gray-600">
            <div className="text-xs text-gray-400 mb-1">Expression:</div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-white flex items-center gap-1">
                <span>{getExpressionEmoji(currentExpression.expression)}</span>
                <span>{currentExpression.expression}</span>
              </span>
              <span className="text-white font-semibold" style={{ color: getExpressionColor(currentExpression.expression) }}>
                {(currentExpression.confidence * 100).toFixed(0)}%
              </span>
            </div>

            {/* Top BlendShapes */}
            {currentExpression.topShapes && (
              <div>
                <div className="text-xs text-gray-400 mb-1">Top Shapes:</div>
                {currentExpression.topShapes.slice(0, 3).map((shape, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-gray-300 truncate text-[10px]">{shape.name.replace(/([A-Z])/g, " $1").trim()}</span>
                    <span className="text-white ml-2 text-[10px]">{(shape.score * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Color Legend */}
        <div className="mt-3 pt-2 border-t border-gray-600">
          <div className="text-xs text-gray-400 mb-1">Legend:</div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: currentExpression ? getExpressionColor(currentExpression.expression) : "#f59e0b" }}
              ></div>
              <span className="text-gray-300">Landmarks</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              <span className="text-gray-300">Face Mesh</span>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Debug - Bottom Right */}
      <div className="absolute bottom-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden shadow-lg z-40">
        <canvas ref={canvasRef} width={320} height={240} className="w-full h-full object-cover" style={{ transform: "scaleX(-1)" }} />
        <div className="absolute top-1 left-1 bg-black/70 backdrop-blur-sm rounded px-2 py-1">
          <span className="text-white text-xs font-medium">Camera Debug</span>
        </div>
      </div>
    </div>
  );
};

export default FaceTracking;
