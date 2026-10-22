export const smoothTransition = {
  duration: 0.55,
  ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
};

export const springGentle = {
  type: "spring" as const,
  stiffness: 220,
  damping: 26,
  mass: 0.85,
};

export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: smoothTransition,
};
