import '@testing-library/jest-dom';

// jsdom has no layout engine, so this is a no-op that components call in real browsers.
// Server-side tests run in the node environment, which has no Element at all.
if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = jest.fn();
}
