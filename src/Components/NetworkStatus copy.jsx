// Components/NetworkStatus.jsx
import { useState, useEffect } from "react";

function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineMessage, setShowOnlineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineMessage(true);
      setTimeout(() => setShowOnlineMessage(false), 3000); // hide after 3 sec
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 z-50">
          🚫 Could not connect to internet
        </div>
      )}
      {isOnline && showOnlineMessage && (
        <div className="fixed top-0 left-0 right-0 bg-green-600 text-white text-center py-2 z-50">
           ✅ You're back online
        </div>
      )}
    </>
  );
}

export default NetworkStatus;
