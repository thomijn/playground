import { useEffect, useState } from "react";
import useScript from "./useScript";

const use8thwallScripts = (appKey) => {
  const [isReady, setIsReady] = useState(false);
  const isScriptXrwebReady = useScript(
    `//apps.8thwall.com/xrweb?appKey=${appKey}`
  );
  const isScriptXrextrasReady = useScript(
    "//cdn.8thwall.com/web/xrextras/xrextras.js"
  );

  const isCoachingOverlayReady = useScript(
    "//cdn.8thwall.com/web/coaching-overlay/coaching-overlay.js"
  );

  useEffect(() => {
    if (isScriptXrwebReady && isScriptXrextrasReady && isCoachingOverlayReady) {
      setIsReady(true);
    }
  }, [isScriptXrwebReady, isScriptXrextrasReady, isCoachingOverlayReady]);

  return isReady;
};

export default use8thwallScripts;
