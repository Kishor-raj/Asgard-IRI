import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getGallery } from '../../services/content.service';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import SkeletonCard from '../../components/common/SkeletonCard';
import { thumb } from '../../utils/cloudinaryTransform';

export default function GalleryPage() {
  const { data, loading } = useFetch(getGallery);
  const items = data?.data || [];
  const [activeMedia, setActiveMedia] = useState(null);

  return (
    <div>
      <Helmet>
        <title>Media & Academic Gallery – ASGARD-IRI</title>
        <meta
          name="description"
          content="Photographic and audiovisual gallery of international conferences, doctoral workshops, and campus ceremonies."
        />
      </Helmet>

      {/* Header */}
      <div className="bg-navy py-16 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
        <div className="max-w-content mx-auto px-6 text-center text-white relative z-10">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">
            Audiovisual Archive
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Foundation Media Gallery
          </h1>
          <p className="text-white/70 text-lg max-w-narrow mx-auto">
            Moments from global research symposia, keynote addresses, academic delegacy signings, and laboratory milestones.
          </p>
        </div>
      </div>

      <div className="max-w-content mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-grey-400 text-sm">
            Gallery media will be uploaded following upcoming symposium proceedings.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card
                key={item.id}
                className="overflow-hidden group cursor-pointer hover:border-gold transition-colors"
                onClick={() => setActiveMedia(item)}
              >
                <div className="h-48 w-full bg-grey-100 relative overflow-hidden">
                  {item.media_type === 'video' ? (
                    <div className="w-full h-full flex items-center justify-center bg-navy/80 text-gold">
                      <VideoCameraIcon className="w-12 h-12" />
                    </div>
                  ) : (
                    <img
                      src={thumb(item.media_url, 400)}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-0.5 rounded text-[10px] text-white uppercase font-semibold">
                    {item.media_type || 'photo'}
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-navy text-xs line-clamp-1">{item.title}</h4>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {activeMedia && (
        <Modal
          isOpen={!!activeMedia}
          onClose={() => setActiveMedia(null)}
          title={activeMedia.title}
        >
          <div className="space-y-4">
            <div className="w-full max-h-[60vh] flex items-center justify-center bg-black/5 rounded-lg overflow-hidden">
              {activeMedia.media_type === 'video' ? (
                <video src={activeMedia.media_url} controls className="max-h-[55vh] w-full" />
              ) : (
                <img
                  src={activeMedia.media_url}
                  alt={activeMedia.title}
                  className="max-h-[55vh] object-contain mx-auto"
                />
              )}
            </div>
            <p className="text-xs text-grey-600">{activeMedia.title}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
