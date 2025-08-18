// Components/NetworkStatus.jsx
import { useState, useEffect } from "react";

function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOnlineMsg, setShowOnlineMsg] = useState(false);

  const checkInternet = async () => {
    try {
      // Use lightweight request to test connectivity
      await fetch("https://www.gstatic.com/generate_204", {
        method: "GET",
        mode: "no-cors",
      });

      if (!isOnline) {
        setIsOnline(true);
        setShowOnlineMsg(true);
        setTimeout(() => setShowOnlineMsg(false), 3000);
      }
    } catch (e) {
      setIsOnline(false);
    }
  };

  useEffect(() => {
    checkInternet(); // First check

    const interval = setInterval(() => {
      checkInternet();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [isOnline]);

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 w-full bg-red-600 text-white text-center py-2 z-50">
           🚫 Could not connect to internet
        </div>
      )}
      {isOnline && showOnlineMsg && (
        <div className="fixed top-0 w-full bg-green-600 text-white text-center py-2 z-50">
          ✅ You're back online
        </div>
      )}
    </>
  );
}

export default NetworkStatus;
