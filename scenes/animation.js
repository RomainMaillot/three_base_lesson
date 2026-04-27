import * as THREE from "three";
import resize from "../helpers/resize.js";

const timer = new THREE.Timer();

/**
 * Animation basics demo using a shared requestAnimationFrame loop.
 */
export default function animationScene() {
  const canvas = document.querySelector(".webgl");
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 5;
  scene.add(camera);

  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);

  resize(camera, renderer);

  animate(cube, scene, camera, renderer);
}

const animate = (cube, scene, camera, renderer) => {
  timer.update();
  // Exemple simple rotation of the cube
  //   cube.rotation.x += 0.01;
  //   cube.rotation.y += 0.01;

  // Exemple with timer
  const elapsedTime = timer.getElapsed();
  //   cube.rotation.x = elapsedTime;
  //   cube.rotation.y = elapsedTime;

  // Move position with time to move the cube around
  //   cube.position.x = Math.cos(elapsedTime);
  //   cube.position.y = Math.sin(elapsedTime);

  // Orbit camera around the cube using cosine/sine over elapsed time.
  camera.position.x = Math.cos(elapsedTime);
  camera.position.y = Math.sin(elapsedTime);
  camera.lookAt(cube.position);

  // Render the scene
  renderer.render(scene, camera);

  // Recursive call to the animate function
  requestAnimationFrame(() => animate(cube, scene, camera, renderer));
};
