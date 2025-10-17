// Playground route configuration
// This file automatically generates routes for all playgrounds
// To add a new playground, simply add it to the playgrounds array below

import { lazy } from 'react';

// Lazy load all playground components for better performance
const Doorway = lazy(() => import('../playgrounds/doorway/index.jsx'));
const Soolax = lazy(() => import('../playgrounds/soolax/index.jsx'));
const Coolblue = lazy(() => import('../playgrounds/coolblue/MarkerLess.jsx'));
const SelectShader = lazy(() => import('../playgrounds/select-shader/index.jsx'));
const NorthSea = lazy(() => import('../playgrounds/north-sea/NorthSea.jsx'));
const WebGPU = lazy(() => import('../playgrounds/webgpu/index.jsx'));
const CastleGenerator = lazy(() => import('../playgrounds/castle/index.jsx'));
const GlowText = lazy(() => import('../playgrounds/glowtext/index.jsx'));
const FaceTracking = lazy(() => import('../playgrounds/face-tracking/index.jsx'));
const KNDSParticles = lazy(() => import('../playgrounds/knds-particles/index.jsx'));
const SvgBlurEffect = lazy(() => import('../playgrounds/svg-blur-effect/index.jsx'));
const InfinitePlanes = lazy(() => import('../playgrounds/infinite-planes/index.jsx'));
const DepthMapParallax = lazy(() => import('../playgrounds/depth-map-parallax/index.jsx'));
const GrabbingMachine = lazy(() => import('../playgrounds/grabbing-machine/index.jsx'));

// Playground configuration - add new playgrounds here
// Set hideHeader: true to hide the navigation header for any route
export const playgrounds = [
  {
    id: 'doorway',
    name: 'Doorway',
    description: 'Interactive doorway experience',
    path: '/doorway',
    component: Doorway,
    category: '3D',
    hideHeader: false // Set to true to hide the header for this route
  },
  {
    id: 'soolax',
    name: 'Soolax',
    description: 'Soolax 3D visualization',
    path: '/soolax',
    component: Soolax,
    category: '3D',
    hideHeader: false
  },
  {
    id: 'coolblue',
    name: 'Coolblue AR',
    description: 'Augmented reality experience',
    path: '/coolblue',
    component: Coolblue,
    category: 'AR',
    hideHeader: false
  },
  {
    id: 'select-shader',
    name: 'Select Shader',
    description: 'Interactive shader selection',
    path: '/select-shader',
    component: SelectShader,
    category: 'Shaders',
    hideHeader: false
  },
  {
    id: 'north-sea',
    name: 'North Sea',
    description: 'North Sea visualization with Swiper',
    path: '/north-sea',
    component: NorthSea,
    category: 'Visualization',
    hideHeader: false
  },
  {
    id: 'webgpu',
    name: 'WebGPU',
    description: 'WebGPU experiments',
    path: '/webgpu',
    component: WebGPU,
    category: 'WebGPU',
    hideHeader: false
  },
  {
    id: 'castle',
    name: 'Castle Generator',
    description: 'Procedural castle generation',
    path: '/castle',
    component: CastleGenerator,
    category: '3D',
    hideHeader: false
  },
  {
    id: 'glowtext',
    name: 'Glow Text',
    description: 'Glowing text effects',
    path: '/glowtext',
    component: GlowText,
    category: 'Effects',
    hideHeader: false
  },
  {
    id: 'face-tracking',
    name: 'Face Tracking',
    description: 'Real-time face mesh detection using MediaPipe',
    path: '/face-tracking',
    component: FaceTracking,
    category: 'AI/ML',
    hideHeader: false
  },
  {
    id: 'knds-particles',
    name: 'KNDS Particles',
    description: 'WebGPU particle system experiments',
    path: '/knds-particles',
    component: KNDSParticles,
    category: 'WebGPU',
    hideHeader: false
  },
  {
    id: 'svg-blur-effect',
    name: 'SVG Blur Effect',
    description: 'Interactive SVG blur and filter effects',
    path: '/svg-blur-effect',
    component: SvgBlurEffect,
    category: 'Effects',
    hideHeader: false
  },
  {
    id: 'infinite-planes',
    name: 'Infinite Planes',
    description: 'Infinite grid of 3D planes with different aspect ratios',
    path: '/infinite-planes',
    component: InfinitePlanes,
    category: '3D',
    hideHeader: true
  },
  {
    id: 'depth-map-parallax',
    name: 'Depth Map Parallax',
    description: 'WebGPU parallax mapping with TSL shaders',
    path: '/depth-map-parallax',
    component: DepthMapParallax,
    category: 'WebGPU',
    hideHeader: false
  },
  {
    id: 'grabbing-machine',
    name: 'Grabbing Machine',
    description: 'WebGPU R3F template for grabbing machine simulation',
    path: '/grabbing-machine',
    component: GrabbingMachine,
    category: 'WebGPU',
    hideHeader: false
  }
];

// Generate routes from playground configuration
export const generateRoutes = () => {
  return playgrounds.map(playground => ({
    path: playground.path,
    element: playground.component,
    id: playground.id,
    hideHeader: playground.hideHeader
  }));
};

// Get playground by ID
export const getPlaygroundById = (id) => {
  return playgrounds.find(playground => playground.id === id);
};

// Get playgrounds by category
export const getPlaygroundsByCategory = (category) => {
  return playgrounds.filter(playground => playground.category === category);
};

// Get all categories
export const getCategories = () => {
  return [...new Set(playgrounds.map(playground => playground.category))];
};
