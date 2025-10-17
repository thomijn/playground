import React from "react";

const UI = () => {
  return (
    <section className="h-[200vh] w-screen absolute top-0 left-0 bg-[#020D0D]">
      {/* Cinnamon Logo - Top Left */}
      <div className="absolute md:top-10 md:left-10 top-5 left-3 z-20 pointer-events-none">
        <img src="/cinnamon/logo.png" alt="Cinnamon Logo" className="md:h-16 h-10 w-auto opacity-90" />
      </div>

      <div className="absolute top-0 h-screen w-screen inset-0 pointer-events-none z-10 flex items-center justify-center">
        <div className="text-center top-[-100px] relative">
          <h1
            className={`
              max-w-[900px] mx-auto
              text-balance
              font-gully
              font-bold
              text-[48px] sm:text-[70px] md:text-[85px] lg:text-[100px]
              leading-[42px] sm:leading-[60px] md:leading-[74px] lg:leading-[85px]
              tracking-[-2px] md:tracking-[-3px] lg:tracking-[-4px]
              uppercase
              text-[#D7E4E4]
              text-center
              drop-shadow-[2px_2px_4px_rgba(0,0,0,0.1)]
              select-none
              px-2
            `}
          >
            Cinnamon.
            <br />
            <span>
              Experience the next big game
            </span>
          </h1>
        </div>
      </div>
    </section>
  );
};

export default UI;
