import type { College } from "@/lib/colleges/types";
import CollegeGalleryCarousel from "@/components/colleges/CollegeGalleryCarousel";

interface CollegeGalleryProps {
  college: College;
}

export default function CollegeGallery({ college }: CollegeGalleryProps) {
  const gallery = college.images?.gallery?.filter(Boolean) ?? [];
  const photos = gallery.length > 0 ? gallery : [college.images.cover].filter(Boolean);

  if (!photos.length) {
    return null;
  }

  return <CollegeGalleryCarousel images={photos} collegeName={college.name} />;
}
