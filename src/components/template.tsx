import "server-only";
import { variant } from "@/lib/config";
import { StandardTemplate } from "./standard";
import { SignatureTemplate } from "./signature";
export const Template =
  variant === "signature" ? SignatureTemplate : StandardTemplate;
