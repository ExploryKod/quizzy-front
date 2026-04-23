// @ts-expect-error https://thymikee.github.io/jest-preset-angular/docs/getting-started/test-environment
globalThis.ngJest = {
  testEnvironmentOptions: {
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
  },
};
import 'jest-preset-angular/setup-jest';
import { TextDecoder, TextEncoder } from 'node:util';
// Using require here avoids TS export mismatches across Node/Jest typings.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const webStreams = require('stream/web');

if (!globalThis.TextEncoder) {
  // Firebase/undici expect Web TextEncoder in Jest runtime.
  Object.defineProperty(globalThis, 'TextEncoder', { value: TextEncoder });
}

if (!globalThis.TextDecoder) {
  Object.defineProperty(globalThis, 'TextDecoder', { value: TextDecoder });
}

if (!globalThis.ReadableStream) {
  Object.defineProperty(globalThis, 'ReadableStream', { value: webStreams.ReadableStream });
}

if (!globalThis.WritableStream) {
  Object.defineProperty(globalThis, 'WritableStream', { value: webStreams.WritableStream });
}

if (!globalThis.TransformStream) {
  Object.defineProperty(globalThis, 'TransformStream', { value: webStreams.TransformStream });
}
