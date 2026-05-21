import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path';
// import svgr from '@svgr/rollup';


// https://vite.dev/config/
export default defineConfig({
  
  plugins: [react(),
        tailwindcss(),
        // svgr(),
  ],
  
  resolve: {
      alias: {
          src: resolve(__dirname, 'src'),
      },
  },
});
