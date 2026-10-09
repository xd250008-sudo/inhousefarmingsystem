export type SerialPortLike = {
  open: (options: SerialOptions) => Promise<void>;
  close: () => Promise<void>;
  readable: ReadableStream<Uint8Array> | null;
  writable: WritableStream<Uint8Array> | null;
};

export interface SerialOptions {
  baudRate: number;
}

export type NavigatorWithSerial = Navigator & {
  serial?: {
    requestPort: (options?: { filters?: unknown[] }) => Promise<SerialPortLike>;
    getPorts: () => Promise<SerialPortLike[]>;
  };
};

export function isWebSerialSupported(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as NavigatorWithSerial;
  return typeof nav.serial !== "undefined" && typeof nav.serial.requestPort === "function";
}
