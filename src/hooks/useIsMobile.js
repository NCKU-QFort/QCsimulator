import { useEffect, useState } from "react";

/**
 * Hook to detect if the viewport is in mobile size
 * @returns {boolean} True if viewport width is less than 768px
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}
