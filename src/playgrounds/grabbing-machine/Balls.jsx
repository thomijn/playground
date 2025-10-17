import { useThree } from "@react-three/fiber";
import { useMemo } from "react";
import Sphere from "./Sphere";
import { useColorControls } from "./ColorControls";
import { PHYSICS_SETTINGS } from "./constants";

export default function Balls() {
  const { viewport } = useThree();
  const accents = useColorControls();
  
  const balls = useMemo(() => {
    const ballInstances = [];
    for (let i = 0; i < PHYSICS_SETTINGS.BALL_COUNT; i++) {
      ballInstances.push({
        accents,
        position: [
          Math.random() * viewport.width - viewport.width / 2,
          Math.random() * viewport.height - viewport.height / 2 + 8,
          Math.random() * 5 - 2.5
        ],
        scale: Math.random() * 0.5 + 0.5
      });
    }
    return ballInstances;
  }, [viewport.width, viewport.height, accents]);

  return (
    <>
      {balls.map((props, i) => (
        <Sphere key={i} {...props} />
      ))}
    </>
  );
}
