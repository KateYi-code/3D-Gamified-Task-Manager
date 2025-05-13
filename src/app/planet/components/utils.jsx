"use client"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { PMREMGenerator } from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import * as THREE from "three"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { AVAILABLE_MODELS } from "./available_models"
const gltfLoader = new GLTFLoader()
const fbxLoader = new FBXLoader()

let renderer, camera, scene
let cRef

function initThree(containerRef){
  scene = new THREE.Scene()
  cRef = containerRef

  let ratio = containerRef.current.clientWidth / containerRef.current.clientHeight
  camera = new THREE.PerspectiveCamera(50,ratio,0.1,2000)
  camera.position.z = 30
  camera.position.y = 15
  // camera.lookAt(new THREE.Vector3(99, 99, 99))
  // scene.add(camera)

  // const axesHelper = new THREE.AxesHelper(1500)
  // scene.add(axesHelper)

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance",
    precision: "highp"
  })
  renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight - 0.4)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  containerRef.current.appendChild(renderer.domElement)

  const pmremGenerator = new PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  const mainLight = new THREE.DirectionalLight(0xffffff, 2.5)
  mainLight.position.set(50, 50, 50)
  mainLight.castShadow = true
  mainLight.shadow.mapSize.width = 4096
  mainLight.shadow.mapSize.height = 4096
  mainLight.shadow.camera.near = 0.5
  mainLight.shadow.camera.far = 500
  mainLight.shadow.camera.left = -50
  mainLight.shadow.camera.right = 50
  mainLight.shadow.camera.top = 50
  mainLight.shadow.camera.bottom = -50
  mainLight.shadow.bias = -0.0001
  mainLight.shadow.normalBias = 0.02
  mainLight.shadow.radius = 2
  scene.add(mainLight)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
  ambientLight.position.set(0, -10, 0)
  scene.add(ambientLight)

  const fillLight = new THREE.DirectionalLight(0xffffff, 1.5)
  fillLight.position.set(-50, 30, -50)
  fillLight.castShadow = true
  fillLight.shadow.mapSize.width = 2048
  fillLight.shadow.mapSize.height = 2048
  fillLight.shadow.bias = -0.0001
  fillLight.shadow.normalBias = 0.02
  fillLight.shadow.radius = 2
  scene.add(fillLight)

  return { renderer, camera, scene, controls }
}

async function modelLoader(modelPath, trans) {
  const extension = modelPath.split('.').pop().toLowerCase()
  const transform = {
    s: trans?.s ? ((typeof trans.s == 'number')?[trans.s,trans.s,trans.s]:trans.s):[1, 1, 1],
    p: trans?.p ?? [0, 0, 0],
    r: trans?.r ?? [0, 0, 0]
  }

  return new Promise((resolve, reject) => {
    const onLoad = (loaded) => {
      const model = extension === 'fbx' ? loaded : loaded.scene
      model.scale.set(...transform.s)
      model.position.set(...transform.p)
      model.rotation.set(...transform.r)
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true
          child.receiveShadow = true
          if (child.material) {
            child.material.shadowSide = THREE.FrontSide
          }
        }
      })
      resolve(model)
    }

    const onError = (e) => {
      console.error(`Error loading model: ${modelPath}`, e)
      reject(e)
    }

    if (extension === 'glb' || extension === 'gltf') {
      gltfLoader.load(`/3d/${modelPath}`, onLoad, undefined, onError)
    } else if (extension === 'fbx') {
      fbxLoader.load(`/3d/${modelPath}`, onLoad, undefined, onError)
    } else {
      reject(new Error(`Unsupported model format: ${extension}`))
    }
  })
}

function createTransparentPreview(model, opacity = 0.83) {
  const clone = model.clone()
  clone.traverse(child => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone()
      child.material.transparent = true
      child.material.opacity = opacity
      child.renderOrder = 1
      child.castShadow = true
      child.receiveShadow = true
    }
  })
  return clone
}

function canvasResize(){
  const width = cRef.current.clientWidth
  const height = cRef.current.clientHeight - 0.4
  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
  
  if (renderer && renderer.domElement) {
    const material = renderer.domElement._backgroundMaterial
    if (material && material.uniforms) {
      material.uniforms.resolution.value.set(width, height)
    }
  }
}

function createGradientBackground(containerRef) {
  const geometry = new THREE.PlaneGeometry(2, 2)
  const material = new THREE.ShaderMaterial({
    uniforms: {
      colorCenter: { value: new THREE.Color(0x0909AB) },
      colorEdge: { value: new THREE.Color(0x030356) },
      resolution: { value: new THREE.Vector2(containerRef.current.clientWidth, containerRef.current.clientHeight) }
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 colorCenter;
      uniform vec3 colorEdge;
      uniform vec2 resolution;
      varying vec2 vUv;

      void main() {
        vec2 center = vec2(0.5, 0.5);
        float dist = distance(vUv, center);
        vec3 color = mix(colorCenter, colorEdge, smoothstep(0.0, 0.7, dist));
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    depthWrite: false,
    depthTest: false,
    side: THREE.DoubleSide
  })
  const mesh = new THREE.Mesh(geometry, material)
  const backgroundScene = new THREE.Scene()
  const backgroundCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)
  backgroundScene.add(mesh)

  return { backgroundScene, backgroundCamera, material }
}


function createStarField(count = 1000, radius = 1000) {
  const geometry = new THREE.BufferGeometry()
  const positions = []
  const sizes = []

  for (let i = 0; i < count; i++) {
    const theta = THREE.MathUtils.randFloat(0, 2 * Math.PI)
    const phi = THREE.MathUtils.randFloat(0, Math.PI)
    const r = radius

    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.sin(phi) * Math.sin(theta)
    const z = r * Math.cos(phi)

    positions.push(x, y, z)
    sizes.push(THREE.MathUtils.randFloat(4.5, 7.5))
  }

  for (let i = 0; i < 50; i++) {
    const x = THREE.MathUtils.randFloatSpread(radius * 0.8)
    const y = THREE.MathUtils.randFloatSpread(radius * 0.8)
    const z = THREE.MathUtils.randFloatSpread(radius * 0.8)
    positions.push(x, y, z)
    sizes.push(THREE.MathUtils.randFloat(6.0, 9.0))
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1))

  const material = new THREE.ShaderMaterial({
    uniforms: {
      color: { value: new THREE.Color(0xffffff) }
    },
    vertexShader: `
      attribute float size;
      varying float vSize;
      void main() {
        vSize = size;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 color;
      void main() {
        float dist = distance(gl_PointCoord, vec2(0.5));
        if (dist > 0.5) discard;
        gl_FragColor = vec4(color, 1.0);
      }
    `,
    transparent: true,
    depthWrite: false
  })

  const stars = new THREE.Points(geometry, material)
  stars.renderOrder = -1
  return stars
}


export {modelLoader, initThree, createTransparentPreview, canvasResize, createGradientBackground, createStarField, AVAILABLE_MODELS}