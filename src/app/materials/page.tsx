import { SiteShell } from "@/components/site-shell";

const materials = [
  {
    id: "bagasse",
    title: "Bagasse (Sugarcane Fiber)",
    what: "Bagasse is the fibrous residue that remains after sugarcane stalks are crushed to extract their juice. It is a highly renewable resource.",
    benefits:
      "Compostable, sturdy, and tolerates both hot and cold temperatures. Utilizing bagasse prevents it from being burned as agricultural waste.",
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
    title: "PLA (Polylactic Acid)",
    what: "PLA is a bioplastic derived from renewable resources like corn starch or sugarcane.",
    benefits:
      "Fully compostable in industrial facilities. It requires significantly less energy to produce compared to conventional plastics and emits fewer greenhouse gases.",
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
    title: "Kraft Paper",
    what: "Kraft paper is produced from chemical pulp produced in the kraft process. It is stronger than standard paper.",
    benefits:
      "100% biodegradable and recyclable. Unbleached kraft paper involves fewer chemicals and is environmentally benign.",
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
    title: "Compostable Bioplastics (PBAT/PLA blends)",
    what: "Blends of PLA and PBAT create flexible, durable bioplastics used for items like trash bags.",
    benefits:
      "Designed to biodegrade in composting conditions, offering a sustainable alternative to conventional polyethylene bags without leaving microplastics.",
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

export default function MaterialsPage() {
  return (
    <SiteShell>
      <section className="border-b border-border bg-primary/5 py-20">
        <div className="container max-w-4xl text-center">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">Our Materials</h1>
          <p className="text-xl text-muted">
            Learn about the plant-based materials that make our packaging
            sustainable.
          </p>
        </div>
      </section>

      <section className="container max-w-4xl py-20">
        <div className="space-y-24">
          {materials.map((material) => (
            <article key={material.id} id={material.id} className="scroll-mt-32">
              <h2 className="mb-6 text-3xl font-bold text-primary">
                {material.title}
              </h2>

              <p className="mb-4 text-lg font-medium text-foreground">
                {material.what}
              </p>
              <p className="mb-8 text-lg text-muted">{material.benefits}</p>

              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted">
                  Research & References
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

