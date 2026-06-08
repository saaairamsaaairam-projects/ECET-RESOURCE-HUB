"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import CollegeLightbox from "@/components/colleges/CollegeLightbox";

interface CollegeGalleryCarouselProps {
  images: string[];
  collegeName: string;
}

export default function CollegeGalleryCarousel({ images, collegeName }: CollegeGalleryCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on("select", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = (index: number) => emblaApi?.scrollTo(index);
  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  if (!images.length) return null;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-purple-200">Gallery</p>
          <h2 className="text-2xl font-semibold text-white">Campus visuals</h2>
          <p className="mt-1 text-sm text-gray-300">Swipe on mobile, browse thumbs, and open the lightbox for a closer look.</p>
        </div>
        <span className="rounded-full bg-purple-500/10 px-3 py-1 text-xs uppercase tracking-[0.25em] text-purple-100">{images.length} photos</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.45fr]">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/20 p-2">
            <div className="embla" ref={emblaRef}>
              <div className="embla__container flex">
                {images.map((image, index) => (
                  <div key={`${collegeName}-${image}-${index}`} className="embla__slide min-w-0 flex-[0_0_100%] p-1">
                    <button type="button" onClick={() => openLightbox(index)} className="group relative block w-full overflow-hidden rounded-2xl border border-white/10 bg-black/10 text-left">
                      <Image src={image} alt={`${collegeName} image ${index + 1}`} width={1200} height={800} priority={index === 0} className="h-[320px] w-full object-cover md:h-[420px]" />
                      <span className="absolute right-3 top-3 rounded-full border border-white/10 bg-black/60 p-2 text-white opacity-0 transition group-hover:opacity-100">
                        <Maximize2 className="h-4 w-4" />
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm text-gray-200">
            <div className="flex items-center gap-2">
              <button type="button" onClick={scrollPrev} className="rounded-full border border-white/10 bg-white/5 p-2 text-white"> <ChevronLeft className="h-4 w-4" /> </button>
              <button type="button" onClick={scrollNext} className="rounded-full border border-white/10 bg-white/5 p-2 text-white"> <ChevronRight className="h-4 w-4" /> </button>
            </div>
            <span className="rounded-full bg-white/5 px-3 py-1">{selectedIndex + 1} / {images.length}</span>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-2">
            {images.map((image, index) => (
              <button
                key={`thumb-${collegeName}-${index}`}
                type="button"
                onClick={() => scrollTo(index)}
                className={`overflow-hidden rounded-2xl border text-left transition ${selectedIndex === index ? "border-purple-400 bg-purple-500/10" : "border-white/10 bg-black/20"}`}
              >
                <Image src={image} alt={`${collegeName} thumbnail ${index + 1}`} width={300} height={180} className="h-20 w-full object-cover" />
                <span className="block px-2 py-2 text-xs text-gray-100">Photo {index + 1}</span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-300">High-resolution images are lazy-loaded and the current slide is highlighted for faster mobile browsing.</p>
        </aside>
      </div>

      <CollegeLightbox
        images={images}
        openIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onPrev={() => setLightboxIndex((current) => (current === 0 ? images.length - 1 : current - 1))}
        onNext={() => setLightboxIndex((current) => (current === images.length - 1 ? 0 : current + 1))}
      />
    </section>
  );
}
