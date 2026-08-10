export type Product = {
  slug: string;
  name: string;
  subtitle: string;
  price: number;
  compareAt?: number;
  collection: "MOVEMENT" | "FABRIC" | "THE DROP" | "ARCHIVE";
  colorway: string;
  image: string;
  alt: string;
  /** Secondary shot used on hover and on the product page. */
  imageAlt: string;
  fabric: string;
  weightGsm: number;
  sizes: string[];
  soldOutSizes?: string[];
  status?: "NEW" | "LOW STOCK" | "SOLD OUT" | "RESTOCK";
  description: string;
  details: string[];
};

const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/**
 * The catalogue as first written, kept only as seed input.
 *
 * Firestore is the source of truth at runtime — read it through
 * `lib/catalogue.ts`. This array exists so `npm run seed` can populate an
 * empty database, and so the demo order history has products to reference.
 */
export const SEED_PRODUCTS: Product[] = [
  {
    slug: "own-the-streets-heavyweight",
    name: "OWN THE STREETS",
    subtitle: "Heavyweight Box Tee",
    price: 68,
    collection: "THE DROP",
    colorway: "Bone / Red",
    image: U("photo-1521572163474-6864f9cf17ab"),
    alt: "Heavyweight white box tee worn straight on",
    imageAlt: U("photo-1622445275576-721325763afe"),
    fabric: "Waffle-structure heavyweight cotton",
    weightGsm: 260,
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    soldOutSizes: ["XS"],
    status: "NEW",
    description:
      "The anchor piece of Collection '26. A boxed-out silhouette cut from 260gsm waffle-structure cotton that holds its shape through the whole night. Screen-printed by hand in three passes so the ink sits on the fabric, not in it.",
    details: [
      "260gsm waffle-structure cotton, garment dyed",
      "Boxed shoulder, dropped sleeve, split hem",
      "Hand-pulled three-pass discharge print",
      "Pre-shrunk — takes one wash and stays put",
    ],
  },
  {
    slug: "movement-waffle-tee",
    name: "MOVEMENT",
    subtitle: "Waffle Structure Tee",
    price: 62,
    collection: "MOVEMENT",
    colorway: "Washed Black",
    image: U("photo-1503341504253-dff4815485f1"),
    alt: "Model wearing the washed black waffle tee against a concrete wall",
    imageAlt: U("photo-1583743814966-8936f5b7be1a"),
    fabric: "Open-weave breathable cotton",
    weightGsm: 240,
    sizes: ["S", "M", "L", "XL"],
    status: "LOW STOCK",
    description:
      "Built for the walk between places. Open-weave cotton moves air through the body so the shirt breathes when the city does. Washed black that fades honestly instead of going grey.",
    details: [
      "240gsm open-weave cotton",
      "Reactive-dyed washed black",
      "Ribbed collar, twin-needle hem",
      "Relaxed through the body, tapered at the arm",
    ],
  },
  {
    slug: "night-shift-longsleeve",
    name: "NIGHT SHIFT",
    subtitle: "Long Sleeve",
    price: 84,
    compareAt: 96,
    collection: "THE DROP",
    colorway: "Off White",
    image: U("photo-1529374255404-311a2a4f1fd9"),
    alt: "Collar and shoulder detail of the off white long sleeve",
    imageAlt: U("photo-1489987707025-afc232f7ea0f"),
    fabric: "Brushed heavyweight jersey",
    weightGsm: 280,
    sizes: ["S", "M", "L", "XL", "XXL"],
    description:
      "For the hours after the shops close. Brushed 280gsm jersey with a weight you can feel across the shoulders, ribbed cuffs that stay closed, and a back print that reads at distance.",
    details: [
      "280gsm brushed heavyweight jersey",
      "Full back placement print",
      "Ribbed cuff and collar, double-stitched",
      "Runs true — size down for a closer fit",
    ],
  },
  {
    slug: "concrete-pocket-tee",
    name: "CONCRETE",
    subtitle: "Pocket Tee",
    price: 58,
    collection: "FABRIC",
    colorway: "Cement",
    image: U("photo-1581655353564-df123a1eb820"),
    alt: "Cement mineral-washed tee hung against a concrete wall",
    imageAlt: U("photo-1529374255404-311a2a4f1fd9"),
    fabric: "Slub cotton, mineral wash",
    weightGsm: 220,
    sizes: ["XS", "S", "M", "L", "XL"],
    description:
      "Mineral-washed slub cotton with a surface that catches light like poured concrete. Chest pocket sits high and square. The plainest thing we make and the one that gets worn most.",
    details: [
      "220gsm slub cotton",
      "Mineral wash — no two pieces identical",
      "Square patch pocket, tonal stitch",
      "Straight body, standard shoulder",
    ],
  },
  {
    slug: "static-graphic-tee",
    name: "STATIC",
    subtitle: "Halftone Graphic Tee",
    price: 66,
    collection: "MOVEMENT",
    colorway: "Bone / Halftone",
    image: U("photo-1576566588028-4147f3842f27"),
    alt: "Oversized halftone graphic printed across the front of the tee",
    imageAlt: U("photo-1523381210434-271e8be1f52b"),
    fabric: "Combed ring-spun cotton",
    weightGsm: 250,
    sizes: ["S", "M", "L", "XL"],
    status: "RESTOCK",
    description:
      "A blown-up halftone lifted from a photocopy of a photocopy. Printed at a dot size big enough that you read the grid before you read the image.",
    details: [
      "250gsm combed ring-spun cotton",
      "Oversized halftone front placement",
      "Water-based ink, soft hand",
      "Boxed fit, dropped shoulder",
    ],
  },
  {
    slug: "cities-tour-tee",
    name: "CITIES",
    subtitle: "Tour Tee",
    price: 72,
    collection: "ARCHIVE",
    colorway: "Faded Black",
    image: U("photo-1583743814966-8936f5b7be1a"),
    alt: "Faded black tour tee with the city list on the reverse",
    imageAlt: U("photo-1618354691373-d851c5c3a990"),
    fabric: "Vintage-wash heavy cotton",
    weightGsm: 240,
    sizes: ["M", "L", "XL"],
    soldOutSizes: ["M"],
    status: "LOW STOCK",
    description:
      "Front logo, back city list. Cut from vintage-wash cotton that arrives already broken in. Six cities on the reverse — the ones that shaped the collection.",
    details: [
      "240gsm vintage-wash cotton",
      "Front chest hit, full back city list",
      "Pre-distressed collar",
      "Relaxed, slightly cropped body",
    ],
  },
];

export const money = (n: number) =>
  `₵${n.toFixed(2).replace(/\.00$/, "")}`;
