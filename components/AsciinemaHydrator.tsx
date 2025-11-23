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
    try {
      // Find all Asciinema embed placeholders
      const embeds = document.querySelectorAll('.asciinema-embed');
      
      embeds.forEach((embed) => {
        try {
          const castId = embed.getAttribute('data-cast-id');
          if (!castId) {
            console.warn('Asciinema embed missing cast-id attribute');
            return;
          }
          
          // Extract configuration from data attributes
          const theme = embed.getAttribute('data-theme') || 'monokai';
          const speedAttr = embed.getAttribute('data-speed');
          const speed = speedAttr ? parseFloat(speedAttr) : 1;
          const autoPlay = embed.getAttribute('data-auto-play') === 'true';
          const loop = embed.getAttribute('data-loop') === 'true';
          const cols = embed.getAttribute('data-cols');
          const rows = embed.getAttribute('data-rows');
          
          // Validate speed value
          if (isNaN(speed) || speed <= 0) {
            console.warn(`Invalid speed value for Asciinema player: ${speedAttr}, using default`);
          }
          
          // Create a container for the React component
          const container = document.createElement('div');
          
          if (!embed.parentNode) {
            console.error('Asciinema embed has no parent node');
            return;
          }
          
          embed.parentNode.replaceChild(container, embed);
          
          // Render the AsciinemaPlayer component
          const root = createRoot(container);
          root.render(
            <AsciinemaPlayer
              castId={castId}
              theme={theme as any}
              speed={isNaN(speed) || speed <= 0 ? 1 : speed}
              autoPlay={autoPlay}
              loop={loop}
              cols={cols ? parseInt(cols, 10) : undefined}
              rows={rows ? parseInt(rows, 10) : undefined}
            />
          );
        } catch (error) {
          console.error('Error hydrating individual Asciinema embed:', error);
          // Continue processing other embeds
        }
      });
    } catch (error) {
      console.error('Error in AsciinemaHydrator:', error);
      // Fail silently to not break the page
    }
  }, []);
  
  return null;
}
