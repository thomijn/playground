import React from "react";
import { motion, MotionConfig } from "framer-motion";

const ProjectTitle = ({ foundPlane }) => {


    
  return (
    <MotionConfig
      transition={{
        duration: 0.5,
        ease: [0.625, 0.05, 0, 1],
      }}
    >
      <motion.div
        initial={{ y: 100 }}
        animate={{
          y: foundPlane !== null ? 0 : 100,

          transition: {
            duration: 0.5,
            delay: foundPlane === null ? 0 : 1.3,
            ease: [0.625, 0.05, 0, 1],
          },
        }}
        className="bottom-0 w-full flex flex-col items-start justify-center px-4 text-black h-[70px] bg-white absolute z-[9999]"
      >
        <motion.span
         initial={{ opacity: 0, y: 10 }}
         animate={{ opacity: foundPlane !== null ? 1 : 0, y: foundPlane !== null ? 0 : 10 }}
          transition={{
            duration: 0.5,
            delay: foundPlane === null ? 0 : 1.45,
            ease: [0.625, 0.05, 0, 1],
          }}
          className="text-[#979797] font-medium "
        >
          Name
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: foundPlane !== null ? 1 : 0, y: foundPlane !== null ? 0 : 10 }}
          transition={{
            duration: 0.5,
            delay: foundPlane === null ? 0 : 1.5,
            ease: [0.625, 0.05, 0, 1],
          }}
          className="font-medium"
        >
          {" "}
          The Muse / Masterplan
        </motion.h1>
      </motion.div>
    </MotionConfig>
  );
};

export default ProjectTitle;
