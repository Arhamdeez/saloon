import DomeGallery from './DomeGallery';

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

export default function Gallery() {
  return (
    <section id="gallery" className="gallery" style={{ minHeight: '100vh', padding: '6rem 0' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-subtitle">Our Work</span>
          <h2 className="section-title">Gallery of Transformations</h2>
        </div>
        <div style={{ width: '100%', height: '80vh', maxHeight: '900px', marginTop: '2rem' }}>
          <DomeGallery
            images={galleryImages}
            fit={0.8}
            minRadius={600}
            maxVerticalRotationDeg={0}
            segments={34}
            dragDampening={2}
            grayscale
          />
        </div>
      </div>
    </section>
  );
}
