"use client";
import { useFormContext, useWatch } from "react-hook-form";
import { socialLinkSchema, type VillaContent } from "@/lib/schemas/content";
import {
  primarySocialPlatforms,
  socialNames,
} from "@/lib/content/social-links";
type Social = NonNullable<VillaContent["signatureMenu"]>["social"][number];
export function SocialLinksEditor({
  issues,
}: {
  issues: { path: string; message: string }[];
}) {
  const form = useFormContext();
  const menu = useWatch({ control: form.control, name: "signatureMenu" });
  if (!menu)
    return (
      <section className="cms-group">
        <h2>Social links</h2>
        <p>Configure the existing Menu and loading screen content first.</p>
      </section>
    );
  const links: Social[] = menu.social || [];
  const rows = [
    ...links.map((link, index) => ({ link, index })),
    ...primarySocialPlatforms
      .filter((platform) => !links.some((link) => link.platform === platform))
      .map((platform) => ({
        index: -1,
        link: {
          id: `unconfigured-${platform}`,
          platform,
          url: "",
          enabled: false,
          order: primarySocialPlatforms.indexOf(platform),
        },
      })),
  ].sort((a, b) => a.link.order - b.link.order);
  function update(index: number, link: Social, patch: Partial<Social>) {
    const next = [...links];
    if (index < 0)
      next.push({
        ...link,
        id: `social-${link.platform}-${crypto.randomUUID()}`,
        ...patch,
      });
    else next[index] = { ...link, ...patch };
    form.setValue("signatureMenu.social", next, { shouldDirty: true });
  }
  return (
    <section className="cms-group cms-social-editor">
      <h2>Social links</h2>
      <p>
        Only enabled platforms with a valid HTTPS account URL appear below Get
        in Touch. Blank URLs stay hidden. Save a draft, then Publish to update
        the public site.
      </p>
      <div className="cms-field">
        <label htmlFor="social-contact-email">
          Contact email override (optional)
        </label>
        <input
          id="social-contact-email"
          type="email"
          value={menu.email || ""}
          onChange={(event) =>
            form.setValue("signatureMenu.email", event.target.value, {
              shouldDirty: true,
            })
          }
        />
        <small>
          Leave blank to use the villa email in Getting Here. Current villa
          email: {form.getValues("email")}
        </small>
        {issues
          .filter((i) => i.path === "signatureMenu.email")
          .map((i) => (
            <p role="alert" key={i.path}>
              {i.message}
            </p>
          ))}
      </div>
      {rows.map(({ link, index }) => {
        const parsed = socialLinkSchema.safeParse(link);
        const errors = parsed.success
          ? []
          : parsed.error.issues.map((issue) => issue.message);
        const fieldId = `social-${link.id}`;
        return (
          <fieldset
            key={
              links.filter((row) => row.platform === link.platform).length > 1
                ? link.id
                : link.platform
            }
            className="cms-social-platform"
          >
            <legend>
              <img
                src={`/social-icons/${link.platform}.svg`}
                width="20"
                height="20"
                alt=""
              />
              {socialNames[link.platform]}
            </legend>
            <label className="cms-field" htmlFor={fieldId}>
              {socialNames[link.platform]} URL
              <input
                id={fieldId}
                type="url"
                inputMode="url"
                autoComplete="off"
                value={link.url}
                aria-invalid={errors.length > 0}
                aria-describedby={
                  errors.length ? fieldId + "-error" : undefined
                }
                onChange={(event) =>
                  update(index, link, { url: event.target.value })
                }
              />
            </label>
            <div className="cms-social-options">
              <label>
                <input
                  type="checkbox"
                  checked={link.enabled}
                  onChange={(event) =>
                    update(index, link, { enabled: event.target.checked })
                  }
                />{" "}
                Enable {socialNames[link.platform]}
              </label>
              <label>
                {" "}
                {socialNames[link.platform]} order
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={link.order}
                  onChange={(event) =>
                    update(index, link, { order: Number(event.target.value) })
                  }
                />
              </label>
            </div>
            {!!errors.length && (
              <p role="alert" id={fieldId + "-error"}>
                {[...new Set(errors)].join(". ")}
              </p>
            )}
          </fieldset>
        );
      })}
    </section>
  );
}
