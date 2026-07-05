"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/data/jobs";

type LegalKind = "terms" | "privacy";
type LegalSection = { title: string; paragraphs: string[]; bullets?: string[] };

const documents: Record<LegalKind, Record<Locale, { title: string; intro: string; sections: LegalSection[] }>> = {
  terms: {
    en: {
      title: "Terms of Use",
      intro: "These terms govern employer access to JobLinker and the use of its job-listing and WhatsApp enquiry features.",
      sections: [
        { title: "1. Acceptance", paragraphs: ["By creating an account, posting a job, or otherwise using JobLinker, you agree to these Terms of Use and our Privacy Policy. If you use JobLinker for a company, you confirm that you are authorised to act for that company."] },
        { title: "2. The service", paragraphs: ["JobLinker is a job-listing platform that helps employers publish vacancies and lets job seekers contact employers directly, including through WhatsApp. JobLinker is not an employer, recruitment agency, employment contract party, or guarantor of any candidate or vacancy."] },
        { title: "3. Employer accounts", paragraphs: ["You must provide accurate, current information and keep your login credentials secure. You are responsible for activity performed through your account and must notify JobLinker if you suspect unauthorised access."] },
        { title: "4. Job listings", paragraphs: ["Employers are responsible for the legality, accuracy and completeness of every listing, including pay, location, duties, requirements and contact details. Listings must comply with Malaysian employment and anti-discrimination requirements."], bullets: ["Do not post false, misleading, duplicate or expired vacancies.", "Do not request unlawful payments, deposits or unnecessary sensitive information from job seekers.", "Do not post scams, illegal work, exploitative arrangements or content that infringes another party's rights."] },
        { title: "5. Review and moderation", paragraphs: ["JobLinker may review, reject, edit visibility, suspend or remove listings and accounts to protect users, enforce these terms or comply with law. Verification badges indicate that certain information was reviewed; they are not a guarantee of an employer, job or outcome."] },
        { title: "6. WhatsApp and third parties", paragraphs: ["WhatsApp enquiries take place through a third-party service governed by its own terms and privacy practices. JobLinker records button interactions for basic analytics but does not control or verify conversations, interviews, offers, payments or hiring decisions made outside JobLinker."] },
        { title: "7. Intellectual property", paragraphs: ["Employers retain ownership of content they submit. You grant JobLinker a non-exclusive, worldwide, royalty-free licence to host, reproduce, format and display that content for operating and promoting the service. The JobLinker name, interface and original platform content remain protected by applicable intellectual-property laws."] },
        { title: "8. Availability and disclaimers", paragraphs: ["The service is provided on an “as available” basis. To the extent permitted by law, JobLinker does not promise uninterrupted availability, specific applicant numbers, successful hiring, or the accuracy of user-submitted content."] },
        { title: "9. Liability", paragraphs: ["To the extent permitted by law, JobLinker is not liable for indirect or consequential losses arising from user content, third-party communications, employment decisions or unauthorised account use. Nothing in these terms excludes liability that cannot lawfully be excluded."] },
        { title: "10. Suspension and termination", paragraphs: ["You may stop using JobLinker at any time. JobLinker may suspend or terminate access for breach, fraud, security risk, legal requirements or harm to users. Provisions intended to survive termination remain effective."] },
        { title: "11. Changes and governing law", paragraphs: ["We may update these terms and will publish the revised date on this page. Material changes may also be communicated through the service. These terms are governed by the laws of Malaysia, and disputes are subject to the courts of Malaysia."] },
        { title: "12. Contact", paragraphs: ["Questions about these terms may be sent through JobLinker's official support contact channel. The operator's legal name, registered address and support email will be published before public launch."] },
      ],
    },
    ms: {
      title: "Terma Penggunaan",
      intro: "Terma ini mengawal akses majikan kepada JobLinker serta penggunaan fungsi iklan kerja dan pertanyaan WhatsApp.",
      sections: [
        { title: "1. Penerimaan", paragraphs: ["Dengan mencipta akaun, mengiklankan kerja atau menggunakan JobLinker, anda bersetuju dengan Terma Penggunaan ini dan Dasar Privasi kami. Jika anda menggunakan JobLinker bagi pihak syarikat, anda mengesahkan bahawa anda diberi kuasa untuk berbuat demikian."] },
        { title: "2. Perkhidmatan", paragraphs: ["JobLinker ialah platform penyenaraian kerja yang membantu majikan menerbitkan kekosongan dan membolehkan pencari kerja menghubungi majikan secara terus, termasuk melalui WhatsApp. JobLinker bukan majikan, agensi pekerjaan, pihak kepada kontrak pekerjaan atau penjamin mana-mana calon atau jawatan."] },
        { title: "3. Akaun majikan", paragraphs: ["Anda mesti memberikan maklumat yang tepat dan terkini serta menjaga keselamatan butiran log masuk. Anda bertanggungjawab atas aktiviti melalui akaun anda dan perlu memaklumkan JobLinker jika mengesyaki akses tanpa kebenaran."] },
        { title: "4. Iklan kerja", paragraphs: ["Majikan bertanggungjawab terhadap kesahan, ketepatan dan kelengkapan setiap iklan, termasuk gaji, lokasi, tugas, syarat dan maklumat hubungan. Iklan mesti mematuhi undang-undang pekerjaan dan keperluan anti-diskriminasi Malaysia."], bullets: ["Jangan siarkan jawatan palsu, mengelirukan, berulang atau tamat tempoh.", "Jangan minta bayaran, deposit atau maklumat sensitif yang tidak perlu daripada pencari kerja.", "Jangan siarkan penipuan, kerja haram, aturan eksploitatif atau kandungan yang melanggar hak pihak lain."] },
        { title: "5. Semakan dan moderasi", paragraphs: ["JobLinker boleh menyemak, menolak, mengehadkan paparan, menggantung atau membuang iklan dan akaun bagi melindungi pengguna, menguatkuasakan terma atau mematuhi undang-undang. Lencana pengesahan bukan jaminan terhadap majikan, kerja atau hasil pengambilan."] },
        { title: "6. WhatsApp dan pihak ketiga", paragraphs: ["Pertanyaan WhatsApp berlaku melalui perkhidmatan pihak ketiga yang mempunyai terma dan amalan privasinya sendiri. JobLinker merekod interaksi butang untuk analitik asas tetapi tidak mengawal perbualan, temu duga, tawaran, bayaran atau keputusan pengambilan di luar JobLinker."] },
        { title: "7. Harta intelek", paragraphs: ["Majikan mengekalkan pemilikan kandungan yang dihantar dan memberi JobLinker lesen bukan eksklusif, seluruh dunia dan bebas royalti untuk menjadi hos, menghasilkan semula, memformat dan memaparkannya bagi mengendalikan serta mempromosikan perkhidmatan."] },
        { title: "8. Ketersediaan dan penafian", paragraphs: ["Perkhidmatan disediakan mengikut ketersediaan. Setakat yang dibenarkan undang-undang, JobLinker tidak menjamin akses tanpa gangguan, jumlah pemohon tertentu, kejayaan pengambilan atau ketepatan kandungan pengguna."] },
        { title: "9. Liabiliti", paragraphs: ["Setakat yang dibenarkan undang-undang, JobLinker tidak bertanggungjawab atas kerugian tidak langsung atau berbangkit daripada kandungan pengguna, komunikasi pihak ketiga, keputusan pekerjaan atau penggunaan akaun tanpa kebenaran."] },
        { title: "10. Penggantungan dan penamatan", paragraphs: ["Anda boleh berhenti menggunakan JobLinker pada bila-bila masa. JobLinker boleh menggantung atau menamatkan akses kerana pelanggaran, penipuan, risiko keselamatan, keperluan undang-undang atau kemudaratan kepada pengguna."] },
        { title: "11. Perubahan dan undang-undang", paragraphs: ["Kami boleh mengemas kini terma ini dan akan menerbitkan tarikh semakan pada halaman ini. Terma ini ditadbir oleh undang-undang Malaysia dan pertikaian tertakluk kepada mahkamah Malaysia."] },
        { title: "12. Hubungi", paragraphs: ["Soalan boleh dihantar melalui saluran sokongan rasmi JobLinker. Nama sah pengendali, alamat berdaftar dan e-mel sokongan akan diterbitkan sebelum pelancaran awam."] },
      ],
    },
  },
  privacy: {
    en: {
      title: "Privacy Policy",
      intro: "This policy explains how JobLinker handles personal data under Malaysia's Personal Data Protection Act 2010 (PDPA).",
      sections: [
        { title: "1. Who is responsible", paragraphs: ["The JobLinker operator is responsible for personal data processed through this service. The operator's legal name, registered address and privacy contact will be published before public launch."] },
        { title: "2. Data we collect", paragraphs: ["We collect information you provide when creating and managing an employer account, company profile or job listing."], bullets: ["Name, work email, telephone or WhatsApp number and account credentials.", "Company name, registration and profile details, logo and job-listing content.", "Technical and usage data such as device information, timestamps, page views and WhatsApp-button clicks.", "Support, moderation and security communications."] },
        { title: "3. Why we use data", paragraphs: ["We use personal data to create accounts, publish and manage listings, enable enquiries, verify employers, moderate content, secure the service, provide support, measure performance and comply with legal obligations. Where required, we rely on consent; you may withdraw consent subject to legal and operational limitations."] },
        { title: "4. Public information", paragraphs: ["Approved job listings and selected company-profile information may be publicly visible. Do not include personal or confidential information in a public listing unless it is necessary and you are authorised to publish it."] },
        { title: "5. Sharing and processors", paragraphs: ["We may share data with service providers that host or support JobLinker, including database, authentication, storage, email, analytics and security providers. We may also disclose data when required by law, to protect users, or during a business transfer. We do not sell personal data."], bullets: ["Supabase supports database, authentication and file storage.", "WhatsApp processes information when a user follows a WhatsApp link or communicates through its service."] },
        { title: "6. International transfers", paragraphs: ["Some service providers may process data outside Malaysia. Where this occurs, JobLinker will take reasonable steps to use appropriate contractual, technical and organisational safeguards as required by applicable law."] },
        { title: "7. Retention", paragraphs: ["We keep personal data only as long as reasonably necessary for the purposes described, account administration, dispute handling, security and legal requirements. Data may then be deleted or anonymised. Backup copies may remain for a limited period."] },
        { title: "8. Security", paragraphs: ["We use reasonable administrative and technical measures such as access controls, authentication and restricted storage. No online system is completely secure, so users must protect passwords and report suspected misuse promptly."] },
        { title: "9. Your choices and rights", paragraphs: ["Subject to the PDPA and applicable exceptions, you may request access to or correction of your personal data, withdraw consent, ask questions about processing, or request account deletion. We may need to verify your identity before completing a request."] },
        { title: "10. Cookies and local storage", paragraphs: ["JobLinker may use essential cookies and browser storage for authentication, language choices, security and basic product operation. Additional analytics or advertising technologies will require an updated notice and, where necessary, consent."] },
        { title: "11. Children", paragraphs: ["Employer accounts are intended for authorised adults acting for businesses. JobLinker is not designed to knowingly collect children's personal data through employer registration."] },
        { title: "12. Changes and contact", paragraphs: ["We may update this policy and will publish the revised date. Privacy questions or rights requests may be sent through JobLinker's official support contact channel until a dedicated privacy email and registered address are published."] },
      ],
    },
    ms: {
      title: "Dasar Privasi",
      intro: "Dasar ini menerangkan cara JobLinker mengendalikan data peribadi di bawah Akta Perlindungan Data Peribadi 2010 (PDPA) Malaysia.",
      sections: [
        { title: "1. Pihak yang bertanggungjawab", paragraphs: ["Pengendali JobLinker bertanggungjawab terhadap data peribadi yang diproses melalui perkhidmatan ini. Nama sah, alamat berdaftar dan hubungan privasi pengendali akan diterbitkan sebelum pelancaran awam."] },
        { title: "2. Data yang kami kumpul", paragraphs: ["Kami mengumpul maklumat yang anda beri semasa mencipta dan mengurus akaun majikan, profil syarikat atau iklan kerja."], bullets: ["Nama, e-mel kerja, nombor telefon atau WhatsApp dan kelayakan akaun.", "Nama syarikat, pendaftaran, profil, logo dan kandungan iklan kerja.", "Data teknikal dan penggunaan seperti peranti, masa, paparan halaman dan klik butang WhatsApp.", "Komunikasi sokongan, moderasi dan keselamatan."] },
        { title: "3. Tujuan penggunaan", paragraphs: ["Kami menggunakan data untuk mencipta akaun, menerbitkan dan mengurus iklan, membolehkan pertanyaan, mengesahkan majikan, menjaga keselamatan, memberi sokongan, mengukur prestasi dan mematuhi undang-undang. Jika diperlukan, kami bergantung pada persetujuan yang boleh ditarik balik tertakluk kepada batasan undang-undang dan operasi."] },
        { title: "4. Maklumat awam", paragraphs: ["Iklan kerja yang diluluskan dan maklumat profil syarikat tertentu boleh dilihat secara awam. Jangan masukkan maklumat peribadi atau sulit kecuali perlu dan anda dibenarkan menerbitkannya."] },
        { title: "5. Perkongsian dan pemproses", paragraphs: ["Kami boleh berkongsi data dengan penyedia perkhidmatan yang menjadi hos atau menyokong JobLinker, dan apabila diperlukan oleh undang-undang atau untuk melindungi pengguna. Kami tidak menjual data peribadi."], bullets: ["Supabase menyokong pangkalan data, pengesahan dan storan fail.", "WhatsApp memproses maklumat apabila pengguna membuka pautan atau berkomunikasi melalui perkhidmatannya."] },
        { title: "6. Pemindahan antarabangsa", paragraphs: ["Sesetengah penyedia mungkin memproses data di luar Malaysia. JobLinker akan mengambil langkah munasabah untuk menggunakan perlindungan kontrak, teknikal dan organisasi yang sesuai seperti dikehendaki undang-undang."] },
        { title: "7. Penyimpanan", paragraphs: ["Kami menyimpan data hanya selama diperlukan untuk tujuan yang diterangkan, pentadbiran akaun, pertikaian, keselamatan dan keperluan undang-undang. Data kemudiannya boleh dipadam atau dinyahkenal pasti."] },
        { title: "8. Keselamatan", paragraphs: ["Kami menggunakan langkah pentadbiran dan teknikal yang munasabah termasuk kawalan akses, pengesahan dan storan terhad. Tiada sistem dalam talian yang selamat sepenuhnya; pengguna perlu melindungi kata laluan dan melaporkan penyalahgunaan."] },
        { title: "9. Pilihan dan hak anda", paragraphs: ["Tertakluk kepada PDPA dan pengecualian berkaitan, anda boleh meminta akses atau pembetulan data, menarik balik persetujuan, bertanya tentang pemprosesan atau meminta pemadaman akaun. Kami mungkin perlu mengesahkan identiti anda."] },
        { title: "10. Kuki dan storan pelayar", paragraphs: ["JobLinker boleh menggunakan kuki penting dan storan pelayar untuk pengesahan, pilihan bahasa, keselamatan dan operasi asas. Analitik atau pengiklanan tambahan memerlukan notis yang dikemas kini dan persetujuan jika perlu."] },
        { title: "11. Kanak-kanak", paragraphs: ["Akaun majikan ditujukan kepada orang dewasa yang diberi kuasa bertindak untuk perniagaan. Pendaftaran majikan tidak direka untuk mengumpul data peribadi kanak-kanak dengan sengaja."] },
        { title: "12. Perubahan dan hubungan", paragraphs: ["Kami boleh mengemas kini dasar ini dan akan menerbitkan tarikh semakan. Soalan atau permintaan hak privasi boleh dihantar melalui saluran sokongan rasmi JobLinker sehingga e-mel privasi dan alamat berdaftar diterbitkan."] },
      ],
    },
  },
};

export function LegalDocument({ kind, initialLocale }: { kind: LegalKind; initialLocale: Locale }) {
  const [locale, setLocale] = useState(initialLocale);
  const document = documents[kind][locale];
  const otherKind = kind === "terms" ? "privacy" : "terms";

  return <div className="legal-page">
    <header className="legal-header"><div><Link className="wordmark" href="/">Job<span>Linker</span></Link><div className="language-switcher"><button type="button" aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button><span>|</span><button type="button" aria-pressed={locale === "ms"} onClick={() => setLocale("ms")}>BM</button></div></div></header>
    <main className="legal-main">
      <Link className="legal-back" href={`/employer/login?lang=${locale}`}>← {locale === "en" ? "Back to employer access" : "Kembali ke akses majikan"}</Link>
      <p className="legal-eyebrow">JobLinker</p><h1>{document.title}</h1><p className="legal-updated">{locale === "en" ? "Last updated: 1 July 2026" : "Kemas kini terakhir: 1 Julai 2026"}</p><p className="legal-intro">{document.intro}</p>
      <div className="legal-sections">{document.sections.map((section) => <section key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((item) => <li key={item}>{item}</li>)}</ul>}</section>)}</div>
      <aside className="legal-related"><span>{locale === "en" ? "Also read" : "Baca juga"}</span><Link href={`/${otherKind}?lang=${locale}`}>{documents[otherKind][locale].title}</Link></aside>
    </main>
  </div>;
}
