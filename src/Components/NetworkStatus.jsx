import { useEffect, useState, useRef } from "react";

function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOnlineMsg, setShowOnlineMsg] = useState(false);
  const wasActuallyOffline = useRef(false); // tracks real offline events

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (wasActuallyOffline.current) {
        setShowOnlineMsg(true);
        setTimeout(() => setShowOnlineMsg(false), 3000);
        wasActuallyOffline.current = false;
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      wasActuallyOffline.current = true;
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
        <div className="fixed bottom-0 w-full bg-red-600 text-white text-center py-2 z-[9999]">
          🚫 No internet connection
        </div>
      )}
      {isOnline && showOnlineMsg && (
        <div className="fixed bottom-0 w-full bg-green-600 text-white text-center py-2 z-[9999]">
          ✅ We are back online
        </div>
      )}
    </>
  );
}

export default NetworkStatus;
