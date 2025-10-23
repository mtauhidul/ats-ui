import { useState, useEffect, type RefObject } from 'react';

export interface ElementSize {
  width: number;
  height: number;
}

/**
 * Custom hook to track the size of a DOM element using ResizeObserver
 * 
 * @param ref - React ref object pointing to the element to observe
 * @returns Object containing the current width and height of the element
 * 
 * @example
 * const containerRef = useRef<HTMLDivElement>(null);
 * const { width, height } = useElementSize(containerRef);
 */
export function useElementSize(ref: RefObject<HTMLElement | null>): ElementSize {
  const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    observer.observe(element);

    // Set initial size
    const rect = element.getBoundingClientRect();
    setSize({
      width: rect.width,
      height: rect.height,
    });

    return () => observer.disconnect();
  }, [ref]);

  return size;
}
