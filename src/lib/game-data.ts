import {
  BarChart3,
  Blocks,
  BrainCircuit,
  Clapperboard,
  Code2,
  Cpu,
  Database,
  Film,
  Gamepad2,
  Globe,
  LayoutGrid,
  Lightbulb,
  MonitorSmartphone,
  MousePointerClick,
  Paintbrush,
  Palette,
  PenTool,
  Puzzle,
  Rocket,
  Server,
  Smartphone,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export type SpecId = "multimedia" | "web" | "games" | "software" | "mobile";

export interface Specialization {
  id: SpecId;
  name: string;
  nameEn: string;
  title: string;
  description: string;
  whyText: string;
  strengths: string[];
  topics: string[];
  keywords: string[];
  careers: string[];
  fitFor: string;
  cta: string;
  icon: LucideIcon;
}

export const SPECIALIZATIONS: Specialization[] = [
  {
    id: "multimedia",
    name: "تكنولوجيا الوسائط المتعددة",
    nameEn: "Multimedia Technology",
    title: "صانع المحتوى الإبداعي 🎨",
    description:
      "إذا كنت تحب التصميم، الألوان، الفيديو، الحركة وصناعة المحتوى البصري، فهذا المسار قد يكون مناسباً لك.",
    whyText: "اختياراتك بتقول إنك بتحب الإبداع البصري، الألوان، الحركة، وصناعة محتوى يلفت العين ويحكي قصة.",
    strengths: ["الإبداع", "الخيال", "الحس الفني", "صناعة المحتوى"],
    topics: ["Graphic Design", "Video Editing", "Motion Graphics", "Animation", "Visual Content", "Digital Media"],
    keywords: ["إبداع", "خيال", "تصميم", "ألوان", "حركة", "محتوى"],
    careers: ["Graphic Designer", "Video Editor", "Motion Graphics Designer", "Content Creator", "UI Visual Designer"],
    fitFor: "اللي بيشوف العالم بعين فنان، وبحب يحول الأفكار لصور وفيديوهات ومحتوى بصري يعيش مع الناس.",
    cta: "اكتشف عالم الوسائط المتعددة",
    icon: Palette,
  },
  {
    id: "web",
    name: "تصميم وتطوير مواقع الويب",
    nameEn: "Web Design & Development",
    title: "صانع الويب 🌐",
    description:
      "إذا كنت تحب بناء المواقع وتحويل الأفكار والتصاميم إلى تجارب رقمية حقيقية، فقد يكون هذا طريقك.",
    whyText: "اختياراتك بتقول إنك بتحب تحويل الأفكار لمواقع حقيقية تشتغل على الإنترنت وتجربة استخدام سلسة.",
    strengths: ["التفكير المنطقي", "التصميم", "حل المشكلات", "بناء الواجهات"],
    topics: [
      "Web Design",
      "Front-End Development",
      "Back-End Development",
      "Responsive Websites",
      "User Experience",
      "Web Applications",
    ],
    keywords: ["منطق", "تصميم", "برمجة", "حل مشاكل", "ويب", "تجربة مستخدم"],
    careers: ["Front-End Developer", "Back-End Developer", "Full-Stack Developer", "UI/UX Designer", "Web Designer"],
    fitFor: "اللي بيحب يشوف فكرته موقعاً حقيقياً يفتحه أي شخص بالعالم، وبيستمتع ببناء الواجهات وتحسين التجربة.",
    cta: "اكتشف عالم الويب",
    icon: Globe,
  },
  {
    id: "games",
    name: "تصميم وبرمجة الألعاب",
    nameEn: "Game Design & Development",
    title: "صانع العوالم 🎮",
    description: "إذا كنت تتخيل عوالم وشخصيات وقصص وتحب التحدي والتجربة، فربما مكانك هنا.",
    whyText: "اختياراتك بتقول إنك بتحب الإبداع، التحدي، التجربة وصناعة الأشياء التفاعلية.",
    strengths: ["الإبداع", "الخيال", "حب التحدي", "التفكير التفاعلي"],
    topics: ["Game Design", "Game Programming", "Game Mechanics", "Interactive Experiences", "Mobile Games", "Storytelling"],
    keywords: ["خيال", "تحدي", "ألعاب", "تجربة", "قصة", "إبداع"],
    careers: [
      "Game Developer",
      "Game Designer",
      "Interactive Experience Designer",
      "Mobile Game Developer",
      "3D / Interactive Content",
    ],
    fitFor: "اللي عنده خيال واسع، بيحب التحدي والقصص، وبيفكر كيف يخلي الناس تعيش تجربة مش بس تتفرج عليها.",
    cta: "اكتشف عالم الألعاب",
    icon: Gamepad2,
  },
  {
    id: "software",
    name: "البرمجيات وقواعد البيانات",
    nameEn: "Software & Databases",
    title: "عقل النظام 🧠",
    description:
      "إذا كنت تحب التفكير المنطقي، تنظيم المعلومات، حل المشكلات وبناء الأنظمة، فهذا المسار قد يناسبك.",
    whyText: "اختياراتك بتقول إنك بتحب التفكير المنطقي، تنظيم البيانات، وبناء أنظمة تحل مشاكل حقيقية.",
    strengths: ["التحليل", "التنظيم", "حل المشكلات", "الدقة"],
    topics: ["Software Development", "Databases", "Algorithms", "Systems", "Data Management", "Backend Logic"],
    keywords: ["منطق", "تحليل", "تنظيم", "بيانات", "حل مشاكل", "برمجة"],
    careers: ["Software Developer", "Backend Developer", "Database Administrator", "System Analyst", "Data Engineer"],
    fitFor: "اللي بيحب يفهم الأشياء كيف بتشتغل من الداخل، وبيستمتع بترتيب الفوضى لنظام منطقي واضح.",
    cta: "اكتشف عالم البرمجيات",
    icon: BrainCircuit,
  },
  {
    id: "mobile",
    name: "تصميم وبرمجة تطبيقات الموبايل",
    nameEn: "Mobile App Design & Development",
    title: "صانع التطبيقات 📱",
    description: "إذا كنت تتخيل تطبيقاً تستخدمه يومياً وتحب بناء تجارب ذكية للموبايل، فهذا المسار قد يكون مناسباً لك.",
    whyText: "اختياراتك بتقول إنك بتحب الابتكار وبناء تطبيقات ذكية يستخدمها الناس كل يوم على جوالاتهم.",
    strengths: ["الابتكار", "تجربة المستخدم", "البرمجة", "حل المشكلات"],
    topics: [
      "Mobile UI",
      "Mobile Development",
      "Android / iOS concepts",
      "App Logic",
      "User Experience",
      "Mobile Applications",
    ],
    keywords: ["ابتكار", "موبايل", "برمجة", "تصميم", "تجربة مستخدم", "حل مشاكل"],
    careers: ["Mobile App Developer", "Android Developer", "iOS Developer", "Mobile UI/UX Designer", "Cross-Platform Developer"],
    fitFor: "اللي بيفكر دايماً: ليش ما في تطبيق بيحل هالمشكلة؟ وبيطلع على تطبيقاته يومياً ليشوف الناس كيف بتستخدمها.",
    cta: "اكتشف عالم التطبيقات",
    icon: Smartphone,
  },
];

export const SPEC_BY_ID: Record<SpecId, Specialization> = Object.fromEntries(
  SPECIALIZATIONS.map((s) => [s.id, s]),
) as Record<SpecId, Specialization>;

/* ---------- Character selection (screen 02) ---------- */

export interface Character {
  id: SpecId;
  label: string;
  emoji: string;
  desc: string;
  icon: LucideIcon;
  /** Small scoring boost — never decides the result alone */
  boost: number;
}

export const CHARACTERS: Character[] = [
  { id: "multimedia", label: "المبدع", emoji: "🎨", desc: "بيحب الألوان والمحتوى البصري", icon: Palette, boost: 3 },
  { id: "web", label: "باني الويب", emoji: "🌐", desc: "بيفكر بمواقع وصفحات الإنترنت", icon: Globe, boost: 3 },
  { id: "games", label: "الغيمر", emoji: "🎮", desc: "عايش بعالم التحدي والألعاب", icon: Gamepad2, boost: 3 },
  { id: "software", label: "حلّال المشاكل", emoji: "🧠", desc: "منطق وأنظمة وبيانات", icon: BrainCircuit, boost: 3 },
  { id: "mobile", label: "صانع التطبيقات", emoji: "📱", desc: "دايماً بيفكر بفكرة تطبيق", icon: Smartphone, boost: 3 },
];

/* ---------- Scenario questions ---------- */

export interface QuestionOption {
  text: string;
  desc: string;
  icon: LucideIcon;
  scores: Partial<Record<SpecId, number>>;
}

export interface Question {
  id: number;
  scenario: string;
  vibe: string;
  layout: "grid" | "list";
  options: QuestionOption[];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    scenario: "لو أعطيناك يوم كامل تعمل فيه مشروع تقني، شو أول شيء بتعمله؟",
    vibe: "يوم كامل لك... بإيدك تعمل أي شيء 👇",
    layout: "grid",
    options: [
      { text: "أصمم شكل وفكرة المشروع 🎨", desc: "الهوية البصرية والمحتوى أولاً", icon: Palette, scores: { multimedia: 3, web: 1 } },
      { text: "أبني موقع وأخليه يشتغل 💻", desc: "صفحة حقيقية تعيش على الإنترنت", icon: Globe, scores: { web: 3 } },
      { text: "أصمم لعبة وأخلي الناس تلعبها 🎮", desc: "عالم تفاعلي مليان تحدي", icon: Gamepad2, scores: { games: 3 } },
      { text: "أبني نظام ينظم البيانات 🗄️", desc: "منطق وقاعدة بيانات مرتبة", icon: Database, scores: { software: 3 } },
      { text: "أصمم تطبيق للموبايل 📱", desc: "شيء الناس بتحمله على جوالاتها", icon: Smartphone, scores: { mobile: 3 } },
    ],
  },
  {
    id: 2,
    scenario: "شو أكثر شيء ممكن يخليك تتحمس لمشروع؟",
    vibe: "خلّي قلبك يجاوب، مش عقلك بس ✨",
    layout: "list",
    options: [
      { text: "الألوان والتصميم والحركة", desc: "لما الشكل يطلع خرافي", icon: Paintbrush, scores: { multimedia: 3 } },
      { text: "بناء شيء يعمل على الإنترنت", desc: "لينك حقيقي تبعته لأصحابك", icon: Globe, scores: { web: 3 } },
      { text: "صناعة تجربة ممتعة للناس", desc: "لما الناس تستمتع باللي عملته", icon: Sparkles, scores: { games: 3, mobile: 1 } },
      { text: "حل مشكلة باستخدام البيانات والأنظمة", desc: "لغز منطقي بدو حل", icon: BrainCircuit, scores: { software: 3 } },
      { text: "إنشاء تطبيق يستخدمه الناس يومياً", desc: "جزء من روتين حياتهم", icon: Smartphone, scores: { mobile: 3 } },
    ],
  },
  {
    id: 3,
    scenario: "لما تشوف تطبيق أو موقع حلو، شو أول شيء بتنتبهله؟",
    vibe: "عينك بتروح لوين أول شيء؟ 👀",
    layout: "grid",
    options: [
      { text: "التصميم والألوان والهوية", desc: "الشكل العام بيخطف عيني", icon: Palette, scores: { multimedia: 3, mobile: 1 } },
      { text: "سهولة التنقل والتجربة", desc: "كل شيء بمكانه الصح", icon: MousePointerClick, scores: { web: 2, mobile: 2 } },
      { text: "الحركة والتفاعل والمؤثرات", desc: "اللمسات الممتعة والتفاعلية", icon: Sparkles, scores: { games: 3 } },
      { text: "الأداء وكيف مبني من الداخل", desc: "بفكر بالتقنية اللي وراه", icon: Cpu, scores: { software: 3 } },
      { text: "إنه شغال بسلاسة على الموبايل", desc: "سريع ومريح على الجوال", icon: Smartphone, scores: { mobile: 3 } },
    ],
  },
  {
    id: 4,
    scenario: "لو عندك مشكلة معقدة، بتحب تحلها كيف؟",
    vibe: "كلنا منواجه مشاكل... بس أسلوبك مختلف 🧩",
    layout: "list",
    options: [
      { text: "برسمها وبفكر فيها بصرياً", desc: "الصورة بتوضحلي الفكرة", icon: PenTool, scores: { multimedia: 2, games: 1 } },
      { text: "ببني نموذج سريع على المتصفح", desc: "بجرب مباشرة وأشوف النتيجة", icon: Code2, scores: { web: 3 } },
      { text: "بحولها لتحدي وبجرب حلول مختلفة", desc: "كل محاولة مستوى جديد", icon: Puzzle, scores: { games: 3 } },
      { text: "بقسمها لخطوات منطقية وبيانات", desc: "خطوة خطوة لحد ما تنحل", icon: BarChart3, scores: { software: 3 } },
      { text: "بفكر بأداة أو تطبيق يحلها", desc: "أكيد في طريقة أذكى", icon: Lightbulb, scores: { mobile: 3 } },
    ],
  },
  {
    id: 5,
    scenario: "أي مشروع بتحس إنك ممكن تقعد عليه ساعات بدون ما تمل؟",
    vibe: "الوقت بيطير لما تعمل شيء بتحبه ⏳",
    layout: "grid",
    options: [
      { text: "مونتاج فيديو أو تصميم هوية", desc: "قص وتجميل وإبداع بصري", icon: Clapperboard, scores: { multimedia: 3 } },
      { text: "موقع إلكتروني من الصفر", desc: "صفحة صفحة لحد ما يكمل", icon: LayoutGrid, scores: { web: 3 } },
      { text: "لعبة صغيرة بفكرة جديدة", desc: "ميكانيكيات ومراحل وتحدي", icon: Gamepad2, scores: { games: 3 } },
      { text: "نظام يرتب بيانات متجر أو مكتبة", desc: "كل معلومة بمكانها الصح", icon: Server, scores: { software: 3 } },
      { text: "تطبيق يسهّل حياة الناس اليومية", desc: "فكرة بسيطة بأثر كبير", icon: Smartphone, scores: { mobile: 3 } },
    ],
  },
  {
    id: 6,
    scenario: "لو عندك فريق من 3 أشخاص، أي دور بتختار؟",
    vibe: "الفريق محتاجك... بأي دور؟ 🤝",
    layout: "list",
    options: [
      { text: "المبدع البصري", desc: "الشكل، المحتوى، والهوية", icon: Film, scores: { multimedia: 3 } },
      { text: "مهندس الواجهات", desc: "بخلي الفكرة موقع حقيقي", icon: Blocks, scores: { web: 3 } },
      { text: "مصمم التجربة والمتعة", desc: "كيف الناس رح تتفاعل وتستمتع", icon: Users, scores: { games: 3, mobile: 1 } },
      { text: "العقل المنظم", desc: "المنطق والبيانات والأنظمة", icon: BrainCircuit, scores: { software: 3 } },
      { text: "مطور التطبيق", desc: "بحول كل شيء لتطبيق جاهز", icon: Rocket, scores: { mobile: 3 } },
    ],
  },
  {
    id: 7,
    scenario: "تخيل عندك فكرة جديدة، شو الجزء اللي بتحب تكون مسؤول عنه؟",
    vibe: "آخر مرحلة... فكرتك الخاصة 💡",
    layout: "grid",
    options: [
      { text: "الهوية البصرية والمحتوى الإعلاني", desc: "كيف الناس رح تشوفها", icon: Palette, scores: { multimedia: 3 } },
      { text: "الموقع اللي يعرض الفكرة للعالم", desc: "واجهة الفكرة على الإنترنت", icon: Globe, scores: { web: 3 } },
      { text: "تحويلها لتجربة تفاعلية أو لعبة", desc: "متعة وتحدي وتفاعل", icon: Gamepad2, scores: { games: 3 } },
      { text: "النظام وقاعدة البيانات", desc: "المحرك اللي خلف الكواليس", icon: Database, scores: { software: 3 } },
      { text: "تطبيق الموبايل اللي يوصلها للناس", desc: "بجيبها لجيب كل شخص", icon: Smartphone, scores: { mobile: 3 } },
    ],
  },
];
