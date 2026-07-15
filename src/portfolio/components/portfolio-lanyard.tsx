'use client';

import { Environment, Lightformer, useGLTF, useTexture } from '@react-three/drei';
import { Canvas, extend, useFrame, type ThreeElement, type ThreeEvent } from '@react-three/fiber';
import {
  BallCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
  type RapierRigidBody,
  type RigidBodyProps,
} from '@react-three/rapier';
import { MeshLineGeometry, MeshLineMaterial } from 'meshline';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

const CARD_MODEL_URL = '/projects/portfolio/lanyard/card.glb';
const LANYARD_TEXTURE_URL = '/projects/portfolio/lanyard/lanyard.png';

extend({ MeshLineGeometry, MeshLineMaterial });

declare module '@react-three/fiber' {
  interface ThreeElements {
    meshLineGeometry: ThreeElement<typeof MeshLineGeometry>;
    meshLineMaterial: ThreeElement<typeof MeshLineMaterial>;
  }
}

interface PortfolioLanyardProps {
  cover: string;
  name: string;
  onReady: (projectId: string) => void;
  projectId: string;
}

interface CardModel {
  nodes: {
    card: THREE.Mesh;
    clamp: THREE.Mesh;
    clip: THREE.Mesh;
  };
  materials: {
    base: THREE.MeshStandardMaterial;
    metal: THREE.MeshStandardMaterial;
  };
}

type ImageWithDimensions = CanvasImageSource & {
  width: number;
  height: number;
};

type LanyardRigidBody = RapierRigidBody & {
  lerped?: THREE.Vector3;
};

function isImageWithDimensions(image: unknown): image is ImageWithDimensions {
  return (
    typeof image === 'object' &&
    image !== null &&
    'width' in image &&
    'height' in image &&
    typeof image.width === 'number' &&
    typeof image.height === 'number'
  );
}

function makeCardTexture(baseMap: THREE.Texture | null, frontTexture: THREE.Texture, backTexture: THREE.Texture): THREE.Texture | null {
  if (!baseMap || !isImageWithDimensions(baseMap.image) || !isImageWithDimensions(frontTexture.image) || !isImageWithDimensions(backTexture.image)) {
    return baseMap;
  }

  const canvas = document.createElement('canvas');
  canvas.width = baseMap.image.width;
  canvas.height = baseMap.image.height;

  const context = canvas.getContext('2d');
  if (!context) {
    return baseMap;
  }

  context.drawImage(baseMap.image, 0, 0, canvas.width, canvas.height);

  const drawCover = (image: ImageWithDimensions, x: number) => {
    const targetWidth = canvas.width * 0.5;
    const targetHeight = canvas.height * 0.755;
    const scale = Math.max(targetWidth / image.width, targetHeight / image.height);
    const width = image.width * scale;
    const height = image.height * scale;

    context.save();
    context.beginPath();
    context.rect(x, 0, targetWidth, targetHeight);
    context.clip();
    context.drawImage(image, x + (targetWidth - width) / 2, (targetHeight - height) / 2, width, height);
    context.restore();
  };

  drawCover(frontTexture.image, 0);
  drawCover(backTexture.image, canvas.width * 0.5);

  const composite = new THREE.CanvasTexture(canvas);
  composite.colorSpace = THREE.SRGBColorSpace;
  composite.flipY = baseMap.flipY;
  composite.anisotropy = 16;
  composite.needsUpdate = true;

  return composite;
}

export default function PortfolioLanyard({ cover, name, onReady, projectId }: PortfolioLanyardProps) {
  return (
    <Canvas
      className="h-full w-full"
      camera={{ position: [0, 0, 30], fov: 12 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }}
      onCreated={({ gl }) => gl.setClearColor(new THREE.Color(0x090a0d), 0)}
      aria-label={`${name} lanyard preview`}
    >
      <ambientLight intensity={Math.PI} />
      <Physics gravity={[0, -40, 0]} timeStep={1 / 60}>
        <Band cover={cover} onReady={onReady} projectId={projectId} />
      </Physics>
      <Environment blur={0.75}>
        <Lightformer intensity={2} color="white" position={[0, -1, 5]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[-1, -1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={3} color="white" position={[1, 1, 1]} rotation={[0, 0, Math.PI / 3]} scale={[100, 0.1, 1]} />
        <Lightformer intensity={10} color="white" position={[-10, 0, 14]} rotation={[0, Math.PI / 2, Math.PI / 3]} scale={[100, 10, 1]} />
      </Environment>
    </Canvas>
  );
}

function Band({ cover, onReady, projectId }: { cover: string; onReady: (projectId: string) => void; projectId: string }) {
  const band = useRef<THREE.Mesh<InstanceType<typeof MeshLineGeometry>, InstanceType<typeof MeshLineMaterial>>>(null!);
  const fixed = useRef<RapierRigidBody>(null!);
  const jointOne = useRef<LanyardRigidBody>(null!);
  const jointTwo = useRef<LanyardRigidBody>(null!);
  const jointThree = useRef<RapierRigidBody>(null!);
  const card = useRef<RapierRigidBody>(null!);
  const vector = useMemo(() => new THREE.Vector3(), []);
  const angularVelocity = useMemo(() => new THREE.Vector3(), []);
  const rotation = useMemo(() => new THREE.Vector3(), []);
  const direction = useMemo(() => new THREE.Vector3(), []);
  const [curve] = useState(() => new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]));
  const [dragged, setDragged] = useState<THREE.Vector3 | false>(false);
  const [hovered, setHovered] = useState(false);

  const { nodes, materials } = useGLTF(CARD_MODEL_URL) as unknown as CardModel;
  const lanyardTexture = useTexture(LANYARD_TEXTURE_URL) as THREE.Texture;
  const [frontTexture, backTexture] = useTexture([cover, cover]) as THREE.Texture[];
  const cardTexture = useMemo(
    () => makeCardTexture(materials.base.map, frontTexture, backTexture),
    [backTexture, frontTexture, materials.base.map],
  );

  useEffect(() => {
    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => onReady(projectId));
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, [onReady, projectId]);

  const segmentProps: RigidBodyProps = {
    type: 'dynamic',
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4,
  };

  const getLerpedPosition = (body: LanyardRigidBody) => {
    if (!body.lerped) {
      body.lerped = new THREE.Vector3().copy(body.translation());
    }

    return body.lerped;
  };

  useRopeJoint(fixed, jointOne, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(jointOne, jointTwo, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(jointTwo, jointThree, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(jointThree, card, [[0, 0, 0], [0, 2.16, 0]]);

  useEffect(() => {
    if (!hovered) {
      return;
    }

    document.body.style.cursor = dragged ? 'grabbing' : 'grab';

    return () => {
      document.body.style.cursor = 'auto';
    };
  }, [dragged, hovered]);

  useFrame((state, delta) => {
    if (dragged) {
      vector.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      direction.copy(vector).sub(state.camera.position).normalize();
      vector.add(direction.multiplyScalar(state.camera.position.length()));
      [card, jointOne, jointTwo, jointThree, fixed].forEach((body) => body.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vector.x - dragged.x,
        y: vector.y - dragged.y,
        z: vector.z - dragged.z,
      });
    }

    if (!fixed.current || !card.current || !jointOne.current || !jointTwo.current || !jointThree.current) {
      return;
    }

    [jointOne, jointTwo].forEach((body) => {
      const lerped = getLerpedPosition(body.current);
      const distance = Math.max(0.1, Math.min(1, lerped.distanceTo(body.current.translation())));
      lerped.lerp(body.current.translation(), delta * distance * 50);
    });

    curve.points[0].copy(jointThree.current.translation());
    curve.points[1].copy(getLerpedPosition(jointTwo.current));
    curve.points[2].copy(getLerpedPosition(jointOne.current));
    curve.points[3].copy(fixed.current.translation());
    band.current.geometry.setPoints(curve.getPoints(32));

    angularVelocity.copy(card.current.angvel());
    rotation.copy(card.current.rotation());
    card.current.setAngvel({ x: angularVelocity.x, y: angularVelocity.y - rotation.y * 0.25, z: angularVelocity.z }, true);
  });

  curve.curveType = 'chordal';
  lanyardTexture.wrapS = THREE.RepeatWrapping;
  lanyardTexture.wrapT = THREE.RepeatWrapping;

  const releasePointer = (event: ThreeEvent<PointerEvent>) => {
    const target = event.target as unknown as { releasePointerCapture?: (pointerId: number) => void };
    target.releasePointerCapture?.(event.pointerId);
    setDragged(false);
  };

  const capturePointer = (event: ThreeEvent<PointerEvent>) => {
    const target = event.target as unknown as { setPointerCapture?: (pointerId: number) => void };
    target.setPointerCapture?.(event.pointerId);
    setDragged(new THREE.Vector3().copy(event.point).sub(vector.copy(card.current.translation())));
  };

  return (
    <>
      <group position={[2.65, 4.5, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type="fixed" />
        <RigidBody position={[0.35, 0, 0]} ref={jointOne} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[0.7, 0, 0]} ref={jointTwo} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.05, 0, 0]} ref={jointThree} {...segmentProps}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.4, 0, 0]} ref={card} {...segmentProps} type={dragged ? 'kinematicPosition' : 'dynamic'}>
          <CuboidCollider args={[1.19, 1.675, 0.01]} />
          <group
            scale={3.35}
            position={[0, -1.79, -0.05]}
            onPointerOver={() => setHovered(true)}
            onPointerOut={() => setHovered(false)}
            onPointerUp={releasePointer}
            onPointerDown={capturePointer}
          >
            <mesh geometry={nodes.card.geometry}>
              <meshPhysicalMaterial map={cardTexture} map-anisotropy={16} clearcoat={1} clearcoatRoughness={0.15} roughness={0.9} metalness={0.8} />
            </mesh>
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          args={[
            {
              color: 'white',
              lineWidth: 1,
              map: lanyardTexture,
              repeat: new THREE.Vector2(-4, 1),
              resolution: new THREE.Vector2(1000, 1000),
              useMap: 1,
            },
          ]}
          depthTest={false}
        />
      </mesh>
    </>
  );
}
