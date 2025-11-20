export function CommentsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-800 rounded-lg p-4">
          <div className="flex items-baseline justify-between mb-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function LikeButtonSkeleton() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 animate-pulse">
      <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
      <div className="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
    </div>
  );
}

export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-2 border-gray-300 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin`}
      ></div>
    </div>
  );
}
