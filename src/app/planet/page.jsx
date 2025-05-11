"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import * as THREE from "three";
import {
  AVAILABLE_MODELS,
  canvasResize,
  createGradientBackground,
  createStarField,
  createTransparentPreview,
  initThree,
  modelLoader,
} from "./components/utils.jsx";
import { gsap } from "gsap";
import { useAuth } from "../../providers/auth-provider";
import { client } from "../../endpoints/client";
import { useParams, useSearchParams } from "next/navigation";

const PlanetContent = () => {
  const searchParams = useSearchParams();
  const addModel = searchParams.get("add");
  const viewUserId = addModel ? null : searchParams.get("user");
  // console.log(viewUserId)

  const { user, loading } = useAuth();
  const containerRef = useRef();
  const cubeRef = useRef();
  const planetRef = useRef();
  const sceneRef = useRef();
  const cameraRef = useRef();
  const rendererRef = useRef();
  const controlsRef = useRef();
  const planetGroupRef = useRef();
  const previewRef = useRef();
  const placedRef = useRef(false);
  const hasLoadedRef = useRef(false);
  const objectsRef = useRef(new Map());

  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState(null);
  const [viewUser, setViewUser] = useState(null);
  const [targetUserId, setTargetUserId] = useState(null);

  const dragging = useRef(false);
  const dragMode = useRef("");
  const lastMouse = useRef({ x: 0, y: 0 });

  // Load user data if viewing another user's planet
  useEffect(() => {
    if (viewUserId && viewUserId !== user?.id) {
      setTargetUserId(viewUserId);
      client.unauth
        .getUserById(viewUserId)
        .then((userData) => {
          setViewUser(userData);
          // console.log(user.id,viewUserId)
        })
        .catch((err) => {
          console.error("Failed to load user data", err);
          setError("Failed to load user data");
        });
    } else {
      setTargetUserId(user?.id);
    }
  }, [viewUserId, user]);

  const loadSavedObjects = async () => {
    try {
      // If viewing another user's planet, load their objects
      setTargetUserId(viewUserId || user.id);
      let targetUserId = viewUserId || user.id;
      let objects = await client.authed.getPlanetObjects(targetUserId);
      for (const obj of objects) {
        const model = await modelLoader(obj.modelPath, {
          s: [obj.scale.x, obj.scale.y, obj.scale.z],
        });

        model.position.set(obj.position.x, obj.position.y, obj.position.z);
        model.quaternion.set(obj.rotation.x, obj.rotation.y, obj.rotation.z, obj.rotation.w);

        planetGroupRef.current.add(model);
        objectsRef.current.set(obj.id, model);
      }
    } catch (error) {
      console.error("Failed to load saved objects:", error);
    }
  };

  useEffect(() => {
    if (!user || loading) return;
    // console.log(user.id)
    if (hasLoadedRef.current) return;
    if (addModel && !AVAILABLE_MODELS.includes(addModel)) {
      setError("Invalid model name");
      return;
    }
    hasLoadedRef.current = true;

    const { renderer, camera, scene, controls } = initThree(containerRef);
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    // Only load preview model if in add mode
    if (addModel) {
      modelLoader(`/decorations/${addModel}`, { s: [0.5, 0.5, 0.5] }).then((model) => {
        scene.add(model);
        model.position.set(0, 13, 0);
        cubeRef.current = model;

        previewRef.current = createTransparentPreview(model);
        scene.add(previewRef.current);
      });
    }

    const light = new THREE.DirectionalLight(0xffffff, 4);
    light.position.set(5, 5, 10);
    scene.add(light);

    modelLoader("Earth.glb", { s: 1 }).then((model) => {
      const group = new THREE.Group();
      group.add(model);
      scene.add(group);

      planetGroupRef.current = group;
      planetRef.current = model;
    });
    loadSavedObjects().then((r) => {});

    const stars = createStarField();
    scene.add(stars);
    const { backgroundScene, backgroundCamera } = createGradientBackground(containerRef);

    const animate = () => {
      requestAnimationFrame(animate);
      renderer.autoClear = false;
      renderer.clear();
      renderer.render(backgroundScene, backgroundCamera);
      renderer.render(scene, camera);
      if (addModel) {
        updatePreviewPosition();
      }
    };
    animate();

    window.addEventListener("resize", () => canvasResize());

    return () => {
      renderer.dispose();
    };
  }, [user, loading, addModel]);

  const updatePreviewPosition = () => {
    if (!planetRef.current || !cubeRef.current || !previewRef.current || placedRef.current) return;
    const raycaster = new THREE.Raycaster();
    const origin = cubeRef.current.position.clone();
    const direction = new THREE.Vector3(0, 0, 0).sub(origin).normalize();
    raycaster.set(origin, direction);
    const intersects = raycaster.intersectObject(planetRef.current, true);
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const normal = intersects[0].face.normal.clone();
      normal.transformDirection(planetRef.current.matrixWorld);
      previewRef.current.position.copy(point);
      const quat = new THREE.Quaternion();
      quat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      previewRef.current.quaternion.copy(quat);
    } else {
      previewRef.current.visible = false;
    }
  };

  const saveObjectPosition = async (model, modelPath) => {
    try {
      const relativePosition = model.position.clone();
      const relativeQuaternion = model.quaternion.clone();
      const relativeScale = model.scale.clone();

      await client.authed.savePlanetObject({
        modelPath,
        position: { x: relativePosition.x, y: relativePosition.y, z: relativePosition.z },
        rotation: {
          x: relativeQuaternion.x,
          y: relativeQuaternion.y,
          z: relativeQuaternion.z,
          w: relativeQuaternion.w,
        },
        scale: { x: relativeScale.x, y: relativeScale.y, z: relativeScale.z },
      });
    } catch (error) {
      console.error("Failed to save object position:", error);
    }
  };

  const placeCubeOnPlanet = async () => {
    if (
      !planetRef.current ||
      !cameraRef.current ||
      !rendererRef.current ||
      !cubeRef.current ||
      !addModel
    )
      return;

    const raycaster = new THREE.Raycaster();
    const origin = cubeRef.current.position.clone();
    const direction = new THREE.Vector3(0, 0, 0).sub(origin).normalize();
    raycaster.set(origin, direction);
    const intersects = raycaster.intersectObject(planetRef.current, true);

    if (intersects.length > 0) {
      const point = intersects[0].point;
      const normal = intersects[0].face.normal.clone();
      normal.transformDirection(planetRef.current.matrixWorld);

      const relativePoint = point
        .clone()
        .applyMatrix4(planetGroupRef.current.matrixWorld.clone().invert());

      const targetQuat = new THREE.Quaternion();
      targetQuat.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);

      const planetQuat = new THREE.Quaternion();
      planetGroupRef.current.getWorldQuaternion(planetQuat);
      const relativeQuat = targetQuat.clone().premultiply(planetQuat.invert());

      const newModel = await modelLoader(`/decorations/${addModel}`, { s: [0.5, 0.5, 0.5] });
      newModel.position.copy(cubeRef.current.position);
      newModel.quaternion.copy(cubeRef.current.quaternion);
      sceneRef.current.add(newModel);

      gsap.to(newModel.position, {
        x: point.x,
        y: point.y,
        z: point.z,
        duration: 0.5,
        ease: "power2.out",
        onComplete: async () => {
          newModel.position.copy(relativePoint);
          newModel.quaternion.copy(relativeQuat);
          planetGroupRef.current.add(newModel);

          await saveObjectPosition(newModel, `/decorations/${addModel}`);

          sceneRef.current.remove(cubeRef.current);
          sceneRef.current.remove(previewRef.current);

          const nextPreview = await modelLoader(`/decorations/${addModel}`, { s: [0.5, 0.5, 0.5] });
          nextPreview.position.set(0, 16, 0);
          cubeRef.current = nextPreview;
          sceneRef.current.add(nextPreview);

          const newPreview = createTransparentPreview(nextPreview);
          previewRef.current = newPreview;
          sceneRef.current.add(newPreview);

          placedRef.current = false;
        },
      });
    }
  };

  useEffect(() => {
    if (!targetUserId || loading) return;
    const dom = containerRef.current;

    const onMouseDown = (event) => {
      if (!planetRef.current) return;

      dragging.current = true;
      lastMouse.current = { x: event.clientX, y: event.clientY };

      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, cameraRef.current);

      const intersects = raycaster.intersectObject(planetRef.current, true);

      if (intersects.length > 0) {
        dragMode.current = "planet";
        if (controlsRef.current) controlsRef.current.enabled = false;
      } else {
        dragMode.current = "scene";
        if (controlsRef.current) controlsRef.current.enabled = true;
      }
    };

    const onMouseMove = (event) => {
      if (!dragging.current || dragMode.current !== "planet" || !planetGroupRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      const getArcballVector = (x, y) => {
        let v = new THREE.Vector3(
          (2 * (2 * x - width)) / width,
          (2 * (height - 2 * y)) / height,
          0.0,
        );
        const lengthSquared = v.x * v.x + v.y * v.y;
        if (lengthSquared <= 1.0) {
          v.z = Math.sqrt(1.0 - lengthSquared);
        } else {
          v.normalize();
        }
        return v;
      };
      const current = getArcballVector(event.clientX, event.clientY);
      const previous = getArcballVector(lastMouse.current.x, lastMouse.current.y);
      let axis = new THREE.Vector3().crossVectors(previous, current).normalize();
      axis.transformDirection(cameraRef.current.matrixWorld);
      const angle = previous.angleTo(current);
      const quaternion = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      planetGroupRef.current.quaternion.premultiply(quaternion);
      lastMouse.current = { x: event.clientX, y: event.clientY };
    };

    const onMouseUp = () => {
      dragging.current = false;
      dragMode.current = "";

      if (controlsRef.current) {
        controlsRef.current.enabled = true;
      }
    };
    dom.addEventListener("mousedown", onMouseDown);
    dom.addEventListener("mousemove", onMouseMove);
    dom.addEventListener("mouseup", onMouseUp);
    return () => {
      dom.removeEventListener("mousedown", onMouseDown);
      dom.removeEventListener("mousemove", onMouseMove);
      dom.removeEventListener("mouseup", onMouseUp);
    };
  }, [targetUserId, loading]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Planet</h2>
        <p className="text-gray-600">Please log in to view planets</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-screen-minus-nav">
      <div ref={containerRef} className="w-full h-screen-minus-nav bg-black no-scrollbar flex-1" />
      {addModel && !placed && (
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "20px 40px",
            borderRadius: "15px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
            zIndex: 10,
          }}
        >
          <button
            onClick={placeCubeOnPlanet}
            style={{
              fontSize: 18,
              padding: "10px 20px",
              borderRadius: "10px",
              border: "none",
              backgroundColor: "#00aaff",
              color: "#fff",
              cursor: "pointer",
            }}
          >
            Place on Planet
          </button>
        </div>
      )}
      {viewUser && (
        <div
          style={{
            position: "absolute",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0,0,0,0.6)",
            padding: "10px 20px",
            borderRadius: "10px",
            color: "#fff",
            zIndex: 10,
          }}
        >
          {viewUser.name}'s Planet
        </div>
      )}
    </div>
  );
};

const Planet = () => {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <PlanetContent />
    </Suspense>
  );
};

export default Planet;
