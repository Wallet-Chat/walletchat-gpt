import React, { useState, useEffect } from "react";

const Alert = () => {
  const [showAlert, setShowAlert] = useState(true);

  const handleClose = () => {
    setShowAlert(false);
    localStorage.setItem("hideAlert", "true"); // Store in local storage that alert is closed
  };

  // Check if alert should be shown based on local storage
  if (!showAlert && localStorage.getItem("hideAlert") === "true") {
    return null; // Don't render the alert if it's closed and stored in local storage
  }
  return (
    <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4">
      <div className="flex text-center justify-center">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            You have to connect your wallet for a private session, all data here
            is public.
          </p>
        </div>
        <button
          type="button"
          className="ml-auto text-yellow-700 focus:outline-none"
          onClick={handleClose}
          aria-label="Close"
        >
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M14.343 5.757a1 1 0 010 1.414L11.414 10l2.93 2.929a1 1 0 11-1.414 1.414L10 11.414l-2.929 2.93a1 1 0 01-1.414-1.414L8.586 10 5.657 7.071a1 1 0 111.414-1.414L10 8.586l2.929-2.93a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Alert;
