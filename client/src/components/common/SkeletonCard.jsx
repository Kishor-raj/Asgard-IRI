export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-grey-200 p-6 animate-pulse">
      <div className="h-4 bg-grey-200 rounded mb-3 w-3/4" />
      <div className="h-3 bg-grey-100 rounded mb-2 w-full" />
      <div className="h-3 bg-grey-100 rounded mb-4 w-5/6" />
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-16 bg-grey-100 rounded-full" />
        <div className="h-5 w-20 bg-grey-100 rounded-full" />
      </div>
      <div className="h-9 bg-grey-200 rounded-lg w-1/3" />
    </div>
  );
}
