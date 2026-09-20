import PillNav, { type PillNavEntry } from "@/components/reactbits/PillNav";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { events } from "@/data/events";

// TODO(owner): link labels/order beyond what's below are decided; anything
// else about look (fonts, exact spacing) is still open — see PAGES.md.
const navItems: PillNavEntry[] = [
  { label: "Home", href: "/" },
  { label: "Core Committee", href: "/core-committee" },
  {
    label: "Events",
    children: events.map((event) => ({
      label: event.name,
      href: `/events/${event.slug}`,
    })),
  },
  { label: "Gallery", href: "/gallery" },
];

export default function Navbar() {
  return (
    <PillNav
      logo="/images/logo.png"
      logoAlt="E-Cell RBU logo"
      logoText="E-Cell RBU"
      items={navItems}
      baseColor="#000000"
      pillColor="#ffffff"
      hoveredPillTextColor="#ffffff"
      pillTextColor="#000000"
      initialLoadAnimation={false}
      trailingContent={<ThemeToggle />}
    />
  );
}
