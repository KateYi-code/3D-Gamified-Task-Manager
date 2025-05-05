"use client"
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { canvasResize, createTransparentPreview, initThree, modelLoader, } from "./components/utils.jsx";
let pi = Math.PI
import { gsap } from "gsap"
import { CSSRulePlugin } from "gsap/CSSRulePlugin"

const Planet = () => {
  const containerRef = useRef()
  const cubeRef = useRef()
  const planetRef = useRef()
  const sceneRef = useRef()
  const cameraRef = useRef()
  const rendererRef = useRef()
  const controlsRef = useRef()
  const planetGroupRef = useRef()
  const previewRef = useRef()
  const placedRef = useRef(false)


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

    modelLoader('/decorations/Cliff.glb', {s:[0.5, 0.5, 0.5]}).then(model => {
      scene.add(model)
      model.position.set(0, 16, 0)
      cubeRef.current = model

      previewRef.current = createTransparentPreview(model)
      // previewRef.current.position.set(0, 10, 0)
      scene.add(previewRef.current)
    })

    const light = new THREE.DirectionalLight(0xffffff, 4)
    light.position.set(5, 5, 10)
    scene.add(light)

    modelLoader('Earth.glb', {s:1.2}).then(model => {
      const group = new THREE.Group();
      group.add(model)
      scene.add(group)

      planetGroupRef.current = group
      planetRef.current = model
    })

    const animate = () => {
      requestAnimationFrame(animate)
      renderer.render(scene, camera)
      updatePreviewPosition()
    }
    animate()

    window.addEventListener('resize', () => canvasResize())

    return () => {
      // containerRef.current.removeChild(renderer.domElement)
      renderer.dispose()
    }
  }, [])

  const updatePreviewPosition = () => {
    if (!planetRef.current || !cubeRef.current || !previewRef.current || placedRef.current) return
    const raycaster = new THREE.Raycaster()
    const origin = cubeRef.current.position.clone()
    const direction = new THREE.Vector3(0, 0, 0).sub(origin).normalize()
    raycaster.set(origin, direction)
    const intersects = raycaster.intersectObject(planetRef.current, true)
    if (intersects.length > 0) {
      const point = intersects[0].point
      const normal = intersects[0].face.normal.clone()
      normal.transformDirection(planetRef.current.matrixWorld)
      previewRef.current.position.copy(point)
      const quat = new THREE.Quaternion()
      quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
      previewRef.current.quaternion.copy(quat)
    } else {
      previewRef.current.visible = false
    }
  }

  const placeCubeOnPlanet = () => {
    if (!planetRef.current || !cameraRef.current || !rendererRef.current || !cubeRef.current) return
    const raycaster = new THREE.Raycaster()
    const origin = cubeRef.current.position.clone()
    const direction = new THREE.Vector3(0, 0, 0).sub(origin).normalize()
    raycaster.set(origin, direction)
    const intersects = raycaster.intersectObject(planetRef.current, true)

    if (intersects.length > 0) {
      const point = intersects[0].point
      const normal = intersects[0].face.normal.clone()
      normal.transformDirection(planetRef.current.matrixWorld)

      const targetQuat = new THREE.Quaternion()
      targetQuat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
      cubeRef.current.quaternion.copy(targetQuat)

      if (intersects.length > 0) {
        const point = intersects[0].point
        const normal = intersects[0].face.normal.clone()
        normal.transformDirection(planetRef.current.matrixWorld)

        const targetQuat = new THREE.Quaternion()
        targetQuat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
        gsap.to(cubeRef.current.position, {
          x: point.x,
          y: point.y,
          z: point.z,
          duration: 0.5,
          ease: 'power2.out',
          onComplete: () => {
            planetRef.current.attach(cubeRef.current)
            placedRef.current = true
            previewRef.current.visible = false
          }
        })
      }
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
      if (!dragging.current || dragMode.current !== 'planet' || !planetGroupRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight

      const getArcballVector = (x, y) => {
        let v = new THREE.Vector3(
          2 * (2 * x - width) / width,
          2 * (height - 2 * y) / height,
          0.0
        )
        const lengthSquared = v.x * v.x + v.y * v.y
        if (lengthSquared <= 1.0) {
          v.z = Math.sqrt(1.0 - lengthSquared)
        } else {
          v.normalize()
        }
        return v
      }
      const current = getArcballVector(event.clientX, event.clientY);
      const previous = getArcballVector(lastMouse.current.x, lastMouse.current.y)
      let axis = new THREE.Vector3().crossVectors(previous, current).normalize();
      axis.transformDirection(cameraRef.current.matrixWorld);
      const angle = previous.angleTo(current);
      const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle)
      planetGroupRef.current.quaternion.premultiply(quaternion)
      lastMouse.current = { x: event.clientX, y: event.clientY }
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
    <div className="h-screen-minus-nav">
      <div ref={containerRef} className="w-full h-screen-minus-nav bg-black no-scrollbar flex-1"/>
      {!placed && (
        <div style={{position: 'absolute', bottom: '10%', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.6)', padding: '20px 40px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', zIndex: 10}}>
          <button
            onClick={placeCubeOnPlanet}
            style={{fontSize: 18, padding: '10px 20px', borderRadius: '10px', border: 'none', backgroundColor: '#00aaff', color: '#fff', cursor: 'pointer'}}>
            Place on Planet
          </button>
        </div>
      )}
    </div>
  )
}
export default Planet
