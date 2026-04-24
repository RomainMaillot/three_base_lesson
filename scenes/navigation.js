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

  // Smoothed rotation offsets, updated independently from the render loop
  const smoothedRotation = { x: 0, y: 0 };

  // add option to look at the cubes
  const currentTarget = { lookAtObject: cube };
  const lookTarget = new THREE.Object3D();

  //   gui.add(currentTarget, "lookAtObject", { cube: cube, cube2: cube2 });
  //   gui.onChange((value) => {
  //     // Reset mouse offsets so the new lookAt orientation starts clean
  //     smoothedRotation.x = 0;
  //     smoothedRotation.y = 0;

  //     motionAnimate(
  //       lookTarget.position,
  //       {
  //         x: value.value.position.x,
  //         y: value.value.position.y,
  //         z: value.value.position.z,
  //       },
  //       { duration: 1.5, ease: "easeInOut" },
  //     );
  //   });

  // raycaster to look at the cubes
  const raycaster = new THREE.Raycaster();

  canvas.addEventListener("click", (event) => {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length > 0) {
      motionAnimate(
        lookTarget.position,
        {
          x: intersects[0].object.position.x,
          y: intersects[0].object.position.y,
          z: intersects[0].object.position.z,
        },
        { duration: 1.5, ease: "easeInOut" },
      );
      currentTarget.lookAtObject = intersects[0].object;
    }
  });

  // move camera with mouse
  const mouse = new THREE.Vector2();
  canvas.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
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

  startCameraSmoothing(smoothedRotation, mouse);
  animate(scene, camera, renderer, lookTarget, smoothedRotation);
}

// Pre-allocated objects reused every frame to avoid garbage collection
const _baseQuat = new THREE.Quaternion();
const _yawQuat = new THREE.Quaternion();
const _yawedQuat = new THREE.Quaternion();
const _pitchQuat = new THREE.Quaternion();
const _rightAxis = new THREE.Vector3();
const _worldUp = new THREE.Vector3(0, 1, 0);

/**
 * Render loop — applies mouse offsets using quaternions so that
 * yaw is always around the world up axis and pitch is always
 * around the camera's local right axis, regardless of where the
 * camera is currently looking.
 */
const animate = (scene, camera, renderer, lookTarget, smoothedRotation) => {
  timer.update();

  camera.lookAt(lookTarget.position);

  _baseQuat.copy(camera.quaternion);

  // Yaw: rotate around world Y — horizontal mouse always means left/right
  _yawQuat.setFromAxisAngle(_worldUp, smoothedRotation.y);
  _yawedQuat.copy(_yawQuat).multiply(_baseQuat);

  // Pitch: rotate around the camera's local right axis after yaw is applied
  _rightAxis.set(1, 0, 0).applyQuaternion(_yawedQuat);
  _pitchQuat.setFromAxisAngle(_rightAxis, smoothedRotation.x);

  camera.quaternion.copy(_pitchQuat.multiply(_yawedQuat));

  renderer.render(scene, camera);

  requestAnimationFrame(() =>
    animate(scene, camera, renderer, lookTarget, smoothedRotation),
  );
};

/**
 * Independent loop that continuously lerps smoothedRotation toward the
 * mouse target. Because it runs in its own rAF cycle, the interpolation
 * accumulates smoothly regardless of what the render loop does.
 */
const startCameraSmoothing = (smoothedRotation, mouse) => {
  const smoothingFactor = 0.02;

  const tick = () => {
    smoothedRotation.x = lerp(smoothedRotation.x, mouse.y * 1, smoothingFactor);
    smoothedRotation.y = lerp(
      smoothedRotation.y,
      -mouse.x * 1,
      smoothingFactor,
    );
    requestAnimationFrame(tick);
  };

  tick();
};

/**
 * Linear interpolation between two values.
 * @param {number} x - Start value
 * @param {number} y - End value
 * @param {number} t - Interpolation factor (0–1)
 * @returns {number} Interpolated result
 */
function lerp(x, y, t) {
  return (1 - t) * x + t * y;
}
