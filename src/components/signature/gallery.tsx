import type { VillaContent } from "@/lib/schemas/content";
import { bookingLinks } from "@/lib/schemas/content";
import { SignatureNavigation } from "./navigation";
import { SignatureGallery } from "./gallery-client";
export function SignatureGalleryPage({
  content,
  prefix,
  preview,
}: {
  content: VillaContent;
  prefix: string;
  preview: boolean;
}) {
  const page = content.signatureGallery,
    links = bookingLinks(content);
  const items = page
    ? page.items.filter((i) => i.enabled)
    : content.gallery.map((image, i) => ({
        id: `legacy-photo-${i}`,
        enabled: true,
        image,
        width: 1200,
        height: 800,
        categories: [image.category.toLowerCase()],
      }));
  const categories = page
    ? page.categories.filter((c) => c.enabled)
    : [...new Set(content.gallery.map((i) => i.category))].map((label) => ({
        id: label.toLowerCase(),
        label,
        enabled: true,
      }));
  const actions = [
    ...(links.whatsapp ? [{ label: "WhatsApp", href: links.whatsapp }] : []),
  ];
  return (
    <div
      className="sg-site sg-reference-site sg-gallery-site"
      data-signature-transition="none" data-signature-background="#f1ecde" data-signature-route={`${prefix}/gallery`}
    >
      <SignatureNavigation content={content} prefix={prefix} />
      {preview && (
        <div className="sg-preview">
          Private draft preview · unpublished content
        </div>
      )}
      <main id="signature-main" className="sgl-page">
        <h1 className="std-visually-hidden">{page?.title || "Gallery"}</h1>
        <SignatureGallery
          items={items}
          categories={categories}
          actions={actions}
          emblem={content.signatureStory?.railEmblem}
        />
      </main>
    </div>
  );
}
