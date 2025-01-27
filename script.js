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
        controls: null,
        mouse: new THREE.Vector2(),
        raycaster: new THREE.Raycaster(),
        animSpeed: 0,
        animPercent: 0.00,
        lightLamp: null,
        listener: null,
        sounds: [],
        soundIndex: 0
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
        vars.scene.background = new THREE.Color(0xFAFFC6);

        // Moteur de rendus
        vars.renderer = new THREE.WebGLRenderer({ antialias: true });
        vars.renderer.setPixelRatio(window.devicePixelRatio);
        vars.renderer.setSize(window.innerWidth, window.innerHeight);

        vars.renderer.shadowMap.enabled = true;
        vars.renderer.shadowMapSoft = true;

        vars.container.appendChild(vars.renderer.domElement);

        // Création de la caméra
        vars.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 5000);
        vars.camera.position.set(-1.5, 1800, 2075);


        // Création de la lumière
        let lightGlobal = new THREE.HemisphereLight(0xFFFFFF, 0x444444, 0.75);
        lightGlobal.position.set(0, 700, 0);
        vars.scene.add(lightGlobal);

        let d = 1000;

        vars.lightLamp = new THREE.SpotLight(0xF0BB2C, 0, 0, Math.PI / 4);
        vars.lightLamp.position.set(370, 700, -160);

        vars.lightLamp.castShadow = true;
        vars.lightLamp.shadow.camera.left = -d;
        vars.lightLamp.shadow.camera.right = d;
        vars.lightLamp.shadow.camera.bottom = -d;
        vars.lightLamp.shadow.camera.top = d;
        vars.lightLamp.shadow.camera.far = 2000;
        vars.lightLamp.shadow.mapSize.width = 4096;
        vars.lightLamp.shadow.mapSize.height = 4096;

        vars.scene.add(vars.lightLamp.target);
        vars.lightLamp.target.position.x = 0;
        vars.lightLamp.target.position.y = 0;
        vars.lightLamp.target.position.z = -10;
        vars.scene.add(vars.lightLamp);


        //let helperLamp = new THREE.SpotLightHelper(vars.lightLamp, 5);
        //vars.scene.add(helperLamp);


        // Création du sol
        var groundTexture = new THREE.TextureLoader().load( './texture/wood.jpg' );
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        var groundMaterial = new THREE.MeshLambertMaterial( { map: groundTexture } );

        let sol = new THREE.Mesh(new THREE.PlaneBufferGeometry(3000, 2000), groundMaterial );
        sol.rotation.x = -Math.PI / 2;
        sol.receiveShadow = false;
        vars.scene.add(sol);

        let planeMaterial = new THREE.ShadowMaterial();
        planeMaterial.opacity = 0.07;
        let shadowPlane = new THREE.Mesh(new THREE.PlaneBufferGeometry(2000, 2000), planeMaterial);
        shadowPlane.rotation.x = -Math.PI / 2;
        shadowPlane.receiveShadow = true;
        vars.scene.add(shadowPlane);

        // Grid helper
        // let grid = new THREE.GridHelper(2000, 20, 0x000000, 0x000000);
        // grid.material.opacity = 0.2;
        // grid.material.transparent = true;
        // vars.scene.add(grid);

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

        vars.controls.minDistance = 300;
        vars.controls.maxDistance = 3000;
        //vars.controls.autoRotate = true;


        //Chargement des objets
        Scene.loadFBX("./models/radio/radio.FBX", 1, [-500, 110, -500], [0, -Math.PI / 3, 0], null, "radio", () => {
            Scene.loadFBX("./models/clipboard.FBX", 60, [0, 100, 850], [0, 0, 0], 0xFFFFFF, "notepad", () => {
                Scene.loadFBX("./models/lamp/lamp.FBX", 1.5, [520, 0, -410], [0, Math.PI / 4, 0], 0xF52323, "lamp", () => {
                    Scene.loadFBX("./models/mug.FBX", 1.25, [-260, 2, -200], [0, 0, 0], 0xFEB900, "mug", () => {
                        Scene.loadFBX("./models/pen.FBX", 1, [0, 250, 0], [Math.PI / 2, 0, 0], 0xFFFF00, "pen1", () => {
                            Scene.loadFBX("./models/eraser.FBX", 40, [500, -20, 200], [0, -Math.PI / 3, 0], 0xFFFF00, "eraser", () => {
                                Scene.loadFBX("./models/fishFBX/fishFBX.FBX", 30, [-470, 400, -1450], [0, 0, 0], null, "fish", () => {
                                    Scene.loadAudio("./sounds/swCantina.mp3", true, () => {
                                        Scene.loadAudio("./sounds/dbzOP.mp3", true, () => {
                                            Scene.loadAudio("./sounds/theWitcher.mp3", true, () => {
                                                Scene.loadAudio("./sounds/zeldaTheme.mp3", true, () => {
                                                    Scene.loadText("Ce serait \nbien d'avoir \nau moins \n15/20 stp :'(", 5, [0, 35, 470], [-Math.PI / 2, 0, 0], 0x1A1A1A, "texte", () => {
                                                        Scene.loadText("STOP", 5, [-550, 100, -570], [0, 7 * Math.PI / 6, 0], 0xFF0000, "texteStop", () => {
                                                            //Clonage
                                                            let pen2 = Scene.vars.pen1.clone();
                                                            pen2.position.x = -60;
                                                            pen2.rotation.y = Math.PI / 4;
                                                            Scene.vars.pen2 = pen2;

                                                            let pen3 = Scene.vars.pen1.clone();
                                                            pen3.position.x = 60;
                                                            pen3.rotation.y = -Math.PI / 4;
                                                            Scene.vars.pen3 = pen3;

                                                            let penNote = Scene.vars.pen1.clone();

                                                            penNote.rotation.x = 0;
                                                            penNote.rotation.y = 0;
                                                            penNote.position.x = 400;
                                                            penNote.position.y = 0;
                                                            penNote.position.z = 500;


                                                            //PEN CUP
                                                            let penCup = new THREE.Group();
                                                            penCup.add(Scene.vars.mug);
                                                            penCup.add(Scene.vars.pen1);
                                                            penCup.add(pen2);
                                                            penCup.add(pen3);
                                                            vars.scene.add(penCup);

                                                            penCup.position.x = -700;
                                                            penCup.position.y = 0;
                                                            penCup.position.z = 150;
                                                            Scene.vars.penCupGroup = penCup;

                                                            //NOTE
                                                            Scene.vars.penNote = penNote;
                                                            vars.scene.add(penNote);
                                                            vars.scene.add(Scene.vars.notepad);

                                                            //NO GROUP
                                                            vars.scene.add(Scene.vars.radio);
                                                            vars.scene.add(Scene.vars.lamp);
                                                            Scene.vars.texte.visible = false;
                                                            vars.scene.add(Scene.vars.texte);
                                                            vars.scene.add(Scene.vars.eraser);
                                                            vars.scene.add(Scene.vars.fish);
                                                            vars.scene.add(Scene.vars.texteStop);

                                                            console.log("== finish loading ==");
                                                            document.querySelector('#loading').remove();
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

        //Ajout animation
        window.addEventListener('mousedown', Scene.onMouseDown, false);
        window.addEventListener('mousemove', Scene.onMouseMove, false);

        //Ajout sons
        vars.listener = new THREE.AudioListener();
        vars.camera.add(vars.listener);

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

        Scene.vars.raycaster.setFromCamera(Scene.vars.mouse, Scene.vars.camera);
        if (Scene.vars.penCupGroup !== undefined) {

            let intersects = Scene.vars.raycaster.intersectObjects(Scene.vars.penCupGroup.children, true);

            if (intersects.length > 0) {
                Scene.vars.animSpeed = 0.05;
            }
            else {
                Scene.vars.animSpeed = -0.05;
            }
            Scene.customAnimation();
        }

        Scene.render();
    },
    customAnimation: () => {
        let vars = Scene.vars;

        if (vars.animSpeed === null) {
            return;
        }

        vars.animPercent += vars.animSpeed;

        if (vars.animPercent < 0) {
            vars.animPercent = 0;
        }
        if (vars.animPercent > 1) {
            vars.animPercent = 1;
        }

        if (vars.animPercent > 0 && vars.animPercent < 1) {
            vars.pen1.position.y = 250 + (vars.animPercent * 200);
        } else if (vars.animPercent >= 1) {
            vars.pen1.position.y = 250 + 200;
        }
        else if (vars.animPercent <= 0) {
            vars.pen1.position.y = 250;
        }


    },
    onMouseMove: (event) => {
        Scene.vars.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        Scene.vars.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    },
    onMouseDown: (event) => {
        Scene.vars.raycaster.setFromCamera(Scene.vars.mouse, Scene.vars.camera);

        if (Scene.vars.lamp !== undefined && Scene.vars.penNote !== undefined
            && Scene.vars.radio !== undefined && Scene.vars.eraser !== undefined
            && Scene.vars.fish !== undefined) {

            let mouse = new THREE.Vector3(Scene.vars.mouse.x, Scene.vars.mouse.y, 0);
            mouse.unproject(Scene.vars.camera);

            let ray = new THREE.Raycaster(Scene.vars.camera.position, mouse.sub(Scene.vars.camera.position).normalize());

            //Animation lampe
            let intersectsLamp = ray.intersectObjects(Scene.vars.lamp.children, true);
            if (intersectsLamp.length > 0) {
                switch (Scene.vars.lightLamp.intensity) {
                    case 0:
                        Scene.vars.lightLamp.intensity = 1;
                        break;
                    case 1:
                        Scene.vars.lightLamp.intensity = 2;
                        break;
                    case 2:
                        Scene.vars.lightLamp.intensity = 3;
                        break;
                    case 3:
                        Scene.vars.lightLamp.intensity = 0;
                        break;
                }

                // var arrow = new THREE.ArrowHelper(ray.ray.direction, ray.ray.origin, 1000, 0xFF00000);
                // Scene.vars.scene.add(arrow);
            }

            //Animation notepad
            let intersectsPenNote = ray.intersectObjects(Scene.vars.penNote.children, true);
            if (intersectsPenNote.length > 0) {
                //Début de tentative échouée
                // Scene.vars.animPercent = 0;
                // Scene.vars.animSpeed = 0.05;
                // Scene.animationPen();

                Scene.vars.texte.visible = true;
            }
            let intersectsEraser = ray.intersectObjects(Scene.vars.eraser.children, true);
            if (intersectsEraser.length > 0) {
                Scene.vars.texte.visible = false;
            }

            //Sons radio
            let intersectsRadio = ray.intersectObjects(Scene.vars.radio.children, true);
            if (intersectsRadio.length > 0) {

                if (Scene.vars.soundIndex === Scene.vars.sounds.length - 1) {
                    Scene.vars.sounds[Scene.vars.soundIndex].pause();
                    Scene.vars.soundIndex = 0;
                }
                else {
                    if (Scene.vars.sounds[Scene.vars.soundIndex].isPlaying) {
                        Scene.vars.sounds[Scene.vars.soundIndex].pause();
                        Scene.vars.soundIndex += 1;
                        Scene.vars.sounds[Scene.vars.soundIndex].play();
                    } else {
                        Scene.vars.sounds[Scene.vars.soundIndex].play();
                    }

                }
            }

            let intersectsStopRadio = ray.intersectObjects([Scene.vars.fish], true);
            if (intersectsStopRadio.length > 0) {
                Scene.vars.sounds[Scene.vars.soundIndex].pause();
            }

        }

    },
    animationPen: () => {
        //Toujours la tentative ratée
    //     while (Scene.vars.animPercent <= 1) {

    //         if (Scene.vars.penNote.position.y < 300) {
    //             Scene.vars.penNote.position.y += 1;
    //         }
    //         else if (Scene.vars.penNote.rotation.y !== 0) {
    //             Scene.vars.penNote.rotation.y = 0;
    //             Scene.vars.penNote.position.x = -100;
    //             Scene.vars.penNote.position.z = 100;
    //             Scene.vars.penNote.position.x = 500;
    //         }


    //         console.log(Scene.vars.animPercent)
    //         Scene.vars.animPercent += 0.0005;
    //     }

    },
    loadFBX: (file, scale, position, rotation, color, name, callback) => {
        let loader = new FBXLoader();

        loader.load(file, (model) => {
            model.traverse(node => {
                if (node.isMesh) {
                    node.receiveShadow = true;
                    node.castShadow = true;
                    if (color !== null) {
                        node.material.color = new THREE.Color(color);
                    }
                }
            });

            model.position.set(position[0], position[1], position[2]);
            model.rotation.set(rotation[0], rotation[1], rotation[2]);
            model.color = color;
            model.scale.set(scale, scale, scale);
            model.name = name;
            Scene.vars[name] = model;
            callback();

        });
    },
    loadAudio: (file, infini, callback) => {
        let audioLoader = new THREE.AudioLoader();
        audioLoader.load(file, function (buffer) {
            console.log("== ready for audio ==");
            let audio = new THREE.Audio(Scene.vars.listener);

            audio.setBuffer(buffer);
            audio.setLoop(infini);
            audio.setVolume(0.5);

            Scene.vars.sounds.push(audio);
            callback();
        });
    },
    loadText: (text, scale, position, rotation, color, namespace, callback) => {
        let loader = new THREE.FontLoader();

        if (text === undefined || text === "") {
            return;
        }

        loader.load('./vendor/three.js-master/examples/fonts/helvetiker_regular.typeface.json', (font) => {

            let geometry = new THREE.TextGeometry(text, {
                font,
                size: 10,
                height: 1,
                curveSegments: 1,
                bevelEnabled: false
            });

            geometry.computeBoundingBox();
            let offset = geometry.boundingBox.getCenter().negate();
            geometry.translate(offset.x, offset.y, offset.z);

            let material = new THREE.MeshBasicMaterial({
                color: new THREE.Color(color)
            });

            let mesh = new THREE.Mesh(geometry, material);


            mesh.position.set(position[0],position[1],position[2]);
            mesh.rotation.set(rotation[0],rotation[1],rotation[2]);

            mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;

            Scene.vars[namespace] = mesh;

            callback();
        });
    },

};

Scene.init();
Scene.animate();