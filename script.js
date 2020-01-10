import * as THREE from './vendor/three.js-master/build/three.module.js';
import Stats from './vendor/three.js-master/examples/jsm/libs/stats.module.js';
import { OrbitControls } from './vendor/three.js-master/examples/jsm/controls/OrbitControls.js';
import { FBXLoader } from './vendor/three.js-master/examples/jsm/loaders/FBXLoader.js'; 

const Scene = {
    vars: {
        container: null,
        scene: null,
        renderer: null,
        camera: null,
        stats: null,
        controls: null
    },
    init: () => {
        console.log("== init ==");
        let vars = Scene.vars;

        // Preparer le container de la scene
        vars.container = document.createElement('div');
        vars.container.classList.add("fullscreen");
        document.body.appendChild(vars.container); 

        // Création de la scene
        vars.scene = new THREE.Scene();
        vars.scene.background = new THREE.Color(0xa0a0a0);

        // Moteur de rendus
        vars.renderer = new THREE.WebGLRenderer({ antialias: true });
        vars.renderer.setPixelRatio(window.devicePixelRatio);
        vars.renderer.setSize(window.innerWidth, window.innerHeight);

        vars.renderer.shadowMap.enabled = true;
        vars.renderer.shadowMapSoft = true;

        vars.container.appendChild(vars.renderer.domElement);

        // Création de la caméra
        vars.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
        vars.camera.position.set(-1.5, 500, 500);

        // Création de la lumière
        let light = new THREE.HemisphereLight(0xFFFFFF, 0x444444, 0.5);
        light.position.set(0, 700, 0);
        vars.scene.add(light);

        // Création du sol
        let sol = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), new THREE.MeshLambertMaterial({ color: new THREE.Color(0x888888), map: new THREE.TextureLoader().load('./texture/grass.jpg') }));
        sol.rotation.x = -Math.PI / 2;
        sol.receiveShadow = false;
        vars.scene.add(sol); 

        // Grid helper
        let grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        vars.scene.add(grid); 

        // Gestion redimensionnement fenetre
        window.addEventListener('resize', Scene.onWindowResize, false);

        // Stats
        vars.stats = new Stats();
        vars.container.appendChild(vars.stats.dom);

        // Orbit
        vars.controls = new OrbitControls(vars.camera, vars.renderer.domElement);
        vars.controls.target.set(0, 100, 0);
        vars.controls.enablePan = false;

        vars.controls.minPolarAngle = -Math.PI / 2;
        vars.controls.maxPolarAngle = Math.PI / 2;
        
        // vars.controls.maxAzimuthAngle = Math.PI / 4;
        // vars.controls.minAzimuthAngle = -Math.PI / 4;

        vars.controls.minDistance = 300;
        vars.controls.maxDistance = 3000;
       //vars.controls.autoRotate = true;


    },
    onWindowResize: () => {
        let vars = Scene.vars;
        vars.camera.aspect = window.innerWidth / window.innerHeight;
        vars.camera.updateProjectionMatrix();
        vars.renderer.setSize(window.innerWidth, window.innerHeight);
    },
    render: () => {
        Scene.vars.renderer.render(Scene.vars.scene, Scene.vars.camera);
        Scene.vars.controls.update(); 
        Scene.vars.stats.update();
    },
    animate: () => {
        requestAnimationFrame(Scene.animate);
        Scene.render();
    }
};

Scene.init(); 
Scene.animate();