import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";
import ScrollTrigger from "gsap/ScrollTrigger";
import React from "react";
import { ReactLenis } from "@studio-freight/react-lenis";
import Flip from "gsap/Flip";

gsap.registerPlugin(useGSAP);
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(Flip);

const transformConfig = {
  columns: [
    {
      images: 5,
      xOffset: -120,
      xImageOffsets: [0, 0, 0, 0, 0],
      yImageOffsets: [0, 0, 0, 0, 0],
    },
    {
      images: 5,
      xOffset: -120,
      xImageOffsets: [0, 0, -50, 0, 0],
      yImageOffsets: [-100, -50, -20, 50, 100],
    },
    {
      images: 5,
      xOffset: 0,
      xImageOffsets: [0, 0, 0, 0, 0],
      yImageOffsets: [-100, -100, 200, 200, 200],
    },
    {
      images: 5,
      xOffset: 120,
      xImageOffsets: [0, 0, 50, 0, 0],
      yImageOffsets: [-100, -50, -20, 50, 100],
    },
    {
      images: 5,
      xOffset: 120,
      xImageOffsets: [0, 0, 0, 0, 0],
      yImageOffsets: [0, 0, 0, 0, 0],
    },
  ],
};

const Doorway = () => {
  const container = useRef();
  const centerHolder = useRef();

  const centerImages = () => {
    const images = gsap.utils.toArray(".image");
    console.log(images);
    images.forEach((image, index) => {
      gsap.set(image, { position: "fixed", top: "50%", left: "50%", xPercent: -50, yPercent: -50 });
      gsap.to(image, { opacity: 1, duration: 1, delay: index * 0.1, ease: "power3.inOut" });
    });
  };

  useLayoutEffect(
    () => () => {
      const images = document.querySelectorAll(".image");
      let states = [];
      for (let i = 0; i < images.length; i++) {
        const state = Flip.getState(images[i], {
          absolute: true,
        });

        states.push(state);
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "#wrapper",
          start: "top top",
          end: "bottom end",
          scrub: true,
          pin: "#inner-wrapper",
          toggleActions: "play none none reverse",
          markers: true,
        },
      });

      // Initial animations for scaling, translation, etc.
      tl.to(".image-wrapper", { x: 0, y: 0, duration: 1 })
        .to(".image", { scale: 1, duration: 1, transformOrigin: "center center" }, "<")
        .to("#grid-wrapper", { scale: 1.2, duration: 1 }, "<")
        .to("#title-wrapper", { opacity: 0, duration: 0.5 }, "<");

      // tl.add(() => {
      //   const images = document.querySelectorAll(".image");
      //   //add all image to the center holer

      //   console.log(centerHolder.current);
      //   const state = Flip.getState(centerHolder.current, {
      //     absolute: true,
      //   });
      //   images.forEach((image) => {
      //     Flip.fit(image, state, {
      //       duration: 0.5,
      //       ease: "power3.inOut",
      //       absolute: true,
      //       scale: true,
      //       nested: true,
      //       simple: true,
      //     });
      //   });
      // }, ">+0.5");
    },
    []
  );

  const calculateOffsets = () => {
    const viewportCenterX = window.innerWidth / 2;
    const viewportCenterY = window.innerHeight / 2;
    const images = gsap.utils.toArray(".image");

    return images.map((image) => {
      // Recursive function to accumulate transforms up the DOM tree
      const getCumulativeTransform = (element) => {
        let xOffset = 0;
        let yOffset = 0;
        let scaleFactor = 1;

        while (element) {
          const style = window.getComputedStyle(element);
          const transform = style.transform;

          if (transform && transform !== "none" && element.id !== "grid-wrapper") {
            const matrix = transform
              .match(/matrix\((.*)\)/)[1]
              .split(",")
              .map(Number);
            const scaleX = matrix[0];
            const scaleY = matrix[3];
            const translateX = matrix[4];
            const translateY = matrix[5];

            xOffset -= translateX;
            yOffset -= translateY;
            scaleFactor *= scaleX;
          }
          element = element.parentElement;
        }

        return { xOffset, yOffset, scaleFactor };
      };
      // Get the accumulated transforms for the image
      const { xOffset, yOffset, scaleFactor } = getCumulativeTransform(image);
      // Get the actual bounding rect of the image (with transformations applied)
      console.log(xOffset);
      const rect = image.getBoundingClientRect();
      const imageCenterX = rect.left + rect.width / 2 + xOffset;
      const imageCenterY = rect.top + rect.height / 2 + 0;

      // Calculate the offsets needed to move each image to the viewport center
      const finalXOffset = (viewportCenterX - imageCenterX) / 1;
      const finalYOffset = (viewportCenterY - imageCenterY) / 1;

      return { xOffset: finalXOffset, yOffset: finalYOffset, el: image };
    });
  };

  return (
    <ReactLenis root>
      <main>
        <div id="wrapper" ref={container} className="h-[400vh]  w-screen bg-white">
          <div id="inner-wrapper" className="flex flex-col z-20 items-center justify-center h-screen w-screen overflow-hidden bg-black">
            <div id="title-wrapper" className="flex flex-col relative items-center justify-center gap-4 text-center max-w-[600px] w-full text-white">
              <div className="absolute  opacity-90 z-0 grad overflow-hidden h-[70vh] w-[70vw] rounded-[100%]" />
              <h2 className="text-[40px] font-bold z-10">Marketing meets Sales here</h2>
              <p>
                Digital business cards and corporate credentials bringing your brand to every employee and client interaction. Built for Apple Wallet & Google
                Wallet.
              </p>
              <div className="flex gap-4 mt-4">
                <button className="bg-transparent border border-white text-white px-8 py-4 rounded-3xl">Get Started</button>
                <button className="bg-transparent border border-white text-white px-8 py-4 rounded-3xl">Learn More</button>
              </div>
            </div>

            <div ref={centerHolder} className="absolute h-[100px] w-[100px] z-20  bg-black opacity-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <h1 className="text-white text-center text-[40px] font-bold z-10"></h1>
            </div>

            <div
              id="grid-wrapper"
              className="grid scale-150 -z-10 grid-cols-5 gap-x-16 absolute h-screen w-full max-w-screen-lg top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              {transformConfig.columns.map((colConfig, colIndex) => (
                <div
                  key={colIndex}
                  id={`col-${colIndex}`}
                  style={{
                    transform: `translateX(${colConfig.xOffset}px)`,
                  }}
                  className="flex flex-col gap-4 items-center justify-center image-wrapper"
                >
                  {Array.from({ length: colConfig.images }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        aspectRatio: Math.random() * (1 - 0.5) + 0.7,
                        //random height
                        // height: Math.random() * (1 - 0.5) + 0.7 * 100,
                        transform: `translateX(${colConfig.xImageOffsets[i] || 0}px) translateY(${colConfig.yImageOffsets[i] || 0}px)`,
                      }}
                      className=" relative w-full image-wrapper"
                    >
                      <Image colIndex={colIndex} imageIndex={i} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="h-[200vh] w-full bg-gray-200 flex flex-col justify-center items-center">
          <h1 className="text-3xl font-bold text-center">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quia voluptas, quidem, voluptate, doloremque, consequuntur, velit perferendis, quibusdam,
            voluptatem, dolores, facere, fugiat assumenda.
          </h1>
        </div>
      </main>
    </ReactLenis>
  );
};

const Image = () => {
  return (
    <div className="bg-red-500 shadow-xl rounded-lg absolute h-full w-full image overflow-hidden">
      {/* <img src="https://picsum.photos/id/100/200/300" alt="image" className="w-full h-full" /> */}
    </div>
  );
};

export default Doorway;
