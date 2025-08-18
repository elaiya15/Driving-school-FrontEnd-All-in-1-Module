// Components/NetworkStatus.jsx
import { useEffect, useState } from "react";

function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineMsg, setShowOnlineMsg] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOnlineMsg(true);
      setTimeout(() => setShowOnlineMsg(false), 3000);
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
        <div className="fixed top-0 w-full bg-red-600 text-white text-center py-2 z-[9999]">
           🚫 Could not connect to internet
        </div>
      )}
      {isOnline && showOnlineMsg && (
        <div className="fixed top-0 w-full bg-green-600 text-white text-center py-2 z-[9999]">
           ✅ You're back online
        </div>
      )}
    </>
  );
}

export default NetworkStatus;
