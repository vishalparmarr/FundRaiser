import React from "react";
import { ConnectWallet } from "@thirdweb-dev/react";
const Logout = () => {
  return (
    <div className="sm:flex flex flex-col items-center mt-[12%] mr-[50%] ml-[50%]">
      <div className="transition duration-300 ease-in-out hover:scale-110">
        <ConnectWallet 
          theme={"light"}
        />
      </div>
    </div>
  );
};

export default Logout;
