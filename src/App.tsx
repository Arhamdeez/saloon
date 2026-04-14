import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import DomeGallery from './DomeGallery';
import Carousel from './Carousel';
import type { CarouselItemData } from './Carousel';

const galleryImages = [
  {
    src: 'https://images.unsplash.com/photo-1522337094846-8a818192de1f?w=600',
    alt: 'Hair transformation'
  },
  {
    src: 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?w=400',
    alt: 'Nail art'
  },
  {
    src: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
    alt: 'Makeup'
  },
  {
    src: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?w=400',
    alt: 'Styling'
  },
  {
    src: 'https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?w=400',
    alt: 'Treatment'
  },
  {
    src: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400',
    alt: 'Bridal'
  },
  {
    src: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400',
    alt: 'Hair Styling'
  },
  {
    src: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400',
    alt: 'Color & Highlights'
  },
  {
    src: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400',
    alt: 'Facial Treatments'
  },
  {
    src: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    alt: 'Manicure & Pedicure'
  },
  {
    src: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400',
    alt: 'Makeup'
  },
  {
    src: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400',
    alt: 'Spa Treatments'
  }
];

const testimonialItems: CarouselItemData[] = [
  {
    id: 1,
    title: 'Alexandra M.',
    role: 'Regular Client',
    description:
      "Nadia's transformed not just my hair, but my entire confidence. The team understood exactly what I wanted and delivered beyond my expectations. The atmosphere is pure luxury!",
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
  },
  {
    id: 2,
    title: 'Jennifer L.',
    role: 'Bridal Client',
    description:
      "My wedding day was perfect thanks to the incredible team at Nadia's. From the trial to the big day, they made me feel like a princess. Absolutely recommend for brides!",
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100'
  },
  {
    id: 3,
    title: 'Sarah K.',
    role: 'Color Client',
    description:
      "I've been coming to Nadia's for three years and wouldn't trust anyone else with my color. The colorists here are true artists – my balayage always looks natural and stunning.",
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
  }
];

function TestimonialsCarousel() {
  const [baseWidth, setBaseWidth] = useState(300);
  useEffect(() => {
    const update = () => setBaseWidth(Math.min(340, Math.max(260, window.innerWidth - 48)));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Carousel
        baseWidth={baseWidth}
        items={testimonialItems}
        autoplay
        autoplayDelay={4000}
        pauseOnHover
        loop
        round={false}
      />
    </div>
  );
}

const galleryRoot = document.getElementById('gallery-root');
if (galleryRoot) {
  const root = ReactDOM.createRoot(galleryRoot);
  root.render(
    <React.StrictMode>
      <DomeGallery
        images={galleryImages}
        fit={0.8}
        minRadius={600}
        maxVerticalRotationDeg={0}
        segments={34}
        dragDampening={2}
        grayscale
        autoRotate
        autoRotateSpeed={5}
        showVignette={false}
        overlayBlurColor="transparent"
        imageBorderRadius="20px"
        openedImageBorderRadius="24px"
        openedImageWidth="420px"
        openedImageHeight="520px"
      />
    </React.StrictMode>
  );
}

const testimonialsRoot = document.getElementById('testimonials-root');
if (testimonialsRoot) {
  const root = ReactDOM.createRoot(testimonialsRoot);
  root.render(
    <React.StrictMode>
      <TestimonialsCarousel />
    </React.StrictMode>
  );
}
