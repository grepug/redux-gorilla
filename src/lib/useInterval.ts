import { useRef, useEffect } from "react";

export function useInterval(
  cb: () => any,
  p: {
    delay: number | null;
    before?: () => any;
  }
) {
  const savedCallback = useRef<any>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = cb;
  }, [cb]);

  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (p.delay !== null) {
      p.before && p.before();
      let id = setInterval(tick, p.delay);
      return () => clearInterval(id);
    }
    return;
  }, [p.delay]);
}
