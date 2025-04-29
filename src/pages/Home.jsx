// src/pages/Home.jsx
import React, { useEffect, useRef, useState } from 'react';
import './Home.css';

const carouselImages = [
  {
    src: 'home1.jpg',
    alt: 'Welcome to Movacash Forum',
    anim: 'fadeIn'
  },
  {
    src: 'home2.jpg',
    alt: 'Welcome to Movacash Forum',
    anim: 'zoomIn'
  },
  {
    src: 'home3.jpg',
    alt: 'Welcome to Movacash Forum',
    anim: 'rotateIn'
  },
  {
    src: 'home4.png',
    alt: 'Welcome to Movacash Forum',
    anim: 'zoomIn'
  },
  {
    src: 'home5.png',
    alt: 'Welcome to Movacash Forum',
    anim: 'rotateIn'
  }
];

const ANIMATION_DURATION = 2200; // ms
const SLIDE_INTERVAL = 5200; // ms

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [animClass, setAnimClass] = useState('carousel-anim-' + carouselImages[0].anim + '-slow');
  const timerRef = useRef();

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      const nextIdx = (activeIndex + 1) % carouselImages.length;
      setAnimClass('carousel-anim-' + carouselImages[nextIdx].anim + '-slow');
      setActiveIndex(nextIdx);
    }, SLIDE_INTERVAL);
    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line
  }, [activeIndex]);

  // Manual navigation
  const goTo = (idx) => {
    clearTimeout(timerRef.current);
    setAnimClass('carousel-anim-' + carouselImages[idx].anim + '-slow');
    setActiveIndex(idx);
  };

  return (
    <div className="fullscreen-carousel-container">
      <div className="custom-carousel-controls">
        <button className="carousel-nav-btn left" onClick={() => goTo((activeIndex - 1 + carouselImages.length) % carouselImages.length)}>&#10094;</button>
        <button className="carousel-nav-btn right" onClick={() => goTo((activeIndex + 1) % carouselImages.length)}>&#10095;</button>
      </div>
      <div className="custom-carousel-indicators">
        {carouselImages.map((img, i) => (
          <span
            key={i}
            className={i === activeIndex ? 'active' : ''}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
      {carouselImages.map((img, i) => (
        <img
          key={i}
          className={`d-block carousel-image-cover${i === activeIndex ? ' active ' + animClass : ''}`}
          src={img.src}
          alt={img.alt}
          style={{ display: i === activeIndex ? 'block' : 'none', position: i === activeIndex ? 'relative' : 'absolute', zIndex: i === activeIndex ? 2 : 1 }}
        />
      ))}
    </div>
  );
}