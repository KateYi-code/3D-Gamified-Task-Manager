"use client"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { PMREMGenerator } from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import * as THREE from "three";
const loader = new GLTFLoader()

let renderer, camera, scene
function initThree(containerRef){
  scene = new THREE.Scene()

  let ratio = containerRef.current.clientWidth / containerRef.current.clientHeight
  camera = new THREE.PerspectiveCamera(75,ratio,0.1,1000)
  camera.position.z = 30

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
  containerRef.current.appendChild(renderer.domElement)

  const pmremGenerator = new PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  new RGBELoader().load('/scene/NightSkyHDR4K.hdr', (texture) => {
    const envMap = pmremGenerator.fromEquirectangular(texture).texture
    scene.background = envMap
    scene.environment = envMap
    texture.dispose()
    pmremGenerator.dispose()
  })

  return { renderer, camera, scene, controls }
}

async function modelLoader(model, trans){
  let transform = {
    s: trans?.s ?? [1, 1, 1],
    p: trans?.p ?? [0, 0, 0],
    r: trans?.r ?? [0, 0, 0]
  }
  return new Promise(resolve => {
    loader.load(`/3d/${model}`, gltf => {
      const model = gltf.scene
      model.scale.set(...transform.s)
      model.position.set(...transform.p)
      model.rotation.set(...transform.r)
      model.traverse(child => {
        if (child.isMesh) child.receiveShadow = true
      })
      resolve(model)
    })
  })
}


export {modelLoader, initThree}