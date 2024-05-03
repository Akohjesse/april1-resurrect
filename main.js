import './style.css'

import * as THREE from "three"
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { Reflector } from "three/examples/jsm/objects/Reflector.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";

let scene, camera, renderer, controls;
let gltfloader = new GLTFLoader();
const clock = new THREE.Clock();
let mixers = [];
let actions = [];

const dLoader = new DRACOLoader();
dLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.6/");
dLoader.setDecoderConfig({ type: "js" });
gltfloader.setDRACOLoader(dLoader);

window.onload = () => {
    init();
    measure();
    // setEnvironment();
    // loadHDRI();
    loadModels();
    render();
  }
  
  function init() { 
    camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 3, 5); 
    camera.lookAt(0, 3, 5);
    
  
    scene = new THREE.Scene();
    scene.add(camera);
    scene.position.y = -2
    
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor("black");
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = .6;
    document.body.appendChild( renderer.domElement );
    setLighting();
  
    // controls = new FirstPersonControls(camera, renderer.domElement);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.update()
    controls.movementSpeed = 1; 
    controls.lookSpeed = 0.09;
  
    controls.autoRotate = true;
    controls.autoRotateSpeed= 1.5
  }

  function setLighting() {
    const ambientLight = new THREE.AmbientLight('white', 4);
    scene.add(ambientLight)
     const directionalLight = new THREE.DirectionalLight('lightblue', 2);
     directionalLight.position.y = 3;
     directionalLight.position.x = -3;
    scene.add(directionalLight);
  }
  
   function measure() {
    const GridHelper = new THREE.GridHelper(50,50);
     scene.add(GridHelper);
     
    //  const axes = new THREE.AxesHelper();
    //  scene.add(axes)

     const reflector1 = new Reflector(new THREE.PlaneGeometry(15, 15), {
      clipBias: 0.009,
      textureWidth: window.innerWidth * window.devicePixelRatio,
       textureHeight: window.innerHeight * window.devicePixelRatio,
  });

 reflector1.position.z = -4
     scene.add(reflector1);

     const reflector2 = new Reflector(new THREE.PlaneGeometry(15, 15), {
      clipBias: 0.009,
      textureWidth: window.innerWidth * window.devicePixelRatio,
       textureHeight: window.innerHeight * window.devicePixelRatio,

  });

     reflector2.position.z = 4
     reflector2.rotation.y= 3.2
     scene.add(reflector2);
     
     

  const plane = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: "black", side: THREE.DoubleSide }));
  plane.position.y = -0.2;
  plane.rotation.x = Math.PI / 2;
  scene.add(plane);
  
   }

function loadModels() {
  gltfloader.load('/crownbounce/scene.gltf', (glb) => {
    let model = glb.scene;
    scene.add(model)
    model.scale.set(1.2, 1.2, 1.2)
    let mixer = new THREE.AnimationMixer(model);
    mixer.timeScale= 1
    mixers.push(mixer)
    const action = mixer.clipAction(glb.animations[0]);
     actions.push(action)

  })

  // gltfloader.load('public/monkey_dancing/scene.gltf', (glb) => {
  //   let model = glb.scene;
  //   scene.add(model)
  //   model.scale.set(0.9, 0.9, 0.9)
  // // model.position.x = 3
  //   let mixer = new THREE.AnimationMixer(model);
  //   mixer.timeScale= 1.2
  //   mixers.push(mixer)
  //   const action = mixer.clipAction(glb.animations[0]);
  //    actions.push(action)

  // })

}
  
   function render() {
    const delta = clock.getDelta();
     controls.update(delta);
     for (let i = 0; i < mixers.length; i++) {
      if (mixers[i]) {
          mixers[i].update(delta);
      }
     }
     setTimeout(() => {
      for (let i = 0; i < actions.length; i++){
          if (actions[i]) {
              actions[i].play()
          }
      }
  }, 2000)
    renderer.render(scene, camera);
    requestAnimationFrame(render)
  }

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight)
})
  
