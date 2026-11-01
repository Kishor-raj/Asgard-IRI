import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  CalendarDaysIcon,
  MapPinIcon,
  ArrowTopRightOnSquareIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getEvents } from '../../services/content.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import SkeletonCard from '../../components/common/SkeletonCard';

export default function EventsPage() {
  const [filter, setFilter] = useState('upcoming');
  const { data, loading, error } = useFetch(getEvents);
  const events = data?.data || [];

  const now = new Date();
  const filteredEvents = events.filter((ev) => {
    if (!ev.event_date) return true;
    const evDate = new Date(ev.event_date);
    return filter === 'upcoming' ? evDate >= now : evDate < now;
  });

  return (
    <div>
      <Helmet>
        <title>Upcoming Events & Symposia – ASGARD-IRI</title>
        <meta
          name="description"
          content="Explore international seminars, academic colloquia, guest lectures, and workshops organized by ASGARD-IRI."
        />
      </Helmet>

      {/* Header */}
      <div className="bg-navy py-16 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
        <div className="max-w-content mx-auto px-6 text-center text-white relative z-10">
          <p className="text-gold text-xs font-semibold tracking-widest uppercase mb-3">
            Academic Calendar
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-4">
            Events, Colloquia & Webinars
          </h1>
          <p className="text-white/70 text-lg max-w-narrow mx-auto">
            Participate in interactive panel discussions, distinguished keynote lectures, and research seminars hosted across our global partner campuses.
          </p>
        </div>
      </div>

      <div className="max-w-content mx-auto px-6 py-12">
        {/* Toggle */}
        <div className="flex gap-2 border-b border-grey-200 pb-4 mb-8">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 text-xs rounded-lg font-medium transition-colors ${
              filter === 'upcoming'
                ? 'bg-navy text-white font-semibold'
                : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
            }`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 text-xs rounded-lg font-medium transition-colors ${
              filter === 'past'
                ? 'bg-navy text-white font-semibold'
                : 'bg-grey-100 text-grey-700 hover:bg-grey-200'
            }`}
          >
            Past Events Archive
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-16 text-grey-400 text-sm">
            No events scheduled under this view. Check back soon for new announcements.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => (
              <Card key={ev.id} className="p-6 flex flex-col justify-between hover:border-gold transition-colors">
                <div>
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="text-[11px] font-semibold text-navy bg-navy/5 px-2.5 py-0.5 rounded-full capitalize">
                      {ev.mode || 'Virtual'}
                    </span>
                    <span className="text-xs text-grey-500 font-medium">
                      {ev.event_date ? new Date(ev.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Date TBA'}
                    </span>
                  </div>

                  {ev.cover_image_url && (
                    <div className="w-full h-36 rounded-lg overflow-hidden mb-4 bg-grey-100">
                      <img src={ev.cover_image_url} alt={ev.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <h3 className="font-display font-semibold text-lg text-navy mb-2 line-clamp-2">
                    {ev.title}
                  </h3>

                  <p className="text-xs text-grey-600 line-clamp-3 mb-6 leading-relaxed">
                    {ev.description}
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-grey-100 text-xs">
                  <div className="flex items-center gap-2 text-grey-600">
                    <MapPinIcon className="w-4 h-4 text-navy shrink-0" />
                    <span className="line-clamp-1">{ev.location || 'Online via Zoom'}</span>
                  </div>

                  <div className="pt-2 flex justify-end">
                    {ev.registration_url ? (
                      <a
                        href={ev.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gold hover:text-navy transition-colors"
                      >
                        Register to Attend <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-grey-400">Open Access Event</span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
