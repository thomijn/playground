// northsea-swiper.js

// Inject CSS for the Swiper carousel
(function() {
  const style = document.createElement('style');
  style.textContent = `
    .main-swiper {
      width: 80%;
      margin: 20px auto;
      height: 500px;
      overflow: hidden;
    }
    .main-swiper .swiper-slide {
      width: 200px !important;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      color: #fff;
      transition: width 0.3s;
    }
    .main-swiper .swiper-slide-active {
      width: 700px !important;
    }
  `;
  document.head.appendChild(style);
})();

// Wait for DOM and Swiper to be ready
document.addEventListener("DOMContentLoaded", function() {
  // Make sure Swiper is loaded
  if (typeof Swiper === "undefined") {
    console.error("Swiper library not loaded. Please include Swiper via CDN before this script.");
    return;
  }

  var swiper = new Swiper('.main-swiper', {
    spaceBetween: 20,
    slidesPerView: 'auto',
    initialSlide: 4,
    centeredSlides: true,
    // loop: true, // Uncomment if you want looping
    on: {
      init: function () {
        adjustMargin();
      },
      resize: function () {
        adjustMargin();
      }
    }
  });

  function adjustMargin() {
    var screenWidth = window.innerWidth;
    var wrapper = document.querySelector('.main-swiper .swiper-wrapper');
    if (wrapper) {
      if (screenWidth <= 600) {
        wrapper.style.marginLeft = "-75px";
      } else if (screenWidth <= 900) {
        wrapper.style.marginLeft = "-90px";
      } else {
        wrapper.style.marginLeft = "-250px";
      }
    }
  }

  window.addEventListener('resize', adjustMargin);
}); 