export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mb-4"></div>
      <p className="text-slate-500 font-medium animate-pulse">লোড হচ্ছে...</p>
    </div>
  );
}
