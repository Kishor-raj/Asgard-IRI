import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';
import {
  getResearcherById,
  updateMyProfile,
  addMyPublication,
  deleteMyPublication,
  getResearchOutputs,
  linkOutputToProfile,
  unlinkOutputFromProfile,
  getMyLinkedOutputs,
} from '../../services/research.service';

export default function ResearcherTab({ userId }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  // Form fields
  const [designation, setDesignation] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [biography, setBiography] = useState('');
  const [researchInterests, setResearchInterests] = useState('');
  const [orcidUrl, setOrcidUrl] = useState('');
  const [googleScholarUrl, setGoogleScholarUrl] = useState('');
  const [scopusUrl, setScopusUrl] = useState('');
  const [cvUrl, setCvUrl] = useState('');

  // Publications
  const [publications, setPublications] = useState([]);
  const [pubTitle, setPubTitle] = useState('');
  const [pubJournal, setPubJournal] = useState('');
  const [pubYear, setPubYear] = useState('');
  const [pubDoi, setPubDoi] = useState('');
  const [addingPub, setAddingPub] = useState(false);

  // Phase 3 Linked Repository Outputs
  const [linkedOutputs, setLinkedOutputs] = useState([]);
  const [repoSearch, setRepoSearch] = useState('');
  const [repoResults, setRepoResults] = useState([]);
  const [searchingRepo, setSearchingRepo] = useState(false);

  const fetchLinkedOutputs = async () => {
    try {
      const res = await getMyLinkedOutputs();
      setLinkedOutputs(res.data || []);
    } catch {
      // Ignored
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getResearcherById(userId);
      const p = res.data;
      setProfile(p);
      setDesignation(p.designation || '');
      setAffiliation(p.affiliation || '');
      setBiography(p.biography || '');
      setResearchInterests(p.research_interests || '');
      setOrcidUrl(p.orcid_url || '');
      setGoogleScholarUrl(p.google_scholar_url || '');
      setScopusUrl(p.scopus_url || '');
      setCvUrl(p.cv_url || '');
      setPublications(p.publications || []);
      await fetchLinkedOutputs();
    } catch {
      // Profile may not exist yet
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) fetchProfile();
  }, [userId]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateMyProfile({
        designation,
        affiliation,
        biography,
        researchInterests,
        orcidUrl,
        googleScholarUrl,
        scopusUrl,
        cvUrl,
      });
      toast.success('Researcher profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPublication = async (e) => {
    e.preventDefault();
    if (!pubTitle.trim()) {
      toast.error('Publication title is required.');
      return;
    }

    try {
      setAddingPub(true);
      const res = await addMyPublication({
        title: pubTitle,
        journal: pubJournal,
        year: pubYear,
        doiUrl: pubDoi,
      });
      toast.success('Publication added!');
      setPublications([res.data, ...publications]);
      setPubTitle('');
      setPubJournal('');
      setPubYear('');
      setPubDoi('');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add publication.');
    } finally {
      setAddingPub(false);
    }
  };

  const handleDeletePublication = async (pubId) => {
    try {
      await deleteMyPublication(pubId);
      toast.success('Publication removed.');
      setPublications(publications.filter((p) => p.id !== pubId));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete publication.');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="space-y-10">
      {/* Profile Form */}
      <div className="bg-white rounded-xl border border-grey-200 p-8 shadow-card">
        <h3 className="font-display font-semibold text-navy text-xl mb-6">
          Edit Researcher Profile
        </h3>
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Academic Designation / Title"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. Associate Professor, Senior Scientist"
            />
            <Input
              label="Primary Affiliation / University"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              placeholder="e.g. Department of Computer Science, MIT"
            />
          </div>

          <Textarea
            label="Research Interests (Comma-separated or narrative)"
            value={researchInterests}
            onChange={(e) => setResearchInterests(e.target.value)}
            placeholder="e.g. Machine Learning, NLP, Quantum Computing, Healthcare Informatics"
            rows={2}
          />

          <Textarea
            label="Biography"
            value={biography}
            onChange={(e) => setBiography(e.target.value)}
            placeholder="Brief academic biography, achievements, and research vision..."
            rows={5}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="ORCID Profile URL"
              value={orcidUrl}
              onChange={(e) => setOrcidUrl(e.target.value)}
              placeholder="https://orcid.org/0000-..."
            />
            <Input
              label="Google Scholar URL"
              value={googleScholarUrl}
              onChange={(e) => setGoogleScholarUrl(e.target.value)}
              placeholder="https://scholar.google.com/..."
            />
            <Input
              label="Scopus Author ID URL"
              value={scopusUrl}
              onChange={(e) => setScopusUrl(e.target.value)}
              placeholder="https://www.scopus.com/..."
            />
          </div>

          <div className="flex justify-end pt-4 border-t border-grey-100">
            <Button type="submit" variant="primary" loading={saving}>
              Save Profile Details
            </Button>
          </div>
        </form>
      </div>

      {/* Publications Management */}
      <div className="bg-white rounded-xl border border-grey-200 p-8 shadow-card space-y-6">
        <div>
          <h3 className="font-display font-semibold text-navy text-xl">
            My Publications & Research Papers
          </h3>
          <p className="text-xs text-grey-600 mt-1">
            Add your peer-reviewed papers to display them on your public researcher directory profile.
          </p>
        </div>

        {/* Add Publication Form */}
        <form onSubmit={handleAddPublication} className="bg-grey-50 p-6 rounded-lg border border-grey-200 space-y-4">
          <h4 className="text-sm font-semibold text-navy">Add New Publication</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Article / Paper Title"
                value={pubTitle}
                onChange={(e) => setPubTitle(e.target.value)}
                placeholder="Title of published paper"
                required
              />
            </div>
            <Input
              label="Journal / Conference Name"
              value={pubJournal}
              onChange={(e) => setPubJournal(e.target.value)}
              placeholder="e.g. IEEE Transactions on Knowledge..."
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Year"
                type="number"
                value={pubYear}
                onChange={(e) => setPubYear(e.target.value)}
                placeholder="2025"
              />
              <Input
                label="DOI or URL"
                value={pubDoi}
                onChange={(e) => setPubDoi(e.target.value)}
                placeholder="https://doi.org/..."
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" variant="secondary" size="sm" loading={addingPub}>
              <PlusIcon className="w-4 h-4 mr-1 inline" /> Add Publication
            </Button>
          </div>
        </form>

        {/* Publications List */}
        <div className="space-y-3">
          {publications.length === 0 ? (
            <p className="text-sm text-grey-400 text-center py-6">
              No publications listed yet. Add your first paper above.
            </p>
          ) : (
            publications.map((pub) => (
              <div
                key={pub.id}
                className="flex items-center justify-between p-4 border border-grey-200 rounded-lg bg-white hover:bg-grey-50 transition-colors"
              >
                <div>
                  <h5 className="font-semibold text-navy text-sm">{pub.title}</h5>
                  <p className="text-xs text-grey-600 mt-0.5">
                    {pub.journal || 'Journal'} {pub.year && `(${pub.year})`}
                    {pub.doi_url && (
                      <a
                        href={pub.doi_url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-info hover:underline"
                      >
                        DOI
                      </a>
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeletePublication(pub.id)}
                  className="p-1.5 text-grey-400 hover:text-error transition-colors rounded"
                  title="Remove publication"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Phase 3: Linked Repository Outputs Section */}
      <div className="bg-white rounded-xl border border-grey-200 p-6 shadow-card space-y-6">
        <div>
          <h4 className="font-display font-semibold text-navy text-base">
            Linked Repository Outputs
          </h4>
          <p className="text-xs text-grey-500 mt-0.5">
            Link manuscripts, proceedings, and monographs from the ASGARD Open Repository to display on your public profile.
          </p>
        </div>

        {/* Search & Link Repository Output Form */}
        <div className="bg-grey-50 p-4 rounded-lg border border-grey-200 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={repoSearch}
              onChange={(e) => setRepoSearch(e.target.value)}
              placeholder="Search repository outputs by title or topic..."
              className="flex-1 border border-grey-200 rounded px-3 py-1.5 text-xs bg-white focus:outline-none focus:border-navy"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              loading={searchingRepo}
              onClick={async () => {
                if (!repoSearch.trim()) return;
                setSearchingRepo(true);
                try {
                  const res = await getResearchOutputs({ q: repoSearch.trim(), limit: 5 });
                  setRepoResults(res.data || []);
                } catch {
                  toast.error('Search failed.');
                } finally {
                  setSearchingRepo(false);
                }
              }}
            >
              Search Repository
            </Button>
          </div>

          {repoResults.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-grey-200">
              <span className="text-[11px] font-semibold text-grey-600 block">Repository Matches:</span>
              {repoResults.map((out) => {
                const isAlreadyLinked = linkedOutputs.some((lo) => lo.id === out.id);
                return (
                  <div
                    key={out.id}
                    className="flex justify-between items-center p-2.5 bg-white border border-grey-200 rounded text-xs gap-3"
                  >
                    <div className="max-w-md truncate">
                      <span className="font-semibold text-navy block truncate">{out.title}</span>
                      <span className="text-[11px] text-grey-500">{out.authors_text} ({out.year})</span>
                    </div>
                    {isAlreadyLinked ? (
                      <span className="text-[11px] text-success font-semibold shrink-0">
                        Already Linked
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await linkOutputToProfile(out.id);
                            toast.success('Output linked to your profile!');
                            await fetchLinkedOutputs();
                          } catch (err) {
                            toast.error(err.response?.data?.error || 'Failed to link output.');
                          }
                        }}
                        className="bg-navy text-white text-[11px] font-semibold px-2.5 py-1 rounded hover:bg-gold hover:text-navy shrink-0"
                      >
                        + Link to Profile
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Currently Linked Outputs List */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-grey-700 block">
            Currently Linked Outputs ({linkedOutputs.length})
          </span>
          {linkedOutputs.length === 0 ? (
            <p className="text-xs text-grey-400 text-center py-4 bg-grey-50 rounded border border-dashed border-grey-200">
              No repository outputs currently linked to your profile. Use the search box above to attach your published works.
            </p>
          ) : (
            linkedOutputs.map((lo) => (
              <div
                key={lo.id}
                className="flex items-center justify-between p-3.5 border border-grey-200 rounded-lg bg-white hover:bg-grey-50 transition-colors"
              >
                <div>
                  <h5 className="font-semibold text-navy text-xs">{lo.title}</h5>
                  <p className="text-[11px] text-grey-500 mt-0.5">
                    {lo.type?.replace('_', ' ').toUpperCase()} · {lo.year || 'N/A'} · {lo.authors_text}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!window.confirm('Unlink this output from your profile?')) return;
                    try {
                      await unlinkOutputFromProfile(lo.id);
                      toast.success('Output unlinked.');
                      await fetchLinkedOutputs();
                    } catch (err) {
                      toast.error(err.response?.data?.error || 'Failed to unlink output.');
                    }
                  }}
                  className="p-1.5 text-grey-400 hover:text-error transition-colors rounded ml-2"
                  title="Unlink output"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
