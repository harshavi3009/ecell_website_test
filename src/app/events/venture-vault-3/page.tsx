import { ventureVault3Content } from "./content";

// TODO(owner): banner image, description text and timeline entries below are
// placeholders. Layout, colours, fonts and animations are all still to be
// decided (see PAGES.md).
export default function VentureVault3Page() {
  const { description, registerUrl, timeline } = ventureVault3Content;

  return (
    <main className="flex-1 px-4 py-8">
      <section className="flex h-48 items-center justify-center bg-black/5">
        <p className="text-black/40">TODO(owner): banner image</p>
      </section>

      <h1 className="mt-6 text-2xl font-semibold">Venture Vault 3.0</h1>
      <p className="mt-2 text-black/60">{description}</p>

      <a
        href={registerUrl}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded bg-black px-5 text-white"
      >
        Register Now
      </a>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Timeline</h2>
        {timeline.length === 0 && (
          <p className="mt-2 text-black/40">TODO(owner): timeline entries go here.</p>
        )}
      </section>
    </main>
  );
}
