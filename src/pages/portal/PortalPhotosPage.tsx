import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Badge, Modal } from "../../components/ui";
import { usePortalAuth } from "../../components/layout/PortalLayout";

type PhotoCategory = "All" | "Before" | "During" | "After" | "Drone" | "Detail";

interface Photo {
  id: number;
  name: string;
  date: string;
  category: Exclude<PhotoCategory, "All">;
  description: string;
  color: string;
}

const photos: Photo[] = [
  { id: 1, name: "Initial roof damage", date: "Mar 10, 2026", category: "Before", description: "Overview of hail damage on south-facing slope. Multiple impact marks visible on aged shingles.", color: "#ef4444" },
  { id: 2, name: "South slope hail impact", date: "Mar 10, 2026", category: "Before", description: "Close-up of hail impacts showing granule loss and cracking on 3-tab shingles.", color: "#dc2626" },
  { id: 3, name: "Gutter dents", date: "Mar 10, 2026", category: "Before", description: "Aluminum gutters showing multiple dent marks from hailstones. Downspout separation at corner.", color: "#b91c1c" },
  { id: 4, name: "North slope wear", date: "Mar 10, 2026", category: "Before", description: "North slope showing aging and wind damage. Missing shingles near ridge cap.", color: "#f87171" },
  { id: 5, name: "Aerial overview before", date: "Mar 11, 2026", category: "Drone", description: "DJI Mavic 3 capture showing full roof overview before work begins. Clear damage patterns visible.", color: "#6366f1" },
  { id: 6, name: "Drone damage map", date: "Mar 11, 2026", category: "Drone", description: "Annotated drone capture mapping all hail impact zones across the roof system.", color: "#818cf8" },
  { id: 7, name: "Progress flyover day 3", date: "Mar 30, 2026", category: "Drone", description: "Aerial progress shot showing new shingles installed on south and east slopes.", color: "#a78bfa" },
  { id: 8, name: "Tear-off day 1", date: "Mar 28, 2026", category: "During", description: "Crew removing old shingles from south slope. Dump trailer staged in driveway.", color: "#f59e0b" },
  { id: 9, name: "Underlayment installed", date: "Mar 28, 2026", category: "During", description: "GAF FeltBuster synthetic underlayment installed over entire south slope.", color: "#fbbf24" },
  { id: 10, name: "New shingles south slope", date: "Mar 29, 2026", category: "During", description: "GAF Timberline HDZ in Charcoal being installed on south slope. Starter strip visible at eave.", color: "#d97706" },
  { id: 11, name: "Ridge vent installation", date: "Mar 30, 2026", category: "During", description: "Cobra Snow Country Advanced ridge vent being installed along main ridge.", color: "#eab308" },
  { id: 12, name: "Ice & water shield", date: "Mar 28, 2026", category: "Detail", description: "GAF WeatherWatch ice and water shield applied at eaves, valleys, and penetrations.", color: "#14b8a6" },
  { id: 13, name: "Pipe boot flashing", date: "Mar 29, 2026", category: "Detail", description: "New Oatey aluminum pipe boot flashing installed around plumbing vent.", color: "#0d9488" },
  { id: 14, name: "Completed south slope", date: "Mar 30, 2026", category: "After", description: "Finished south slope with new GAF Timberline HDZ Charcoal shingles. Clean lines at drip edge.", color: "#22c55e" },
  { id: 15, name: "New gutters installed", date: "Mar 30, 2026", category: "After", description: "New 5-inch seamless aluminum gutters in white with leaf guards installed.", color: "#16a34a" },
  { id: 16, name: "Valley detail complete", date: "Mar 30, 2026", category: "Detail", description: "Closed valley with dimensional shingles properly overlapping. IWS visible at base.", color: "#2dd4bf" },
];

const categoryColors: Record<string, string> = {
  Before: "#ef4444",
  During: "#f59e0b",
  After: "#22c55e",
  Drone: "#6366f1",
  Detail: "#14b8a6",
};

export default function PortalPhotosPage() {
  const navigate = useNavigate();
  const { isLoggedIn } = usePortalAuth();
  const [filter, setFilter] = useState<PhotoCategory>("All");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (!isLoggedIn) {
    navigate("/portal", { replace: true });
    return null;
  }

  const filtered = filter === "All" ? photos : photos.filter((p) => p.category === filter);

  const goToPhoto = (direction: "prev" | "next") => {
    if (!selectedPhoto) return;
    const idx = filtered.findIndex((p) => p.id === selectedPhoto.id);
    if (direction === "prev" && idx > 0) setSelectedPhoto(filtered[idx - 1]);
    if (direction === "next" && idx < filtered.length - 1) setSelectedPhoto(filtered[idx + 1]);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Progress Photos</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          {photos.length} photos documenting your project &bull; 1847 Maple Grove Dr
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {(["All", "Before", "During", "After", "Drone", "Detail"] as PhotoCategory[]).map((cat) => {
          const count = cat === "All" ? photos.length : photos.filter((p) => p.category === cat).length;
          const isActive = filter === cat;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition border ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600"
              }`}
            >
              {cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtered.map((photo) => (
          <div
            key={photo.id}
            onClick={() => setSelectedPhoto(photo)}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg hover:border-blue-300 transition group"
          >
            {/* Color placeholder thumbnail */}
            <div
              style={{ backgroundColor: photo.color + "20", borderBottom: `3px solid ${photo.color}` }}
              className="aspect-[4/3] flex items-center justify-center relative"
            >
              <Camera className="w-8 h-8" style={{ color: photo.color + "60" }} />
              <div className="absolute top-2 left-2">
                <Badge color={categoryColors[photo.category]}>{photo.category}</Badge>
              </div>
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold text-gray-800 truncate">{photo.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{photo.date}</p>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-sm">
          No photos in this category yet.
        </div>
      )}

      {/* Photo Detail Modal */}
      <Modal
        open={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
        title={selectedPhoto?.name || "Photo Detail"}
        wide
      >
        {selectedPhoto && (
          <div className="space-y-4">
            {/* Large placeholder */}
            <div
              style={{ backgroundColor: selectedPhoto.color + "15", border: `2px solid ${selectedPhoto.color}30` }}
              className="aspect-video rounded-xl flex items-center justify-center relative"
            >
              <Camera className="w-16 h-16" style={{ color: selectedPhoto.color + "40" }} />
              <div className="absolute top-3 left-3">
                <Badge color={categoryColors[selectedPhoto.category]}>{selectedPhoto.category}</Badge>
              </div>
              {/* Nav arrows */}
              {filtered.findIndex((p) => p.id === selectedPhoto.id) > 0 && (
                <button
                  onClick={() => goToPhoto("prev")}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}
              {filtered.findIndex((p) => p.id === selectedPhoto.id) < filtered.length - 1 && (
                <button
                  onClick={() => goToPhoto("next")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center shadow hover:bg-white transition"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-bold text-gray-900">{selectedPhoto.name}</h3>
                <Badge color={categoryColors[selectedPhoto.category]}>{selectedPhoto.category}</Badge>
              </div>
              <p className="text-xs text-gray-400 mb-2">{selectedPhoto.date}</p>
              <p className="text-sm text-gray-700">{selectedPhoto.description}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
