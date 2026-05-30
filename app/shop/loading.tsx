/**
 * Loading skeleton for /[locale]/shop
 * Shows immediately while the React client component mounts + fetches data.
 */
export default function ShopLoading() {
    return (
        <div className="min-h-screen bg-[#F5F2EB]">
            <div className="pt-24 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Controls bar skeleton */}
                    <div className="flex justify-between items-center mb-8 animate-pulse">
                        <div className="flex items-center gap-2">
                            <div className="h-4 bg-stone-200/60 rounded w-14" />
                            <div className="h-4 bg-stone-200/60 rounded w-3" />
                            <div className="h-4 bg-stone-200/60 rounded w-12" />
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-4 bg-stone-200/60 rounded w-20 hidden lg:block" />
                            <div className="h-4 bg-stone-200/60 rounded w-16" />
                        </div>
                    </div>

                    {/* Title skeleton */}
                    <div className="text-center mb-10 animate-pulse">
                        <div className="h-7 bg-stone-200/60 rounded w-24 mx-auto" />
                    </div>

                    {/* Grid skeleton */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-stone-200/60 aspect-[3/4] rounded-lg mb-4 border border-stone-200/40" />
                                <div className="space-y-2 px-1">
                                    <div className="h-4 bg-stone-200/60 rounded w-3/4" />
                                    <div className="h-4 bg-stone-200/60 rounded w-1/2" />
                                    <div className="flex gap-1 mt-2">
                                        {Array.from({ length: 3 }).map((_, j) => (
                                            <div key={j} className="w-4 h-4 bg-stone-200/60 rounded-sm" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
