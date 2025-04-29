"use client"
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { initThree, modelLoader } from "./components/utils.jsx";

const Planet = () => {
  const containerRef = useRef()
  const cubeRef = useRef()
  const planetRef = useRef()
  const sceneRef = useRef()
  const cameraRef = useRef()
  const rendererRef = useRef()
  const controlsRef = useRef()
  const planetGroupRef = useRef()


  const [placed, setPlaced] = useState(false)

  const dragging = useRef(false)
  const dragMode = useRef('') // 'planet' or 'scene'
  const lastMouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const { renderer, camera, scene, controls } = initThree(containerRef)
    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    controlsRef.current = controls

    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshPhongMaterial({ color: 0x00aaff })
    const cube = new THREE.Mesh(geometry, material)
    cube.position.set(0, 10, 0)
    cubeRef.current = cube
    scene.add(cube)

    const light = new THREE.DirectionalLight(0xffffff, 4)
    light.position.set(5, 5, 10)
    scene.add(light)

    modelLoader('Earth.glb', {}).then(model => {
      const group = new THREE.Group();
      group.add(model)
      scene.add(group)

      planetGroupRef.current = group
      planetRef.current = model
    })

    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      // containerRef.current.removeChild(renderer.domElement)
      renderer.dispose()
      geometry.dispose()
      material.dispose()
    }
  }, [])

  const placeCubeOnPlanet = () => {
    if (!planetRef.current || !cameraRef.current || !rendererRef.current || !cubeRef.current) return
    const raycaster = new THREE.Raycaster()
    const origin = cubeRef.current.position.clone()
    const direction = new THREE.Vector3(0, 0, 0).sub(origin).normalize()
    raycaster.set(origin, direction)
    const intersects = raycaster.intersectObject(planetRef.current, true)

    if (intersects.length > 0) {
      const point = intersects[0].point
      cubeRef.current.position.copy(point)
      cubeRef.current.lookAt(0, 0, 0)
      planetRef.current.attach(cubeRef.current)

      setPlaced(true)
    } else {
      console.log('No intersection with planet surface.')
    }
  }



  useEffect(() => {
    const dom = containerRef.current

    const onMouseDown = (event) => {
      if (!planetRef.current) return;

      dragging.current = true
      lastMouse.current = { x: event.clientX, y: event.clientY }

      const mouse = new THREE.Vector2()
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, cameraRef.current)

      const intersects = raycaster.intersectObject(planetRef.current, true)

      if (intersects.length > 0) {
        dragMode.current = 'planet'
        if (controlsRef.current) controlsRef.current.enabled = false
      } else {
        dragMode.current = 'scene'
        if (controlsRef.current) controlsRef.current.enabled = true
      }
    }

    const onMouseMove = (event) => {
      if (!dragging.current) return
      const deltaX = event.clientX - lastMouse.current.x
      const deltaY = event.clientY - lastMouse.current.y
      lastMouse.current = { x: event.clientX, y: event.clientY }

      if (dragMode.current === 'planet' && planetGroupRef.current) {
        const deltaRotationQuaternion = new THREE.Quaternion()
          .setFromEuler(new THREE.Euler(
            deltaY * 0.005,
            deltaX * 0.005,
            0,
            'XYZ'
          ));
        planetGroupRef.current.quaternion.multiplyQuaternions(deltaRotationQuaternion, planetGroupRef.current.quaternion);
      }
    }

    const onMouseUp = () => {
      dragging.current = false
      dragMode.current = ''

      if (controlsRef.current) {
        controlsRef.current.enabled = true
      }
    }
    dom.addEventListener('mousedown', onMouseDown)
    dom.addEventListener('mousemove', onMouseMove)
    dom.addEventListener('mouseup', onMouseUp)
    return () => {
      dom.removeEventListener('mousedown', onMouseDown)
      dom.removeEventListener('mousemove', onMouseMove)
      dom.removeEventListener('mouseup', onMouseUp)
    }
  }, [])

  return (
    <>
      <div ref={containerRef} style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }} />
      {!placed && (
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0,0,0,0.6)',
          padding: '20px 40px',
          borderRadius: '15px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          zIndex: 10,
        }}>
          <button
            onClick={placeCubeOnPlanet}
            style={{
              fontSize: 18,
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: '#00aaff',
              color: '#fff',
              cursor: 'pointer'
            }}
          >
            Place on Planet
          </button>
        </div>
      )}
    </>
  )
}
export default Planet
