import * as THREE from "three";
import GUI from "lil-gui";
import resize from "../helpers/resize.js";

const timer = new THREE.Timer();

/**
 * Directional light demo with GUI controls and helper visualization.
 */
export default function lights() {
  const gui = new GUI();

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
  const material = new THREE.MeshStandardMaterial();
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  // Lights
  //   const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  //   scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xff0000, 1);
  directionalLight.position.set(1, 1, 1);
  directionalLight.target = cube;
  const directionalLightHelper = new THREE.DirectionalLightHelper(
    directionalLight,
  );

  gui.addColor(directionalLight, "color").onChange((color) => {
    directionalLight.color.set(color);
  });
  gui.add(directionalLight.position, "x", -10, 10);
  gui.add(directionalLight.position, "y", -10, 10);
  gui.add(directionalLight.position, "z", -10, 10);
  gui.add(cube.position, "x", -10, 10);
  gui.add(cube.position, "y", -10, 10);
  gui.add(cube.position, "z", -10, 10);
  //   gui.add(directionalLight, "intensity").min(0).max(1).step(0.01);
  //   gui.add(directionalLight, "position").min(-10).max(10).step(0.01);

  scene.add(directionalLight);
  scene.add(directionalLightHelper);

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);

  resize(camera, renderer);

  animate(
    cube,
    scene,
    camera,
    renderer,
    directionalLight,
    directionalLightHelper,
  );
}

const animate = (
  cube,
  scene,
  camera,
  renderer,
  directionalLight,
  directionalLightHelper,
) => {
  timer.update();
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  directionalLight.target = cube;
  directionalLightHelper.update();
  renderer.render(scene, camera);
  requestAnimationFrame(() =>
    animate(
      cube,
      scene,
      camera,
      renderer,
      directionalLight,
      directionalLightHelper,
    ),
  );
};
