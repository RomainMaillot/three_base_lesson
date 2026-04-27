import * as THREE from "three";
import { animate as motionAnimate } from "motion";
import { DragControls } from "three/addons/controls/DragControls.js";
import resize from "../helpers/resize.js";

const timer = new THREE.Timer();

/**
 * Raycaster demo:
 * - hover changes color/cursor
 * - click toggles cube scale animation
 */
export default function raycaster() {
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

  // Keep drag controls enabled so students can test drag + raycast together.
  new DragControls([cube], camera, canvas);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let isCubeBig = false;

  canvas.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  });

  canvas.addEventListener("mousedown", (event) => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      if (!isCubeBig) {
        motionAnimate(cube.scale, { x: 2, y: 2, z: 2 }, { duration: 0.5 });
        isCubeBig = true;
      } else {
        motionAnimate(cube.scale, { x: 1, y: 1, z: 1 }, { duration: 0.5 });
        isCubeBig = false;
      }
    }
  });

  resize(camera, renderer);

  animate(cube, scene, camera, renderer, raycaster, mouse);
}

const animate = (cube, scene, camera, renderer, raycaster, mouse) => {
  timer.update();
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children);
  if (intersects.length > 0) {
    intersects[0].object.material.color.set(0x0000ff);
    document.body.style.cursor = "pointer";
  } else {
    cube.material.color.set(0x00ff00);
  }

  renderer.render(scene, camera);

  requestAnimationFrame(() =>
    animate(cube, scene, camera, renderer, raycaster, mouse),
  );
};
