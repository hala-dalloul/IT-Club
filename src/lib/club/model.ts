import { z } from "zod";
export const collections = ["members", "events", "achievements", "partners"] as const;
export type ContentCollection = (typeof collections)[number];
export type Lang = "ar" | "en";
export type Content = {
  id: string;
  title: string;
  title_en: string;
  description: string;
  description_en: string;
  category?: string;
  year?: number;
  date?: string;
  images?: string[];
  technologies?: string[];
  memberIds?: string[];
  role?: string;
  role_en?: string;
  committee?: string;
  isFounder?: boolean;
  websiteUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  demoUrl?: string;
  apkUrl?: string;
  partnershipType?: string;
  partnershipType_en?: string;
  status?: string;
  updatedAt?: unknown;
  updatedBy?: string;
};
export type Settings = {
  vision: string;
  vision_en: string;
  mission: string;
  mission_en: string;
  goals: string;
  goals_en: string;
  email: string;
  facebook: string;
  instagram: string;
  linkedin: string;
  github: string;
};
export const emptySettings: Settings = {
  vision: "",
  vision_en: "",
  mission: "",
  mission_en: "",
  goals: "",
  goals_en: "",
  email: "",
  facebook: "",
  instagram: "",
  linkedin: "",
  github: "",
};
export const labels: Record<ContentCollection, [string, string]> = {
  members: ["الفريق", "Team"],
  events: ["الأخبار والفعاليات", "News & events"],
  achievements: ["الإنجازات", "Achievements"],
  partners: ["الشراكات", "Partners"],
};
export const categories = [
  ["mobile", "تطبيقات الموبايل", "Mobile apps"],
  ["web", "مواقع الويب", "Websites"],
  ["games", "الألعاب", "Games"],
  ["multimedia", "الوسائط المتعددة", "Multimedia"],
] as const;
export const majors = [
  "تصميم و برمجة تطبيقات الموبايل",
  "تصميم و برمجة الألعاب الموبايل",
  "تصميم و برمجة صفحات الويب",
  "تكنولوجيا الوسائط المتعددة",
] as const;
export const committees = [
  ["media", "الإعلام", "Media"],
  ["relations", "العلاقات العامة", "Public relations"],
  ["activities", "الأنشطة", "Activities"],
] as const;
export function local(
  item: Content,
  key: "title" | "description" | "role" | "partnershipType",
  lang: Lang,
) {
  return (lang === "en" ? item[`${key}_en`] : item[key]) || item[key] || "";
}
export function safeUrl(value: string | undefined) {
  if (!value) return undefined;
  try {
    const u = new URL(value);
    return u.protocol === "https:" ? u.href : undefined;
  } catch {
    return undefined;
  }
}
const text = z.string().trim().min(2).max(200);
export const contactSchema = z.object({
  name: text,
  email: z.string().trim().email().max(254),
  message: z.string().trim().min(10).max(4000),
});
export const joinSchema = z.object({
  fullName: text,
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(30),
  studentId: z
    .string()
    .trim()
    .regex(/^[0-9]{9}$/),
  major: z.enum(majors),
  preferredCommittee: z.enum(["media", "relations", "activities"]),
  message: z.string().trim().min(10).max(4000),
});
export const contentSchema = z
  .object({
    title: text,
    title_en: text,
    description: z.string().trim().min(2).max(20000),
    description_en: z.string().trim().min(2).max(20000),
  })
  .passthrough();
