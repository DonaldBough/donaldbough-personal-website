// Device detection and the quality settings that depend on it.
// Phones get a lower resolution and smaller shadow maps to keep the frame rate up.

export const isTouchDevice = window.matchMedia('(pointer: coarse)').matches;

export const quality = isTouchDevice
  ? { maxPixelRatio: 1.5, shadowMapSize: 512 }
  : { maxPixelRatio: 2, shadowMapSize: 1024 };
