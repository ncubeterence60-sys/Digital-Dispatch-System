export {};

declare global {
  interface Window {
    electronAPI: {
      on(channel: string, listener: (...args: any[]) => void): () => void;
      removeAllListeners(channel: string): void;
    };
  }
}

