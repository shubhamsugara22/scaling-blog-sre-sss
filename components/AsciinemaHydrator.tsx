'use client';

import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import AsciinemaPlayer from './AsciinemaPlayer';

/**
 * Client-side component that hydrates Asciinema placeholders
 * with the actual AsciinemaPlayer component.
 * 
 * This component scans the DOM for elements with class "asciinema-embed"
 * and replaces them with the AsciinemaPlayer React component.
 */
export default function AsciinemaHydrator() {
  useEffect(() => {
    // Find all Asciinema embed placeholders
    const embeds = document.querySelectorAll('.asciinema-embed');
    
    embeds.forEach((embed) => {
      const castId = embed.getAttribute('data-cast-id');
      if (!castId) return;
      
      // Extract configuration from data attributes
      const theme = embed.getAttribute('data-theme') || 'monokai';
      const speed = parseFloat(embed.getAttribute('data-speed') || '1');
      const autoPlay = embed.getAttribute('data-auto-play') === 'true';
      const loop = embed.getAttribute('data-loop') === 'true';
      const cols = embed.getAttribute('data-cols');
      const rows = embed.getAttribute('data-rows');
      
      // Create a container for the React component
      const container = document.createElement('div');
      embed.parentNode?.replaceChild(container, embed);
      
      // Render the AsciinemaPlayer component
      const root = createRoot(container);
      root.render(
        <AsciinemaPlayer
          castId={castId}
          theme={theme as any}
          speed={speed}
          autoPlay={autoPlay}
          loop={loop}
          cols={cols ? parseInt(cols, 10) : undefined}
          rows={rows ? parseInt(rows, 10) : undefined}
        />
      );
    });
  }, []);
  
  return null;
}
