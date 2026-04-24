import * as THREE from "three";
import GUI from "lil-gui";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import resize from "../helpers/resize.js";
import stats from "../helpers/stats.js";

const timer = new THREE.Timer();
const INFO_LOG_INTERVAL_MS = 2000;

/**
 * Logs renderer performance info in a readable format.
 * @param {THREE.WebGLRenderer} renderer
 */
function logRendererInfo(renderer) {
  const info = renderer.info;
  console.log("Triangles:", info.render.triangles);
  console.log("Draw calls:", info.render.calls);
  console.log("Textures GPU:", info.memory.textures);
  console.log("Geometries GPU:", info.memory.geometries);
}

/**
 * Scene demonstrating lights, materials, and progressive texture application.
 * Follow the GUI checkboxes to toggle each texture layer on/off.
 */
export default function performance() {
  const infoLogState = { lastLogMs: 0 };
  const statsInstance = stats();
  const canvas = document.querySelector(".webgl");
  const scene = new THREE.Scene();
  const gui = new GUI({ title: "Lights & Textures" });

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 0, 3);
  scene.add(camera);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  // --- Texture loader ---
  const textureLoader = new THREE.TextureLoader();
  const colorTexture = textureLoader.load(
    "./assets/textures/brick_wall/color.jpg",
  );
  const normalTexture = textureLoader.load(
    "./assets/textures/brick_wall/normal.jpg",
  );
  const roughnessTexture = textureLoader.load(
    "./assets/textures/brick_wall/roughness.jpg",
  );
  const aoTexture = textureLoader.load("./assets/textures/brick_wall/ao.jpg");

  colorTexture.colorSpace = THREE.SRGBColorSpace;

  // --- Material (starts with flat color, no textures) ---
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.3,
  });

  // --- Mesh: sphere to show textures well ---
  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const sphere = new THREE.Mesh(geometry, material);
  sphere.canRotate = true;
  sphere.position.x = -1.5;
  sphere.castShadow = true;
  sphere.receiveShadow = true;
  scene.add(sphere);

  // --- Second object: metal grate plane with alpha map ---
  const grateColorTexture = textureLoader.load(
    "./assets/textures/alpha_demo/color.jpg",
  );
  const grateNormalTexture = textureLoader.load(
    "./assets/textures/alpha_demo/normal.jpg",
  );
  const grateAlphaTexture = textureLoader.load(
    "./assets/textures/alpha_demo/alpha.jpg",
  );
  grateColorTexture.colorSpace = THREE.SRGBColorSpace;

  const grateMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.5,
    metalness: 0.7,
    transparent: true,
    side: THREE.DoubleSide,
  });

  const planeGeometry = new THREE.PlaneGeometry(2, 2);
  const plane = new THREE.Mesh(planeGeometry, grateMaterial);
  plane.canRotate = true;
  plane.position.x = 1.5;
  plane.castShadow = true;
  plane.receiveShadow = true;
  scene.add(plane);

  // --- Lights ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
  directionalLight.position.set(3, 4, 2);
  directionalLight.shadow.mapSize.set(1024, 1024);
  scene.add(directionalLight);
  directionalLight.castShadow = true;

  const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
  );
  scene.add(directionalLightHelper);

  // --- GUI: Light controls ---
  const lightFolder = gui.addFolder("Lights");
  lightFolder
    .add(ambientLight, "intensity", 0, 2, 0.01)
    .name("Ambient intensity");
  lightFolder
    .add(directionalLight, "intensity", 0, 3, 0.01)
    .name("Directional intensity");
  lightFolder.addColor(directionalLight, "color").name("Directional color");
  lightFolder
    .add(directionalLight.position, "x", -10, 10, 0.1)
    .name("Dir pos X");
  lightFolder
    .add(directionalLight.position, "y", -10, 10, 0.1)
    .name("Dir pos Y");
  lightFolder
    .add(directionalLight.position, "z", -10, 10, 0.1)
    .name("Dir pos Z");

  lightFolder.add(directionalLight, "castShadow", true).name("Cast shadows");

  // --- GUI: Material controls (brick sphere) ---
  const materialFolder = gui.addFolder("Material (Sphere)");
  materialFolder.add(material, "roughness", 0, 1, 0.01);
  materialFolder.add(material, "metalness", 0, 1, 0.01);
  materialFolder
    .add(material, "aoMapIntensity", 0, 5, 0.1)
    .name("AO intensity");
  materialFolder.add(material, "wireframe");
  // Button to toggle rotation of the sphere
  materialFolder.add(sphere, "canRotate", false).name("Toggle rotation");

  // --- GUI: Progressive texture toggles ---
  const textureState = {
    map: false,
    normalMap: false,
    roughnessMap: false,
    aoMap: false,
  };

  const textureFolder = gui.addFolder("Textures (toggle)");

  textureFolder
    .add(textureState, "map")
    .name("1. Color (map)")
    .onChange((enabled) => {
      material.map = enabled ? colorTexture : null;
      material.needsUpdate = true;
    });

  textureFolder
    .add(textureState, "normalMap")
    .name("2. Normal Map")
    .onChange((enabled) => {
      material.normalMap = enabled ? normalTexture : null;
      material.needsUpdate = true;
    });

  textureFolder
    .add(textureState, "roughnessMap")
    .name("3. Roughness Map")
    .onChange((enabled) => {
      material.roughnessMap = enabled ? roughnessTexture : null;
      material.needsUpdate = true;
    });

  textureFolder
    .add(textureState, "aoMap")
    .name("4. AO Map")
    .onChange((enabled) => {
      material.aoMap = enabled ? aoTexture : null;
      material.needsUpdate = true;
    });

  // --- GUI: Alpha object (metal grate plane) ---
  const grateTextureState = {
    map: false,
    alphaMap: false,
    normalMap: false,
  };

  const grateFolder = gui.addFolder("Alpha Object (Plane)");
  grateFolder.add(grateMaterial, "roughness", 0, 1, 0.01);
  grateFolder.add(grateMaterial, "metalness", 0, 1, 0.01);

  grateFolder
    .add(grateTextureState, "map")
    .name("1. Color (map)")
    .onChange((enabled) => {
      grateMaterial.map = enabled ? grateColorTexture : null;
      grateMaterial.needsUpdate = true;
    });

  grateFolder
    .add(grateTextureState, "alphaMap")
    .name("2. Alpha Map")
    .onChange((enabled) => {
      grateMaterial.alphaMap = enabled ? grateAlphaTexture : null;
      grateMaterial.needsUpdate = true;
    });

  grateFolder
    .add(grateTextureState, "normalMap")
    .name("3. Normal Map")
    .onChange((enabled) => {
      grateMaterial.normalMap = enabled ? grateNormalTexture : null;
      grateMaterial.needsUpdate = true;
    });
  // Button to toggle rotation of the plane
  grateFolder.add(plane, "canRotate", false).name("Toggle rotation");

  // Add a floor
  const floorGeometry = new THREE.PlaneGeometry(10, 10);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x999999 });
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -2;
  floor.receiveShadow = true;
  scene.add(floor);

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.render(scene, camera);
  renderer.shadowMap.enabled = true;

//   shadowFolder.add(renderer, "shadowMap.enabled", false).name("Enable shadows");
  

  resize(camera, renderer);

  animate(
    scene,
    camera,
    renderer,
    controls,
    sphere,
    plane,
    directionalLightHelper,
    statsInstance,
    infoLogState,
  );
}

/**
 * Render loop — rotates both objects slowly and updates controls/helpers.
 */
const animate = (
  scene,
  camera,
  renderer,
  controls,
  sphere,
  plane,
  lightHelper,
  statsInstance,
  infoLogState,
) => {
  statsInstance.begin();
  timer.update();

  if (sphere.canRotate) {
    sphere.rotation.y += 0.003;
  }
  if (plane.canRotate) {
    plane.rotation.y += 0.005;
  }
  controls.update();
  lightHelper.update();

  renderer.render(scene, camera);

  const nowMs = window.performance.now();
  if (nowMs - infoLogState.lastLogMs >= INFO_LOG_INTERVAL_MS) {
    logRendererInfo(renderer);
    infoLogState.lastLogMs = nowMs;
  }

  statsInstance.end();

  requestAnimationFrame(() =>
    animate(
      scene,
      camera,
      renderer,
      controls,
      sphere,
      plane,
      lightHelper,
      statsInstance,
      infoLogState,
    ),
  );
};
