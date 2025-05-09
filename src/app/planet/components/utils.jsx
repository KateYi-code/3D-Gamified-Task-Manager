"use client"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { PMREMGenerator } from 'three'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import * as THREE from "three"
const loader = new GLTFLoader()

let renderer, camera, scene
let cRef

function initThree(containerRef){
  scene = new THREE.Scene()
  cRef = containerRef

  const axesHelper = new THREE.AxesHelper(1500)
  scene.add(axesHelper)

  let ratio = containerRef.current.clientWidth / containerRef.current.clientHeight
  camera = new THREE.PerspectiveCamera(75,ratio,0.1,1000)
  camera.position.z = 30
  camera.position.y = 15


  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight - 0.4)
  containerRef.current.appendChild(renderer.domElement)

  const pmremGenerator = new PMREMGenerator(renderer)
  pmremGenerator.compileEquirectangularShader()

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // scene.environment = null
  // scene.background = new THREE.Color(0x000022)

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
  ambientLight.position.set(0, -10, 0)
  scene.add(ambientLight)
  // const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
  // directionalLight.position.set(0, -10, 0)
  // scene.add(directionalLight)

  // new RGBELoader().load('/scene/NightSkyHDR4K.hdr', (texture) => {
  //   const envMap = pmremGenerator.fromEquirectangular(texture).texture
  //   scene.background = envMap
  //   scene.environment = envMap
  //   texture.dispose()
  //   pmremGenerator.dispose()
  // })

  return { renderer, camera, scene, controls }
}

async function modelLoader(model, trans){
  let transform = {
    s: trans?.s ? ((typeof trans.s == 'number')?[trans.s,trans.s,trans.s]:trans.s):[1, 1, 1],
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
      // model.traverse((child) => {
      //   if (child.isMesh) {
      //     console.log(child.name, child.geometry.attributes.position.count, child.material);
      //   }
      // })
      resolve(model)
    })
  })
}

function createTransparentPreview(model, opacity = 0.4) {
  const clone = model.clone()
  clone.traverse(child => {
    if (child.isMesh && child.material) {
      child.material = child.material.clone()
      child.material.transparent = true
      child.material.opacity = opacity
      child.renderOrder = 1
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
}

function createGradientBackground(containerRef) {
  const geometry = new THREE.PlaneGeometry(2, 2)
  const material = new THREE.ShaderMaterial({
    uniforms: {
      colorCenter: { value: new THREE.Color(0x0909AB) }, // 中心偏蓝
      colorEdge: { value: new THREE.Color(0x030356) }    // 边缘接近黑
    },
    vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 colorCenter;
      uniform vec3 colorEdge;

      void main() {
        vec2 uv = gl_FragCoord.xy / vec2(${containerRef.current.clientWidth}, ${containerRef.current.clientHeight});
        float dist = distance(uv, vec2(0.5));
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
  const backgroundCamera = new THREE.PerspectiveCamera()
  backgroundScene.add(mesh)

  return { backgroundScene, backgroundCamera }
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

export {modelLoader, initThree, createTransparentPreview, canvasResize, createGradientBackground, createStarField}