import * as THREE from "three";
import GUI from "lil-gui";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

import resize from "../helpers/resize.js";

const timer = new THREE.Timer();

/**
 * Scene demonstrating glTF model import with proper PBR lighting.
 * Uses the Khronos DamagedHelmet sample model.
 */
export default function importModel() {
  const canvas = document.querySelector(".webgl");
  const scene = new THREE.Scene();
  const gui = new GUI({ title: "Import Model" });

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

  // --- Environment / Skybox ---
  const textureLoader = new THREE.TextureLoader();
  const skybox = textureLoader.load("./assets/equirectangularmaps/skybox.jpg", () => {
    skybox.mapping = THREE.EquirectangularReflectionMapping;
    skybox.colorSpace = THREE.SRGBColorSpace;
    scene.background = skybox;
    scene.environment = skybox;
  });

  // --- Lights ---
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
  directionalLight.position.set(3, 5, 2);
  scene.add(directionalLight);

  const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight);
  scene.add(directionalLightHelper);

  const pointLight = new THREE.PointLight(0xff9000, 1, 10, 2);
  pointLight.position.set(-2, 1, 2);
  scene.add(pointLight);

  const pointLightHelper = new THREE.PointLightHelper(pointLight, 0.2);
  scene.add(pointLightHelper);

  // --- Load glTF model ---
  const gltfLoader = new GLTFLoader();
  // modelGroup is available immediately, even before the file is loaded.
  // This lets us animate/scale/rotate a stable parent object from frame 1.
  const modelGroup = new THREE.Group();
  scene.add(modelGroup);

  // Async step: this callback runs later, once the .glb has finished loading.
  gltfLoader.load("./assets/models/damaged_helmet.glb", (gltf) => {
    const model = gltf.scene;
    modelGroup.add(model);
  });

  // --- GUI: Lights ---
  const lightFolder = gui.addFolder("Lumières");
  lightFolder.add(ambientLight, "intensity", 0, 2, 0.01).name("Ambient");
  lightFolder.add(directionalLight, "intensity", 0, 3, 0.01).name("Directional");
  lightFolder.addColor(directionalLight, "color").name("Dir color");
  lightFolder.add(directionalLight.position, "x", -10, 10, 0.1).name("Dir X");
  lightFolder.add(directionalLight.position, "y", -10, 10, 0.1).name("Dir Y");
  lightFolder.add(directionalLight.position, "z", -10, 10, 0.1).name("Dir Z");
  lightFolder.add(pointLight, "intensity", 0, 3, 0.01).name("Point");
  lightFolder.addColor(pointLight, "color").name("Point color");

  // --- GUI: Model transform ---
  const modelFolder = gui.addFolder("Model");
  modelFolder.add(modelGroup.rotation, "x", -Math.PI, Math.PI, 0.01).name("Rotation X");
  modelFolder.add(modelGroup.rotation, "y", -Math.PI, Math.PI, 0.01).name("Rotation Y");
  modelFolder.add(modelGroup.rotation, "z", -Math.PI, Math.PI, 0.01).name("Rotation Z");
  modelFolder.add(modelGroup.scale, "x", 0.1, 3, 0.01).name("Scale").onChange((value) => {
    modelGroup.scale.set(value, value, value);
  });

  // --- GUI: Helpers visibility ---
  const helpersFolder = gui.addFolder("Helpers");
  helpersFolder.add(directionalLightHelper, "visible").name("Dir helper");
  helpersFolder.add(pointLightHelper, "visible").name("Point helper");

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  renderer.render(scene, camera);

  resize(camera, renderer);

  animate(scene, camera, renderer, controls, modelGroup, directionalLightHelper);
}

/**
 * Render loop — slow auto-rotation of the model, updates controls and helpers.
 */
const animate = (scene, camera, renderer, controls, modelGroup, lightHelper) => {
  timer.update();

  modelGroup.rotation.y += 0.005;
  controls.update();
  lightHelper.update();

  renderer.render(scene, camera);

  requestAnimationFrame(() =>
    animate(scene, camera, renderer, controls, modelGroup, lightHelper),
  );
};
