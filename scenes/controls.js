import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from "three/examples/jsm/Addons.js";
import GUI from "lil-gui";

import resize from "../helpers/resize.js";

const timer = new THREE.Timer();

export default function animationScene() {
  const gui = new GUI();
  const canvas = document.querySelector(".webgl");
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc2c2c2);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 5;
  scene.add(camera);

  // Create floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(10, 10),
    new THREE.MeshBasicMaterial({ color: 0x999999 }),
  );
  floor.position.y = -1;
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  gui.add(cube.position, "x", -10, 10).listen();
  gui.add(cube.position, "y", -10, 10).listen();
  gui.add(cube.position, "z", -10, 10).listen();

  // Create transform controls
  const transformControls = new TransformControls(camera, canvas);
  transformControls.attach(cube);

  // Show different modes of transform controls
  transformControls.setMode("translate");
  //   transformControls.setMode("rotate");
  // transformControls.setMode("scale");

  // show helper of transform controls
  scene.add(transformControls.getHelper());

  // Prevent orbit controls from being moved when transform controls is active
  transformControls.addEventListener("mouseDown", (event) => {
    controls.enabled = false;
  });
  transformControls.addEventListener("mouseUp", (event) => {
    controls.enabled = true;
  });

  // Handle controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;

  // Handle renderer
  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);

  // Handle resize
  resize(camera, renderer);

  animate(cube, scene, camera, renderer, controls);
}

const animate = (cube, scene, camera, renderer, controls) => {
  timer.update();

  // Exemple with timer
  //   const elapsedTime = timer.getElapsed();

  // Move position with time to move the cube around
  //   cube.position.x = Math.cos(elapsedTime);
  //   cube.position.y = Math.sin(elapsedTime);

  // Render the scene
  renderer.render(scene, camera);
  controls.update();

  // Recursive call to the animate function
  requestAnimationFrame(() => animate(cube, scene, camera, renderer, controls));
};
