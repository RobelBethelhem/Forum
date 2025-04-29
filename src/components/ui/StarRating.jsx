import React, { useState } from 'react';

const Star = ({ filled, size = 24, onClick, onMouseEnter, onMouseLeave, interactive }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? '#FFD700' : 'none'}
    stroke={filled ? '#FFD700' : '#e3e6f0'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ cursor: interactive ? 'pointer' : 'default' }}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default function StarRating({ rating = 0, max = 5, interactive = false, onRatingChange }) {
  const [hoverValue, setHoverValue] = useState(0);
  const [selectedValue, setSelectedValue] = useState(rating);
  const displayValue = interactive ? (hoverValue || selectedValue) : rating;

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {Array.from({ length: max }, (_, i) => {
        const value = i + 1;
        return (
          <Star
            key={value}
            filled={value <= displayValue}
            interactive={interactive}
            size={20}
            onClick={() => {
              if (interactive) {
                setSelectedValue(value);
                onRatingChange && onRatingChange(value);
              }
            }}
            onMouseEnter={() => interactive && setHoverValue(value)}
            onMouseLeave={() => interactive && setHoverValue(0)}
          />
        );
      })}
    </div>
  );
}
