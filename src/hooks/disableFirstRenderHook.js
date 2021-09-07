import { useRef, useEffect } from "react";

export const IsFirstRender = () => {
  const isFirstRenderRef = useRef(true);
  useEffect(() => {
    isFirstRenderRef.current = false;
  }, []);
  return isFirstRenderRef.current;
};
