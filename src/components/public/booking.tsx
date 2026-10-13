import {publicCopy} from "@/lib/content/public-copy";
import { bookingLinks, type VillaContent } from "@/lib/schemas/content";
export function Booking({
  content,
  room,
  compact = false,
}: {
  content: VillaContent;
  room?: string;
  compact?: boolean;
}) {
  const links = bookingLinks(content, room);
  if (!links.whatsapp) return null;
  return (
    <div className={`booking-links ${compact ? "compact" : ""}`}>
      {links.whatsapp ? (
        <a
          className="button secondary"
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
        >
          {publicCopy(content,"whatsappLabel")} <span aria-hidden="true">↗</span>
        </a>
      ) : null}
    </div>
  );
}
