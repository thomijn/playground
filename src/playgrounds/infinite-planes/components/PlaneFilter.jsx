import React, { useEffect } from "react";
import { motion, LayoutGroup, AnimatePresence, MotionConfig } from "framer-motion";

function PlaneFilter({ typeOfView, setTypeOfView, foundPlane, setFoundPlane }) {
  // Handle Escape key to reset found plane
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && foundPlane !== null) {
        setFoundPlane(null);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [foundPlane, setFoundPlane]);

  return (
    <MotionConfig
      transition={{
        duration: 0.5,
        ease: [0.625, 0.05, 0, 1],
      }}
    >
      <motion.div className="absolute overflow-hidden bottom-6 left-1/2 transform z-[9999] -translate-x-1/2">
        <LayoutGroup>
          <motion.div
            initial={{ y: 100 }}
            animate={{
              y: foundPlane === null ? 0 : 100,
              transition: {
                duration: 1,
                ease: [0.625, 0.05, 0, 1],
                delay: foundPlane !== null ? 0 : 1.5,
              },
            }}
            className="flex items-center px-4 py-3 gap-[5px]"
            layout
          >
            <motion.button
              layout
              onClick={() => setTypeOfView(typeOfView === "Grid" ? "Timeline" : "Grid")}
              className="px-4 py-2 h-[40px] flex items-center gap-2 text-black text-sm rounded-[2px]  focus:outline-none  bg-white"
              disabled={foundPlane !== null}
            >
              {/* <AnimatedIcon /> */}
              <AnimatePresence mode="wait">
                {typeOfView === "Grid" ? (
                  <React.Fragment key="grid">
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      layout
                      src="/barcode/icon.svg"
                      alt="Grid"
                      className="w-4 h-4"
                    />
                    <motion.span layout key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-black block">
                      Grid
                    </motion.span>
                  </React.Fragment>
                ) : (
                  <React.Fragment key="timeline">
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      layout
                      src="/barcode/icon2.svg"
                      alt="Grid"
                      className="w-5 h-8"
                    />
                    <motion.span layout key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-black block">
                      Timeline
                    </motion.span>
                  </React.Fragment>
                )}
              </AnimatePresence>
            </motion.button>
            <motion.input
              layout
              type="text"
              placeholder="What are you looking for?"
              className="px-3 py-2 h-[40px] w-[400px] text-sm rounded-[2px] text-black focus:outline-none  bg-white"
              disabled={foundPlane !== null}
            />
          </motion.div>
        </LayoutGroup>
      </motion.div>
    </MotionConfig>
  );
}

const AnimatedIcon = () => {
  return (
    <motion.div layout>
      <motion.svg layout xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <rect width="2" height="2" fill="black" />
        <rect width="2" height="2" transform="translate(6)" fill="black" />
        <rect width="2" height="2" transform="translate(12)" fill="black" />
        <rect width="2" height="2" transform="translate(0 6)" fill="black" />
        <rect width="2" height="2" transform="translate(6 6)" fill="black" />
        <rect width="2" height="2" transform="translate(12 6)" fill="black" />
        <rect width="2" height="2" transform="translate(0 12)" fill="black" />
        <rect width="2" height="2" transform="translate(6 12)" fill="black" />
        <rect width="2" height="2" transform="translate(12 12)" fill="black" />
      </motion.svg>
    </motion.div>
  );
};

export default PlaneFilter;
