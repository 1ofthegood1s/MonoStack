import { defineConfig } from 'vite';

// Served from https://1ofthegood1s.github.io/MonoStack/ — assets need the
// repo-name prefix. Change base to '/' if this ever moves to a domain root.
export default defineConfig({
  base: '/MonoStack/',
  build: {
    rollupOptions: {
      output: {
        // cannon-es carries no inline banner of its own; MIT asks for the
        // notice in distributed copies (three.js and postprocessing keep
        // their own @license comments through minification).
        banner:
          '/*! Bundles cannon-es — MIT — Copyright (c) 2015 cannon.js, 2020 cannon-es contributors */',
      },
    },
  },
});
