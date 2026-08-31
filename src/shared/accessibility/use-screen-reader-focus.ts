import { useEffect, useRef } from 'react';
import { AccessibilityInfo, findNodeHandle, Text } from 'react-native';

export function useScreenReaderFocus() {
  const headingRef = useRef<Text>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const node = findNodeHandle(headingRef.current);
      if (node) AccessibilityInfo.setAccessibilityFocus(node);
    }, 250);
    return () => clearTimeout(timer);
  }, []);

  return headingRef;
}

export function useScreenReaderFocusWhen(shouldFocus: boolean, delay = 100) {
  const targetRef = useRef<Text>(null);

  useEffect(() => {
    if (!shouldFocus) return;
    const timer = setTimeout(() => {
      const node = findNodeHandle(targetRef.current);
      if (node) AccessibilityInfo.setAccessibilityFocus(node);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, shouldFocus]);

  return targetRef;
}
