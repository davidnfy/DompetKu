import React from 'react';

export default function LazyImage({ src, alt = '', className = '', webpSrc, ...props }) {
  return (
    <picture className={className}>
      {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
      <img src={src} alt={alt} loading="lazy" className={`responsive-img ${className}`} {...props} />
    </picture>
  );
}
