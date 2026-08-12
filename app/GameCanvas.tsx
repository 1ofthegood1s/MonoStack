'use client';

import { useEffect, useRef } from 'react';

// Mounts the three.js game into #app after hydration. The game modules are
// dynamically imported so nothing touches window/localStorage at build time.
// Boot-once guard: the game owns window-level listeners, so StrictMode's
// dev double-mount must not start it twice.
export default function GameCanvas() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const w = window as unknown as { __monostackBooted?: boolean };
    if (w.__monostackBooted || !hostRef.current) return;
    w.__monostackBooted = true;
    let stop: (() => void) | undefined;
    void import('../src/boot').then(({ boot }) => {
      if (hostRef.current) stop = boot(hostRef.current);
    });
    return () => stop?.();
  }, []);

  return <div id="app" ref={hostRef} />;
}
