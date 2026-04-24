import * as THREE from "three";
import GUI from "lil-gui";
import { animate as motionAnimate } from "motion";

import resize from "../helpers/resize.js";

const timer = new THREE.Timer();

export default function animationLookAt() {
  const canvas = document.querySelector(".webgl");
  const scene = new THREE.Scene();
  const gui = new GUI();

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
  const material2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
  camera.lookAt(cube.position);
  const cube2 = new THREE.Mesh(geometry, material2);
  cube2.position.y = 2;
  cube2.position.x = -5;
  cube2.position.z = 5;
  scene.add(cube2);

  // add option to look at the cubes
  const currentTarget = { lookAtObject: cube };
  const lookTarget = new THREE.Object3D();
  gui.add(currentTarget, "lookAtObject", { cube: cube, cube2: cube2 });
  gui.onChange((value) => {
    motionAnimate(
      lookTarget.position,
      {
        x: value.value.position.x,
        y: value.value.position.y,
        z: value.value.position.z,
      },
      { duration: 2.5, ease: "easeInOut" },
    );
  });

  // Add skybox
  const loader = new THREE.TextureLoader();
  const skybox = loader.load("./assets/equirectangularmaps/skybox.jpg", () => {
    skybox.mapping = THREE.EquirectangularReflectionMapping;
    skybox.colorSpace = THREE.SRGBColorSpace;
    scene.background = skybox;
  });

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);

  resize(camera, renderer);

  animate(scene, camera, renderer, lookTarget);
}

const animate = (scene, camera, renderer, lookTarget) => {
  timer.update();

  camera.lookAt(lookTarget.position);

  renderer.render(scene, camera);

  requestAnimationFrame(() => animate(scene, camera, renderer, lookTarget));
};
