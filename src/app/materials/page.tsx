"use client";

import { SiteShell } from "@/components/site-shell";
import { useLanguage } from "@/components/app-providers";
import type { Lang } from "@/lib/types";

const materials = [
  {
    id: "bagasse",
    title: {
      en: "Bagasse (Sugarcane Fiber)",
      ar: "تفل قصب السكر (باغاس)",
    },
    what: {
      en: "Bagasse is the fibrous residue that remains after sugarcane stalks are crushed to extract their juice. It is a highly renewable resource.",
      ar: "تفل قصب السكر هو البقايا الليفية التي تبقى بعد سحق سيقان قصب السكر لاستخراج عصيرها. إنه مورد متجدد للغاية.",
    },
    benefits: {
      en: "Compostable, sturdy, and tolerates both hot and cold temperatures. Utilizing bagasse prevents it from being burned as agricultural waste.",
      ar: "قابل للتسميد، قوي، ويتحمل درجات الحرارة الساخنة والباردة. استخدام تفل قصب السكر يمنع حرقه كنفايات زراعية.",
    },
    links: [
      {
        title: "Bagasse LCA",
        url: "https://www.sciencedirect.com/science/article/abs/pii/S0959652620306806",
      },
      {
        title: "Sugarcane bagasse review",
        url: "https://www.sciencedirect.com/science/article/pii/S2589014X20300712",
      },
    ],
  },
  {
    id: "pla",
    title: {
      en: "PLA (Polylactic Acid)",
      ar: "حمض عديد اللبنيك (PLA)",
    },
    what: {
      en: "PLA is a bioplastic derived from renewable resources like corn starch or sugarcane.",
      ar: "PLA هو بلاستيك حيوي مشتق من موارد متجددة مثل نشا الذرة أو قصب السكر.",
    },
    benefits: {
      en: "Fully compostable in industrial facilities. It requires significantly less energy to produce compared to conventional plastics and emits fewer greenhouse gases.",
      ar: "قابل للتحلل بالكامل في منشآت التسميد الصناعية. يتطلب إنتاجه طاقة أقل بكثير مقارنة بالبلاستيك التقليدي وينبعث منه غازات دفيئة أقل.",
    },
    links: [
      {
        title: "PLA biodegradation",
        url: "https://pubs.rsc.org/en/content/articlehtml/2020/gc/d0gc01647k",
      },
      {
        title: "EPA composting",
        url: "https://www.epa.gov/sustainable-management-food/composting-home",
      },
    ],
  },
  {
    id: "kraft",
    title: {
      en: "Kraft Paper",
      ar: "ورق الكرافت",
    },
    what: {
      en: "Kraft paper is produced from chemical pulp produced in the kraft process. It is stronger than standard paper.",
      ar: "يتم إنتاج ورق الكرافت من اللب الكيميائي المنتج في عملية الكرافت. وهو أقوى من الورق القياسي.",
    },
    benefits: {
      en: "100% biodegradable and recyclable. Unbleached kraft paper involves fewer chemicals and is environmentally benign.",
      ar: "قابل للتحلل وإعادة التدوير بالكامل. ورق الكرافت غير المبيض يستخدم مواد كيميائية أقل ويعد خيارا صديقا للبيئة.",
    },
    links: [
      {
        title: "Kraft paper environmental impact",
        url: "https://link.springer.com/article/10.1007/s11356-020-09483-9",
      },
      {
        title: "UNEP plastics report",
        url: "https://www.unep.org/resources/report/single-use-plastics-roadmap-sustainability",
      },
    ],
  },
  {
    id: "pbat",
    title: {
      en: "Compostable Bioplastics (PBAT/PLA blends)",
      ar: "البلاستيك الحيوي القابل للتسميد (مزيج PBAT و PLA)",
    },
    what: {
      en: "Blends of PLA and PBAT create flexible, durable bioplastics used for items like trash bags.",
      ar: "تنتج مزيجات PLA و PBAT بلاستيكا حيويا مرنا ومتين يستخدم في منتجات مثل أكياس النفايات.",
    },
    benefits: {
      en: "Designed to biodegrade in composting conditions, offering a sustainable alternative to conventional polyethylene bags without leaving microplastics.",
      ar: "مصمم للتحلل في ظروف التسميد، ويوفر بديلا مستداما لأكياس البولي إيثيلين التقليدية دون ترك جسيمات بلاستيكية دقيقة.",
    },
    links: [
      {
        title: "PBAT compostability",
        url: "https://www.sciencedirect.com/science/article/pii/S0921344919303441",
      },
      {
        title: "Bioplastics review",
        url: "https://www.nature.com/articles/s41893-019-0339-6",
      },
    ],
  },
];

function localized(value: Record<Lang, string>, lang: Lang) {
  return value[lang];
}

export default function MaterialsPage() {
  const { lang, t } = useLanguage();

  return (
    <SiteShell>
      <section className="border-b border-border bg-primary/5 py-20">
        <div className="container max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">{t("materials.title")}</h1>
          <p className="text-xl text-muted">
            {t("materials.subtitle")}
          </p>
        </div>
      </section>

      <section className="container max-w-4xl py-20">
        <div className="space-y-24">
          {materials.map((material) => (
            <article key={material.id} id={material.id} className="scroll-mt-32">
              <h2 className="mb-6 text-3xl font-bold text-primary">
                {localized(material.title, lang)}
              </h2>

              <p className="mb-4 text-lg font-medium text-foreground">
                {localized(material.what, lang)}
              </p>
              <p className="mb-8 text-lg text-muted">{localized(material.benefits, lang)}</p>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                  {t("materials.references")}
                </h3>
                <ul className="space-y-3">
                  {material.links.map((link) => (
                    <li key={link.url}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        {link.title} ↗
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}

