import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-2 mt-10">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="p-2 rounded-lg border border-grey-200 hover:bg-grey-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeftIcon className="w-4 h-4 text-grey-600" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1)
        .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
        .reduce((acc, p, idx, arr) => {
          if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
          acc.push(p);
          return acc;
        }, [])
        .map((item, i) =>
          item === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-grey-400">
              …
            </span>
          ) : (
            <button
              key={item}
              onClick={() => onChange(item)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                item === page
                  ? 'bg-navy text-white'
                  : 'border border-grey-200 text-grey-600 hover:bg-grey-50'
              }`}
            >
              {item}
            </button>
          )
        )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="p-2 rounded-lg border border-grey-200 hover:bg-grey-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRightIcon className="w-4 h-4 text-grey-600" />
      </button>
    </div>
  );
}
