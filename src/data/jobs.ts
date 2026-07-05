export type Locale = "en" | "ms";
export type JobCategory = "factory" | "warehouse" | "retail" | "driver" | "food-service";
export type LocalizedText = Record<Locale, string>;

export function formatPostedTime(postedHours: number, locale: Locale) {
  if (postedHours < 24) {
    return locale === "ms" ? `${postedHours} jam lalu` : `${postedHours}h ago`;
  }

  const days = Math.floor(postedHours / 24);
  if (locale === "ms") return `${days} hari lalu`;
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export type Job = {
  id: string;
  referenceCode?: string;
  title: LocalizedText;
  salary: LocalizedText;
  salaryMin: number;
  salaryMax?: number;
  salaryUnit?: "month" | "day" | "hour";
  company: string;
  companyLogoUrl?: string;
  location: string;
  category: JobCategory;
  initials: string;
  whatsapp: string;
  postedHours: number;
  publishedAt?: string;
  expiresAt?: string;
  featured?: boolean;
  urgent?: boolean;
  verified?: boolean;
  employmentType: LocalizedText;
  employmentTypeCode?: "full-time" | "part-time" | "contract";
  schedule: LocalizedText;
  vacancies: number;
  description: LocalizedText;
  responsibilities: Record<Locale, string[]>;
  requirements: Record<Locale, string[]>;
  benefits: Record<Locale, string[]>;
};

const sharedDetails = {
  factory: {
    employmentType: { en: "Full-time", ms: "Sepenuh masa" },
    schedule: { en: "Rotating shifts", ms: "Syif bergilir" },
    responsibilities: {
      en: ["Operate assigned production equipment safely", "Check product quality and record daily output", "Keep the work area clean and follow safety procedures"],
      ms: ["Mengendalikan mesin pengeluaran dengan selamat", "Memeriksa kualiti produk dan merekod hasil harian", "Menjaga kebersihan kawasan kerja dan mematuhi prosedur keselamatan"],
    },
    requirements: {
      en: ["Malaysian citizen aged 18 or above", "Able to work shifts and overtime when required", "Training is provided; fresh applicants are welcome"],
      ms: ["Warganegara Malaysia berumur 18 tahun ke atas", "Boleh bekerja syif dan lebih masa apabila diperlukan", "Latihan disediakan; pemohon baharu dialu-alukan"],
    },
    benefits: {
      en: ["EPF, SOCSO and EIS", "Attendance and shift allowance", "Uniform and on-the-job training"],
      ms: ["KWSP, PERKESO dan SIP", "Elaun kehadiran dan syif", "Pakaian seragam dan latihan di tempat kerja"],
    },
  },
  service: {
    employmentType: { en: "Full-time", ms: "Sepenuh masa" },
    schedule: { en: "6 days per week", ms: "6 hari seminggu" },
    responsibilities: {
      en: ["Complete daily tasks accurately and on time", "Provide helpful service to customers and team members", "Follow company operating and safety procedures"],
      ms: ["Menyiapkan tugasan harian dengan tepat dan menepati masa", "Memberi perkhidmatan yang baik kepada pelanggan dan pasukan", "Mematuhi prosedur operasi dan keselamatan syarikat"],
    },
    requirements: {
      en: ["Malaysian citizen aged 18 or above", "Responsible, punctual and able to work in a team", "Basic Bahasa Malaysia; training is provided"],
      ms: ["Warganegara Malaysia berumur 18 tahun ke atas", "Bertanggungjawab, menepati masa dan boleh bekerja dalam pasukan", "Asas Bahasa Malaysia; latihan disediakan"],
    },
    benefits: {
      en: ["EPF, SOCSO and EIS", "Overtime pay where applicable", "Annual leave and staff benefits"],
      ms: ["KWSP, PERKESO dan SIP", "Bayaran lebih masa jika berkenaan", "Cuti tahunan dan faedah kakitangan"],
    },
  },
} satisfies Record<string, {
  employmentType: LocalizedText;
  schedule: LocalizedText;
  responsibilities: Record<Locale, string[]>;
  requirements: Record<Locale, string[]>;
  benefits: Record<Locale, string[]>;
}>;

export const jobs: Job[] = [
  {
    id: "JL-1001",
    title: { en: "Production Operator", ms: "Operator Pengeluaran" },
    salary: { en: "RM1,800–RM2,400 / month", ms: "RM1,800–RM2,400 / bulan" },
    salaryMin: 1800,
    company: "ABC Manufacturing Sdn Bhd",
    location: "Shah Alam, Selangor",
    category: "factory",
    initials: "AB",
    whatsapp: "60123456789",
    postedHours: 1,
    featured: true,
    vacancies: 12,
    description: {
      en: "Join our Shah Alam production team assembling household components in a clean and safety-focused facility. No previous factory experience is required.",
      ms: "Sertai pasukan pengeluaran kami di Shah Alam untuk memasang komponen rumah dalam kemudahan yang bersih dan mengutamakan keselamatan. Pengalaman kilang tidak diperlukan.",
    },
    ...sharedDetails.factory,
  },
  {
    id: "JL-1002",
    title: { en: "Warehouse Assistant", ms: "Pembantu Gudang" },
    salary: { en: "RM1,500–RM1,900 / month", ms: "RM1,500–RM1,900 / bulan" },
    salaryMin: 1500,
    company: "Giant Logistics Sdn Bhd",
    location: "Klang, Selangor",
    category: "warehouse",
    initials: "GL",
    whatsapp: "60123456789",
    postedHours: 2,
    vacancies: 6,
    description: {
      en: "Support daily receiving, picking and packing activities at our Klang distribution centre. Suitable for applicants who enjoy active, hands-on work.",
      ms: "Membantu aktiviti penerimaan, pemilihan dan pembungkusan harian di pusat pengedaran Klang. Sesuai untuk pemohon yang gemar kerja aktif dan praktikal.",
    },
    ...sharedDetails.service,
  },
  {
    id: "JL-1003",
    title: { en: "Retail Sales Associate", ms: "Pembantu Jualan Runcit" },
    salary: { en: "RM1,600–RM2,000 / month", ms: "RM1,600–RM2,000 / bulan" },
    salaryMin: 1600,
    company: "Perniagaan Nina Sdn Bhd",
    location: "Petaling Jaya, Selangor",
    category: "retail",
    initials: "PN",
    whatsapp: "60123456789",
    postedHours: 3,
    vacancies: 4,
    description: {
      en: "Help customers find the right products, maintain attractive displays and support smooth daily store operations in Petaling Jaya.",
      ms: "Membantu pelanggan mencari produk yang sesuai, menjaga paparan kedai dan menyokong operasi harian yang lancar di Petaling Jaya.",
    },
    ...sharedDetails.service,
  },
  {
    id: "JL-1004",
    title: { en: "Delivery Driver", ms: "Pemandu Penghantaran" },
    salary: { en: "RM2,000–RM2,800 / month", ms: "RM2,000–RM2,800 / bulan" },
    salaryMin: 2000,
    company: "Speedy Parcel Sdn Bhd",
    location: "Subang Jaya, Selangor",
    category: "driver",
    initials: "SP",
    whatsapp: "60123456789",
    postedHours: 4,
    vacancies: 8,
    description: {
      en: "Deliver parcels safely across assigned Klang Valley routes using a company vehicle. Routes and delivery support are provided daily.",
      ms: "Menghantar bungkusan dengan selamat di laluan Lembah Klang menggunakan kenderaan syarikat. Laluan dan sokongan penghantaran disediakan setiap hari.",
    },
    ...sharedDetails.service,
  },
  {
    id: "JL-1005",
    title: { en: "Quality Control Inspector", ms: "Pemeriksa Kawalan Kualiti" },
    salary: { en: "RM2,100–RM2,700 / month", ms: "RM2,100–RM2,700 / bulan" },
    salaryMin: 2100,
    company: "Southern Components Sdn Bhd",
    location: "Johor Bahru, Johor",
    category: "factory",
    initials: "SC",
    whatsapp: "60123456789",
    postedHours: 6,
    urgent: true,
    vacancies: 3,
    description: {
      en: "Inspect finished components, document findings and work with production teams to maintain consistent product quality at our Johor Bahru plant.",
      ms: "Memeriksa komponen siap, merekod penemuan dan bekerjasama dengan pasukan pengeluaran untuk mengekalkan kualiti produk di kilang Johor Bahru.",
    },
    ...sharedDetails.factory,
  },
  {
    id: "JL-1006",
    title: { en: "Store Assistant", ms: "Pembantu Stor" },
    salary: { en: "RM1,700–RM2,100 / month", ms: "RM1,700–RM2,100 / bulan" },
    salaryMin: 1700,
    company: "Maju Mart",
    location: "Seremban, Negeri Sembilan",
    category: "retail",
    initials: "MM",
    whatsapp: "60123456789",
    postedHours: 8,
    vacancies: 5,
    description: {
      en: "Keep stock organised, replenish shelves and assist with receiving deliveries at our busy Seremban outlet.",
      ms: "Menyusun stok, mengisi semula rak dan membantu menerima penghantaran di cawangan Seremban kami.",
    },
    ...sharedDetails.service,
  },
];

export function getJobById(id: string) {
  return jobs.find((job) => job.id.toLowerCase() === id.toLowerCase());
}
