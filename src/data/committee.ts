// Core Committee members, grouped into the rows the owner asked for:
// row 1 = President alone, row 2 = Secretary + Treasurer together,
// then each pair of heads shares a row.

export interface CommitteeMember {
  name: string;
  role: string;
  image: string;
}

export interface CommitteeRow {
  members: CommitteeMember[];
}

export const committeeRows: CommitteeRow[] = [
  {
    members: [{ name: "Ved Tidke", role: "President", image: "/images/committee/01-ved-tidke.jpg" }],
  },
  {
    members: [
      { name: "Chetan Lahoti", role: "Secretary", image: "/images/committee/02-chetan-lahoti.jpg" },
      { name: "Anika Agarwal", role: "Treasurer", image: "/images/committee/03-anika-agarwal.jpg" },
    ],
  },
  {
    members: [
      { name: "Rishi Palod", role: "Event Head", image: "/images/committee/04-rishi-palod.jpg" },
      { name: "Devansh Lakhotia", role: "Event Head", image: "/images/committee/05-devansh-lakhotia.jpg" },
    ],
  },
  {
    members: [
      { name: "Vedika Jain", role: "Media Head", image: "/images/committee/06-vedika-jain.jpg" },
      { name: "Vismay Shende", role: "Media Head", image: "/images/committee/07-vismay-shende.jpg" },
    ],
  },
  {
    members: [
      { name: "Shashwat Sinha", role: "Publicity Head", image: "/images/committee/08-shashwat-sinha.jpg" },
      { name: "Shubh Surana", role: "Publicity Head", image: "/images/committee/09-shubh-surana.jpg" },
    ],
  },
  {
    members: [
      { name: "Bhumika Reddy", role: "Design Head", image: "/images/committee/10-bhumika-reddy.jpg" },
      { name: "Aarryan Parakh", role: "Design Head", image: "/images/committee/11-aarryan-parakh.jpg" },
    ],
  },
  {
    members: [
      { name: "Saksham Boldhan", role: "Technical Head", image: "/images/committee/12-saksham-boldhan.jpg" },
      { name: "Tilak Sorte", role: "Technical Head", image: "/images/committee/13-tilak-sorte.jpg" },
    ],
  },
  {
    members: [
      { name: "Kripa Tawri", role: "Hospitality Head", image: "/images/committee/14-kripa-tawri.jpg" },
      { name: "Pragnya Mogalla", role: "Hospitality Head", image: "/images/committee/15-pragnya-mogalla.jpg" },
    ],
  },
];
