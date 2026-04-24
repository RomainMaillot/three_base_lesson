import Stats from "stats.js";

export default function stats() {
  const stats = new Stats();
  document.body.appendChild(stats.dom);

  return stats;
}