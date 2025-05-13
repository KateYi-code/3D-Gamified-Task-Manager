"use client"
import { useEffect, useRef, useState, Suspense } from 'react'
import * as THREE from 'three'
import {
  AVAILABLE_MODELS,
  canvasResize,
  createGradientBackground,
  createStarField,
  createTransparentPreview,
  initThree,
  modelLoader,
} from "./components/utils.jsx"
import { gsap } from "gsap"
import { useAuth } from "../../providers/auth-provider"
import { client } from "../../endpoints/client"
import { useParams, useSearchParams } from 'next/navigation'


const PlanetContent = () => {
  const searchParams = useSearchParams()
  const addModel = searchParams.get('add')
  const viewUserId = addModel ? null : searchParams.get('user')
  // console.log(viewUserId)


  const { user, loading } = useAuth()
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
  const hasLoadedRef = useRef(false)
  const objectsRef = useRef(new Map())

  const [placed, setPlaced] = useState(false)
  const [error, setError] = useState(null)
  const [viewUser, setViewUser] = useState(null)
  const [targetUserId, setTargetUserId] = useState(null)

  const dragging = useRef(false)
  const dragMode = useRef('')
  const lastMouse = useRef({ x: 0, y: 0 })

  const [height, setHeight] = useState(0)
  const [scale, setScale] = useState(0.5)
  const [rotation, setRotation] = useState(0)

  const [isControlsExpanded, setIsControlsExpanded] = useState(false)

  useEffect(() => {
    if (viewUserId && viewUserId !== user?.id) {
      setTargetUserId(viewUserId)
      client.unauth.getUserById(viewUserId).then(userData => {
        setViewUser(userData)
        // console.log(user.id,viewUserId)
      }).catch(err => {
        console.error('Failed to load user data',err)
        setError('Failed to load user data')
      })
    }else {
      setTargetUserId(user?.id)
    }
  }, [viewUserId, user])

  const loadSavedObjects = async () => {
    try {
      setTargetUserId(viewUserId || user.id)
      let targetUserId = viewUserId || user.id
      let objects = await client.authed.getPlanetObjects(targetUserId)
      for (const obj of objects) {
        const scaleFactor = obj.scale_factor || 1
        const model = await modelLoader(obj.modelPath, {
          s: [scaleFactor, scaleFactor, scaleFactor]
        })

        model.position.set(obj.position.x, obj.position.y, obj.position.z)
        
        if (obj.height) {
          const normal = new THREE.Vector3(0, 1, 0)
          const heightOffset = normal.multiplyScalar(obj.height)
          model.position.add(heightOffset)
        }

        if (obj.rotation) {
          model.quaternion.set(obj.rotation.x, obj.rotation.y, obj.rotation.z, obj.rotation.w)
          
          if (obj.rotation_angle) {
            const normal = new THREE.Vector3(0, 1, 0)
            const rotationQuat = new THREE.Quaternion().setFromAxisAngle(normal, obj.rotation_angle)
            model.quaternion.multiply(rotationQuat)
          }
        }

        planetGroupRef.current.add(model)
        objectsRef.current.set(obj.id, model)
      }
    } catch (error) {
      console.error('Failed to load saved objects:', error)
    }
  }

  useEffect(() => {
    if (!user || loading) return
    if (hasLoadedRef.current) return
    if (addModel && !AVAILABLE_MODELS.includes(addModel)) {
      setError('Invalid model name')
      return
    }
    hasLoadedRef.current = true

    const { renderer, camera, scene, controls } = initThree(containerRef)
    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    controlsRef.current = controls

    if (addModel) {
      modelLoader(`/decorations/${addModel}`, {s:[scale, scale, scale]}).then(model => {
        scene.add(model)
        model.position.set(0, 13, 0)
        const centerToPoint = new THREE.Vector3(0, 1, 0).normalize()
        const baseQuat = new THREE.Quaternion()
        baseQuat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), centerToPoint)
        model.quaternion.copy(baseQuat)
        
        const rotationQuat = new THREE.Quaternion().setFromAxisAngle(centerToPoint, rotation)
        model.quaternion.multiply(rotationQuat)
        
        // Make sure the model is transparent
        model.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = true
            child.material.opacity = 0.4
            child.material.needsUpdate = true
          }
        })
        
        cubeRef.current = model

        previewRef.current = createTransparentPreview(model)
        scene.add(previewRef.current)
        updatePreviewPosition()
      })
    }

    modelLoader('Earth.glb', {s:1}).then(model => {
      const group = new THREE.Group()
      group.add(model)
      scene.add(group)

      model.traverse((child) => {
        if (child.isMesh) {
          child.receiveShadow = true
          if (child.material) {
            child.material.shadowSide = THREE.FrontSide
          }
        }
      })

      planetGroupRef.current = group
      planetRef.current = model
    })
    loadSavedObjects().then(r => {})

    const stars = createStarField()
    scene.add(stars)
    const { backgroundScene, backgroundCamera, material } = createGradientBackground(containerRef)
    renderer.domElement._backgroundMaterial = material

    const animate = () => {
      requestAnimationFrame(animate)
      renderer.autoClear = false
      renderer.clear()
      renderer.render(backgroundScene, backgroundCamera)
      renderer.render(scene, camera)
      if (addModel) {
        updatePreviewPosition()
      }
    }
    animate()

    window.addEventListener('resize', () => canvasResize())

    return () => {
      renderer.dispose()
    }
  }, [user, loading, addModel])

  useEffect(() => {
    if (!addModel || !cubeRef.current || !previewRef.current) return

    let animationFrameId
    let time = 0
    const updatePreview = () => {
      previewRef.current.scale.set(scale, scale, scale)
      cubeRef.current.scale.set(scale, scale, scale)
      
      updatePreviewPosition()

      if (cubeRef.current) {
        const centerToPoint = new THREE.Vector3(0, 1, 0).normalize()
        const baseQuat = new THREE.Quaternion()
        baseQuat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), centerToPoint)
        cubeRef.current.quaternion.copy(baseQuat)
        
        const rotationQuat = new THREE.Quaternion().setFromAxisAngle(centerToPoint, rotation)
        cubeRef.current.quaternion.multiply(rotationQuat)

        //breathing effect with more pronounced changes
        time += 0.02
        const opacity = 0.8 + Math.sin(time) * 0.3
        cubeRef.current.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.transparent = true
            child.material.opacity = opacity
            child.material.needsUpdate = true
          }
        })
      }
      
      animationFrameId = requestAnimationFrame(updatePreview)
    }

    animationFrameId = requestAnimationFrame(updatePreview)

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [height, scale, rotation, addModel])

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

      const basePoint = point.clone()
      previewRef.current.position.copy(basePoint)

      const centerToPoint = point.clone().normalize()
      
      const baseQuat = new THREE.Quaternion()
      baseQuat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), centerToPoint)
      previewRef.current.quaternion.copy(baseQuat)

      const heightOffset = normal.clone().multiplyScalar(height)
      previewRef.current.position.add(heightOffset)

      const rotationQuat = new THREE.Quaternion().setFromAxisAngle(centerToPoint, rotation)
      previewRef.current.quaternion.multiply(rotationQuat)

      previewRef.current.visible = true
    } else {
      previewRef.current.visible = false
    }
  }

  const saveObjectPosition = async (model, modelPath, additionalProps = {}) => {
    try {
      const relativePosition = model.position.clone()
      const relativeQuaternion = model.quaternion.clone()
      const relativeScale = model.scale.clone()

      const objectData = {
        modelPath,
        position: {
          x: relativePosition.x,
          y: relativePosition.y,
          z: relativePosition.z
        },
        rotation: {
          x: relativeQuaternion.x,
          y: relativeQuaternion.y,
          z: relativeQuaternion.z,
          w: relativeQuaternion.w
        },
        scale: {
          x: relativeScale.x,
          y: relativeScale.y,
          z: relativeScale.z
        },
        height: additionalProps.height || 0,
        scale_factor: additionalProps.scale || 1,
        rotation_angle: additionalProps.rotation || 0
      }

      await client.authed.savePlanetObject(objectData)
    } catch (error) {
      console.error('Failed to save object position:', error)
    }
  }

  const placeCubeOnPlanet = async () => {
    if (!planetRef.current || !cameraRef.current || !rendererRef.current || !cubeRef.current || !addModel) return

    const raycaster = new THREE.Raycaster()
    const origin = cubeRef.current.position.clone()
    const direction = new THREE.Vector3(0, 0, 0).sub(origin).normalize()
    raycaster.set(origin, direction)
    const intersects = raycaster.intersectObject(planetRef.current, true)

    if (intersects.length > 0) {
      const point = intersects[0].point
      const normal = intersects[0].face.normal.clone()
      normal.transformDirection(planetRef.current.matrixWorld)

      const basePoint = point.clone()
      const heightOffset = normal.clone().multiplyScalar(height)
      const finalPoint = basePoint.clone().add(heightOffset)

      const relativePoint = finalPoint.clone().applyMatrix4(planetGroupRef.current.matrixWorld.clone().invert())

      const centerToPoint = point.clone().normalize()
      
      const baseQuat = new THREE.Quaternion()
      baseQuat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), centerToPoint)
      
      const rotationQuat = new THREE.Quaternion().setFromAxisAngle(centerToPoint, rotation)
      const targetQuat = baseQuat.clone().multiply(rotationQuat)

      const planetQuat = new THREE.Quaternion()
      planetGroupRef.current.getWorldQuaternion(planetQuat)
      const relativeQuat = targetQuat.clone().premultiply(planetQuat.invert())

      const newModel = await modelLoader(`/decorations/${addModel}`, { s: [scale, scale, scale] })
      newModel.position.copy(cubeRef.current.position)
      newModel.quaternion.copy(cubeRef.current.quaternion)
      sceneRef.current.add(newModel)

      gsap.to(newModel.position, {
        x: finalPoint.x,
        y: finalPoint.y,
        z: finalPoint.z,
        duration: 0.5,
        ease: 'power2.out',
        onComplete: async () => {
          newModel.position.copy(relativePoint)
          newModel.quaternion.copy(relativeQuat)
          planetGroupRef.current.add(newModel)

          await saveObjectPosition(newModel, `/decorations/${addModel}`, {
            height,
            scale,
            rotation
          })

          sceneRef.current.remove(cubeRef.current)
          sceneRef.current.remove(previewRef.current)

          const nextPreview = await modelLoader(`/decorations/${addModel}`, { s: [scale, scale, scale] })
          nextPreview.position.set(0, 16, 0)
          const centerToPoint = new THREE.Vector3(0, 1, 0).normalize()
          const baseQuat = new THREE.Quaternion()
          baseQuat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), centerToPoint)
          nextPreview.quaternion.copy(baseQuat)
          
          const rotationQuat = new THREE.Quaternion().setFromAxisAngle(centerToPoint, rotation)
          nextPreview.quaternion.multiply(rotationQuat)
          
          cubeRef.current = nextPreview
          sceneRef.current.add(nextPreview)

          const newPreview = createTransparentPreview(nextPreview)
          previewRef.current = newPreview
          sceneRef.current.add(newPreview)

          placedRef.current = false
        }
      })
    }
  }


  useEffect(() => {
    if (!targetUserId || loading) return
    const dom = containerRef.current

    const onPointerDown = (event) => {
      if (!planetRef.current) return
      
      if (event.touches && event.touches.length > 1) {
        return
      }

      dragging.current = true
      lastMouse.current = { x: event.clientX || event.touches[0].clientX, y: event.clientY || event.touches[0].clientY }

      const mouse = new THREE.Vector2()
      const clientX = event.clientX || event.touches[0].clientX
      const clientY = event.clientY || event.touches[0].clientY
      mouse.x = (clientX / window.innerWidth) * 2 - 1
      mouse.y = -(clientY / window.innerHeight) * 2 + 1

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

    const onPointerMove = (event) => {
      if (event.touches && event.touches.length > 1) {
        return
      }

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

      const clientX = event.clientX || event.touches[0].clientX
      const clientY = event.clientY || event.touches[0].clientY
      const current = getArcballVector(clientX, clientY)
      const previous = getArcballVector(lastMouse.current.x, lastMouse.current.y)
      let axis = new THREE.Vector3().crossVectors(previous, current).normalize()
      axis.transformDirection(cameraRef.current.matrixWorld)
      const angle = previous.angleTo(current)
      const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle)
      planetGroupRef.current.quaternion.premultiply(quaternion)
      lastMouse.current = { x: clientX, y: clientY }
    }

    const onPointerUp = (event) => {
      if (event.touches && event.touches.length > 1) {
        return
      }

      dragging.current = false
      dragMode.current = ''

      if (controlsRef.current) {
        controlsRef.current.enabled = true
      }
    }

    dom.addEventListener('pointerdown', onPointerDown)
    dom.addEventListener('pointermove', onPointerMove)
    dom.addEventListener('pointerup', onPointerUp)
    dom.addEventListener('pointercancel', onPointerUp)

    return () => {
      dom.removeEventListener('pointerdown', onPointerDown)
      dom.removeEventListener('pointermove', onPointerMove)
      dom.removeEventListener('pointerup', onPointerUp)
      dom.removeEventListener('pointercancel', onPointerUp)
    }
  }, [targetUserId, loading])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Planet</h2>
        <p className="text-gray-600">Please log in to view planets</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="h-screen-minus-nav">
      <div 
        ref={containerRef} 
        className="w-full h-screen-minus-nav bg-black no-scrollbar flex-1 select-none touch-none"
        onContextMenu={(e) => e.preventDefault()}
        onSelect={(e) => e.preventDefault()}
        style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', KhtmlUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none', touchAction: 'none'}}
      />
      {addModel && !placed && (
        <div className="opacity-85 absolute bottom-[6%] left-1/2 -translate-x-1/2 bg-black/60 p-4 rounded-xl shadow-lg z-10 flex flex-col gap-3 min-w-[280px] max-w-[90vw]" style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', KhtmlUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none', touchAction: 'none'}}
        >
          <div className="flex justify-between items-center">
            <h3 className="text-white text-base font-medium">Adjust Your Item:</h3>
            <button onClick={() => setIsControlsExpanded(!isControlsExpanded)} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg transition-colors">
              {isControlsExpanded ? 'Hide' : 'Show'}
            </button>
          </div>

          {isControlsExpanded && (
            <>
              <div className="flex items-center gap-4">
                <label className="text-white text-sm min-w-[40px]">Height</label>
                <input type="range" min="-2" max="2" step="0.1" value={height} onChange={(e) => setHeight(parseFloat(e.target.value))} className="flex-1" />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-white text-sm min-w-[40px]">Scale</label>
                <input type="range" min="0.1" max="2" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="flex-1" />
              </div>

              <div className="flex items-center gap-4">
                <label className="text-white text-sm min-w-[40px]">Rotate</label>
                <input type="range" min="0" max={Math.PI * 2} step="0.1" value={rotation} onChange={(e) => setRotation(parseFloat(e.target.value))} className="flex-1" />
              </div>
            </>
          )}

          <div className="flex justify-center mt-2">
            <button onClick={placeCubeOnPlanet} className="bg-[#00aaff] hover:bg-[#0099ee] text-white px-5 py-2 rounded-lg min-w-[120px] transition-colors">
              Place on Planet
            </button>
          </div>
        </div>
      )}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-lg text-white z-10 opacity-85" style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', KhtmlUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none', touchAction: 'none'}}
      >
        {viewUser ? `${viewUser.name}'s Planet` : (addModel ? 'Place Your Item' : ``)}
      </div>
    </div>
  )
}

const Planet = () => {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PlanetContent />
    </Suspense>
  )
}

export default Planet