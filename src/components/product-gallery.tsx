import { useState } from "react";

export function ProductGallery({ mainSrc, gallery, alt }: { mainSrc: string; gallery: string[]; alt: string }) {
  const images = gallery.length > 0 ? gallery : [mainSrc];
  const [active, setActive] = useState(images[0]);

  return (
    <div className="space-y-3">
      <div className="aspect-square overflow-hidden rounded-xl border bg-secondary">
        <img src={active} alt={alt} width={800} height={800} className="h-full w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(src)}
              className={`aspect-square overflow-hidden rounded-md border bg-secondary transition ${active === src ? "ring-2 ring-primary" : "opacity-80 hover:opacity-100"}`}
            >
              <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
