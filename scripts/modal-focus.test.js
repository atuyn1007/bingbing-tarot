import test from 'node:test';
import assert from 'node:assert/strict';
import { attachModalFocus } from '../src/modalFocus.js';

// Minimal DOM boundary: focus events and keyboard defaults remain observable.
function fixture() {
  const listeners = {};
  const doc = {
    activeElement: null, native: null,
    querySelector: () => doc.native,
    addEventListener(type, fn) { (listeners[type] ??= new Set()).add(fn); },
    removeEventListener(type, fn) { listeners[type].delete(fn); },
    dispatch(type, event) { for (const fn of [...(listeners[type] ?? [])]) fn(event); },
  };
  function element(children = []) {
    const node = {
      ownerDocument: doc, isConnected: true, disabled: false, tabIndex: 0,
      getClientRects: () => [1], closest: () => null,
      contains: target => target === node || children.includes(target),
      querySelectorAll: () => children,
      focus() { doc.activeElement = node; doc.dispatch('focusin', { target: node }); },
    };
    return node;
  }
  const opener = element(); opener.focus();
  const first = element(), last = element(), panel = element([first, last]);
  const key = (key, shiftKey = false) => {
    const event = { key, shiftKey, prevented: false, preventDefault() { this.prevented = true; }, stopPropagation() {} };
    doc.dispatch('keydown', event); return event;
  };
  return { doc, element, opener, first, last, panel, key };
}

test('focus enters modal, Tab wraps both ways, and cleanup restores opener', () => {
  const f = fixture(); const dispose = attachModalFocus(f.panel, () => {});
  assert.equal(f.doc.activeElement, f.first);
  assert.equal(f.key('Tab', true).prevented, true);
  assert.equal(f.doc.activeElement, f.last);
  f.key('Tab'); assert.equal(f.doc.activeElement, f.first);
  f.opener.focus(); assert.equal(f.doc.activeElement, f.first);
  dispose(); assert.equal(f.doc.activeElement, f.opener);
  f.key('Tab'); assert.equal(f.doc.activeElement, f.opener);
});

test('only top modal handles Escape and nested cleanup restores parent focus', () => {
  const f = fixture(); let parent = 0, child = 0;
  const closeParent = attachModalFocus(f.panel, () => parent++);
  const childButton = f.element(), childPanel = f.element([childButton]);
  const closeChild = attachModalFocus(childPanel, () => child++);
  f.key('Escape'); assert.equal(child, 1); assert.equal(parent, 0);
  closeChild(); assert.equal(f.doc.activeElement, f.first);
  f.key('Escape'); assert.equal(parent, 1);
  closeParent(); f.key('Escape'); assert.equal(parent, 1);
});

test('native share dialog suspends parent trap and Escape handler', () => {
  const f = fixture(); let closed = 0;
  const dispose = attachModalFocus(f.panel, () => closed++);
  f.doc.native = f.element(); f.doc.native.focus();
  assert.equal(f.doc.activeElement, f.doc.native);
  assert.equal(f.key('Escape').prevented, false); assert.equal(closed, 0);
  f.doc.native = null; f.first.focus(); f.key('Escape'); assert.equal(closed, 1);
  dispose();
});

test('disabled controls are skipped and empty modal traps focus on panel', () => {
  const f = fixture(); f.last.disabled = true;
  const dispose = attachModalFocus(f.panel, () => {});
  f.key('Tab'); assert.equal(f.doc.activeElement, f.first);
  f.first.disabled = true; f.key('Tab'); assert.equal(f.doc.activeElement, f.panel);
  f.opener.isConnected = false; dispose(); assert.equal(f.doc.activeElement, f.panel);
});
