import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/thumbs";

const NorthSea = () => {
  const [thumbsSwiper, setThumbsSwiper] = React.useState(null);
  const swiperRef = useRef(null);
  const swiperWrapperRef = useRef(null);

  const slides = ["red", "green", "blue", "orange", "purple", "teal", "brown", "pink", "grey"];

  // React.useEffect(() => {
  //   if (swiperRef.current && swiperRef.current.swiper) {
  //     swiperRef.current.swiper.controller.control = thumbsSwiper;
  //   }
  // }, [thumbsSwiper]);

  function adjustMargin() {
    const screenWidth = window.innerWidth;
    if (swiperWrapperRef.current) {
      swiperWrapperRef.current.style.marginLeft = screenWidth <= 600 ? "-75px" : screenWidth <= 900 ? "-90px" : "-250px";
    }
  }

  return (
    <div className="swiper-container">
      <Swiper
        spaceBetween={20}
        slidesPerView={"auto"}
        initialSlide={4}
        centeredSlides={true}
        // loop={true}
        className="main-swiper"
        ref={swiperRef}
        onSwiper={(swiper) => {
          swiperWrapperRef.current = swiper.wrapperEl;
          swiper.on("resize", adjustMargin);
        }}
      >
        {slides.map((color, index) => (
          <SwiperSlide key={index}>
            <div
              style={{
                backgroundColor: color,
                width: "100%",
                height: "100%",
              }}
            >
              Slide {index + 1}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style jsx>{`
        .swiper-container {
          width: 80%;
          margin: 20px auto;
          overflow: hidden;
        }

        .main-swiper {
          height: 500px;
        }

        .main-swiper .swiper-slide {
          width: 200px;
          transition: 0.3s;
        }

        .main-swiper .swiper-slide-active {
          width: 700px;
        }

        .thumbs-swiper {
          height: 75px;
          margin-bottom: 20px;
        }
        .thumbs-swiper .swiper-slide {
          opacity: 0.4;
        }

        .thumbs-swiper .swiper-slide-thumb-active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
};

export default NorthSea;
