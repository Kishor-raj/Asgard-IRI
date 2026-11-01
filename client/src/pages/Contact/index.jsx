import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { submitContact } from '../../services/content.service';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import PageHeader from '../../components/common/PageHeader';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await submitContact(formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Helmet>
        <title>Contact Secretariat – ASGARD-IRI</title>
        <meta
          name="description"
          content="Reach out to ASGARD International Foundation secretariat for research inquiries, partnerships, and publishing correspondence."
        />
      </Helmet>

      {/* Header */}
      <PageHeader
        overline="Inquiries & Correspondence"
        title="Contact the Foundation"
        subtitle="Our global academic coordination team is available to support your institutional inquiries, journal collaborations, and grant proposals."
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-7 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Secretariat Details */}
          <div className="space-y-6">
            <Card className="p-6">
              <h2 className="font-display font-semibold text-lg text-navy mb-4 border-b border-grey-100 pb-3">
                Secretariat Headquarters
              </h2>
              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPinIcon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-navy block mb-0.5">International Secretariat</strong>
                    <p className="text-grey-600 leading-relaxed">
                      ASGARD International Foundation for Research and Innovation<br />
                      Knowledge Park & Science Corridor<br />
                      Academic City Campus
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <EnvelopeIcon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-navy block mb-0.5">Official Inquiries</strong>
                    <a href="mailto:contact@asgard-iri.org" className="text-navy hover:underline">
                      contact@asgard-iri.org
                    </a>
                    <br />
                    <a href="mailto:admin@asgard-iri.org" className="text-grey-500 hover:underline">
                      admin@asgard-iri.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <PhoneIcon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-navy block mb-0.5">Telephone</strong>
                    <p className="text-grey-600 font-mono">+1 (800) 274-2734 / +91 (11) 4567-8900</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ClockIcon className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-navy block mb-0.5">Working Hours</strong>
                    <p className="text-grey-600">Monday – Friday: 09:00 – 18:00 UTC</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-navy text-white">
              <h3 className="font-display font-semibold text-base text-gold mb-2">
                Press & Media Desk
              </h3>
              <p className="text-xs text-white/80 leading-relaxed mb-4">
                For journalist inquiries, official press kits, and executive interviews:
              </p>
              <a
                href="mailto:press@asgard-iri.org"
                className="text-xs font-semibold text-gold hover:underline inline-block"
              >
                press@asgard-iri.org →
              </a>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="p-8">
              <h2 className="font-display text-2xl font-bold text-navy mb-2">
                Send an Official Message
              </h2>
              <p className="text-xs text-grey-600 mb-6">
                All communications are recorded in our audit registry and dispatched to the designated department.
              </p>

              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <CheckCircleIcon className="w-14 h-14 text-emerald-600 mx-auto" />
                  <h3 className="font-display text-2xl font-bold text-navy">Inquiry Received</h3>
                  <p className="text-sm text-grey-600 max-w-md mx-auto">
                    Thank you for reaching out to ASGARD-IRI. A member of the secretariat will review your message and reply promptly.
                  </p>
                  <div className="pt-4">
                    <Button variant="outline" onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Dr. / Scholar / Colleague"
                      required
                    />
                    <Input
                      label="Your Email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@university.edu"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Contact Number (Optional)"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 / +91 ..."
                    />
                    <Input
                      label="Subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Journal Indexing Collaboration"
                      required
                    />
                  </div>

                  <Textarea
                    label="Detailed Message / Proposal"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide full background context, relevant links, or specific questions..."
                    rows={5}
                    required
                  />

                  <div className="flex justify-end pt-2">
                    <Button type="submit" variant="primary" loading={loading} className="px-8">
                      Submit Message
                    </Button>
                  </div>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
