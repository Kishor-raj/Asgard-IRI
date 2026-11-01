import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  ArrowTopRightOnSquareIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ClipboardDocumentIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import useFetch from '../../hooks/useFetch';
import { getResearchOutputBySlug } from '../../services/research.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Loader from '../../components/common/Loader';

export default function ResearchOutputDetailPage() {
  const { slug } = useParams();
  const { data, loading, error } = useFetch(() => getResearchOutputBySlug(slug), [slug]);
  const output = data?.data;

  const copyBibtex = () => {
    if (!output) return;
    const bib = `@article{asgard_${output.id},
  title = {${output.title}},
  author = {${output.authors_text || 'ASGARD Consortium'}},
  year = {${output.year || new Date().getFullYear()}},
  url = {${output.url || window.location.href}}
}`;
    navigator.clipboard.writeText(bib);
    toast.success('BibTeX citation copied to clipboard.');
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !output) {
    return (
      <div className="max-w-content mx-auto px-6 py-20 text-center">
        <h2 className="font-display text-2xl font-bold text-navy mb-3">Output Not Found</h2>
        <p className="text-grey-600 text-sm mb-6">The requested research output could not be found in the repository.</p>
        <Link to="/research/repository" className="text-navy font-semibold hover:underline">
          ← Back to Repository
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-grey-50 min-h-screen py-12">
      <Helmet>
        <title>{output.title} – ASGARD Research Repository</title>
        <meta name="description" content={output.abstract?.substring(0, 160)} />
      </Helmet>

      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <Link
          to="/research/repository"
          className="inline-flex items-center gap-1.5 text-xs text-navy font-semibold hover:text-gold transition-colors"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" /> Back to Research Repository
        </Link>

        {/* Main Article Header Card */}
        <Card className="p-8 space-y-6">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge
              label={output.type?.replace('_', ' ').toUpperCase()}
              variant="gold"
            />
            {output.year && (
              <span className="text-xs font-semibold text-navy bg-navy/5 px-2.5 py-0.5 rounded">
                Year: {output.year}
              </span>
            )}
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-navy leading-snug">
            {output.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-xs text-grey-600 pb-4 border-b border-grey-100">
            <div className="flex items-center gap-1.5">
              <UserGroupIcon className="w-4 h-4 text-navy shrink-0" />
              <span>Authors: <strong>{output.authors_text || 'ASGARD Research Consortium'}</strong></span>
            </div>
            {output.year && (
              <div className="flex items-center gap-1.5">
                <CalendarDaysIcon className="w-4 h-4 text-navy shrink-0" />
                <span>Published: {output.year}</span>
              </div>
            )}
          </div>

          <div>
            <h3 className="font-display font-semibold text-navy text-base mb-2">Abstract</h3>
            <p className="text-grey-700 text-sm leading-relaxed whitespace-pre-line">
              {output.abstract || 'No abstract provided for this catalog record.'}
            </p>
          </div>

          {output.url && (
            <div className="pt-4 border-t border-grey-100 flex flex-wrap gap-3 items-center justify-between">
              <div>
                <span className="text-xs text-grey-500 block">External Digital Identifier / Publication:</span>
                <span className="text-xs font-mono text-navy font-medium break-all">{output.url}</span>
              </div>
              <a
                href={output.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-navy text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-gold hover:text-navy transition-colors shrink-0"
              >
                Access Full Publication <ArrowTopRightOnSquareIcon className="w-4 h-4" />
              </a>
            </div>
          )}
        </Card>

        {/* Linked Project Card if present */}
        {output.project_title && (
          <Card className="p-6">
            <span className="text-[11px] text-grey-400 uppercase font-semibold block mb-1">
              Associated Strategic Initiative
            </span>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-display font-semibold text-navy text-base">
                  {output.project_title}
                </h4>
                <p className="text-xs text-grey-500 mt-0.5">Funded research initiative under ASGARD-IRI</p>
              </div>
              {output.project_slug && (
                <Link
                  to={`/research/projects/${output.project_slug}`}
                  className="text-xs text-navy font-semibold hover:underline"
                >
                  View Project →
                </Link>
              )}
            </div>
          </Card>
        )}

        {/* Citation Box */}
        <Card className="p-6 space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-display font-semibold text-navy text-sm">Cite this Output</h4>
            <button
              onClick={copyBibtex}
              className="inline-flex items-center gap-1 text-xs text-navy font-semibold hover:text-gold"
            >
              <ClipboardDocumentIcon className="w-4 h-4" /> Copy BibTeX
            </button>
          </div>
          <div className="bg-grey-50 p-3 rounded-lg border border-grey-200 font-mono text-[11px] text-grey-700 select-all overflow-x-auto">
            {output.authors_text || 'ASGARD Consortium'} ({output.year || new Date().getFullYear()}). "{output.title}". ASGARD Institute of Research & Innovation Open Repository.
          </div>
        </Card>
      </div>
    </div>
  );
}
