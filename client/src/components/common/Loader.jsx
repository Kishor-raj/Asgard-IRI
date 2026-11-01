export default function Loader({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-grey-50">
        <div className="w-10 h-10 border-4 border-grey-200 border-t-navy rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-grey-200 border-t-navy rounded-full animate-spin" />
    </div>
  );
}
