const stacks = new WeakMap();
const controls = 'button, [href], input, select, textarea, [tabindex]';

/** Owns focus only while this overlay is the topmost custom dialog. */
export function attachModalFocus(panel, onClose) {
  const doc = panel.ownerDocument;
  const opener = doc.activeElement;
  const stack = stacks.get(doc) ?? [];
  stacks.set(doc, stack);
  const entry = { panel };
  stack.push(entry);
  const nativeAbove = () => {
    const native = doc.querySelector('dialog[open]');
    return native && !panel.contains(native);
  };
  const active = () => stack.at(-1) === entry && !nativeAbove();
  const focusable = () => [...panel.querySelectorAll(controls)].filter(node =>
    !node.disabled && node.tabIndex >= 0 && !node.closest('[inert], [hidden]') &&
    node.getClientRects().length > 0 &&
    doc.defaultView?.getComputedStyle(node).visibility !== 'hidden');
  const focus = node => node?.focus({ preventScroll: true });
  const focusFirst = () => focus(focusable()[0] ?? panel);
  const keydown = event => {
    if (!active() || event.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onClose();
    } else if (event.key === 'Tab') {
      const items = focusable();
      const first = items[0], last = items.at(-1);
      if (!items.length || !items.includes(doc.activeElement) ||
        (event.shiftKey ? doc.activeElement === first : doc.activeElement === last)) {
        event.preventDefault();
        focus((event.shiftKey ? last : first) ?? panel);
      }
    }
  };
  const focusin = event => {
    if (active() && !panel.contains(event.target)) focusFirst();
  };
  doc.addEventListener('keydown', keydown);
  doc.addEventListener('focusin', focusin);
  if (active()) focusFirst();
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    const wasTop = stack.at(-1) === entry;
    stack.splice(stack.indexOf(entry), 1);
    doc.removeEventListener('keydown', keydown);
    doc.removeEventListener('focusin', focusin);
    if (wasTop && !nativeAbove() && opener?.isConnected &&
      (!stack.length || stack.at(-1).panel.contains(opener))) focus(opener);
  };
}
