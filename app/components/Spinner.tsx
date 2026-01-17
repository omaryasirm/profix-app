import React from "react";

const Spinner = ({ fullPage }: { fullPage?: boolean }) => {
  const spinner = () => {
    return (
      <div
        className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
        role="status"
      >
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Loading...
        </span>
      </div>
    );
  };

  return (
    <div className={fullPage ?? false ? "h-full" : "flex"}>
      {fullPage ?? false ? (
        <div
          className="flex justify-center items-center"
          style={{ height: "calc(100% - 150px)" }}
        >
          {spinner()}
        </div>
      ) : (
        spinner()
      )}
    </div>
  );
};

export default Spinner;
