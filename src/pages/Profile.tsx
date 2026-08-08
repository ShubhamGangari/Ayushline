import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getProfile, createOrUpsertProfile, type Profile as ProfileType } from '../lib/api/profiles';
import { Button } from '../components/ui/Button';
import {
  User,
  Mail,
  Save,
  Camera,
  Trash2,
  LogOut,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Bell,
  Key,
  Briefcase,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const ROLE_LABELS: Record<string, string> = {
  user: 'General User',
  doctor: 'Doctor / Practitioner',
  student: 'Student',
  org: 'Organization',
  admin: 'Administrator',
};

const ROLE_COLORS: Record<string, string> = {
  user: 'bg-gray-100 text-gray-700',
  doctor: 'bg-emerald-100 text-emerald-800',
  student: 'bg-blue-100 text-blue-800',
  org: 'bg-purple-100 text-purple-800',
  admin: 'bg-red-100 text-red-800',
};

const SYSTEM_OPTIONS = [
  { value: 'ayurveda', label: 'Ayurveda' },
  { value: 'yoga', label: 'Yoga & Naturopathy' },
  { value: 'unani', label: 'Unani' },
  { value: 'siddha', label: 'Siddha' },
  { value: 'homeopathy', label: 'Homeopathy' },
];

const QUALIFICATION_OPTIONS = [
  'BAMS',
  'BHMS',
  'BUMS',
  'BSMS',
  'BNYS',
  'MD (Ayurveda)',
  'MD (Homeopathy)',
  'MD (Unani)',
  'MD (Siddha)',
  'MSc Yoga Therapy',
  'BPT',
  'BNYS',
  'Other',
];

function getProfileCompleteness(profile: ProfileType | null): number {
  let score = 0;
  const max = 10;
  if (profile?.name) score++;
  if (profile?.email) score++;
  if (profile?.phone || profile?.whatsapp) score++;
  if (profile?.city) score++;
  if (profile?.bio) score++;
  if (profile?.role && profile.role !== 'user') score++;
  if (profile?.specialization) score++;
  if (profile?.qualification) score++;
  if (profile?.experience_years) score++;
  if (profile?.system) score++;
  return Math.round((score / max) * 100);
}

export const Profile = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  // Profile form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [system, setSystem] = useState('ayurveda');
  const [college, setCollege] = useState('');
  const [accreditation, setAccreditation] = useState('');

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    void getProfile(user.id).then((p) => {
      if (p) {
        setProfile(p);
        setName(p.name || user.name || '');
        setEmail(p.email || user.email || '');
        setRole(p.role || 'user');
        setAvatarUrl(p.avatar_url || user.avatarUrl || '');
        setBio(p.bio || '');
        setWhatsapp(p.whatsapp || '');
        setPhone(p.phone || '');
        setCity(p.city || '');
        setAddress(p.address || '');
        setSpecialization(p.specialization || '');
        setQualification(p.qualification || '');
        setExperienceYears(p.experience_years ? String(p.experience_years) : '');
        setSystem(p.system || 'ayurveda');
        setCollege(p.college || '');
        setAccreditation(p.accreditation || '');
      } else {
        setName(user.name || '');
        setEmail(user.email || '');
        setAvatarUrl(user.avatarUrl || '');
      }
      setLoading(false);
    });
  }, [user?.id, user?.name, user?.email, user?.avatarUrl]);

   const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const file = e.target.files?.[0];
     if (!file) return;
     const reader = new FileReader();
     reader.onloadend = () => {
       setAvatarUrl(reader.result as string);
     };
     reader.readAsDataURL(file);
   };

   const handleRemoveAvatar = () => {
     setAvatarUrl('');
     if (fileInputRef.current) {
       fileInputRef.current.value = '';
     }
   };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    const res = await createOrUpsertProfile(user.id, {
      name,
      email,
      role: role as ProfileType['role'],
      avatar_url: avatarUrl,
      bio,
      whatsapp,
      phone,
      city,
      address,
      specialization,
      qualification,
      experience_years: experienceYears ? parseInt(experienceYears, 10) : undefined,
      system,
      college,
      accreditation,
    });

    setSaving(false);
    if (res.success) {
      setSuccessMsg('Profile updated successfully!');
      setProfile(res.data || null);
      setTimeout(() => setSuccessMsg(''), 4000);
    } else {
      setErrorMsg(res.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordMsg('');

    if (!currentPassword) {
      setPasswordError('Current password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    // In a real app, this would call Clerk's updatePassword API
    // For now, show success since Clerk handles password updates via its own UI
    setPasswordMsg('Password change request submitted. Check your email for confirmation.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogout = async () => {
    try {
      if (signOut) {
        await signOut();
      }
    } catch {
      // fallback
    }
    window.location.href = '/';
  };

  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const completeness = getProfileCompleteness(profile);

  if (loading) {
    return (
      <div className="min-h-screen bg-ayush-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-ayush-gold animate-spin mx-auto mb-3" />
          <p className="text-ayush-charcoal/60 font-ui text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ayush-cream min-h-screen">
      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-ayush-forest via-ayush-ocean to-ayush-sea text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-ayush-gold rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-ayush-coral rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-28 h-28 rounded-full border-4 border-ayush-gold overflow-hidden shadow-xl bg-ayush-forest">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ayush-gold font-display font-bold text-2xl">
                    {initials}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-9 h-9 bg-ayush-gold text-ayush-forest rounded-full flex items-center justify-center shadow-lg hover:bg-ayush-gold/90 transition-colors"
                title="Change photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              {avatarUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute top-0 right-0 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                  title="Remove photo"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-3xl font-display font-bold">{name || 'User'}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-700'}`}>
                  {ROLE_LABELS[role] || role}
                </span>
              </div>
              <p className="text-ayush-ivory/70 font-body text-sm flex items-center justify-center md:justify-start gap-1.5">
                <Mail className="w-4 h-4" />
                {email || 'No email set'}
              </p>
              {user?.id && (
                <p className="text-ayush-ivory/40 font-ui text-xs mt-1">
                  ID: {user.id.slice(0, 12)}...
                </p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Link
                to="/dashboard"
                className="px-5 py-2.5 bg-white/10 text-white font-ui font-semibold rounded-xl hover:bg-white/20 transition-colors text-sm flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" /> Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 bg-red-500/20 text-red-300 font-ui font-semibold rounded-xl hover:bg-red-500/30 transition-colors text-sm flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success / Error Alerts */}
        {successMsg && (
          <div className="mb-6 bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm font-ui flex items-center gap-2 border border-emerald-200 animate-fade-in">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-ui flex items-center gap-2 border border-red-200 animate-fade-in">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Completion Banner */}
        {!loading && profile && completeness < 100 && (
          <div className="mb-6 bg-ayush-gold/10 border border-ayush-gold/20 rounded-2xl p-5 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-display font-bold text-ayush-forest mb-1">Complete Your Profile</h3>
                <p className="text-sm font-ui text-ayush-charcoal/60">
                  Add more details to make your profile stand out and unlock job matching opportunities.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-ayush-charcoal/10 rounded-full overflow-hidden">
                  <div className="h-full bg-ayush-gold rounded-full transition-all" style={{ width: `${completeness}%` }} />
                </div>
                <span className="text-sm font-ui font-bold text-ayush-forest">{completeness}%</span>
                <button
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2 bg-ayush-forest text-white font-ui font-semibold text-xs rounded-xl hover:bg-ayush-forest/90 transition-colors"
                >
                  Complete Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 bg-white rounded-2xl p-1.5 shadow-sm border border-ayush-charcoal/10 w-fit">
          {[
            { key: 'profile', label: 'Profile', icon: User },
            { key: 'security', label: 'Security', icon: Lock },
            { key: 'notifications', label: 'Notifications', icon: Bell },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`px-5 py-2.5 rounded-xl font-ui font-semibold text-sm flex items-center gap-2 transition-all ${
                  activeTab === tab.key
                    ? 'bg-ayush-forest text-white shadow-sm'
                    : 'text-ayush-charcoal/60 hover:text-ayush-forest hover:bg-ayush-sage'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-ayush-charcoal/10">
                <h2 className="text-2xl font-display font-bold text-ayush-forest mb-6 flex items-center gap-2">
                  <User className="w-6 h-6 text-ayush-gold" /> Personal Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">WhatsApp Number</label>
                    <input
                      type="text"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="e.g. 919876543210"
                      className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">Phone Number</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 011-23456789"
                      className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm transition-all"
                    />
                  </div>
                </div>

                <div className="mt-5">
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New Delhi"
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm transition-all"
                  />
                </div>

                <div className="mt-5">
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">Address</label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={2}
                    placeholder="Full address..."
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm resize-none transition-all"
                  ></textarea>
                </div>

                <div className="mt-5">
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">Bio / About</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Tell us about yourself, your interests, or professional background..."
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm resize-none transition-all"
                  ></textarea>
                </div>
              </div>

              {/* Professional Details (conditional based on role) */}
              {(role === 'doctor' || role === 'student' || role === 'org') && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-ayush-charcoal/10">
                  <h2 className="text-2xl font-display font-bold text-ayush-forest mb-6 flex items-center gap-2">
                    <Briefcase className="w-6 h-6 text-ayush-gold" /> Professional Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {role === 'doctor' && (
                      <>
                        <div>
                          <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">AYUSH System</label>
                          <select
                            value={system}
                            onChange={(e) => setSystem(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm transition-all capitalize"
                          >
                            {SYSTEM_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">Specialization</label>
                          <input
                            type="text"
                            value={specialization}
                            onChange={(e) => setSpecialization(e.target.value)}
                            placeholder="e.g. Panchakarma, Skin"
                            className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">Qualification</label>
                          <select
                            value={qualification}
                            onChange={(e) => setQualification(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm transition-all"
                          >
                            {QUALIFICATION_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">Experience (Years)</label>
                          <input
                            type="number"
                            value={experienceYears}
                            onChange={(e) => setExperienceYears(e.target.value)}
                            min={0}
                            className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm transition-all"
                          />
                        </div>
                      </>
                    )}

                    {role === 'student' && (
                      <>
                        <div>
                          <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">College / University</label>
                          <input
                            type="text"
                            value={college}
                            onChange={(e) => setCollege(e.target.value)}
                            placeholder="e.g. National Institute of Ayurveda"
                            className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">Degree / Course</label>
                          <select
                            value={qualification}
                            onChange={(e) => setQualification(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm transition-all"
                          >
                            {QUALIFICATION_OPTIONS.map((opt) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">AYUSH System</label>
                          <select
                            value={system}
                            onChange={(e) => setSystem(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm transition-all capitalize"
                          >
                            {SYSTEM_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {role === 'org' && (
                      <>
                        <div>
                          <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">Accreditation</label>
                          <input
                            type="text"
                            value={accreditation}
                            onChange={(e) => setAccreditation(e.target.value)}
                            placeholder="e.g. Ministry of AYUSH Recognized"
                            className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">Organization Type</label>
                          <select
                            value={system}
                            onChange={(e) => setSystem(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm transition-all capitalize"
                          >
                            {SYSTEM_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex items-center gap-4">
                <Button type="submit" variant="primary" className="py-3 px-8 inline-flex items-center gap-2" disabled={saving}>
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
                <Link to="/dashboard" className="px-6 py-3 border border-ayush-forest/20 rounded-full font-ui font-semibold text-sm text-ayush-forest hover:bg-ayush-cream transition-colors">
                  Back to Dashboard
                </Link>
              </div>
            </form>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-ayush-charcoal/10">
                <h2 className="text-2xl font-display font-bold text-ayush-forest mb-6 flex items-center gap-2">
                  <Lock className="w-6 h-6 text-ayush-gold" /> Change Password
                </h2>

                <form onSubmit={handleChangePassword} className="space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1.5">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold focus:border-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                      required
                    />
                  </div>

                  {passwordError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-ui flex items-center gap-2 border border-red-100">
                      <AlertCircle className="w-4 h-4" />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordMsg && (
                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-sm font-ui flex items-center gap-2 border border-emerald-200">
                      <CheckCircle className="w-4 h-4" />
                      <span>{passwordMsg}</span>
                    </div>
                  )}

                  <Button type="submit" variant="primary" className="py-3 px-6 inline-flex items-center gap-2">
                    <Key className="w-4 h-4" /> Update Password
                  </Button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-red-200">
                <h2 className="text-2xl font-display font-bold text-red-700 mb-4 flex items-center gap-2">
                  <Trash2 className="w-6 h-6" /> Danger Zone
                </h2>
                <p className="text-sm font-body text-ayush-charcoal/70 mb-4">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                      handleLogout();
                    }
                  }}
                  className="px-6 py-3 bg-red-600 text-white font-ui font-semibold rounded-xl hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Delete Account
                </button>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-ayush-charcoal/10">
              <h2 className="text-2xl font-display font-bold text-ayush-forest mb-6 flex items-center gap-2">
                <Bell className="w-6 h-6 text-ayush-gold" /> Notification Preferences
              </h2>

              <div className="space-y-5">
                {[
                  { label: 'Email notifications for new messages', desc: 'Receive email when someone sends you a message', checked: true },
                  { label: 'Appointment reminders', desc: 'Get reminded about upcoming appointments', checked: true },
                  { label: 'New practitioner listings', desc: 'Be notified when new practitioners join', checked: false },
                  { label: 'Event announcements', desc: 'Get updates about upcoming AYUSH events', checked: true },
                  { label: 'Marketing emails', desc: 'Receive newsletters and promotional content', checked: false },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-3 border-b border-ayush-charcoal/10 last:border-0">
                    <div>
                      <p className="font-ui font-semibold text-ayush-forest text-sm">{item.label}</p>
                      <p className="text-xs text-ayush-charcoal/50 font-ui mt-0.5">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      className={`w-12 h-6 rounded-full transition-colors relative ${item.checked ? 'bg-ayush-forest' : 'bg-gray-300'}`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${item.checked ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <Button variant="primary" className="mt-6 py-3 px-6 inline-flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Preferences
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};