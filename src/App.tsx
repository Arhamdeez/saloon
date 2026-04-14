import React, { useEffect, useMemo, useState } from 'react';
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
    src: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    alt: 'Salon interior'
  }
];

const testimonialItems: CarouselItemData[] = [
  {
    id: 1,
    title: 'Ayesha Khan',
    role: 'Johar Town · Lahore',
    description:
      "My highlights and toner here always leave my hair looking expensive — warm, blended, and still healthy. In daylight and in photos I finally look like myself, just more polished.",
    avatarUrl:
      'https://ui-avatars.com/api/?name=Ayesha+Khan&background=e8dfd4&color=2a2218&size=128&rounded=true&bold=true'
  },
  {
    id: 2,
    title: 'Fatima Zahra',
    role: 'Bridal makeup · Valima',
    description:
      "Valima makeup and hair were exactly what I wanted — soft skin, defined eyes, nothing heavy. I still loved my face at midnight in the car mirror; the photos look like me on my best day.",
    avatarUrl:
      'https://ui-avatars.com/api/?name=Fatima+Zahra&background=ddd2c4&color=2a2218&size=128&rounded=true&bold=true'
  },
  {
    id: 3,
    title: 'Zainab Hussain',
    role: 'Gulberg · Lahore',
    description:
      "Eid makeup here last year — luminous skin, neat brows, a lip that didn’t disappear after lunch. I got compliments all day; my sister said my face looked ‘fresh’ even after the heat.",
    avatarUrl:
      'https://ui-avatars.com/api/?name=Zainab+Hussain&background=c9b8a8&color=1a1512&size=128&rounded=true&bold=true'
  },
  {
    id: 4,
    title: 'Sana Malik',
    role: 'DHA · Lahore',
    description:
      "Mehndi-night glam — bronze eyes, flushed cheeks, liner that didn’t smudge when I teared up. I felt confident in close-ups; the look matched my outfit without stealing the show.",
    avatarUrl:
      'https://ui-avatars.com/api/?name=Sana+Malik&background=e5dcd0&color=2a2218&size=128&rounded=true&bold=true'
  },
  {
    id: 5,
    title: 'Hira Tariq',
    role: 'Hair colour · Roots touch-up',
    description:
      "Colour and blow-dry before a dinner — my hair looked glossy and the tone suited my skin. People asked if I’d done something new with my makeup; it was really the hair framing my face.",
    avatarUrl:
      'https://ui-avatars.com/api/?name=Hira+Tariq&background=d4c4b4&color=1a1512&size=128&rounded=true&bold=true'
  },
  {
    id: 6,
    title: 'Maryam Sheikh',
    role: 'Model Town · Lahore',
    description:
      "Mother–daughter day: soft makeup for her, a clean glow for me. She doesn’t wear much usually but she smiled at herself in the mirror — that was worth everything.",
    avatarUrl:
      'https://ui-avatars.com/api/?name=Maryam+Sheikh&background=efe6dc&color=2a2218&size=128&rounded=true&bold=true'
  },
  {
    id: 7,
    title: 'Noor Fatima',
    role: 'Engagement makeup',
    description:
      "Engagement glam — skin looked real, not mask-like, and the eyes photographed beautifully under harsh hall lights. Trial run meant no surprises; I walked in knowing I’d love my face.",
    avatarUrl:
      'https://ui-avatars.com/api/?name=Noor+Fatima&background=c9b8a8&color=1a1512&size=128&rounded=true&bold=true'
  },
  {
    id: 8,
    title: 'Rabia Iqbal',
    role: 'Wapda Town · Lahore',
    description:
      "Evening event makeup — smoky eye, nude lip, skin that still looked dewy hours later. I kept checking my reflection; it was the first time in ages I felt that put-together in person, not just in filters.",
    avatarUrl:
      'https://ui-avatars.com/api/?name=Rabia+Iqbal&background=ddd2c4&color=2a2218&size=128&rounded=true&bold=true'
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
        autoplayDelay={6500}
        pauseOnHover
        loop
        round={false}
        smoothSlide
      />
    </div>
  );
}

function ResponsiveGallery() {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = windowWidth < 768;
  const galleryProps = useMemo(() => ({
    images: galleryImages,
    fit: isMobile ? 0.95 : 0.8,
    minRadius: isMobile ? 300 : 600,
    maxVerticalRotationDeg: 0,
    segments: isMobile ? 20 : 34,
    dragDampening: 2,
    grayscale: true,
    autoRotate: true,
    autoRotateSpeed: 5,
    showVignette: false,
    overlayBlurColor: 'transparent' as const,
    imageBorderRadius: isMobile ? '12px' : '20px',
    openedImageBorderRadius: isMobile ? '16px' : '24px',
    openedImageWidth: isMobile ? `${Math.min(windowWidth - 32, 320)}px` : '420px',
    openedImageHeight: isMobile ? `${Math.min(Math.round((windowWidth - 32) * 1.2), 420)}px` : '520px',
  }), [isMobile, windowWidth]);

  return <DomeGallery {...galleryProps} />;
}

const galleryRoot = document.getElementById('gallery-root');
if (galleryRoot) {
  const root = ReactDOM.createRoot(galleryRoot);
  root.render(
    <React.StrictMode>
      <ResponsiveGallery />
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
