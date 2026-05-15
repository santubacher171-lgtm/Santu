/**
 * AdSpace Component
 * Placeholder for Adsterra Banner ads and Pop-unders.
 */
export function AdSpace({ label }: { label: string }) {
  return (
    <div className="w-full bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center my-6 min-h-[150px]">
      <span className="text-gray-400 font-mono text-xs uppercase tracking-widest">{label}</span>
      <div className="mt-2 text-gray-300 italic text-[10px]">Adsterra Integration Space</div>
      {/* Placeholder for actual Adsterra script integration */}
      {/* <script type="text/javascript" src="..."></script> */}
    </div>
  );
}
