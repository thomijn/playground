import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ExplosionConfetti = forwardRef(({
  amount = 100,
  radius = 15,
  fallingHeight = 10,
  colors = [0x0000ff, 0xff0000, 0xffff00],
  enableShadows = false,
}, ref) => {
  const groupRef = useRef();
  const [booms, setBooms] = useState([]);

  const geometry = new THREE.PlaneGeometry(0.02, 0.02, 1, 1);

  const explode = (position) => {
    const boom = new THREE.Object3D();
    boom.life = Math.random() * 5 + 5;
    boom.position.set(...position); // Set explosion at the specified position
    groupRef.current.add(boom);
    setBooms((prev) => [...prev, boom]);

    for (let i = 0; i < amount; i++) {
      const material = new THREE.MeshBasicMaterial({
        color: colors[Math.floor(Math.random() * colors.length)],
        side: THREE.DoubleSide,
      });
      const particle = new THREE.Mesh(geometry, material);
      particle.castShadow = enableShadows;
      boom.add(particle);

      particle.life = 1;

      particle.destination = {
        x: (Math.random() - 0.5) * (radius * 2) * Math.random(),
        y: (Math.random() - 0.5) * (radius * 2) * Math.random(),
        z: (Math.random() - 0.5) * (radius * 2) * Math.random(),
      };

      particle.rotation.x = Math.random() * 360;
      particle.rotation.y = Math.random() * 360;
      particle.rotation.z = Math.random() * 360;

      const size = Math.random() * 2 + 1;
      particle.scale.set(size, size, size);

      particle.rotateSpeedX = Math.random() * 0.8 - 0.4;
      particle.rotateSpeedY = Math.random() * 0.8 - 0.4;
      particle.rotateSpeedZ = Math.random() * 0.8 - 0.4;
    }

    boom.dispose = function () {
      for (let i = 0; i < boom.children.length; i++) {
        const particle = boom.children[i];
        particle.material.dispose();
        particle.geometry.dispose();
        boom.remove(particle);
      }
      groupRef.current.remove(boom);
    };
  };

  useImperativeHandle(ref, () => ({
    handleExplosion: (position) => explode(position),
  }));

  useFrame(() => {
    for (let i = 0; i < booms.length; i++) {
      const boom = booms[i];

      for (let k = 0; k < boom.children.length; k++) {
        let particle = boom.children[k];

        particle.destination.y -= THREE.MathUtils.randFloat(0.1, 0.3);
        particle.life -= THREE.MathUtils.randFloat(0.005, 0.01);

        const speedX = (particle.destination.x - particle.position.x) / 200;
        const speedY = (particle.destination.y - particle.position.y) / 200;
        const speedZ = (particle.destination.z - particle.position.z) / 200;

        particle.position.x += speedX;
        particle.position.y += speedY;
        particle.position.z += speedZ;

        particle.rotation.y += particle.rotateSpeedY;
        particle.rotation.x += particle.rotateSpeedX;
        particle.rotation.z += particle.rotateSpeedZ;

        particle.material.opacity -= THREE.MathUtils.randFloat(0.005, 0.01);

        if (particle.position.y < -fallingHeight) {
          particle.material.dispose();
          particle.geometry.dispose();
          boom.remove(particle);
          particle = null;
        }
      }

      if (boom.children.length <= 0) {
        boom.dispose();
        setBooms((prev) => prev.filter((b) => b !== boom));
      }
    }
  });

  return <group ref={groupRef} />;
});

export default ExplosionConfetti;
