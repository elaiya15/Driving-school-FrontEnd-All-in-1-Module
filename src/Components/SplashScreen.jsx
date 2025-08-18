import React from "react";
import logo from "../../src/assets/logo.png";
function SplashScreen() {
  return (
    <React.Fragment>
      <section className="">
        <div className="w-full h-screen flex justify-center items-center flex-col space-y-5">
          <img
            src={logo}
            alt="logo"
            className="w-32 sm:48 rounded-full object-cover"
          />
          <h1 className="font-semibold text-base">Driving School</h1>
        </div>
      </section>
    </React.Fragment>
  );
}

export default SplashScreen;
