'use client';

import { useEffect, useRef, useState } from 'react';

export interface AsciinemaPlayerProps {
  castId: string;
  theme?: 'asciinema' | 'monokai' | 'solarized-dark' | 'solarized-light';
  speed?: number;
  autoPlay?: boolean;
  loop?: boolean;
  cols?: number;
  rows?: number;
}

export default function AsciinemaPlayer({
  castId,
  theme = 'monokai',
  speed = 1,
  autoPlay = false,
  loop = false,
  cols,
  rows,
}: AsciinemaPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let player: any = null;

    const loadPlayer = async () => {
      try {
        // Dynamically import asciinema-player
        const { create } = await import('asciinema-player');
        
        if (!isMounted || !containerRef.current) return;

        // Clear any existing content
        containerRef.current.innerHTML = '';

        // Construct the source URL for asciinema.org recordings
        const src = castId.startsWith('http') 
          ? castId 
          : `https://asciinema.org/a/${castId}.cast`;

        // Create player
        player = create(
          src,
          containerRef.current,
          {
            theme,
            speed,
            autoPlay,
            loop,
            cols,
            rows,
          }
        );

        if (!player && isMounted) {
          setError('Failed to create Asciinema player');
        }

        setIsLoading(false);
      } catch (err) {
        if (isMounted) {
          console.error('Error loading Asciinema player:', err);
          setError('Failed to load Asciinema player. Please check your connection.');
          setIsLoading(false);
        }
      }
    };

    loadPlayer();

    return () => {
      isMounted = false;
      // Cleanup player if it exists
      if (player && player.dispose) {
        try {
          player.dispose();
        } catch (err) {
          console.error('Error disposing player:', err);
        }
      }
    };
  }, [castId, theme, speed, autoPlay, loop, cols, rows]);

  if (error) {
    return (
      <div className="asciinema-error border border-red-300 bg-red-50 p-4 rounded-md">
        <p className="text-red-800 text-sm">
          <strong>Asciinema Player Error:</strong> {error}
        </p>
        <p className="text-red-600 text-xs mt-2">
          Cast ID: {castId}
        </p>
      </div>
    );
  }

  return (
    <div className="asciinema-player-wrapper my-6">
      {isLoading && (
        <div className="flex items-center justify-center p-8 bg-gray-100 rounded-md">
          <div className="text-gray-600">Loading terminal recording...</div>
        </div>
      )}
      <div ref={containerRef} className={isLoading ? 'hidden' : ''} />
    </div>
  );
}
