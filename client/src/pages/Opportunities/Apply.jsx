import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import useFetch from '../../hooks/useFetch';
import { getOpportunityBySlug, applyToOpportunity } from '../../services/opportunity.service';
import Loader from '../../components/common/Loader';
import Textarea from '../../components/ui/Textarea';
import FileUpload from '../../components/ui/FileUpload';
import Button from '../../components/common/Button';

export default function ApplyPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data, loading, error: fetchError } = useFetch(
    () => getOpportunityBySlug(id),
    [id]
  );
  const opp = data?.data;

  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!coverLetter.trim()) {
      toast.error('Please provide a cover letter or statement of purpose.');
      return;
    }

    if (!resumeFile) {
      toast.error('Please upload your resume or curriculum vitae (PDF).');
      return;
    }

    const formData = new FormData();
    formData.append('coverLetter', coverLetter);
    formData.append('resume', resumeFile);

    try {
      setSubmitting(true);
      await applyToOpportunity(opp?.id || id, formData);
      toast.success('Application submitted successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullPage />;
  if (fetchError || !opp) {
    return (
      <div className="max-w-content mx-auto px-6 py-20 text-center">
        <h2 className="text-xl font-bold font-display text-navy mb-2">Opportunity Not Found</h2>
        <Link to="/opportunities" className="text-navy font-semibold hover:underline">
          ← Back to Opportunities
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-grey-50 min-h-screen py-12">
      <Helmet>
        <title>Apply for {opp.title} – ASGARD-IRI</title>
      </Helmet>

      <div className="max-w-narrow mx-auto px-6">
        <div className="mb-6">
          <Link to={`/opportunities/${opp.slug || opp.id}`} className="text-xs text-grey-600 hover:text-navy">
            ← Back to position description
          </Link>
          <h1 className="font-display text-3xl font-bold text-navy mt-2">
            Submit Your Application
          </h1>
          <p className="text-sm text-grey-600 mt-1">
            Applying for: <strong className="text-navy">{opp.title}</strong> ({opp.department || 'ASGARD-IRI'})
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-grey-200 shadow-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Textarea
              label="Cover Letter / Statement of Purpose"
              placeholder="Introduce yourself, your academic/professional background, and explain why you are interested in this position..."
              rows={8}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              required
            />

            <FileUpload
              label="Resume / Curriculum Vitae (PDF format)"
              accept=".pdf,application/pdf"
              maxSizeMB={5}
              onChange={(file) => setResumeFile(file)}
              required
            />

            <div className="pt-4 border-t border-grey-100 flex items-center justify-between">
              <Link
                to={`/opportunities/${opp.slug || opp.id}`}
                className="text-sm text-grey-600 hover:text-navy font-medium"
              >
                Cancel
              </Link>
              <Button type="submit" variant="primary" loading={submitting}>
                Submit Application
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
