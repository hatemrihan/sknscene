'use client';

import React from 'react';

export default function Featured() {
  return (
    <section className="featured-section">
      {/* Desktop / Laptop — one.mp4 */}
      <div className="featured-video featured-video--desktop">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="featured-video__player"
        >
          <source src="/videos/one_optimized.webm" type="video/webm" />
          <source src="/videos/one.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Mobile / iPhone — two.mp4 */}
      <div className="featured-video featured-video--mobile">
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="featured-video__player"
        >
          <source src="/videos/two_optimized.webm" type="video/webm" />
          <source src="/videos/two.mp4" type="video/mp4" />
        </video>
      </div>

      <style jsx>{`
        .featured-section {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          padding-bottom: 60px;
        }

        /* ── Desktop: show one.mp4, centered & reduced ── */
        .featured-video--desktop {
          display: none;
        }

        @media (min-width: 1024px) {
          .featured-section {
            padding-bottom: 80px;
          }

          .featured-video--desktop {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
            max-width: 520px;
            margin: 0 auto;
          }

          .featured-video--desktop .featured-video__player {
            width: 100%;
            height: auto;
            display: block;
          }
        }

        /* ── Mobile: show two.mp4, full-width ── */
        .featured-video--mobile {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
        }

        .featured-video--mobile .featured-video__player {
          width: 100%;
          height: auto;
          display: block;
        }

        @media (min-width: 1024px) {
          .featured-video--mobile {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
