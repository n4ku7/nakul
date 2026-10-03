export const motionTokens = {
  ease: {
    enter: [0.16, 1, 0.3, 1] as const,
    standard: [0.22, 1, 0.36, 1] as const,
  },
  spring: {
    snappy: { type: "spring", stiffness: 520, damping: 34 } as const,
    morph: { type: "spring", stiffness: 420, damping: 36 } as const,
  },
  blur: { soft: 5, subtle: 2 },
  duration: { fast: 0.16 },
};
