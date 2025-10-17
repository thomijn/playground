import { useControls } from "leva";
import { useMemo } from "react";
import { DEFAULT_ACCENTS } from "./constants";

export function useColorControls() {
  const { color1, color2, color3, color4 } = useControls("Ball Colors", {
    color1: { value: DEFAULT_ACCENTS[0], label: "Color 1" },
    color2: { value: DEFAULT_ACCENTS[1], label: "Color 2" },
    color3: { value: DEFAULT_ACCENTS[2], label: "Color 3" },
    color4: { value: DEFAULT_ACCENTS[3], label: "Color 4" },
  });

  const accents = useMemo(() => 
    [color1, color2, color3, color4], 
    [color1, color2, color3, color4]
  );

  return accents;
}
