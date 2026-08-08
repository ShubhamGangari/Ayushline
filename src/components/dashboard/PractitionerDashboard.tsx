import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getProfile, createOrUpsertProfile } from '../../lib/api/profiles';
import { Button } from '../ui/Button';
import { Stethoscope, User, Save, CheckCircle, Calendar, MessageSquare, Send, Clock } from 'lucide-react';
import { createPost } from '../../lib/api/posts';
import { Link } from 'react-router-dom';
import { getApprovedDoctors } from '../../lib/api/doctors';

export const PractitionerDashboard = () => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [system, setSystem] = useState('ayurveda');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('5');
  const [clinicName, setClinicName] = useState('');
  const [city, setCity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Map & Website fields
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicLocation, setClinicLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [googleMapLink, setGoogleMapLink] = useState('');

  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [postSuccess, setPostSuccess] = useState('');
  const [doctorId, setDoctorId] = useState<string | number | null>(null);

  // Sample Appointments State
  const [appointments, setAppointments] = useState([
    { id: '1', patientName: 'Rajesh Kumar', date: '2026-08-10', time: '10:30 AM', concern: 'Chronic Knee Joint Pain & Stiffness', status: 'Pending' },
    { id: '2', patientName: 'Sunita Sharma', date: '2026-08-12', time: '02:00 PM', concern: 'Ayurvedic Diet & Digestion Guidance', status: 'Confirmed' },
  ]);

  useEffect(() => {
    if (user?.id) {
      void getProfile(user.id).then((p) => {
        if (p) {
          setName(p.name || user.name || '');
          setSystem(p.system || 'ayurveda');
          setSpecialization(p.specialization || 'Panchakarma');
          setQualification(p.qualification || 'BAMS');
          setExperience(p.experience_years ? String(p.experience_years) : '5');
          setClinicName(p.address || '');
          setCity(p.city || '');
          setWhatsapp(p.whatsapp || '919876543210');
          setPhone(p.phone || '');
          setBio(p.bio || '');
          setAvatarUrl(p.avatar_url || user.avatarUrl || '');
          setClinicAddress(p.clinic_address || '');
          setClinicLocation(p.clinic_location || '');
          setWebsite(p.website || '');
          setGoogleMapLink(p.google_map_link || '');
        } else {
          setName(user.name || '');
          setAvatarUrl(user.avatarUrl || '');
        }
      });

      // Find this doctor's public profile ID
      void getApprovedDoctors().then((docs) => {
        const match = docs.find(d => d.user_id === user.id || d.email === user.email);
        if (match) setDoctorId(match.id);
      });
    }
  }, [user?.id]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setSuccessMsg('');

    const res = await createOrUpsertProfile(user.id, {
      name,
      email: user.email,
      role: 'doctor',
      system,
      specialization,
      qualification,
      experience_years: parseInt(experience, 10) || 0,
      address: clinicName,
      city,
      whatsapp,
      phone,
      bio,
      avatar_url: avatarUrl,
      clinic_address: clinicAddress,
      clinic_location: clinicLocation,
      website,
      google_map_link: googleMapLink,
    });

    setSaving(false);
    if (res.success) {
      setSuccessMsg('Practitioner profile saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;
    setPublishing(true);
    setPostSuccess('');

    const res = await createPost({
      title: postTitle,
      content: postContent,
      author_name: name || user?.name || 'Dr. Practitioner',
      system,
    });

    setPublishing(false);
    if (res.success) {
      setPostSuccess('Article published to community feed!');
      setPostTitle('');
      setPostContent('');
      setTimeout(() => setPostSuccess(''), 3000);
    }
  };

  const updateAppointmentStatus = (id: string, status: string) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  const whatsappClean = (whatsapp || '').replace(/[^0-9]/g, '');

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Practitioner Header */}
      <div className="bg-gradient-to-r from-ayush-forest to-emerald-950 text-white rounded-3xl p-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left">
            <img
              src={avatarUrl || `https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80`}
              alt={name}
              className="w-20 h-20 rounded-full border-4 border-ayush-gold object-cover shadow-md"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Doctor')}&background=2d5a27&color=fff&size=150`;
              }}
            />
            <div>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-ayush-gold/20 text-ayush-gold text-sm font-bold uppercase tracking-wider mb-2">
                <Stethoscope className="w-4 h-4 mr-1" /> Practitioner Portal
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold">{name || 'Doctor Practitioner'}</h1>
              <p className="text-ayush-ivory/80 font-body text-base mt-1 capitalize">
                {system} Specialist • {qualification} ({experience} Yrs Exp)
              </p>
            </div>
          </div>
          {whatsappClean && (
            <a
              href={`https://wa.me/${whatsappClean}?text=Hello%20${encodeURIComponent(name)},%20I%20would%20like%20to%20consult%20you.`}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3 bg-emerald-600 text-white font-ui font-semibold rounded-full hover:bg-emerald-500 transition-colors shadow-sm flex items-center gap-2 text-base"
            >
              <MessageSquare className="w-4 h-4" /> Test WhatsApp
            </a>
          )}
          {doctorId && (
            <Link
              to={`/doctor/${doctorId}`}
              className="px-5 py-3 bg-ayush-gold text-ayush-forest font-ui font-semibold rounded-full hover:bg-white transition-colors shadow-sm flex items-center gap-2 text-base"
            >
              View My Public Profile
            </Link>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column: Clinical Article Publisher */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-sm border border-ayush-charcoal/10 space-y-6">
          <div className="flex items-center justify-between border-b border-ayush-charcoal/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-ayush-sage rounded-2xl text-ayush-forest">
                <Send className="w-6 h-6 text-ayush-gold" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold text-ayush-forest">Write & Publish Clinical Article</h2>
                <p className="text-sm font-ui text-ayush-charcoal/60">Share treatment guidelines, case studies, or AYUSH research with the community</p>
              </div>
            </div>
            <Link
              to="/profile"
              className="px-4 py-2 bg-ayush-cream text-ayush-forest border border-ayush-forest/20 rounded-xl font-ui font-bold text-sm hover:bg-ayush-sage transition-all flex items-center gap-1.5"
            >
              Edit Profile
            </Link>
          </div>

          <form onSubmit={handlePublishPost} className="space-y-4">
            <div>
              <label className="block text-base font-ui font-semibold text-ayush-forest mb-1">Article Title</label>
              <input
                type="text"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                placeholder="Title (e.g. Managing Arthritis via Panchakarma Therapy)"
                className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-base"
                required
              />
            </div>
            <div>
              <label className="block text-base font-ui font-semibold text-ayush-forest mb-1">Article Content</label>
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows={6}
                placeholder="Write your clinical research findings, treatment guidelines, or patient advice..."
                className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-base resize-none"
                required
              ></textarea>
            </div>

            {postSuccess && (
              <div className="bg-emerald-50 text-emerald-700 p-3.5 rounded-xl text-sm font-ui flex items-center gap-2 border border-emerald-200">
                <CheckCircle className="w-5 h-5" />
                <span>{postSuccess}</span>
              </div>
            )}

            <Button type="submit" variant="primary" className="py-3 px-6 text-sm" disabled={publishing}>
              {publishing ? 'Publishing Article...' : 'Publish Article to Directory'}
            </Button>
          </form>
        </div>

        {/* Appointments Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-ayush-charcoal/10">
            <h3 className="text-2xl font-display font-bold text-ayush-forest mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-ayush-gold" /> Patient Appointments
            </h3>

            <div className="space-y-4">
              {appointments.map((appt) => (
                <div key={appt.id} className="bg-ayush-cream/60 p-4 rounded-2xl border border-ayush-forest/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-ayush-forest text-base">{appt.patientName}</p>
                    <span className={`text-xs uppercase font-bold px-2.5 py-1 rounded-full ${appt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {appt.status}
                    </span>
                  </div>
                  <p className="text-sm text-ayush-charcoal/70 font-ui flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {appt.date} at {appt.time}
                  </p>
                  <p className="text-sm text-ayush-charcoal/80 font-body italic">"{appt.concern}"</p>

                  <div className="flex gap-2 pt-2">
                    {appt.status !== 'Confirmed' && (
                      <button
                        onClick={() => updateAppointmentStatus(appt.id, 'Confirmed')}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-ui text-sm font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Accept
                      </button>
                    )}
                    <button
                      onClick={() => updateAppointmentStatus(appt.id, 'Cancelled')}
                      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-ui text-sm font-semibold hover:bg-red-100 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
