import { committeeRows } from "@/data/committee";
import RevealCard from "@/components/ui/RevealCard";
import StrokeText from "@/components/reactbits/StrokeText";

// Layout (rows and grouping) is as the owner asked for. Colours, fonts and
// card styling beyond this are still open (see PAGES.md).
//
// The heading stroke is the owner's chosen yellow (#EAB308); the fill still
// uses "currentColor" since a fill colour hasn't been decided yet — it
// follows whatever text colour the page already uses (light/dark).
export default function CoreCommitteePage() {
  return (
    <main className="flex-1 px-4 py-8">
      <h1 className="max-w-md">
        <StrokeText
          text="Core Committee"
          trigger="mount"
          fillMode="wipe"
          strokeColor="#EAB308"
          fillColor="currentColor"
          strokeWidth={1.4}
          drawDuration={1.2}
          fillDelay={0.1}
          stagger={0.03}
          ease="power2.out"
          fontSize={44}
          fontWeight={800}
          letterSpacing={-1}
        />
      </h1>

      <div className="mt-8 flex flex-col items-center gap-10">
        {committeeRows.map((row) => (
          <div
            key={row.members.map((member) => member.name).join("-")}
            className="flex flex-wrap items-start justify-center gap-8 sm:gap-12"
          >
            {row.members.map((member, index) => (
              <RevealCard
                key={member.name}
                name={member.name}
                role={member.role}
                image={member.image}
                sizes="(min-width: 768px) 384px, (min-width: 640px) 320px, 288px"
                fromSide={
                  row.members.length === 2 ? (index === 0 ? "left" : "right") : "none"
                }
              />
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
