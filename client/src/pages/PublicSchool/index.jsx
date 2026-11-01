import { Helmet } from 'react-helmet-async';
import { AcademicCapIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export default function PublicSchoolPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-grey-50 px-4 py-16">
      <Helmet>
        <title>Public School (Planned Initiative) – ASGARD-IRI</title>
        <meta
          name="description"
          content="ASGARD Public School is a planned initiative. Details will be published once officially confirmed."
        />
      </Helmet>
      <div className="bg-white rounded-2xl border border-grey-200 shadow-card p-10 text-center max-w-lg w-full">
        <div className="w-16 h-16 bg-navy/10 rounded-full flex items-center justify-center mx-auto mb-5">
          <AcademicCapIcon className="w-8 h-8 text-navy" />
        </div>
        <h1 className="font-display text-2xl font-bold text-navy mb-3">
          ASGARD Public School
        </h1>
        <p className="text-grey-600 text-sm leading-relaxed">
          ASGARD Public School is a planned initiative. Details including admissions,
          curriculum, faculty and facilities will be published once officially confirmed.
          Please check back for updates.
        </p>
        <Link
          to="/contact"
          className="mt-6 inline-block text-gold-dark hover:text-navy text-sm font-semibold hover:underline"
        >
          Contact Secretariat for Inquiries →
        </Link>
      </div>
    </div>
  );
}
