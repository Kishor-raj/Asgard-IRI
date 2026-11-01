import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  AcademicCapIcon,
  EnvelopeIcon,
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getResearcherById, sendCollaborationRequest } from '../../services/research.service';
import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { thumb } from '../../utils/cloudinaryTransform';

export default function ResearcherProfilePage() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useFetch(() => getResearcherById(id), [id]);
  const researcher = data?.data;

  // Collaboration Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [institution, setInstitution] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [sendError, setSendError] = useState(null);

  const handleSendCollaboration = async (e) => {
    e.preventDefault();
    setSending(true);
    setSendError(null);
    try {
      await sendCollaborationRequest(id, {
        name: senderName,
        email: senderEmail,
        institution,
        message,
      });
      setSentSuccess(true);
      setTimeout(() => {
        setModalOpen(false);
        setSentSuccess(false);
        setSenderName('');
        setSenderEmail('');
        setInstitution('');
        setMessage('');
      }, 2500);
    } catch (err) {
      setSendError(err.response?.data?.error || 'Failed to send collaboration request.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (error || !researcher) {
    return (
      <div className="max-w-content mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold font-display text-navy mb-2">Researcher Profile Not Found</h2>
        <p className="text-grey-600 mb-6">The requested researcher profile could not be located.</p>
        <Link to="/research" className="text-navy font-semibold hover:underline">
          ← Back to Research Directory
        </Link>
      </div>
    );
  }

  const publications = researcher.publications || [];
  const projects = researcher.projects || [];
  const linkedOutputs = researcher.linkedOutputs || [];

  return (
    <div>
      <Helmet>
        <title>{researcher.full_name} – Researcher Profile | ASGARD-IRI</title>
        <meta
          name="description"
          content={`Scholarly profile of ${researcher.full_name}, ${researcher.designation || 'Researcher'} at ${researcher.affiliation || 'ASGARD-IRI'}.`}
        />
      </Helmet>

      {/* Profile Header */}
      <div className="bg-navy py-16 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gold" />
        <div className="max-w-content mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-white/10 border-2 border-gold/40 flex items-center justify-center text-4xl font-display font-bold text-gold overflow-hidden shrink-0 shadow-lg">
              {researcher.profile_photo ? (
                <img
                  src={thumb(researcher.profile_photo, 200)}
                  alt={researcher.full_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                researcher.full_name?.charAt(0) || 'R'
              )}
            </div>

            <div className="text-center md:text-left flex-1 text-white">
              <span className="text-xs font-semibold text-gold tracking-widest uppercase mb-1 block">
                Affiliated Researcher
              </span>
              <h1 className="font-display text-3xl sm:text-4xl font-bold">{researcher.full_name}</h1>
              <p className="text-gold-light text-base font-medium mt-1">
                {researcher.designation || 'Research Fellow'}
              </p>
              <p className="text-white/70 text-sm mt-0.5">
                {researcher.affiliation || 'ASGARD International Foundation for Research & Innovation'}
              </p>

              {/* Research Interests Tags */}
              {researcher.research_interests && (
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  {researcher.research_interests.split(',').map((item, i) => (
                    <span
                      key={i}
                      className="bg-white/10 text-white/90 text-xs px-3 py-1 rounded-full border border-white/10"
                    >
                      {item.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="shrink-0 flex flex-col gap-3">
              <Button
                variant="primary"
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 justify-center"
              >
                <EnvelopeIcon className="w-4 h-4" /> Request Collaboration
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-content mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left Column: Bio & Academic IDs */}
          <div className="space-y-8">
            <Card className="p-6">
              <h2 className="font-display font-semibold text-lg text-navy mb-4 border-b border-grey-100 pb-3">
                Academic Identifiers
              </h2>
              <div className="space-y-3 text-sm">
                {researcher.orcid_id ? (
                  <a
                    href={`https://orcid.org/${researcher.orcid_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-grey-200 hover:border-gold hover:bg-grey-50 transition-colors"
                  >
                    <span className="font-medium text-navy">ORCID</span>
                    <span className="text-xs text-grey-500 font-mono flex items-center gap-1">
                      {researcher.orcid_id} <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                    </span>
                  </a>
                ) : (
                  <div className="text-xs text-grey-400">ORCID not linked</div>
                )}

                {researcher.google_scholar_url && (
                  <a
                    href={researcher.google_scholar_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-grey-200 hover:border-gold hover:bg-grey-50 transition-colors"
                  >
                    <span className="font-medium text-navy">Google Scholar</span>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-grey-400" />
                  </a>
                )}

                {researcher.scopus_url && (
                  <a
                    href={researcher.scopus_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-lg border border-grey-200 hover:border-gold hover:bg-grey-50 transition-colors"
                  >
                    <span className="font-medium text-navy">Scopus Profile</span>
                    <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5 text-grey-400" />
                  </a>
                )}
              </div>
            </Card>

            {researcher.bio && (
              <Card className="p-6">
                <h2 className="font-display font-semibold text-lg text-navy mb-3">
                  Biographical Summary
                </h2>
                <p className="text-sm text-grey-700 leading-relaxed whitespace-pre-line">
                  {researcher.bio}
                </p>
              </Card>
            )}
          </div>

          {/* Right Column: Publications & Projects */}
          <div className="lg:col-span-2 space-y-10">
            {/* Linked Projects */}
            <section>
              <h2 className="font-display text-2xl font-bold text-navy mb-4 flex items-center gap-2">
                <BriefcaseIcon className="w-6 h-6 text-gold" /> Active Projects
              </h2>

              {projects.length === 0 ? (
                <p className="text-sm text-grey-500 bg-grey-50 p-6 rounded-xl border border-grey-200">
                  No active projects currently listed for this researcher.
                </p>
              ) : (
                <div className="space-y-4">
                  {projects.map((p) => (
                    <Card key={p.id} className="p-5 hover:border-navy transition-colors">
                      <h3 className="font-display font-semibold text-base text-navy mb-1">
                        <Link to={`/research/projects/${p.slug || p.id}`} className="hover:underline">
                          {p.title}
                        </Link>
                      </h3>
                      <p className="text-xs text-grey-600 line-clamp-2 mt-1">{p.abstract}</p>
                      <div className="mt-3 flex items-center gap-4 text-xs text-grey-400">
                        <span>Role: Principal Investigator</span>
                        <span>Status: {p.status || 'Active'}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Publications */}
            <section>
              <h2 className="font-display text-2xl font-bold text-navy mb-4 flex items-center gap-2">
                <BookOpenIcon className="w-6 h-6 text-gold" /> Peer-Reviewed Publications
              </h2>

              {publications.length === 0 ? (
                <p className="text-sm text-grey-500 bg-grey-50 p-6 rounded-xl border border-grey-200">
                  No publications recorded yet in the ASGARD repository.
                </p>
              ) : (
                <div className="space-y-4">
                  {publications.map((pub) => (
                    <Card key={pub.id} className="p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="text-[11px] font-semibold uppercase text-gold-dark tracking-wider">
                            {pub.publication_type || 'Journal Article'} • {pub.year || '2025'}
                          </span>
                          {pub.doi && (
                            <a
                              href={`https://doi.org/${pub.doi}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-navy font-mono hover:underline flex items-center gap-0.5"
                            >
                              DOI <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <h3 className="font-display font-semibold text-navy text-base mb-1">
                          {pub.title}
                        </h3>
                        <p className="text-xs text-grey-600 italic mb-2">
                          {pub.journal_name || 'ASGARD Research Proceedings'}
                        </p>
                        {pub.authors && (
                          <p className="text-xs text-grey-500">Authors: {pub.authors}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* Linked Research Repository Outputs */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-display text-2xl font-bold text-navy flex items-center gap-2">
                  <DocumentTextIcon className="w-6 h-6 text-gold" /> Research Repository Outputs
                </h2>
                <Link
                  to="/research/repository"
                  className="text-xs font-semibold text-navy hover:text-gold transition-colors"
                >
                  Browse Repository →
                </Link>
              </div>

              {linkedOutputs.length === 0 ? (
                <p className="text-sm text-grey-500 bg-grey-50 p-6 rounded-xl border border-grey-200">
                  No repository outputs directly linked to this profile.
                </p>
              ) : (
                <div className="space-y-4">
                  {linkedOutputs.map((out) => (
                    <Card key={out.id} className="p-5 flex flex-col justify-between hover:border-navy transition-colors">
                      <div>
                        <div className="flex justify-between items-start gap-2 mb-2">
                          <span className="text-[11px] font-semibold uppercase text-gold-dark tracking-wider">
                            {out.type ? out.type.replace('_', ' ') : 'Output'} • {out.year || '2025'}
                          </span>
                          <div className="flex items-center gap-3">
                            {out.doi && (
                              <a
                                href={`https://doi.org/${out.doi}`}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-navy font-mono hover:underline flex items-center gap-0.5"
                              >
                                DOI <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                              </a>
                            )}
                            {out.url && (
                              <a
                                href={out.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs text-navy font-medium hover:underline flex items-center gap-0.5"
                              >
                                View / PDF <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                        <h3 className="font-display font-semibold text-navy text-base mb-1">
                          <Link to={`/research/outputs/${out.slug || out.id}`} className="hover:underline">
                            {out.title}
                          </Link>
                        </h3>
                        {out.abstract && (
                          <p className="text-xs text-grey-600 line-clamp-2 mt-1">
                            {out.abstract}
                          </p>
                        )}
                        {out.authors_text && (
                          <p className="text-xs text-grey-500 mt-2">Authors: {out.authors_text}</p>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      {/* Collaboration Request Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Request Collaboration with ${researcher.full_name}`}
      >
        {sentSuccess ? (
          <div className="text-center py-8">
            <CheckCircleIcon className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="font-display text-xl font-bold text-navy">Collaboration Request Sent!</h3>
            <p className="text-sm text-grey-600 mt-2">
              Your inquiry has been relayed to the researcher and registered in the ASGARD coordination log.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSendCollaboration} className="space-y-4">
            {sendError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-xs text-red-600">
                {sendError}
              </div>
            )}
            <Input
              label="Your Full Name"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="Dr. / Prof. / Scholar"
              required
            />
            <Input
              label="Your Email"
              type="email"
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              placeholder="colleague@institution.edu"
              required
            />
            <Input
              label="Affiliated Institution / Organization"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              placeholder="University or Research Laboratory"
              required
            />
            <Textarea
              label="Collaboration Proposal or Inquiry"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Briefly outline your research proposal, joint grant interest, or consultation request..."
              rows={4}
              required
            />
            <div className="flex justify-end gap-3 pt-3">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={sending}>
                Send Request
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
