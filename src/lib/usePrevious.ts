import { useRef, useEffect } from 'react';

export function usePrevious<T>(value: T, debugName?: string) {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  });
  if (debugName) {
    console.group('usePrevious', debugName);
    console.log(value, ref.current, value === ref.current);
    console.groupEnd();
  }
  return ref.current;
}
