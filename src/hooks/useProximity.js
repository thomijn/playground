import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useState } from "react";

const useProximity = (ref, options) => {
  const {
    distance = 5,
    onProximity = () => {},
    onExitProximity = () => {},
  } = options;
  const [proximity, setProximity] = useState(false);
  const { camera } = useThree();
  useFrame(() => {
    const distanceFromCamera = ref.current.position.distanceTo(camera.position);
    setProximity(distanceFromCamera < distance);
  });
  useEffect(() => {
    if (proximity) {
      onProximity();
    } else {
      onExitProximity();
    }
  }, [proximity, onProximity]);
  return proximity;
};

export default useProximity;
