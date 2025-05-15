// @ts-nocheck
"use client"
import { useEffect, useRef, useState, Suspense, useCallback } from 'react'
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
import { useSearchParams } from 'next/navigation'


const PlanetContent = ({ id }) => {
  const searchParams = useSearchParams()
  const finishedTaskId = searchParams.get('finished')
  const viewUserId = searchParams.get('user')

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
  const atmosphereRef = useRef()

  const [placed, setPlaced] = useState(false)
  const [error, setError] = useState(null)
  const [viewUser, setViewUser] = useState(null)
  const [targetUserId, setTargetUserId] = useState(null)
  const [taskInfo, setTaskInfo] = useState(null)
  const [rewardOptions, setRewardOptions] = useState([])
  const [selectedReward, setSelectedReward] = useState(null)
  const rewardPreviewRefs = useRef(new Map())

  const dragging = useRef(false)
  const dragMode = useRef('')
  const lastMouse = useRef({ x: 0, y: 0 })

  const [height, setHeight] = useState(0)
  const [scale, setScale] = useState(0.5)
  const [rotation, setRotation] = useState(0)

  const [isControlsExpanded, setIsControlsExpanded] = useState(false)

  const [selectedObject, setSelectedObject] = useState(null)
  const [objectTaskInfo, setObjectTaskInfo] = useState(null)
  const [bubblePosition, setBubblePosition] = useState({ x: 0, y: 0 })
  const [objectScreenPosition, setObjectScreenPosition] = useState({ x: 0, y: 0 })

  const planetRadius = 15
  const updatePositions = useCallback(() => {
    if (!selectedObject || !objectsRef.current.has(selectedObject)) return

    const object = objectsRef.current.get(selectedObject)
    const objectWorldPos = new THREE.Vector3()
    object.getWorldPosition(objectWorldPos)
    const planetCenter = new THREE.Vector3(0, 0, 0)
    const dir = objectWorldPos.clone().sub(planetCenter).normalize()
    const bubbleWorldPos = planetCenter.clone().add(dir.multiplyScalar(planetRadius * 1.2))
    bubbleWorldPos.project(cameraRef.current)
    let bubbleX = (bubbleWorldPos.x * 0.5 + 0.5) * window.innerWidth
    let bubbleY = (-bubbleWorldPos.y * 0.5 + 0.5) * window.innerHeight

    const bubbleWidth = 250
    const bubbleHeight = 100
    const margin = 16
    const canvasRect = containerRef.current?.getBoundingClientRect()
    if (canvasRect) {
      const left = canvasRect.left
      const top = canvasRect.top
      const right = canvasRect.right
      const bottom = canvasRect.bottom
      bubbleX = Math.max(left + margin + bubbleWidth / 2, Math.min(right - margin - bubbleWidth / 2, bubbleX))
      bubbleY = Math.max(top + margin + bubbleHeight / 2, Math.min(bottom - margin - bubbleHeight / 2, bubbleY))
    }

    setBubblePosition({ x: bubbleX, y: bubbleY })
    objectWorldPos.project(cameraRef.current)
    const objX = (objectWorldPos.x * 0.5 + 0.5) * window.innerWidth
    const objY = (-objectWorldPos.y * 0.5 + 0.5) * window.innerHeight
    setObjectScreenPosition({ x: objX, y: objY })
  }, [selectedObject, planetRadius])

  useEffect(() => {
    if (!selectedObject) return

    const animate = () => {
      updatePositions()
      requestAnimationFrame(animate)
    }
    const animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [selectedObject, updatePositions])

  const handleObjectClick = async (objectId, taskId) => {
    if (!taskId) return
    
    try {
      const taskInfo = await client.authed.getTaskAndTargetByTaskId(taskId)
      console.log('Clicked object info:', {
        objectId, taskId, taskInfo: {title: taskInfo.title, targetTitle: taskInfo.target.title, completedAt: taskInfo.completedAt}
      })
      setObjectTaskInfo(taskInfo)
      setSelectedObject(objectId)
      updatePositions()
    } catch (error) {
      console.error('Failed to load task info:', error)
    }
  }

  const handleBackgroundClick = (event) => {
    if (event.target === containerRef.current) {
      setSelectedObject(null)
      setObjectTaskInfo(null)
    }
  }

  useEffect(() => {
    if (id) {
      setTargetUserId(id)
      client.unauth.getUserById(id).then(userData => {
        setViewUser(userData)
      }).catch(err => {
        console.error('Failed to load user data',err)
        setError('Failed to load user data')
      })
    } else if (viewUserId && viewUserId !== user?.id) {
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
  }, [id, viewUserId, user])

  useEffect(() => {
    if (finishedTaskId) {
      client.authed.getTaskAndTargetByTaskId(finishedTaskId).then(task => {
        console.log(task)
        setTaskInfo(task)
        const shuffled = [...AVAILABLE_MODELS].sort(() => 0.5 - Math.random())
        setRewardOptions(shuffled.slice(0, 3))
      }).catch(err => {
        console.error('Failed to load task data', err)
        setError('Failed to load task data')
      })
    }
  }, [finishedTaskId])

  const loadSavedObjects = async () => {
    try {
      setTargetUserId(id || viewUserId || user?.id || "")
      let targetUserId = id || viewUserId || user?.id || ""
      let objects = await client.authed.getPlanetObjects(targetUserId)
      
      const loadPromises = objects.map(async (obj) => {
        const scaleFactor = obj.scale_factor || 1
        const model = await modelLoader(obj.modelPath, {
          s: [scaleFactor, scaleFactor, scaleFactor]
        })

        model.position.set(obj.position.x, obj.position.y, obj.position.z)
        model.quaternion.set(obj.rotation.x, obj.rotation.y, obj.rotation.z, obj.rotation.w)

        let fileName = obj.modelPath.split('/').pop().split('.')[0].replace(/\d+/g, '')
        let ObjectName = fileName.charAt(0).toUpperCase() + fileName.slice(1)

        model.userData = { id: obj.id, taskId: obj.taskId, modelName: ObjectName }
        model.traverse((child) => {
          if (child.isMesh) {child.userData = { id: obj.id, taskId: obj.taskId }}
        })

        planetGroupRef.current.add(model)
        objectsRef.current.set(obj.id, model)
      })

      await Promise.all(loadPromises)
    } catch (error) {
      console.error('Failed to load saved objects:', error)
      setError('Failed to load planet objects')
    }
  }

  const atmosphereVertexShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vPosition = position;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `

  const atmosphereFragmentShader = `
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
      float intensity = pow(0.45 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
      gl_FragColor = vec4(1.0, 1.0, 1.0, 0.7) * intensity;
    }
  `

  useEffect(() => {
    if (!user || loading) return
    if (hasLoadedRef.current) return
    hasLoadedRef.current = true

    const { renderer, camera, scene, controls } = initThree(containerRef, !!id)
    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer
    controlsRef.current = controls

    modelLoader('Earth.glb', {s:1}).then(model => {
      const group = new THREE.Group()
      group.add(model)
      scene.add(group)

      const atmosphereGeometry = new THREE.SphereGeometry(12.1, 44, 44)
      const atmosphereMaterial = new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        transparent: true,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending
      })
      const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
      group.add(atmosphere)
      atmosphereRef.current = atmosphere

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
      if (selectedReward) {
        updatePreviewPosition()
      }
    }
    animate()

    window.addEventListener('resize', () => canvasResize())

    return () => {
      renderer.dispose()
    }
  }, [user, loading, selectedReward, id])

  useEffect(() => {
    if (hasLoadedRef.current && planetGroupRef.current) {
      while(planetGroupRef.current.children.length > 1) {
        const child = planetGroupRef.current.children[1]
        planetGroupRef.current.remove(child)
      }
      objectsRef.current.clear()
      loadSavedObjects()
    }
  }, [id])

  useEffect(() => {
    if (!selectedReward || !cubeRef.current || !previewRef.current) return

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
  }, [height, scale, rotation, selectedReward])

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
        rotation_angle: additionalProps.rotation || 0,
        taskId: finishedTaskId || null
      }

      await client.authed.savePlanetObject(objectData)
    } catch (error) {
      console.error('Failed to save object position:', error)
    }
  }

  const placeCubeOnPlanet = async () => {
    if (!planetRef.current || !cameraRef.current || !rendererRef.current || !cubeRef.current || !selectedReward) return

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

      const newModel = await modelLoader(`/decorations/${selectedReward}`, { s: [scale, scale, scale] })
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

          await saveObjectPosition(newModel, `/decorations/${selectedReward}`, {
            height,
            scale,
            rotation
          })

          sceneRef.current.remove(cubeRef.current)
          sceneRef.current.remove(previewRef.current)
          setSelectedReward(null)
          setPlaced(true)
        }
      })
    }
  }

  const handleRewardSelection = (model) => {
    setSelectedReward(model)
    modelLoader(`/decorations/${model}`, {s:[scale, scale, scale]}).then(model => {
      sceneRef.current.add(model)
      model.position.set(0, 13, 0)
      const centerToPoint = new THREE.Vector3(0, 1, 0).normalize()
      const baseQuat = new THREE.Quaternion()
      baseQuat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), centerToPoint)
      model.quaternion.copy(baseQuat)
      
      const rotationQuat = new THREE.Quaternion().setFromAxisAngle(centerToPoint, rotation)
      model.quaternion.multiply(rotationQuat)
      
      model.traverse((child) => {
        if (child.isMesh && child.material) {
          child.material.transparent = true
          child.material.opacity = 0.4
          child.material.needsUpdate = true
        }
      })
      
      cubeRef.current = model

      previewRef.current = createTransparentPreview(model)
      sceneRef.current.add(previewRef.current)
      updatePreviewPosition()
    })
  }

  const initRewardPreviews = async () => {
    if (!rewardOptions.length) return

    for (const model of rewardOptions) {
      const container = document.getElementById(`preview-${model}`)
      if (!container) continue

      const previewScene = new THREE.Scene()
      const previewCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000)
      const previewRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
      previewRenderer.setSize(200, 200)
      previewRenderer.setClearColor(0x000000, 0)

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
      previewScene.add(ambientLight)

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
      directionalLight.position.set(5, 5, 5)
      previewScene.add(directionalLight)

      const loadedModel = await modelLoader(`/decorations/${model}`, { s: [0.5, 0.5, 0.5] })
      
      loadedModel.position.set(0, 0, 0)
      loadedModel.rotation.set(0, Math.PI / 4, 0)
      
      previewScene.add(loadedModel)
      
      previewCamera.position.z = 5
      previewCamera.position.y = 2
      previewCamera.lookAt(0, 0, 0)
      
      previewRenderer.render(previewScene, previewCamera)
      container.appendChild(previewRenderer.domElement)
      
      rewardPreviewRefs.current.set(model, {
        scene: previewScene,
        camera: previewCamera,
        renderer: previewRenderer,
        model: loadedModel
      })

      const animate = () => {
        if (!rewardPreviewRefs.current.has(model)) return
        
        const { scene, camera, renderer, model: previewModel } = rewardPreviewRefs.current.get(model)
        if (previewModel) {
          previewModel.rotation.y += 0.005 // 降低旋转速度
        }
        renderer.render(scene, camera)
        requestAnimationFrame(animate)
      }
      animate()
    }
  }

  useEffect(() => {
    return () => {
      rewardPreviewRefs.current.forEach(({ renderer, scene }) => {
        renderer.dispose()
        scene.traverse((object) => {
          if (object.isMesh) {
            object.geometry.dispose()
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose())
              } else {
                object.material.dispose()
              }
            }
          }
        })
      })
      rewardPreviewRefs.current.clear()
    }
  }, [])

  useEffect(() => {
    if (rewardOptions.length > 0) {
      initRewardPreviews()
    }
  }, [rewardOptions])

  const lastInteractionTime = useRef(Date.now())
  const isAutoRotating = useRef(false)
  const autoRotateSpeed = 0.00025
  const idleTimeout = 8000

  const updateLastInteractionTime = () => {
    lastInteractionTime.current = Date.now()
    isAutoRotating.current = false
  }

  const checkAutoRotate = () => {
    const now = Date.now()
    if (now - lastInteractionTime.current > idleTimeout && !isAutoRotating.current) {
      isAutoRotating.current = true
    }
  }

  useEffect(() => {
    let animationFrameId

    const animate = () => {
      checkAutoRotate()
      
      if (isAutoRotating.current && planetGroupRef.current) {
        planetGroupRef.current.rotation.y += autoRotateSpeed
        if (atmosphereRef.current) {
          atmosphereRef.current.rotation.y += autoRotateSpeed
        }
      }
      
      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
    }
  }, [])

  useEffect(() => {
    if (!targetUserId || loading) return
    const dom = containerRef.current

    const onPointerDown = (event) => {
      if (!planetRef.current) return
      
      if (event.touches && event.touches.length > 1) {
        return
      }

      updateLastInteractionTime()
      dragging.current = true
      lastMouse.current = { x: event.clientX || event.touches[0].clientX, y: event.clientY || event.touches[0].clientY }

      const mouse = new THREE.Vector2()
      const clientX = event.clientX || event.touches[0].clientX
      const clientY = event.clientY || event.touches[0].clientY
      mouse.x = (clientX / window.innerWidth) * 2 - 1
      mouse.y = -(clientY / window.innerHeight) * 2 + 1

      const raycaster = new THREE.Raycaster()
      raycaster.setFromCamera(mouse, cameraRef.current)

      const intersects = raycaster.intersectObjects(planetGroupRef.current.children, true)
      const planetIntersects = raycaster.intersectObject(planetRef.current, true)

      if (intersects.length > 0) {
        const object = intersects[0].object
        const taskId = object.userData?.taskId
        if (taskId) {
          console.log(object);
          handleObjectClick(object.userData.id, taskId)
        }
        dragMode.current = 'planet'
        if (controlsRef.current) controlsRef.current.enabled = false
      } else if (planetIntersects.length > 0) {
        setSelectedObject(null)
        setObjectTaskInfo(null)
        dragMode.current = 'planet'
        if (controlsRef.current) controlsRef.current.enabled = false
      } else {
        setSelectedObject(null)
        setObjectTaskInfo(null)
        dragMode.current = 'scene'
        if (controlsRef.current) controlsRef.current.enabled = true
      }
    }

    const onPointerMove = (event) => {
      if (event.touches && event.touches.length > 1) {
        return
      }

      if (dragging.current) {
        updateLastInteractionTime()
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
      updateLastInteractionTime()

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
    <div className="w-full h-full" style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', KhtmlUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none', touchAction: 'none'}}>
      <div 
        ref={containerRef} 
        className="w-full h-full bg-black no-scrollbar flex-1 select-none touch-none"
        onContextMenu={(e) => e.preventDefault()}
        onSelect={(e) => e.preventDefault()}
        onClick={handleBackgroundClick}
      />

      {objectTaskInfo && selectedObject && (
        <>
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" style={{ position: 'fixed' }}>
            <line x1={objectScreenPosition.x} y1={objectScreenPosition.y} x2={bubblePosition.x} y2={bubblePosition.y} stroke="rgba(255, 255, 255, 0.45)" strokeWidth="1.6" strokeDasharray="5,8"/>
          </svg>
          
          <div className="absolute bg-black/60 p-4 rounded-xl shadow-lg z-10 min-w-[220px] max-w-[90vw]"
            style={{
              left: `${bubblePosition.x}px`,
              top: `${bubblePosition.y}px`,
              transform: 'translate(-50%, -50%)',
              WebkitTouchCallout: 'none', WebkitUserSelect: 'none', KhtmlUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none', touchAction: 'none'
            }}
          >
            <div className="text-left">
              <h2 className="text-white text-base font-semibold mb-2">You Got Bonus Item：
                <span className="text-[#00aaff]">{objectsRef.current.get(selectedObject)?.userData?.modelName}</span>
              </h2>
              <p className="text-white/90 text-sm mb-1">
                From Target: <span className="text-[#00aaff]">{objectTaskInfo.target.title}</span>
                , Task:<span className="text-[#00aaff]">{objectTaskInfo.title}</span>
              </p>
              {objectTaskInfo.completedAt && (
                <p className="text-white/70 text-xs mt-1">
                  On: {new Date(objectTaskInfo.completedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {finishedTaskId && !selectedReward && !placed && (
        <div className="opacity-85 absolute bottom-[6%] left-1/2 -translate-x-1/2 bg-black/60 p-4 rounded-xl shadow-lg z-10 flex flex-col gap-3 w-[95vw] max-w-[500px]">
          {taskInfo && (
            <div className="text-center mb-4">
              <h2 className="text-white text-xl font-semibold mb-2">Congratulations!</h2>
              <p className="text-white/90">
                Completed <span className="text-[#00aaff]">{taskInfo.target.title}</span>'s <span className="text-[#00aaff]">{taskInfo.title}</span>
              </p>
            </div>
          )}
          <h3 className="text-white text-base font-medium text-center mb-2">Choose Your Reward</h3>
          <div className="grid grid-cols-3 gap-4">
            {rewardOptions.map((model, index) => (
              <button
                key={index}
                onClick={() => handleRewardSelection(model)}
                className="bg-white/20 hover:bg-white/30 text-white p-3 rounded-lg transition-colors flex flex-col items-center"
              >
                <div id={`preview-${model}`} className="w-full aspect-square mb-2" />
                <span className="text-sm sm:text-base">{model.replace('.fbx', '')}</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {selectedReward && !placed && (
        <div className="opacity-85 absolute bottom-[6%] left-1/2 -translate-x-1/2 bg-black/60 p-4 rounded-xl shadow-lg z-10 flex flex-col gap-3 min-w-[280px] max-w-[90vw]">
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
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-lg text-white z-10 opacity-85">
        {viewUser ? `${viewUser.name}'s Planet` : (finishedTaskId && !placed ? 'Choose Your Reward' : '')}
      </div>
    </div>
  )
}

const Planet = ({ params }) => {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PlanetContent id={params?.id} />
    </Suspense>
  )
}

export default Planet