import firstScene from "./scenes/firstScene.js";
import secondScene from "./scenes/secondScene.js";
import animationScene from "./scenes/animation.js";
import controlsScene from "./scenes/controls.js";
import animationLookAt from "./scenes/animationLookAt.js";
import raycaster from "./scenes/raycaster.js";
import lights from "./scenes/lights.js";
import navigation from "./scenes/navigation.js";
import importObject from "./scenes/importObject.js";
import lightsAndTextures from "./scenes/lightsAndTextures.js";
import importModel from "./scenes/importModel.js";
import performance from "./scenes/performance.js";
import loading from "./scenes/loading.js";

/**
 * Keep only one scene call active at a time.
 * Imports alone do not run a scene: only the function call does.
 */
// --- Cours 1 scenes ---
// firstScene();
// secondScene();
// animationScene();
// controlsScene();
// animationLookAt();
// raycaster();
// lights();
// navigation();
// importObject();

// --- Cours 3 scenes ---
// lightsAndTextures();
// importModel();

// --- Cours 4 scenes ---
// performance();
// Active scene for this demo:
loading();
