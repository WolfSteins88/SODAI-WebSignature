import type { VillaContent } from "@/lib/schemas/content";
import { publicContactLinks } from "@/lib/content/social-links";
export function SocialLinks({
  links,
  email,
}: {
  links: NonNullable<VillaContent["signatureMenu"]>["social"];
  email?: string;
}) {
  const configured = publicContactLinks(links, email);
  if (!configured.length) return null;
  return (
    <nav className="sg-menu-social" aria-label="Contact and social links">
      {configured.map((link) => (
        <a
          key={link.id}
          href={link.href}
          target={link.external ? "_blank" : undefined}
          rel={link.external ? "noopener noreferrer" : undefined}
          aria-label={
            link.external ? `${link.label} (opens in new tab)` : "Email contact"
          }
        >
          <span
            aria-hidden="true"
            className="sg-social-icon"
            style={{
              maskImage: `url(/social-icons/${link.platform}.svg)`,
              WebkitMaskImage: `url(/social-icons/${link.platform}.svg)`,
            }}
          />
        </a>
      ))}
    </nav>
  );
}
