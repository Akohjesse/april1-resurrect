import './style.css'

import * as THREE from "three"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger)

const clock = new THREE.Clock();

class Scene{
    constructor(model) {
        this.views = [
            { bottom: 0, height: 1 }, 
            { bottom: 0, height: 0},
        ]
        
        this.renderer = new THREE.WebGL1Renderer({
            antialias: true,
            alpha: true
        })

        this.deviceRatio = Math.min(window.devicePixelRatio, 1.5)
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setPixelRatio(this.deviceRatio)
        this.renderer.outputColorSpace = THREE.LinearSRGBColorSpace
        

        document.querySelector('.gl').appendChild(this.renderer.domElement)

        this.scene = new THREE.Scene()
        this.views.forEach((view, i) => {
            let camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 1, 2000)
            camera.position.fromArray([0, 0, 180])
            camera.layers.disableAll()
            camera.layers.enable(i)
            view.camera = camera
            camera.lookAt(new THREE.Vector3(0, 5, 0))
        })
        
        this.light = new THREE.PointLight("white", 0.75)
        this.light.position.z = 200
        this.light.position.x = 0
        this.light.position.y = 100
        this.light.castShadow = true
        this.scene.add(this.light)
    
        this.softLight = new THREE.AmbientLight(0xffffff, 3.5)
        this.scene.add(this.softLight)
    

        this.onResize()
        window.addEventListener('resize', this.onResize, false)

        this.modelGroup = new THREE.Group()

        // initially i was looping with items and not allMesh, in Line 77
        let items = [
            "heRjaHxXLjFJjdt", "QyAWeOpsuVjSyNX", "uBiRabfzjnxHTgu", "PCWEALGjovbBhHe", "BhsXYXYiQBCrRTz",
            "LXhIduNQXQASNBG", "AFbNJKMTxxnUVsS", "ioTXiDtRDpMHGMJ"
        ]

        let allMesh =[]
        model.traverse((child) => {
            if (child.isMesh) {
                allMesh.push(child.name)
            }
        })

        model.name = 'model'
        const watch = new THREE.Group()
        watch.name = 'watch'

        allMesh.forEach((l, i) => {
            let m = model.getObjectByName(l)
            let wireframe = m.clone();
            wireframe.children = []
            m.traverse((mesh) => {
                if (mesh.isMesh) {
                    let edges = new THREE.EdgesGeometry(mesh.geometry)
                    let line = new THREE.LineSegments(edges)
                    line.material.depthTest = false
                    line.material.opacity = 1
                    line.material.lineWidth = 1
                    if (i % 2 === 0) {
                        line.material.color = new THREE.Color("#d3d3d3")
                    }
                    else {
                        line.material.color = new THREE.Color("pink")
                    }
                    line.material.transparent = true
                    line.layers.set(1)
                    wireframe.add(line)
                }
            })
            watch.add(wireframe)
        })

        this.modelGroup.add(watch)
        this.modelGroup.scale.set(17, 17, 17)
        this.modelGroup.rotation.y = -1.3
        this.modelGroup.position.x = 98.4
        this.scene.add(this.modelGroup)
    }

    render =()=>{
        this.views.forEach((view) => {
            let camera = view.camera
            let bottom = Math.floor(this.h * view.bottom)
            let height = Math.floor(this.h * view.height)
            
            this.renderer.setViewport(0, 0, this.w, this.h)
            this.renderer.setScissor(0, bottom, this.w, height)
            this.renderer.setScissorTest(true)
            camera.aspect = this.w / this.h
            this.renderer.render(this.scene, camera)
        })
    }

    onResize = () => {
        let height = document.querySelector('.gl').offsetHeight
        this.w = window.innerWidth
        this.h = height > 200 ? height : window.innerHeight 
        
        this.views.forEach((view) => {
            let camera = view.camera
            camera.aspect = this.w / this.h
            let camZ = (screen.width - (this.w * 1)) / 3
            camera.position.z = height > 1024 ? 180 + (height / 65) : 180
            camera.updateProjectionMatrix()
        })

        this.renderer.setSize(this.w, this.h)
        this.render()
    }
}


function loadModel () {
    let model;
    let manager = new THREE.LoadingManager(() => {
        init(model)
    })
    const gltfloader = new GLTFLoader(manager);
    gltfloader.load("./watch/scene.gltf", (gltf) => {
        model = gltf.scene
    })
}

function init(model) {
    let scene = new Scene(model)
    let all = scene.modelGroup
    let watch = all.getObjectByName('watch')


    gsap.fromTo(scene.views[1],  { height: 1, bottom: 0 } ,{
        height: 0,
        bottom: 1,
        ease: 'none',
        onUpdate: scene.render,
        scrollTrigger: {
          trigger: '.two',
          scrub: true,
          start: 'top bottom',
            end: 'top top'
        }
    })

    let tl = gsap.timeline({
    onUpdate: scene.render,
    scrollTrigger: {
        trigger: ".one",
        scrub: true,
        start: 'top top',
        end: 'bottom bottom"',
    }
});
tl.to(watch.position, { y: -2, z: 10, x: -1.7, ease: 'power1.out' }, 0) 
        .to(watch.rotation, { y: -6.7, ease: 'power1.out' }, 0); 
    
    // you can uncomment the rest of the code as it's not necessary
    // let allMesh = []
    //     watch.traverse((obj) => {
    //         if (obj.isMesh) {
    //             allMesh.push(obj);
    //         }
    //     });
    
    //     allMesh.forEach((mesh) => {
    //         const randomX = Math.random() * 10 - 3; 
    //         const randomY = Math.random() * 10 - 3; 
    //     const randomZ = Math.random() * 10 - 3;
            
    //         gsap.to(mesh.position, {
    //             x: randomX,
    //             y: randomY,
    //             z: randomZ,
    //             duration: 1,
    //             onUpdate: scene.render,
    //             ease: "power1.inOut",
    //             scrollTrigger: {
    //                 trigger: ".two",
    //                 start: 'top top',
    //                 end: 'bottom center'
    //             }
    //         });
    //     });
    
    
    gsap.set(scene.views[1], { height: 1, bottom: 0})

    scene.render()
}


window.onload = () => {
    loadModel()
}