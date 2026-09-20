// TODO(owner): animation, how long it shows, and whether it shows on every
// visit or once per session are all still to be decided (see PAGES.md).
// Not wired into the Home page yet — ask the owner before building that in.
export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <p>TODO(owner): loading animation goes here.</p>
    </div>
  );
}
