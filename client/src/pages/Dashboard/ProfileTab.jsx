import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { updateMe } from '../../services/auth.service';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import { thumb } from '../../utils/cloudinaryTransform';

export default function ProfileTab() {
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    bio: user?.bio || '',
    affiliation: user?.affiliation || '',
  });

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        bio: user.bio || '',
        affiliation: user.affiliation || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateMe(form);
      await refreshUser();
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-grey-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-navy/10 border border-grey-200 overflow-hidden flex items-center justify-center font-display font-bold text-navy text-xl shrink-0">
              {user?.profilePhoto ? (
                <img src={thumb(user.profilePhoto, 200)} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0) || 'U'
              )}
            </div>
            <div>
              <h2 className="font-display font-semibold text-navy text-xl">Personal Profile</h2>
              <p className="text-xs text-grey-500 mt-1">Manage your academic profile and institutional affiliation details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge label={user?.role?.replace('_', ' ').toUpperCase()} variant="category" />
            <Badge label={user?.status?.toUpperCase()} variant="open" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 pt-6 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
            <div>
              <label className="block text-grey-700 font-medium mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full border border-grey-200 rounded-lg px-3 py-2 bg-grey-100 text-grey-500 cursor-not-allowed text-xs"
              />
              <span className="text-[10px] text-grey-400 mt-1 block">Email address cannot be modified</span>
            </div>
          </div>

          <Input
            label="Institutional Affiliation / Organization"
            value={form.affiliation}
            onChange={(e) => setForm({ ...form, affiliation: e.target.value })}
            placeholder="e.g. Department of Computer Science, University of Cambridge"
          />

          <Textarea
            label="Biographical Note / Research Summary"
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={4}
            placeholder="Brief academic biography, key research interests, and scholarly background..."
          />

          <div className="flex justify-end pt-3">
            <Button type="submit" variant="primary" loading={saving}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
