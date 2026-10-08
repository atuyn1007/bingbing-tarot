import { useEffect, useRef } from 'react';
import { attachModalFocus } from '../../modalFocus';

export default function useModalFocus(onClose, enabled = true) {
  const panel = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (enabled && panel.current) {
      return attachModalFocus(panel.current, () => close.current());
    }
  }, [enabled]);
  return panel;
}
