// Browser polyfills for Node.js features used by Solana Web3.js
export function createBuffer(data: number[] | ArrayBuffer | string): Uint8Array {
  if (Array.isArray(data)) {
    return new Uint8Array(data);
  }
  if (typeof data === 'string') {
    return new TextEncoder().encode(data);
  }
  if (data instanceof ArrayBuffer) {
    return new Uint8Array(data);
  }
  return new Uint8Array(0);
}

// Mock Buffer.from for browser compatibility
if (typeof window !== 'undefined' && !window.Buffer) {
  (window as any).Buffer = {
    from: createBuffer,
    isBuffer: (obj: any) => obj instanceof Uint8Array,
  };
}

export default {};