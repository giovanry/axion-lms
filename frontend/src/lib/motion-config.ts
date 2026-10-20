import type { TargetAndTransition } from "framer-motion";

/**
 * AXION MOTION PHYSICS & TRANSITION CONFIGURATION
 * Strict physics-based spring curves (NO linear/robotic easing)
 */

export const SPRING_SNAPPY = {
  type: "spring" as const,
  stiffness: 450,
  damping: 32,
  mass: 0.8,
};

export const SPRING_SMOOTH = {
  type: "spring" as const,
  stiffness: 300,
  damping: 30,
  mass: 1,
};

export const SPRING_BOUNCY = {
  type: "spring" as const,
  stiffness: 500,
  damping: 25,
  mass: 0.7,
};

export const SPRING_GENTLE = {
  type: "spring" as const,
  stiffness: 220,
  damping: 28,
  mass: 1.1,
};

export const SPRING_RESIZE = {
  type: "spring" as const,
  stiffness: 350,
  damping: 32,
  mass: 0.85,
};

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export const TRANSITION_TAB_CONTENT = {
  duration: 0.22,
  ease: EASE_OUT_EXPO,
};

export const SHAKE_KEYFRAMES: TargetAndTransition = {
  x: [0, -6, 6, -4, 4, -2, 2, 0],
  transition: { duration: 0.45, ease: "easeInOut" },
};
