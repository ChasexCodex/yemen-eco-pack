export type Product = {
  id: number;
  name: string;
  category: string;
  unit: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
};

export const products: Product[] = [
  {
    id: 1,
    name: "9x9 Clamshell Box",
    category: "Bagasse",
    unit: "piece",
    price: 0.18,
    image: "/products/clamshell-9x9.png",
    description:
      "A sturdy compostable clamshell made from sugarcane fiber, suitable for hot and cold meals.",
    inStock: true,
  },
  {
    id: 2,
    name: "3-Compartment Clamshell",
    category: "Bagasse",
    unit: "piece",
    price: 0.22,
    image: "/products/clamshell-3compartment.png",
    description:
      "Multi-compartment compostable takeaway container ideal for portioned dishes and mixed meals.",
    inStock: true,
  },
  {
    id: 3,
    name: "24oz Bowl",
    category: "Bagasse",
    unit: "piece",
    price: 0.19,
    image: "/products/bowl-24oz.png",
    description:
      "Deep biodegradable bowl for salads, rice dishes, and soups with reliable structure.",
    inStock: true,
  },
  {
    id: 4,
    name: "16oz PLA Cold Cup",
    category: "PLA",
    unit: "cup",
    price: 0.22,
    image: "/products/pla-cold-cup-16oz.png",
    description:
      "Crystal-clear compostable cup for cold beverages, made from plant-based PLA material.",
    inStock: true,
  },
  {
    id: 5,
    name: "12oz Hot Cup",
    category: "Compostable",
    unit: "cup",
    price: 0.2,
    image: "/products/hot-cup-12oz.png",
    description:
      "Insulated compostable hot cup designed for tea and coffee service in eco-conscious cafes.",
    inStock: true,
  },
  {
    id: 6,
    name: "Kraft Paper Straws",
    category: "Kraft Paper",
    unit: "pack",
    price: 1.45,
    image: "/products/kraft-straws.png",
    description:
      "Durable paper straws made from responsibly sourced kraft paper with plastic-free packaging.",
    inStock: true,
  },
  {
    id: 7,
    name: "2oz Portion Cup",
    category: "Compostable",
    unit: "piece",
    price: 0.08,
    image: "/products/portion-cup-2oz.png",
    description:
      "Small compostable cup for sauces, condiments, and sampling portions in food service.",
    inStock: true,
  },
  {
    id: 8,
    name: "13gal Compostable Trash Bags",
    category: "PBAT/PLA Blend",
    unit: "roll",
    price: 4.25,
    image: "/products/trash-bags-13gal.png",
    description:
      "Compostable liner bags for waste collection, engineered for strength and cleaner disposal.",
    inStock: true,
  },
];

export function getProductById(id: number): Product | undefined {
  return products.find((product) => product.id === id);
}

