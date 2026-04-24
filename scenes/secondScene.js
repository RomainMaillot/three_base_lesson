import * as THREE from "three";

export default function secondScene() {
  const canvas = document.querySelector(".webgl");
  const scene = new THREE.Scene();
  const axesHelper = new THREE.AxesHelper(2);
  scene.add(axesHelper);

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

  // Modify cube position
  cube.position.x = 1;
  cube.position.y = 1;
  cube.position.z = 1;
  // cube.position.set(1, 1, 1);

  // Modify cube rotation
  cube.rotation.x = Math.PI / 4;
  cube.rotation.y = Math.PI / 4;
  // cube.rotation.set(Math.PI / 4, Math.PI / 4, Math.PI / 4);

  // Modify cube scale
  cube.scale.x = 0.8;
  cube.scale.y = 0.4;
  cube.scale.z = 0.5;
  // cube.scale.set(0.8, 0.4, 0.5);

  scene.add(cube);

  // Create a group of objects
  const group = new THREE.Group();
  group.position.x = -2;
  group.rotation.x = Math.PI / 4;
  // scene.add(group);

  // Add cubes to the group
  const redMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
  const blueMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });
  const leftCube = new THREE.Mesh(geometry, redMaterial);
  leftCube.position.x = -2;
  const rightCube = new THREE.Mesh(geometry, blueMaterial);
  rightCube.position.x = 2;
  const topCube = new THREE.Mesh(geometry, material);
  topCube.position.y = 2;
  group.add(leftCube);
  group.add(rightCube);
  group.add(topCube);

  // Transform the group
  // group.scale.x = 0.5;
  // group.scale.y = 0.5;
  // group.scale.z = 0.5;
  // group.rotation.x = Math.PI / 4;
  // group.rotation.y = Math.PI / 4;
  // group.rotation.z = Math.PI / 4;

  // Modify camera position
  // camera.position.x = 2;
  // camera.position.y = 2;
  // camera.position.z = 2;
  // camera.position.set(5, 5, 5);

  // Modify camera rotation
  // camera.rotation.x = Math.PI / 4;
  // camera.rotation.y = Math.PI / 4;
  // camera.rotation.set(Math.PI / 4, Math.PI / 4, Math.PI / 4);

  // Make camera look at something or the cube
  // camera.lookAt(1, 1, 1);
  // camera.lookAt(cube.position);
  camera.lookAt(group.position);

  const renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.render(scene, camera);
}
