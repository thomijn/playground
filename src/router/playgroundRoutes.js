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

// Playground configuration - add new playgrounds here
export const playgrounds = [
  {
    id: 'doorway',
    name: 'Doorway',
    description: 'Interactive doorway experience',
    path: '/doorway',
    component: Doorway,
    category: '3D'
  },
  {
    id: 'soolax',
    name: 'Soolax',
    description: 'Soolax 3D visualization',
    path: '/soolax',
    component: Soolax,
    category: '3D'
  },
  {
    id: 'coolblue',
    name: 'Coolblue AR',
    description: 'Augmented reality experience',
    path: '/coolblue',
    component: Coolblue,
    category: 'AR'
  },
  {
    id: 'select-shader',
    name: 'Select Shader',
    description: 'Interactive shader selection',
    path: '/select-shader',
    component: SelectShader,
    category: 'Shaders'
  },
  {
    id: 'north-sea',
    name: 'North Sea',
    description: 'North Sea visualization with Swiper',
    path: '/north-sea',
    component: NorthSea,
    category: 'Visualization'
  },
  {
    id: 'webgpu',
    name: 'WebGPU',
    description: 'WebGPU experiments',
    path: '/webgpu',
    component: WebGPU,
    category: 'WebGPU'
  },
  {
    id: 'castle',
    name: 'Castle Generator',
    description: 'Procedural castle generation',
    path: '/castle',
    component: CastleGenerator,
    category: '3D'
  },
  {
    id: 'glowtext',
    name: 'Glow Text',
    description: 'Glowing text effects',
    path: '/glowtext',
    component: GlowText,
    category: 'Effects'
  },
  {
    id: 'face-tracking',
    name: 'Face Tracking',
    description: 'Real-time face mesh detection using MediaPipe',
    path: '/face-tracking',
    component: FaceTracking,
    category: 'AI/ML'
  },
  {
    id: 'knds-particles',
    name: 'KNDS Particles',
    description: 'WebGPU particle system experiments',
    path: '/knds-particles',
    component: KNDSParticles,
    category: 'WebGPU'
  }
];

// Generate routes from playground configuration
export const generateRoutes = () => {
  return playgrounds.map(playground => ({
    path: playground.path,
    element: playground.component,
    id: playground.id
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
