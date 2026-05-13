import type { MaterialPageItem, PageContent, SiteSettings } from "./types";

const defaultMaterialItems: MaterialPageItem[] = [
  {
    id: "bagasse",
    title_en: "Bagasse (Sugarcane Fiber)",
    title_ar: "تفل قصب السكر (باغاس)",
    what_en:
      "Bagasse is the fibrous residue that remains after sugarcane stalks are crushed to extract their juice. It is a highly renewable resource.",
    what_ar:
      "تفل قصب السكر هو البقايا الليفية التي تبقى بعد سحق سيقان قصب السكر لاستخراج عصيرها. إنه مورد متجدد للغاية.",
    benefits_en:
      "Compostable, sturdy, and tolerates both hot and cold temperatures. Utilizing bagasse prevents it from being burned as agricultural waste.",
    benefits_ar:
      "قابل للتسميد، قوي، ويتحمل درجات الحرارة الساخنة والباردة. استخدام تفل قصب السكر يمنع حرقه كنفايات زراعية.",
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
    title_en: "PLA (Polylactic Acid)",
    title_ar: "حمض عديد اللبنيك (PLA)",
    what_en: "PLA is a bioplastic derived from renewable resources like corn starch or sugarcane.",
    what_ar: "PLA هو بلاستيك حيوي مشتق من موارد متجددة مثل نشا الذرة أو قصب السكر.",
    benefits_en:
      "Fully compostable in industrial facilities. It requires significantly less energy to produce compared to conventional plastics and emits fewer greenhouse gases.",
    benefits_ar:
      "قابل للتحلل بالكامل في منشآت التسميد الصناعية. يتطلب إنتاجه طاقة أقل بكثير مقارنة بالبلاستيك التقليدي وينبعث منه غازات دفيئة أقل.",
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
    title_en: "Kraft Paper",
    title_ar: "ورق الكرافت",
    what_en:
      "Kraft paper is produced from chemical pulp produced in the kraft process. It is stronger than standard paper.",
    what_ar: "يتم إنتاج ورق الكرافت من اللب الكيميائي المنتج في عملية الكرافت. وهو أقوى من الورق القياسي.",
    benefits_en:
      "100% biodegradable and recyclable. Unbleached kraft paper involves fewer chemicals and is environmentally benign.",
    benefits_ar:
      "قابل للتحلل وإعادة التدوير بالكامل. ورق الكرافت غير المبيض يستخدم مواد كيميائية أقل ويعد خيارا صديقا للبيئة.",
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
    title_en: "Compostable Bioplastics (PBAT/PLA blends)",
    title_ar: "البلاستيك الحيوي القابل للتسميد (مزيج PBAT و PLA)",
    what_en:
      "Blends of PLA and PBAT create flexible, durable bioplastics used for items like trash bags.",
    what_ar: "تنتج مزيجات PLA و PBAT بلاستيكا حيويا مرنا ومتين يستخدم في منتجات مثل أكياس النفايات.",
    benefits_en:
      "Designed to biodegrade in composting conditions, offering a sustainable alternative to conventional polyethylene bags without leaving microplastics.",
    benefits_ar:
      "مصمم للتحلل في ظروف التسميد، ويوفر بديلا مستداما لأكياس البولي إيثيلين التقليدية دون ترك جسيمات بلاستيكية دقيقة.",
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

export const defaultPageContent: PageContent = {
  header: {
    nav_home_en: "Home",
    nav_home_ar: "الرئيسية",
    nav_products_en: "Products",
    nav_products_ar: "المنتجات",
    nav_materials_en: "Materials",
    nav_materials_ar: "المواد",
    nav_about_en: "About",
    nav_about_ar: "من نحن",
    nav_contact_en: "Contact",
    nav_contact_ar: "اتصل بنا",
  },
  home: {
    hero_title_en: "Sustainable Packaging for a Greener Tomorrow",
    hero_title_ar: "تغليف مستدام لغد أكثر اخضرارا",
    hero_subtitle_en:
      "BioPak provides eco-friendly, biodegradable food packaging solutions in Yemen.",
    hero_subtitle_ar: "توفر بايو باك حلول تغليف طعام صديقة للبيئة وقابلة للتحلل في اليمن.",
    cta_label_en: "Learn More",
    cta_label_ar: "اعرف المزيد",
    featured_title_en: "Featured Products",
    featured_title_ar: "منتجات مميزة",
    featured_link_label_en: "View All Products",
    featured_link_label_ar: "عرض كل المنتجات",
    why_title_en: "Why Biodegradable?",
    why_title_ar: "لماذا القابل للتحلل؟",
    why_text_en:
      "Traditional plastics take hundreds of years to decompose, choking our landfills and oceans. Our plant-based packaging breaks down naturally, returning safely to the earth.",
    why_text_ar:
      "يستغرق البلاستيك التقليدي مئات السنين ليتحلل، مما يخنق مكبات النفايات والمحيطات. تتحلل عبواتنا النباتية بشكل طبيعي وتعود بأمان إلى الأرض.",
    materials_link_label_en: "Learn about our materials",
    materials_link_label_ar: "تعرف على موادنا",
  },
  products: {
    title_en: "Our Products",
    title_ar: "منتجاتنا",
    subtitle_en:
      "Explore BioPak's biodegradable packaging range for takeaway, food service, and retail needs.",
    subtitle_ar: "استكشف مجموعة بايو باك من التغليف القابل للتحلل لتلبية احتياجات الطلبات الخارجية وخدمات الطعام والتجزئة.",
    empty_en: "No products are available yet.",
    empty_ar: "لا توجد منتجات متاحة بعد.",
  },
  materials: {
    title_en: "Our Materials",
    title_ar: "موادنا",
    subtitle_en: "Learn about the plant-based materials that make our packaging sustainable.",
    subtitle_ar: "تعرف على المواد النباتية التي تجعل عبواتنا مستدامة.",
    references_label_en: "Research and References",
    references_label_ar: "الأبحاث والمراجع",
    items: defaultMaterialItems,
  },
  about: {
    title_en: "About BioPak",
    title_ar: "عن بايو باك",
    mission_title_en: "Our Mission",
    mission_title_ar: "مهمتنا",
    mission_text_en:
      "Our company specializes in providing sustainable and eco-friendly packaging solutions. We aim to reduce environmental impact by offering biodegradable packaging alternatives to traditional plastic packaging.",
    mission_text_ar:
      "تتخصص شركتنا في تقديم حلول تغليف مستدامة وصديقة للبيئة. نهدف إلى تقليل الأثر البيئي من خلال تقديم بدائل تغليف قابلة للتحلل للتغليف البلاستيكي التقليدي.",
    vision_title_en: "Our Vision",
    vision_title_ar: "رؤيتنا",
    vision_text_en:
      "To provide reliable and sustainable packaging solutions to meet the needs of various industries, while promoting the reduction of plastic use and raising awareness of the benefits of biodegradable packaging solutions.",
    vision_text_ar:
      "تقديم حلول تغليف موثوقة ومستدامة لتلبية احتياجات مختلف الصناعات، مع تعزيز تقليل استخدام البلاستيك ورفع الوعي بفوائد حلول التغليف القابلة للتحلل.",
  },
  contact: {
    title_en: "Contact Us",
    title_ar: "اتصل بنا",
    subtitle_en: "Have a question or want to place a large order? Get in touch.",
    subtitle_ar: "هل لديك سؤال أو ترغب في تقديم طلب كبير؟ تواصل معنا.",
    form_title_en: "Send an Inquiry",
    form_title_ar: "إرسال استفسار",
  },
  footer: {
    copyright_en: "© 2026 BioPak. All rights reserved.",
    copyright_ar: "© 2026 بايو باك. جميع الحقوق محفوظة.",
  },
};

export const defaultSiteSettings: SiteSettings = {
  site_name_en: "BioPak",
  site_name_ar: "بايو باك",
  logo_url: "/logo.png",
  hero_images: ["/hero.png"],
  contact_email: "info@biopak.ye",
  contact_phone: "+967-1-555-0100",
  address_en: "Sana'a, Yemen",
  address_ar: "صنعاء، اليمن",
  tagline_en: "Sustainable solutions for a greener Yemen.",
  tagline_ar: "حلول مستدامة من أجل يمن أكثر اخضرارا.",
  page_content: defaultPageContent,
};
