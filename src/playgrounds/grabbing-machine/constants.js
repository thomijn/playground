// Shared constants for the grabbing machine playground
export const DEFAULT_ACCENTS = [
  "#ff8936", 
  "#5b76f5", 
  "#06d6a0", 
  "#f72585",
  "#4cc9f0", 
  "#ffd60a", 
  "#003566", 
  "#ff8500"
];

export const PHYSICS_SETTINGS = {
  GRAVITY: [0, -30, 0],
  BALL_COUNT: window.innerWidth < 768 ? 30 : 40,
  MAX_ANGULAR_VELOCITY: 5,
  LINEAR_DAMPING: 4,
  ANGULAR_DAMPING: 1,
  FRICTION: 0.1
};

export const MOBILE_SETTINGS = {
  BREAKPOINT: 768,
  CLAW_SCALE: 2,
  DESKTOP_CLAW_SCALE: 2.5,
  SPHERE_SCALE: 0.7,
  SAFE_MARGIN: 0.5,
  DESKTOP_SAFE_MARGIN: 2
};

export const INTERACTION_SETTINGS = {
  DESKTOP: {
    RADIUS: 4,
    IMPULSE_STRENGTH: 20,
    LATERAL_IMPULSE: 5,
    ANGULAR_IMPULSE: 15
  },
  MOBILE: {
    RADIUS: 2,
    IMPULSE_STRENGTH: 25,
    LATERAL_IMPULSE: 5,
    ANGULAR_IMPULSE: 10
  }
};

export const CAMERA_SETTINGS = {
  POSITION: [0, 0, 30],
  FOV: 17.5
};

export const VIEWPORT_SETTINGS = {
  DPR: [1, 1.5]
};
