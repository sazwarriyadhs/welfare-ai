
"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sky } from "@react-three/drei";
import * as THREE from "three";

type DroneSceneProps = {
  connected: boolean;
  latitude: number | null;
  longitude: number | null;
  relativeAltitudeM: number | null;
  rollDeg: number | null;
  pitchDeg: number | null;
  yawDeg: number | null;
};

const CONFIG = {
  vegetation: "Mixed Vegetation",
  terrain: "Rolling Hills",
  density: 0.65,
  trees: "Scattered",
  season: "Spring",
};

const WORLD_SIZE = 100;
const SEGMENTS = 120;

function random(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function terrainHeight(x: number, z: number) {
  const broad =
    Math.sin(x * 0.045) * 2.7 +
    Math.cos(z * 0.052) * 2.1;

  const rolling =
    Math.sin((x + z) * 0.085) * 0.9 +
    Math.cos((x - z) * 0.07) * 0.7;

  const detail =
    Math.sin(x * 0.17 + z * 0.12) * 0.22;

  return broad + rolling + detail;
}

function createTerrainGeometry() {
  const geometry = new THREE.PlaneGeometry(
    WORLD_SIZE,
    WORLD_SIZE,
    SEGMENTS,
    SEGMENTS
  );

  geometry.rotateX(-Math.PI / 2);

  const positions = geometry.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const z = positions.getZ(i);

    positions.setY(i, terrainHeight(x, z));
  }

  geometry.computeVertexNormals();
  return geometry;
}

function Terrain() {
  const geometry = useMemo(() => createTerrainGeometry(), []);

  return (
    <group>
      <mesh
        geometry={geometry}
        receiveShadow
        castShadow
      >
        <meshStandardMaterial
          color="#638d50"
          roughness={1}
          metalness={0}
        />
      </mesh>

      <gridHelper
        args={[WORLD_SIZE, 40, "#a9c49c", "#8eaa82"]}
        position={[0, -0.15, 0]}
      />
    </group>
  );
}

function GrassLayer() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const data = useMemo(() => {
    const rand = random(20261120);
    const items: {
      x: number;
      z: number;
      height: number;
      width: number;
      rotation: number;
    }[] = [];

    const count = Math.floor(
      10500 * CONFIG.density
    );

    for (let i = 0; i < count; i++) {
      const x = (rand() - 0.5) * WORLD_SIZE * 0.96;
      const z = (rand() - 0.5) * WORLD_SIZE * 0.96;

      items.push({
        x,
        z,
        height: 0.22 + rand() * 0.45,
        width: 0.035 + rand() * 0.045,
        rotation: rand() * Math.PI,
      });
    }

    return items;
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();

    data.forEach((item, index) => {
      dummy.position.set(
        item.x,
        terrainHeight(item.x, item.z) + item.height / 2,
        item.z
      );

      dummy.rotation.set(
        0,
        item.rotation,
        (Math.random() - 0.5) * 0.12
      );

      dummy.scale.set(
        item.width,
        item.height,
        item.width
      );

      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [data]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, data.length]}
      castShadow
      receiveShadow
    >
      <coneGeometry args={[1, 1, 4]} />
      <meshStandardMaterial
        color="#8ebc64"
        roughness={1}
        vertexColors={false}
      />
    </instancedMesh>
  );
}

function ShrubLayer() {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const items = useMemo(() => {
    const rand = random(90210);
    const result: {
      x: number;
      z: number;
      scale: number;
    }[] = [];

    for (let i = 0; i < 230; i++) {
      const x = (rand() - 0.5) * WORLD_SIZE * 0.9;
      const z = (rand() - 0.5) * WORLD_SIZE * 0.9;

      result.push({
        x,
        z,
        scale: 0.45 + rand() * 0.8,
      });
    }

    return result;
  }, []);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();

    items.forEach((item, index) => {
      dummy.position.set(
        item.x,
        terrainHeight(item.x, item.z) + item.scale * 0.35,
        item.z
      );

      dummy.scale.set(
        item.scale,
        item.scale * 0.7,
        item.scale
      );

      dummy.updateMatrix();
      mesh.setMatrixAt(index, dummy.matrix);
    });

    mesh.instanceMatrix.needsUpdate = true;
  }, [items]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, items.length]}
      castShadow
    >
      <dodecahedronGeometry args={[0.65, 0]} />
      <meshStandardMaterial color="#527b43" roughness={1} />
    </instancedMesh>
  );
}

function TreeLayer() {
  const trunkRef = useRef<THREE.InstancedMesh>(null);
  const crownRef = useRef<THREE.InstancedMesh>(null);

  const trees = useMemo(() => {
    const rand = random(55129);
    const result: {
      x: number;
      z: number;
      height: number;
      crown: number;
    }[] = [];

    for (let i = 0; i < 48; i++) {
      const x = (rand() - 0.5) * WORLD_SIZE * 0.85;
      const z = (rand() - 0.5) * WORLD_SIZE * 0.85;

      result.push({
        x,
        z,
        height: 2.4 + rand() * 2.3,
        crown: 1.1 + rand() * 0.9,
      });
    }

    return result;
  }, []);

  useEffect(() => {
    const trunks = trunkRef.current;
    const crowns = crownRef.current;

    if (!trunks || !crowns) return;

    const dummy = new THREE.Object3D();

    trees.forEach((tree, index) => {
      const ground = terrainHeight(tree.x, tree.z);

      dummy.position.set(
        tree.x,
        ground + tree.height / 2,
        tree.z
      );
      dummy.scale.set(0.28, tree.height, 0.28);
      dummy.updateMatrix();
      trunks.setMatrixAt(index, dummy.matrix);

      dummy.position.set(
        tree.x,
        ground + tree.height + tree.crown * 0.35,
        tree.z
      );
      dummy.scale.set(
        tree.crown,
        tree.crown * 1.2,
        tree.crown
      );
      dummy.updateMatrix();
      crowns.setMatrixAt(index, dummy.matrix);
    });

    trunks.instanceMatrix.needsUpdate = true;
    crowns.instanceMatrix.needsUpdate = true;
  }, [trees]);

  return (
    <group>
      <instancedMesh
        ref={trunkRef}
        args={[undefined, undefined, trees.length]}
        castShadow
      >
        <cylinderGeometry args={[0.12, 0.2, 1, 6]} />
        <meshStandardMaterial color="#75543a" />
      </instancedMesh>

      <instancedMesh
        ref={crownRef}
        args={[undefined, undefined, trees.length]}
        castShadow
      >
        <coneGeometry args={[0.8, 1.6, 7]} />
        <meshStandardMaterial color="#367c43" roughness={1} />
      </instancedMesh>
    </group>
  );
}

function DroneModel({
  latitude,
  longitude,
  relativeAltitudeM,
  rollDeg,
  pitchDeg,
  yawDeg,
}: DroneSceneProps) {
  const group = useRef<THREE.Group>(null);

  const origin = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useFrame((_, delta) => {
    if (!group.current) return;

    if (
      typeof latitude === "number" &&
      typeof longitude === "number" &&
      Number.isFinite(latitude) &&
      Number.isFinite(longitude)
    ) {
      if (!origin.current) {
        origin.current = { latitude, longitude };
      }

      const latScale = 111320;
      const lonScale =
        111320 * Math.cos(
          (origin.current.latitude * Math.PI) / 180
        );

      const x =
        (longitude - origin.current.longitude) * lonScale;

      const z =
        -(latitude - origin.current.latitude) * latScale;

      const altitude = Math.max(
        1.8,
        1.8 + (relativeAltitudeM ?? 0)
      );

      group.current.position.x = THREE.MathUtils.damp(
        group.current.position.x,
        x,
        3,
        delta
      );

      group.current.position.z = THREE.MathUtils.damp(
        group.current.position.z,
        z,
        3,
        delta
      );

      group.current.position.y = THREE.MathUtils.damp(
        group.current.position.y,
        terrainHeight(
          THREE.MathUtils.clamp(x, -48, 48),
          THREE.MathUtils.clamp(z, -48, 48)
        ) + altitude,
        3,
        delta
      );
    }

    const roll = THREE.MathUtils.degToRad(rollDeg ?? 0);
    const pitch = THREE.MathUtils.degToRad(pitchDeg ?? 0);
    const yaw = THREE.MathUtils.degToRad(yawDeg ?? 0);

    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      pitch,
      5,
      delta
    );

    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      yaw,
      5,
      delta
    );

    group.current.rotation.z = THREE.MathUtils.damp(
      group.current.rotation.z,
      -roll,
      5,
      delta
    );
  });

  return (
    <group ref={group} position={[0, 3, 0]}>
      {/* Main body */}
      <mesh castShadow>
        <boxGeometry args={[0.9, 0.24, 0.7]} />
        <meshStandardMaterial
          color="#263b31"
          metalness={0.5}
          roughness={0.35}
        />
      </mesh>

      {/* Front marker */}
      <mesh position={[0, 0.12, -0.37]}>
        <boxGeometry args={[0.24, 0.12, 0.12]} />
        <meshStandardMaterial
          color="#e5a63b"
          emissive="#e5a63b"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Arms and motors */}
      {[
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ].map(([x, z], index) => (
        <group key={index}>
          <mesh
            position={[x * 0.65, 0, z * 0.55]}
            rotation={[0, 0, Math.atan2(x, z)]}
          >
            <boxGeometry args={[0.95, 0.09, 0.11]} />
            <meshStandardMaterial color="#42594c" />
          </mesh>

          <mesh
            position={[x * 1.1, 0.1, z * 0.9]}
            castShadow
          >
            <cylinderGeometry args={[0.14, 0.14, 0.12, 12]} />
            <meshStandardMaterial color="#263b31" />
          </mesh>

          <mesh
            position={[x * 1.1, 0.19, z * 0.9]}
          >
            <boxGeometry args={[0.85, 0.035, 0.09]} />
            <meshStandardMaterial color="#b8c8bd" />
          </mesh>
        </group>
      ))}

      {/* Camera */}
      <mesh position={[0, -0.22, -0.2]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial
          color="#17231d"
          metalness={0.4}
        />
      </mesh>

      <pointLight
        position={[0, 0.4, 0]}
        intensity={0.5}
        distance={5}
        color="#9de6ad"
      />
    </group>
  );
}

function Scene(props: DroneSceneProps) {
  return (
    <>
      <Sky
        distance={450000}
        sunPosition={[30, 45, 20]}
        inclination={0.52}
        azimuth={0.25}
      />

      <ambientLight intensity={0.75} />
      <directionalLight
        position={[25, 35, 15]}
        intensity={2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <Terrain />
      <GrassLayer />
      <ShrubLayer />
      <TreeLayer />

      <DroneModel {...props} />

      <OrbitControls
        makeDefault
        target={[0, 2, 0]}
        minDistance={5}
        maxDistance={90}
        maxPolarAngle={Math.PI / 2.05}
      />
    </>
  );
}

export default function DroneScene(props: DroneSceneProps) {
  return (
    <div
      style={{
        width: "100%",
        height: 430,
        position: "relative",
        background: "#c9dfd1",
      }}
    >
      <Canvas
        camera={{
          position: [24, 22, 28],
          fov: 48,
          near: 0.1,
          far: 500,
        }}
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
      >
        <Scene {...props} />
      </Canvas>

      <div
        style={{
          position: "absolute",
          left: 14,
          bottom: 12,
          background: "#ffffffdd",
          padding: "7px 10px",
          borderRadius: 7,
          fontSize: 10,
          color: "#365541",
          pointerEvents: "none",
        }}
      >
        PROCEDURAL TERRAIN · {CONFIG.vegetation.toUpperCase()} ·
        {` ${CONFIG.terrain.toUpperCase()}`}
      </div>
    </div>
  );
}
