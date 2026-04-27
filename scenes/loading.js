import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import performance from "./performance.js";

/**
 * Asset manifest grouped by loader type.
 * Every file currently present in first_project/assets is referenced here.
 */
const ASSET_MANIFEST = {
  textures: [
    "./assets/textures/brick_wall/ao.jpg",
    "./assets/textures/brick_wall/arm.jpg",
    "./assets/textures/brick_wall/color.jpg",
    "./assets/textures/brick_wall/normal.jpg",
    "./assets/textures/brick_wall/roughness.jpg",
    "./assets/textures/alpha_demo/alpha.jpg",
    "./assets/textures/alpha_demo/color.jpg",
    "./assets/textures/alpha_demo/metalness.jpg",
    "./assets/textures/alpha_demo/normal.jpg",
    "./assets/textures/alpha_demo/roughness.jpg",
    "./assets/equirectangularmaps/skybox.jpg",
  ],
  models: ["./assets/models/bookshelf.glb", "./assets/models/damaged_helmet.glb"],
  files: ["./assets/models/damaged_helmet.glb.zip"],
};

/**
 * Returns the existing fixed Cursor div when available.
 * Falls back to creating a compatible fixed badge when not found.
 */
function getOrCreateLoadingBadge() {
  const cursorBadge = document.querySelector('[data-cursor-element-id="cursor-el-5"]');
  if (cursorBadge instanceof HTMLDivElement) {
    return cursorBadge;
  }

  const fallbackBadge = document.createElement("div");
  fallbackBadge.style.position = "fixed";
  fallbackBadge.style.top = "0";
  fallbackBadge.style.left = "0";
  fallbackBadge.style.background = "rgb(58, 150, 221)";
  fallbackBadge.style.color = "white";
  fallbackBadge.style.padding = "2px 6px";
  fallbackBadge.style.fontSize = "11px";
  fallbackBadge.style.fontFamily = "system-ui, -apple-system, sans-serif";
  fallbackBadge.style.fontWeight = "500";
  fallbackBadge.style.borderRadius = "2px";
  fallbackBadge.style.pointerEvents = "none";
  fallbackBadge.style.zIndex = "9999";
  fallbackBadge.textContent = "Loading 0%";
  document.body.appendChild(fallbackBadge);

  return fallbackBadge;
}

/**
 * Promise wrapper for TextureLoader.
 * @param {THREE.TextureLoader} textureLoader
 * @param {string} url
 * @returns {Promise<THREE.Texture>}
 */
function loadTexture(textureLoader, url) {
  return new Promise((resolve, reject) => {
    if (typeof url !== "string" || url.length === 0) {
      reject(new Error("Invalid texture URL"));
      return;
    }
    textureLoader.load(url, resolve, undefined, reject);
  });
}

/**
 * Promise wrapper for GLTFLoader.
 * @param {GLTFLoader} gltfLoader
 * @param {string} url
 * @returns {Promise<import('three/examples/jsm/loaders/GLTFLoader.js').GLTF>}
 */
function loadModel(gltfLoader, url) {
  return new Promise((resolve, reject) => {
    if (typeof url !== "string" || url.length === 0) {
      reject(new Error("Invalid model URL"));
      return;
    }
    gltfLoader.load(url, resolve, undefined, reject);
  });
}

/**
 * Promise wrapper for generic file loading.
 * @param {THREE.FileLoader} fileLoader
 * @param {string} url
 * @returns {Promise<string | ArrayBuffer>}
 */
function loadFile(fileLoader, url) {
  return new Promise((resolve, reject) => {
    if (typeof url !== "string" || url.length === 0) {
      reject(new Error("Invalid file URL"));
      return;
    }
    fileLoader.load(url, resolve, undefined, reject);
  });
}

/**
 * Loading scene:
 * - loads every asset listed in ASSET_MANIFEST
 * - updates the fixed badge text while loading
 * - starts the performance scene when loading is complete
 */
export default async function loading() {
  const badge = getOrCreateLoadingBadge();
  // LoadingManager tracks loader progress events globally for attached loaders.
  const manager = new THREE.LoadingManager();
  const textureLoader = new THREE.TextureLoader(manager);
  const gltfLoader = new GLTFLoader(manager);
  const fileLoader = new THREE.FileLoader(manager);
  fileLoader.setResponseType("arraybuffer");

  /** @type {{textures: Record<string, THREE.Texture>, models: Record<string, unknown>, files: Record<string, string | ArrayBuffer>}} */
  const loadedAssets = {
    textures: {},
    models: {},
    files: {},
  };

  manager.onStart = () => {
    badge.textContent = "Loading 0% (0/0)";
  };

  manager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const safeTotal = itemsTotal > 0 ? itemsTotal : 1;
    const percentage = Math.round((itemsLoaded / safeTotal) * 100);
    badge.textContent = `Loading ${percentage}% (${itemsLoaded}/${safeTotal})`;
    badge.title = `Current: ${url}`;
  };

  manager.onError = (url) => {
    badge.textContent = `Error loading: ${url}`;
  };

  // Promise lists define completion logic used by Promise.all below.
  // LoadingManager is used in parallel only to provide progress callbacks.
  const texturePromises = ASSET_MANIFEST.textures.map(async (url) => {
    const texture = await loadTexture(textureLoader, url);
    loadedAssets.textures[url] = texture;
  });

  const modelPromises = ASSET_MANIFEST.models.map(async (url) => {
    const model = await loadModel(gltfLoader, url);
    loadedAssets.models[url] = model;
  });

  const filePromises = ASSET_MANIFEST.files.map(async (url) => {
    const file = await loadFile(fileLoader, url);
    loadedAssets.files[url] = file;
  });

  try {
    // The scene starts only when every asset promise has resolved.
    await Promise.all([...texturePromises, ...modelPromises, ...filePromises]);
    // onLoad may already have fired by this point; we keep explicit "Ready"
    // updates here so the final UI state is deterministic for students.
    manager.onLoad = () => {
      badge.textContent = "Ready";
    };
    badge.textContent = "Loading 100%";
    setTimeout(() => {
      badge.textContent = "Ready";
    }, 250);

    // Stored globally for optional reuse by other scenes.
    window.__loadedAssets = loadedAssets;
    performance();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown loading error";
    badge.textContent = `Loading failed: ${message}`;
    console.error("Loading scene failed:", error);
  }
}
