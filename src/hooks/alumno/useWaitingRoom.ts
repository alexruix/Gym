import { useCallback, useState } from "react";

export function useWaitingRoom() {
  const [isChecking, setIsChecking] = useState(false);

  const handleCheckAgain = useCallback(() => {
    setIsChecking(true);
    // Agregamos un peque\u00f1o delay visual antes del recargo
    setTimeout(() => {
      window.location.reload();
    }, 400);
  }, []);

  return {
    isChecking,
    handleCheckAgain,
  };
}
