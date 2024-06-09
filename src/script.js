import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'
import { Timer } from 'three/examples/jsm/Addons.js';
//

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
});

window.addEventListener('dblclick', () => {
    if (!document.fullscreenElement){
        canvas.requestFullscreen()
    } else{
        document.exitFullscreen()
    }
});

// window.addEventListener('keydown', (key) => {
//     if (key == 'h'){
//         gui.show(gui._hidden)
//     }
// });

/**
 * Base
 */
// Debug
const gui = new GUI()
const animationOptions = {
    count: 500,
    animationType: 'wavex'
};
gui.add(animationOptions, 'animationType', ['wavex', 'wavez']).name('Animation Type');

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()
const axesHelper = new THREE.AxesHelper(3)
scene.add(axesHelper)

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const particleTexture = textureLoader.load('./textures/particles/8.png') // alpha

/**
 * Particles
 */
// Geometry
const particlesGeometry = new THREE.BufferGeometry()
// const count = 250 //50000
gui.add(animationOptions, 'count')
gui.add(animationOptions, 'count', 2500, 10000).step(100).name('Particle Count').onChange((value) => {
    createParticles(value);
});

const positions = new Float32Array(animationOptions.count * 3)
const colors = new Float32Array(count * 3)

for(let i = 0; i < count * 3; i++)
{
    positions[i] = (Math.random() - 0.5) * 10 // x, y, z
    colors[i] = Math.random() // RGB
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

// Material
const particlesMaterial = new THREE.PointsMaterial()
particlesMaterial.size = 0.1 // 1 by default
particlesMaterial.sizeAttenuation = true // adding perspective
// particlesMaterial.color = new THREE.Color('#ff88cc')
particlesMaterial.transparent = true // we need this in order to apply the alphaMap:
particlesMaterial.alphaMap = particleTexture
// particlesMaterial.alphaTest = 0.001 // <- (0, 1) enables the WebGL to know when not to render the pixel according to that pixel's transparency.
// particlesMaterial.depthTest = false // <- when drawing, the WebGL tests if what's being drawn is closer than what's already drawn. However, deactivating the 'depth testing' might create bugs if ywe have other objects in our scene of particles with different colors (by adding a simple cube we can see transparency in the cube, seeing this particles...for example).
particlesMaterial.depthWrite = false // <<Whether rendering this material has any effect on the depth buffer. Default is true. When drawing 2D overlays it can be useful to disable the depth writing in order to layer several things together without creating z-index artifacts.>>
particlesMaterial.blending = THREE.AdditiveBlending // <<Which blending to use when displaying objects with this material. Default is NormalBlending .>>
// The WebGL currently draws pixels one of top of the other; with this 'blending' property, we can tell the WebGL to add the color of the pixel already drawn (glowing and some transparency).
// This effect will impact the performances.
particlesMaterial.vertexColors = true // <<Defines whether vertex coloring is used. Default is false.>>

// Points
const particles = new THREE.Points(particlesGeometry, particlesMaterial)
scene.add(particles)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

// Camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 9
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

// ------------------------------------------------------------

/**
 * Animations
 */
// const timer = new Timer()
const clock = new THREE.Clock()
const frame = () =>
{
    // timer.update()
    const elapsedTime = clock.getElapsedTime()
    // const elapsedTime = timer.elapsedTime

    // Updating particles:
    if (animationOptions.animationType === 'wavex') {
        for(let i = 0; i < count; i++){
            let i3 = i * 3 // 0, 3, 6, 9 (each X position)
            // y <- i3 + 1
            // z <- i3 + 2

            const x = particlesGeometry.attributes.position.array[i3]
            const y = particlesGeometry.attributes.position.array[i3 + 1]
            const z = particlesGeometry.attributes.position.array[i3 + 2]
            particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime)
        }
    } else if (animationOptions.animationType === 'wavez') {
        for(let i = 0; i < count; i++){
            let i3 = i * 3 // 0, 3, 6, 9 (each X position)
            // y <- i3 + 1
            // z <- i3 + 2

            const x = particlesGeometry.attributes.position.array[i3]
            const y = particlesGeometry.attributes.position.array[i3 + 1]
            const z = particlesGeometry.attributes.position.array[i3 + 2]
            particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime)
        }
    }
    // for (let i = 0; i < count; i++) {
    //     const i3 = i * 3;
        
    //     // Calculate the angle for spiral movement
    //     const angle = elapsedTime * 0.1 + i * 0.01;
        
    //     // Calculate the spiral path
    //     const radius = 5 + Math.sin(angle * 10) * 0.5;
    //     particlesGeometry.attributes.position.array[i3] = radius * Math.cos(angle);
    //     particlesGeometry.attributes.position.array[i3 + 1] = Math.sin(elapsedTime * 2 + i * 0.1);
    //     particlesGeometry.attributes.position.array[i3 + 2] = radius * Math.sin(angle);
    // }
    particlesGeometry.attributes.position.needsUpdate = true

    controls.update() // updating controls
    renderer.render(scene, camera) // Render
    window.requestAnimationFrame(frame) // calling 'frame' again on the next frame
}
frame() // Nevertheless, if we want to do this kind of animations, we will have to create our own MATERIAL in order to create our own SHADER.