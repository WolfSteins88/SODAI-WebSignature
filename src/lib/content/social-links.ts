import { z } from "zod";
import { socialLinkSchema, type VillaContent } from "../schemas/content";
export const socialNames = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tripadvisor: "TripAdvisor",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  x: "X",
};
export const primarySocialPlatforms = [
  "instagram",
  "facebook",
  "youtube",
  "tripadvisor",
] as const;
export function publicContactLinks(
  links: NonNullable<VillaContent["signatureMenu"]>["social"],
  email?: string,
) {
  const social = links
    .flatMap((link) => {
      const parsed = socialLinkSchema.safeParse(link);
      return parsed.success && parsed.data.enabled && parsed.data.url
        ? [
            {
              id: parsed.data.id,
              platform: parsed.data.platform,
              label: socialNames[parsed.data.platform],
              href: parsed.data.url,
              external: true,
              order: parsed.data.order,
            },
          ]
        : [];
    })
    .sort((a, b) => a.order - b.order);
  const contact = z.string().email().safeParse(email);
  return [
    ...(contact.success
      ? [
          {
            id: "contact-email",
            platform: "email" as const,
            label: "Email",
            href: `mailto:${contact.data}`,
            external: false,
          },
        ]
      : []),
    ...social,
  ];
}
