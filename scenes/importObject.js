import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import resize from "../helpers/resize.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const timer = new THREE.Timer();

/**
 * glTF import basics with orbit controls and simple light setup.
 */
export default function importObject() {
  const canvas = document.querySelector(".webgl");
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.set(0, 0, 5);
  scene.add(camera);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  const loader = new GLTFLoader();
  const bookshelf = new THREE.Group();
  // Async: model becomes visible once loading callback resolves.
  loader.load("./assets/models/bookshelf.glb", (object) => {
    bookshelf.add(object.scene);
    scene.add(bookshelf);
  });
  bookshelf.position.set(0, 0, -1);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(1, 1, 1);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);

  resize(camera, renderer);

  animate(scene, camera, renderer, controls, bookshelf);
}

const animate = (scene, camera, renderer, controls, bookshelf) => {
  timer.update();
  controls.update();

  bookshelf.rotation.y += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(() =>
    animate(scene, camera, renderer, controls, bookshelf),
  );
};
