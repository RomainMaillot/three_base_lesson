import Stats from "stats.js";

/**
 * Creates and mounts the FPS panel, then returns the stats instance.
 */
export default function stats() {
  const stats = new Stats();
  document.body.appendChild(stats.dom);

  return stats;
}