import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  NewspaperIcon,
  CalendarDaysIcon,
  PhotoIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getNews, getEvents, getGallery } from '../../services/content.service';
import {
  createNews,
  updateNews,
  deleteNews,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadGallery,
  deleteGallery,
} from '../../services/admin.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import Loader from '../../components/common/Loader';

const newsTypes = [
  { value: 'news', label: 'News' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'press_release', label: 'Press Release' },
  { value: 'research_highlight', label: 'Research Highlight' },
];

export default function AdminNewsPage() {
  const [activeTab, setActiveTab] = useState('news');

  // Modals
  const [newsModal, setNewsModal] = useState(false);
  const [editingNewsId, setEditingNewsId] = useState(null);

  const [eventModal, setEventModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);

  const [galleryModal, setGalleryModal] = useState(false);

  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Data
  const { data: newsData, loading: loadingNews, refetch: refetchNews } = useFetch(() =>
    getNews({ limit: 100 })
  );
  const newsList = newsData?.data || [];

  const { data: eventsData, loading: loadingEvents, refetch: refetchEvents } = useFetch(getEvents);
  const events = eventsData?.data || [];

  const { data: galleryData, loading: loadingGallery, refetch: refetchGallery } = useFetch(getGallery);
  const gallery = galleryData?.data || [];

  // News form state
  const [newsForm, setNewsForm] = useState({
    title: '',
    type: 'news',
    content: '',
    isFeatured: false,
    coverImageUrl: '',
  });

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    eventDate: '',
    location: '',
    mode: 'virtual',
    registrationUrl: '',
    coverImageUrl: '',
  });

  // Gallery form state
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    mediaType: 'image',
    mediaUrl: '',
  });
  const [galleryFile, setGalleryFile] = useState(null);

  // News Handlers
  const handleOpenCreateNews = () => {
    setEditingNewsId(null);
    setNewsForm({
      title: '',
      type: 'news',
      content: '',
      isFeatured: false,
      coverImageUrl: '',
    });
    setFormError(null);
    setNewsModal(true);
  };

  const handleOpenEditNews = (item) => {
    setEditingNewsId(item.id);
    setNewsForm({
      title: item.title,
      type: item.type || 'news',
      content: item.content || '',
      isFeatured: item.is_featured || false,
      coverImageUrl: item.cover_image_url || '',
    });
    setFormError(null);
    setNewsModal(true);
  };

  const handleSaveNews = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingNewsId) {
        await updateNews(editingNewsId, newsForm);
      } else {
        await createNews(newsForm);
      }
      setNewsModal(false);
      refetchNews();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save news.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNews = async (id, title) => {
    if (!window.confirm(`Delete news article "${title}"?`)) return;
    try {
      await deleteNews(id);
      refetchNews();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete news.');
    }
  };

  // Event Handlers
  const handleOpenCreateEvent = () => {
    setEditingEventId(null);
    setEventForm({
      title: '',
      description: '',
      eventDate: '',
      location: '',
      mode: 'virtual',
      registrationUrl: '',
      coverImageUrl: '',
    });
    setFormError(null);
    setEventModal(true);
  };

  const handleOpenEditEvent = (ev) => {
    setEditingEventId(ev.id);
    setEventForm({
      title: ev.title,
      description: ev.description || '',
      eventDate: ev.event_date ? ev.event_date.split('T')[0] : '',
      location: ev.location || '',
      mode: ev.mode || 'virtual',
      registrationUrl: ev.registration_url || '',
      coverImageUrl: ev.cover_image_url || '',
    });
    setFormError(null);
    setEventModal(true);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingEventId) {
        await updateEvent(editingEventId, eventForm);
      } else {
        await createEvent(eventForm);
      }
      setEventModal(false);
      refetchEvents();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to save event.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEvent = async (id, title) => {
    if (!window.confirm(`Delete event "${title}"?`)) return;
    try {
      await deleteEvent(id);
      refetchEvents();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete event.');
    }
  };

  // Gallery Handlers
  const handleSaveGallery = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const formData = new FormData();
      formData.append('title', galleryForm.title);
      formData.append('mediaType', galleryForm.mediaType);
      if (galleryFile) {
        formData.append('media', galleryFile);
      } else if (galleryForm.mediaUrl) {
        formData.append('mediaUrl', galleryForm.mediaUrl);
      } else {
        throw new Error('Please select a file or provide a media URL.');
      }
      await uploadGallery(formData);
      setGalleryModal(false);
      setGalleryFile(null);
      setGalleryForm({ title: '', mediaType: 'image', mediaUrl: '' });
      refetchGallery();
    } catch (err) {
      setFormError(err.response?.data?.error || err.message || 'Failed to upload media.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGallery = async (id, title) => {
    if (!window.confirm(`Delete media item "${title}"?`)) return;
    try {
      await deleteGallery(id);
      refetchGallery();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete media.');
    }
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Manage News & Media – ASGARD-IRI Admin</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-navy">News, Events & Media Gallery</h1>
          <p className="text-xs text-grey-500 mt-1">
            Publish press announcements, schedule academic seminars, and upload symposium photography
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'news' && (
            <Button variant="primary" size="sm" onClick={handleOpenCreateNews}>
              + New Article
            </Button>
          )}
          {activeTab === 'events' && (
            <Button variant="primary" size="sm" onClick={handleOpenCreateEvent}>
              + New Event
            </Button>
          )}
          {activeTab === 'gallery' && (
            <Button variant="primary" size="sm" onClick={() => setGalleryModal(true)}>
              + Upload Media
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-grey-200">
        <button
          onClick={() => setActiveTab('news')}
          className={`py-3 px-6 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'news' ? 'border-gold text-navy' : 'border-transparent text-grey-500'
          }`}
        >
          News Dispatches ({newsList.length})
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`py-3 px-6 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'events' ? 'border-gold text-navy' : 'border-transparent text-grey-500'
          }`}
        >
          Calendar Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`py-3 px-6 text-xs font-semibold border-b-2 transition-colors ${
            activeTab === 'gallery' ? 'border-gold text-navy' : 'border-transparent text-grey-500'
          }`}
        >
          Media Gallery ({gallery.length})
        </button>
      </div>

      {/* Tab: News */}
      {activeTab === 'news' && (
        <Card className="overflow-hidden">
          {loadingNews ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : newsList.length === 0 ? (
            <div className="p-12 text-center text-xs text-grey-400">
              No news dispatches published yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Article Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Published Date</th>
                    <th className="py-3 px-4">Featured</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  {newsList.map((item) => (
                    <tr key={item.id} className="hover:bg-grey-50/50">
                      <td className="py-3 px-4 font-semibold text-navy max-w-sm truncate">
                        {item.title}
                      </td>
                      <td className="py-3 px-4">
                        <Badge label={item.type?.replace('_', ' ').toUpperCase()} variant="gold" />
                      </td>
                      <td className="py-3 px-4 text-grey-500">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        {item.is_featured ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            Yes
                          </span>
                        ) : (
                          <span className="text-grey-400">No</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditNews(item)}
                          className="text-navy hover:text-gold p-1"
                          title="Edit News"
                        >
                          <PencilSquareIcon className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(item.id, item.title)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete News"
                        >
                          <TrashIcon className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab: Events */}
      {activeTab === 'events' && (
        <Card className="overflow-hidden">
          {loadingEvents ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : events.length === 0 ? (
            <div className="p-12 text-center text-xs text-grey-400">
              No calendar events scheduled yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-grey-50 text-grey-600 uppercase border-b border-grey-200 font-semibold text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Event Title</th>
                    <th className="py-3 px-4">Scheduled Date</th>
                    <th className="py-3 px-4">Location / Mode</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-100">
                  {events.map((ev) => (
                    <tr key={ev.id} className="hover:bg-grey-50/50">
                      <td className="py-3 px-4 font-semibold text-navy max-w-sm truncate">
                        {ev.title}
                      </td>
                      <td className="py-3 px-4 text-grey-600">
                        {ev.event_date ? new Date(ev.event_date).toLocaleDateString() : 'TBA'}
                      </td>
                      <td className="py-3 px-4 text-grey-600 capitalize">
                        {ev.mode} · {ev.location || 'Online'}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditEvent(ev)}
                          className="text-navy hover:text-gold p-1"
                          title="Edit Event"
                        >
                          <PencilSquareIcon className="w-4 h-4 inline" />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(ev.id, ev.title)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Delete Event"
                        >
                          <TrashIcon className="w-4 h-4 inline" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Tab: Gallery */}
      {activeTab === 'gallery' && (
        <Card className="p-6">
          {loadingGallery ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : gallery.length === 0 ? (
            <div className="p-12 text-center text-xs text-grey-400">
              No gallery media uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.map((g) => (
                <div key={g.id} className="relative group rounded-lg overflow-hidden border border-grey-200">
                  <img src={g.media_url} alt={g.title} className="w-full h-32 object-cover" />
                  <div className="p-2 text-[11px] font-semibold text-navy truncate">
                    {g.title}
                  </div>
                  <button
                    onClick={() => handleDeleteGallery(g.id, g.title)}
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete item"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* News Modal */}
      <Modal
        isOpen={newsModal}
        onClose={() => setNewsModal(false)}
        title={editingNewsId ? 'Edit Article' : 'Publish News Dispatch'}
      >
        <form onSubmit={handleSaveNews} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {formError}
            </div>
          )}

          <Input
            label="Article Title"
            value={newsForm.title}
            onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
            placeholder="Official title..."
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Dispatch Type"
              value={newsForm.type}
              onChange={(e) => setNewsForm({ ...newsForm, type: e.target.value })}
              required
            >
              {newsTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </Select>

            <Input
              label="Cover Image URL"
              value={newsForm.coverImageUrl}
              onChange={(e) => setNewsForm({ ...newsForm, coverImageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <Textarea
            label="Article Content"
            value={newsForm.content}
            onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
            placeholder="Write full story or announcement body..."
            rows={5}
            required
          />

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isFeatured"
              checked={newsForm.isFeatured}
              onChange={(e) => setNewsForm({ ...newsForm, isFeatured: e.target.checked })}
              className="rounded text-navy focus:ring-navy"
            />
            <label htmlFor="isFeatured" className="text-grey-700 font-medium">
              Featured on homepage
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
            <Button type="button" variant="outline" onClick={() => setNewsModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingNewsId ? 'Update Article' : 'Publish Article'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Event Modal */}
      <Modal
        isOpen={eventModal}
        onClose={() => setEventModal(false)}
        title={editingEventId ? 'Edit Event' : 'Schedule Academic Event'}
      >
        <form onSubmit={handleSaveEvent} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {formError}
            </div>
          )}

          <Input
            label="Event Title"
            value={eventForm.title}
            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
            placeholder="e.g. Distinguished Lecture in Quantum Materials"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Event Date"
              type="date"
              value={eventForm.eventDate}
              onChange={(e) => setEventForm({ ...eventForm, eventDate: e.target.value })}
              required
            />
            <Select
              label="Event Mode"
              value={eventForm.mode}
              onChange={(e) => setEventForm({ ...eventForm, mode: e.target.value })}
            >
              <option value="virtual">Virtual / Zoom</option>
              <option value="in_person">In-Person Campus</option>
              <option value="hybrid">Hybrid</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Location / Campus"
              value={eventForm.location}
              onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
              placeholder="e.g. Auditorium Hall A / Online"
            />
            <Input
              label="Registration URL"
              value={eventForm.registrationUrl}
              onChange={(e) => setEventForm({ ...eventForm, registrationUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <Textarea
            label="Event Description"
            value={eventForm.description}
            onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
            placeholder="Distinguished speakers, agenda, and participation details..."
            rows={3}
            required
          />

          <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
            <Button type="button" variant="outline" onClick={() => setEventModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              {editingEventId ? 'Update Event' : 'Schedule Event'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Gallery Modal */}
      <Modal
        isOpen={galleryModal}
        onClose={() => setGalleryModal(false)}
        title="Upload Media to Foundation Gallery"
      >
        <form onSubmit={handleSaveGallery} className="space-y-4 text-xs">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded">
              {formError}
            </div>
          )}

          <Input
            label="Media Title"
            value={galleryForm.title}
            onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
            placeholder="e.g. 2025 International Colloquium Closing Ceremony"
            required
          />

          <Select
            label="Media Type"
            value={galleryForm.mediaType}
            onChange={(e) => setGalleryForm({ ...galleryForm, mediaType: e.target.value })}
          >
            <option value="image">Image / Photograph</option>
            <option value="video">Video Recording</option>
          </Select>

          <Input
            label="Image / Media URL"
            value={galleryForm.mediaUrl}
            onChange={(e) => setGalleryForm({ ...galleryForm, mediaUrl: e.target.value })}
            placeholder="https://..."
          />

          <div className="border border-dashed border-grey-300 rounded-lg p-4 text-center">
            <span className="text-grey-500 block mb-2">Or select a local file to upload:</span>
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setGalleryFile(e.target.files[0])}
              className="text-xs text-grey-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-grey-100">
            <Button type="button" variant="outline" onClick={() => setGalleryModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={saving}>
              Upload Media
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
