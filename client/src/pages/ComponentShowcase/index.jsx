import { useState } from 'react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Loader from '../../components/common/Loader';
import SkeletonCard from '../../components/common/SkeletonCard';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import DummyPayment from '../../components/common/DummyPayment';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import FileUpload from '../../components/ui/FileUpload';

export default function ComponentShowcasePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dummyLoading, setDummyLoading] = useState(false);

  return (
    <div className="max-w-content mx-auto px-6 py-12 space-y-12">
      <div>
        <h1 className="text-3xl font-bold font-display text-navy mb-2">ASGARD Design System Showcase</h1>
        <p className="text-grey-600">Verification sandbox for all Phase 0 layout, common, form, and placeholder components.</p>
      </div>

      {/* Buttons */}
      <section className="bg-white p-6 rounded-xl border border-grey-200 space-y-4">
        <h2 className="text-xl font-display font-semibold text-navy">1. Buttons</h2>
        <div className="flex flex-wrap gap-3 items-center">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary (Gold)</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" disabled>Disabled</Button>
        </div>
      </section>

      {/* Badges */}
      <section className="bg-white p-6 rounded-xl border border-grey-200 space-y-4">
        <h2 className="text-xl font-display font-semibold text-navy">2. Badges</h2>
        <div className="flex flex-wrap gap-2 items-center">
          <Badge label="Open" variant="open" />
          <Badge label="Closed" variant="closed" />
          <Badge label="Pending" variant="pending" />
          <Badge label="Active" variant="active" />
          <Badge label="Completed" variant="completed" />
          <Badge label="Draft" variant="draft" />
          <Badge label="Featured" variant="featured" />
          <Badge label="Category" variant="category" />
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-display font-semibold text-navy">3. Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-navy mb-2">Standard Card</h3>
            <p className="text-grey-600 text-sm">Regular border with subtle drop shadow.</p>
          </Card>
          <Card featured className="p-6">
            <h3 className="text-lg font-semibold text-navy mb-2">Featured Card</h3>
            <p className="text-grey-600 text-sm">Features the signature gold accent border.</p>
          </Card>
        </div>
      </section>

      {/* Form Primitives */}
      <section className="bg-white p-6 rounded-xl border border-grey-200 space-y-4">
        <h2 className="text-xl font-display font-semibold text-navy">4. Form Primitives</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Full Name" placeholder="Enter your full name" required />
          <Input label="Email Address" type="email" placeholder="name@example.com" error="Valid email required" />
          <Select label="Role Selection" required>
            <option value="researcher">Researcher</option>
            <option value="author">Author</option>
            <option value="reviewer">Reviewer</option>
          </Select>
          <FileUpload label="Resume (PDF)" />
        </div>
        <Textarea label="Cover Letter" placeholder="Write your letter here..." rows={3} />
      </section>

      {/* Loader & Skeleton */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-grey-200">
          <h2 className="text-xl font-display font-semibold text-navy mb-4">5. Loader</h2>
          <Loader />
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-navy mb-4">6. Skeleton Card</h2>
          <SkeletonCard />
        </div>
      </section>

      {/* EmptyState */}
      <section className="bg-white p-6 rounded-xl border border-grey-200">
        <h2 className="text-xl font-display font-semibold text-navy mb-4">7. Empty State</h2>
        <EmptyState
          title="No opportunities available"
          description="Check back later for fresh fellowship and career listings."
          action={<Button variant="outline">Refresh Listing</Button>}
        />
      </section>

      {/* Pagination */}
      <section className="bg-white p-6 rounded-xl border border-grey-200">
        <h2 className="text-xl font-display font-semibold text-navy mb-4">8. Pagination</h2>
        <Pagination page={currentPage} totalPages={10} onChange={setCurrentPage} />
      </section>

      {/* Modal Trigger */}
      <section className="bg-white p-6 rounded-xl border border-grey-200 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-display font-semibold text-navy">9. Focus-Trapped Modal</h2>
          <p className="text-grey-600 text-sm">Overlay with Escape-key close and tab lock.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
      </section>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Sample Modal">
        <p className="text-grey-600 text-sm mb-6">
          This modal is accessible, traps focus within its boundaries, and closes when pressing the Escape key.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
          <Button variant="primary" onClick={() => setIsModalOpen(false)}>Confirm</Button>
        </div>
      </Modal>

      {/* Dummy Payment */}
      <section className="bg-white p-6 rounded-xl border border-grey-200">
        <h2 className="text-xl font-display font-semibold text-navy mb-4">10. Dummy Payment Component</h2>
        <DummyPayment
          loading={dummyLoading}
          onConfirm={() => {
            setDummyLoading(true);
            setTimeout(() => setDummyLoading(false), 1000);
          }}
        />
      </section>
    </div>
  );
}
