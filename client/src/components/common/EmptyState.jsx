import { InboxIcon } from '@heroicons/react/24/outline';

export default function EmptyState({ title = 'No results found', description, action }) {
  return (
    <div className="text-center py-20">
      <div className="w-16 h-16 bg-grey-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <InboxIcon className="w-8 h-8 text-grey-400" />
      </div>
      <h3 className="font-display text-lg font-semibold text-grey-900 mb-2">{title}</h3>
      {description && (
        <p className="text-grey-600 text-sm max-w-xs mx-auto mb-6">{description}</p>
      )}
      {action}
    </div>
  );
}
