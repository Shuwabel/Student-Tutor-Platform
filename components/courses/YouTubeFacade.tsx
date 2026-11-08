'use client'

import { useState } from 'react'
import { Play } from 'lucide-react'

/** Nothing from YouTube loads until the learner presses play. */
export default function YouTubeFacade({ videoId, title }: { videoId: string; title: string }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="mb-6 aspect-video w-full max-w-3xl overflow-hidden rounded-md border border-border bg-card">
      {playing ? (
        <iframe
          className="h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`}
          title={`Video: ${title}`}
          allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="flex h-full w-full flex-col items-center justify-center gap-3 bg-muted text-foreground transition-colors hover:bg-accent"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full bg-primary text-primary-foreground">
            <Play className="h-7 w-7" aria-hidden="true" />
          </span>
          <span className="font-semibold">Play video</span>
          <span className="max-w-xs px-4 text-center text-xs text-muted-foreground">Loads from YouTube only when you press play.</span>
        </button>
      )}
    </div>
  )
}
