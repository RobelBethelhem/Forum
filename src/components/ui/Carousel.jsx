import React, { useEffect, useState, useRef } from 'react';

const animationVariants = [
  'animate-fade-in',
  'animate-slide-in-left',
  'animate-slide-in-right',
  'animate-zoom-in',
];

const Carousel = () => {
  const [images, setImages] = useState([]);
  const [current, setCurrent] = useState(0);
  const [anim, setAnim] = useState(animationVariants[0]);
  const intervalRef = useRef(null);

  useEffect(() => {
    fetch('/carousel-images.json')
      .then(res => res.json())
      .then(setImages);
  }, []);

  useEffect(() => {
    if (images.length === 0) return;
    intervalRef.current = setInterval(() => {
      setAnim(animationVariants[Math.floor(Math.random() * animationVariants.length)]);
      setCurrent(prev => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(intervalRef.current);
  }, [images]);

  if (!images.length) return null;

  return (
    <div className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-2xl shadow-lg mb-10">
      {images.map((img, idx) => (
        <img
          key={img.src}
          src={img.src}
          alt={img.alt}
          className={`absolute top-0 left-0 w-full h-64 object-cover transition-all duration-700 ease-in-out ${idx === current ? `${anim} opacity-100 z-10` : 'opacity-0 z-0'}`}
          style={{ transitionProperty: 'opacity, transform' }}
        />
      ))}
      <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-lg py-2 px-4 text-center font-semibold rounded-b-2xl">
        {images[current].caption}
      </div>
      <div className="absolute bottom-3 right-4 flex gap-2">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`w-3 h-3 rounded-full border-2 border-white ${idx === current ? 'bg-white' : 'bg-transparent'}`}
            onClick={() => setCurrent(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
