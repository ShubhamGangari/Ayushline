import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getProfile, createOrUpsertProfile } from '../../lib/api/profiles';
import { uploadImage } from '../../lib/uploadImage';
import { Button } from '../ui/Button';
import {
  Stethoscope, User, Save, CheckCircle, Calendar, MessageSquare,
  Send, Clock, Phone, MapPin, Eye, Check, X, Shield, Star, DollarSign, ToggleLeft, ToggleRight, Camera, AlertCircle
} from 'lucide-react';
import { createPost } from '../../lib/api/posts';
import { Link } from 'react-router-dom';
import { getApprovedDoctors, getAllDoctorsAdmin, upsertLocalDoctor, type Doctor } from '../../lib/api/doctors';
import { getAppointmentsForDoctor, updateAppointmentStatus, type Appointment } from '../../lib/api/appointments';

export const PractitionerDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'listing' | 'article'>('appointments');

  // Listing / Profile fields
  const [name, setName] = useState('');
  const [system, setSystem] = useState('ayurveda');
  const [specialization, setSpecialization] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [city, setCity] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [consultationFee, setConsultationFee] = useState('₹500');
  const [listingEnabled, setListingEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Map & Location
  const [clinicAddress, setClinicAddress] = useState('');
  const [clinicLocation, setClinicLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [googleMapLink, setGoogleMapLink] = useState('');

  // Post Article
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postThumbnailUrl, setPostThumbnailUrl] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [postSuccess, setPostSuccess] = useState('');
  const [avatarError, setAvatarError] = useState('');
  const [postImageError, setPostImageError] = useState('');

  const avatarFileInputRef = useRef<HTMLInputElement>(null);
  const articleImageInputRef = useRef<HTMLInputElement>(null);

  const handleArticleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPostImageError('');
    try {
      const res = await uploadImage(file, 'posts', 900, 600, 0.85);
      setPostThumbnailUrl(res.url);
    } catch (err: any) {
      setPostImageError(err.message || 'Image size exceeds 2MB limit.');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError('');
    try {
      const res = await uploadImage(file, 'avatars', 400, 400, 0.82);
      setAvatarUrl(res.url);
      setSuccessMsg('Profile picture uploaded and compressed! Click "Save & List Live" to update.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setAvatarError(err.message || 'Failed to process image. Max 2MB limit.');
      setTimeout(() => setAvatarError(''), 5000);
    }
  };

  // Public Doctor Profile ID & Status
  const [doctorId, setDoctorId] = useState<string | number>('1');
  const [doctorStatus, setDoctorStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // Real Appointments
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const loadAppointments = async () => {
    if (!user) return;
    const list = await getAppointmentsForDoctor(user.id, name || user.name || '');
    setAppointments(list);
  };

  const syncDoctorStatus = async () => {
    if (!user?.id) return;
    const docs = await getAllDoctorsAdmin();
    const match = docs.find(d => d.user_id === user.id || (user.email && d.email === user.email));
    if (match) {
      setDoctorId(match.id);
      setDoctorStatus(match.status || 'pending');
      setConsultationFee(String(match.consultation_fee || '₹500'));
      setListingEnabled(match.listing_enabled !== false);
    } else {
      setDoctorStatus('pending');
    }
  };

  useEffect(() => {
    if (user?.id) {
      void getProfile(user.id).then((p) => {
        if (p) {
          setName(p.name || user.name || '');
          setSystem(p.system || 'ayurveda');
          setSpecialization(p.specialization || '');
          setQualification(p.qualification || '');
          setExperience(p.experience_years ? String(p.experience_years) : '');
          setClinicName(p.address || '');
          setCity(p.city || '');
          setWhatsapp(p.whatsapp || '');
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

      void syncDoctorStatus();
      void loadAppointments();

      // Listen for incoming appointment requests & doctor status updates
      const handleApptUpdate = () => void loadAppointments();
      const handleDoctorUpdate = () => void syncDoctorStatus();
      window.addEventListener('ayush_appointments_update', handleApptUpdate);
      window.addEventListener('ayush_doctors_update', handleDoctorUpdate);
      return () => {
        window.removeEventListener('ayush_appointments_update', handleApptUpdate);
        window.removeEventListener('ayush_doctors_update', handleDoctorUpdate);
      };
    }
  }, [user?.id, name]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setSuccessMsg('');

    // 1. Update Profile API
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

    // 2. Upsert Local Doctor Directory record (pending admin review)
    const updatedDoc = upsertLocalDoctor({
      id: doctorId,
      user_id: user.id,
      name,
      email: user.email,
      system,
      specialization,
      qualification,
      experience_years: parseInt(experience, 10) || 0,
      clinic_name: clinicName,
      clinic_address: clinicAddress,
      city,
      whatsapp,
      phone,
      bio,
      profile_image_url: avatarUrl,
      consultation_fee: consultationFee,
      listing_enabled: listingEnabled,
      status: doctorStatus || 'pending'
    });
    setDoctorId(updatedDoc.id);
    setDoctorStatus(updatedDoc.status || 'pending');

    setSaving(false);
    if (res.success) {
      setSuccessMsg(
        updatedDoc.status === 'approved'
          ? 'Consultation profile updated successfully!'
          : 'Consultation profile submitted to Admin Panel! Status is pending verification.'
      );
      setTimeout(() => setSuccessMsg(''), 5000);
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
      thumbnail_url: postThumbnailUrl,
    });

    setPublishing(false);
    if (res.success) {
      setPostSuccess('Article published to community feed!');
      setPostTitle('');
      setPostContent('');
      setPostThumbnailUrl('');
      setTimeout(() => setPostSuccess(''), 3000);
    }
  };

  const handleApptAction = async (id: string | number, status: 'confirmed' | 'cancelled' | 'completed') => {
    await updateAppointmentStatus(id, status);
    await loadAppointments();
  };

  const whatsappClean = (whatsapp || '').replace(/[^0-9]/g, '');

  const isProfileComplete = Boolean(
    specialization.trim() &&
    qualification.trim() &&
    (city.trim() || clinicName.trim())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Gentle Profile Info Tip (non-blocking) */}
      {!isProfileComplete && (
        <div className="bg-emerald-50/80 rounded-2xl p-4 border border-emerald-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-emerald-950 shadow-sm">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <p className="font-body text-xs sm:text-sm text-emerald-900">
              <strong>Doctor Portal Active:</strong> Manage your patient appointments and consultation settings. Fill in optional specialization and degree details in Profile Settings to enrich your public page.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('listing')}
            className="px-4 py-1.5 bg-emerald-700 text-white rounded-xl font-ui font-semibold text-xs hover:bg-emerald-800 transition-all flex-shrink-0"
          >
            Update Profile Settings →
          </button>
        </div>
      )}

      {/* Practitioner Header */}
      <div className="bg-gradient-to-r from-ayush-forest via-emerald-950 to-slate-900 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5 text-center md:text-left">
            <div className="relative flex-shrink-0">
              <img
                src={avatarUrl || `https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80`}
                alt={name}
                className="w-20 h-20 rounded-full border-4 border-ayush-gold object-cover shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Doctor')}&background=2d5a27&color=fff&size=150`;
                }}
              />
              <button
                type="button"
                onClick={() => avatarFileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-ayush-gold text-ayush-forest rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all border border-ayush-forest"
                title="Upload Profile Picture (Max 2MB)"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
              <input
                ref={avatarFileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
              />
            </div>
            <div>
              <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-ayush-gold/20 text-ayush-gold text-xs font-bold uppercase tracking-wider mb-2">
                <Shield className="w-3.5 h-3.5 mr-1" /> Verified Practitioner Directory Portal
              </div>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white tracking-wide">{name || 'Doctor Practitioner'}</h1>
              <p className="text-ayush-ivory/80 font-body text-base mt-1 capitalize">
                {specialization ? `${system} Specialist • ${specialization}` : `${system} Practitioner`}
                {qualification ? ` (${qualification})` : ''}
                {experience ? ` • ${experience} Yrs Exp` : ''}
                {city || clinicName ? ` • ${city || clinicName}` : ''}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to={`/doctor/${doctorId}`}
              className="px-5 py-3 bg-ayush-gold text-ayush-forest font-ui font-bold rounded-2xl hover:bg-white transition-all shadow-md flex items-center gap-2 text-sm"
            >
              <Eye className="w-4 h-4" /> View Live Profile
            </Link>
            {whatsappClean && (
              <a
                href={`https://wa.me/${whatsappClean}?text=Hello%20${encodeURIComponent(name)},%20I%20am%20testing%20my%20WhatsApp%20consultation%20link.`}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 bg-emerald-600 text-white font-ui font-semibold rounded-2xl hover:bg-emerald-500 transition-colors shadow-md flex items-center gap-2 text-sm"
              >
                <Phone className="w-4 h-4" /> WhatsApp Test
              </a>
            )}
          </div>
        </div>
      </div>

      {avatarError && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-ui flex items-center gap-2 border border-red-200 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{avatarError}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row bg-white rounded-2xl p-1.5 shadow-sm border border-ayush-charcoal/10 gap-1.5 sm:gap-2 w-full max-w-2xl">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-ui font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'appointments' ? 'bg-ayush-forest text-white shadow-sm' : 'text-ayush-charcoal/70 hover:bg-ayush-cream'
          }`}
        >
          <Calendar className="w-4 h-4 flex-shrink-0" />
          Patient Requests ({appointments.filter(a => a.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('listing')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-ui font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'listing' ? 'bg-ayush-forest text-white shadow-sm' : 'text-ayush-charcoal/70 hover:bg-ayush-cream'
          }`}
        >
          <Stethoscope className="w-4 h-4 flex-shrink-0" />
          Profile Settings
        </button>
        <button
          onClick={() => setActiveTab('article')}
          className={`flex-1 py-2.5 px-3 rounded-xl font-ui font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'article' ? 'bg-ayush-forest text-white shadow-sm' : 'text-ayush-charcoal/70 hover:bg-ayush-cream'
          }`}
        >
          <Send className="w-4 h-4 flex-shrink-0" />
          Publish Article
        </button>
      </div>

      {/* TAB 1: Appointments Management */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-ayush-charcoal/10 space-y-6">
          <div className="flex items-center justify-between border-b border-ayush-charcoal/10 pb-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-ayush-forest flex items-center gap-2">
                <Calendar className="w-6 h-6 text-ayush-gold" /> Patient Appointment Requests
              </h2>
              <p className="text-sm font-body text-ayush-charcoal/70">
                Review incoming patient consultations, accept or decline requests, or connect directly on WhatsApp.
              </p>
            </div>
            <button
              onClick={() => void loadAppointments()}
              className="px-4 py-2 rounded-xl bg-ayush-sage text-ayush-forest font-ui text-xs font-bold hover:bg-ayush-gold/20 transition-colors"
            >
              Refresh
            </button>
          </div>

          {appointments.length === 0 ? (
            <div className="text-center py-12 bg-ayush-cream/40 rounded-2xl border border-dashed border-ayush-forest/20">
              <Calendar className="w-12 h-12 text-ayush-forest/30 mx-auto mb-3" />
              <h3 className="font-display font-bold text-lg text-ayush-forest">No Appointment Requests Yet</h3>
              <p className="text-sm font-body text-ayush-charcoal/60 max-w-md mx-auto mt-1">
                Patients who book a consultation with you from the Consult directory will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appointments.map((appt) => {
                const isPending = appt.status === 'pending';
                const isConfirmed = appt.status === 'confirmed';
                const isCancelled = appt.status === 'cancelled';
                const isCompleted = appt.status === 'completed';

                return (
                  <div
                    key={appt.id}
                    className={`rounded-2xl p-6 border transition-all flex flex-col justify-between ${
                      isPending
                        ? 'bg-amber-50/60 border-amber-200'
                        : isConfirmed
                        ? 'bg-emerald-50/60 border-emerald-200'
                        : isCompleted
                        ? 'bg-blue-50/60 border-blue-200'
                        : 'bg-red-50/60 border-red-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-display font-bold text-lg text-ayush-forest">{appt.patient_name}</span>
                        <span
                          className={`text-xs font-ui font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                            isPending
                              ? 'bg-amber-200 text-amber-900'
                              : isConfirmed
                              ? 'bg-emerald-200 text-emerald-900'
                              : isCompleted
                              ? 'bg-blue-200 text-blue-900'
                              : 'bg-red-200 text-red-900'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-sm font-ui text-ayush-charcoal/80 mb-4">
                        <p className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-ayush-gold" />
                          <strong>Preferred Time:</strong> {appt.preferred_date} at {appt.preferred_time}
                        </p>
                        {appt.patient_email && (
                          <p className="text-xs text-ayush-charcoal/60">Email: {appt.patient_email}</p>
                        )}
                        {appt.message && (
                          <div className="mt-3 p-3 bg-white/80 rounded-xl border border-ayush-forest/10">
                            <p className="text-xs font-bold text-ayush-forest mb-1">Patient Concern / Note:</p>
                            <p className="text-xs font-body italic text-ayush-charcoal/80">"{appt.message}"</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-ayush-charcoal/10 flex flex-wrap gap-2">
                      {isPending && (
                        <>
                          <button
                            onClick={() => void handleApptAction(appt.id, 'confirmed')}
                            className="flex-1 py-2.5 bg-emerald-600 text-white rounded-xl font-ui font-bold text-xs hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                          >
                            <Check className="w-4 h-4" /> Accept & Confirm
                          </button>
                          <button
                            onClick={() => void handleApptAction(appt.id, 'cancelled')}
                            className="py-2.5 px-4 bg-red-100 text-red-700 rounded-xl font-ui font-bold text-xs hover:bg-red-200 transition-colors flex items-center justify-center gap-1"
                          >
                            <X className="w-4 h-4" /> Decline
                          </button>
                        </>
                      )}

                      {isConfirmed && (
                        <>
                          <button
                            onClick={() => void handleApptAction(appt.id, 'completed')}
                            className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-ui font-bold text-xs hover:bg-blue-700 transition-colors flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" /> Mark Completed
                          </button>
                          <button
                            onClick={() => void handleApptAction(appt.id, 'cancelled')}
                            className="py-2 px-3 bg-gray-200 text-gray-700 rounded-xl font-ui font-semibold text-xs hover:bg-gray-300 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {appt.patient_name && (
                        <a
                          href={`https://wa.me/919876543210?text=Hello%20${encodeURIComponent(appt.patient_name)}%2C%20I%20am%20${encodeURIComponent(name)}.%20Regarding%20your%20appointment%20request%20for%20${encodeURIComponent(appt.preferred_date || '')}...`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 px-3 bg-emerald-100 text-emerald-800 rounded-xl font-ui font-bold text-xs hover:bg-emerald-200 transition-colors flex items-center gap-1"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Patient
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Consult Profile Directory Settings */}
      {activeTab === 'listing' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-ayush-charcoal/10 space-y-8">
          <div className="flex items-center justify-between border-b border-ayush-charcoal/10 pb-4">
            <div>
              <h2 className="text-2xl font-display font-bold text-ayush-forest flex items-center gap-2">
                <Stethoscope className="w-6 h-6 text-ayush-gold" /> Directory Profile & Contact Settings
              </h2>
              <p className="text-sm font-body text-ayush-charcoal/70">
                Configure what patients see on the <strong>Consultation Directory (`/consult`)</strong>.
              </p>
            </div>
            
            {/* Listing Toggle */}
            <button
              type="button"
              onClick={() => setListingEnabled(!listingEnabled)}
              className={`px-4 py-2 rounded-2xl font-ui font-bold text-xs flex items-center gap-2 transition-all ${
                listingEnabled ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-gray-100 text-gray-600 border border-gray-300'
              }`}
            >
              {listingEnabled ? <ToggleRight className="w-5 h-5 text-emerald-600" /> : <ToggleLeft className="w-5 h-5 text-gray-400" />}
              <span>{listingEnabled ? 'Listed Live on Consult' : 'Directory Listing Hidden'}</span>
            </button>
          </div>

          {/* Verification Status Card */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
            doctorStatus === 'approved'
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
              : doctorStatus === 'rejected'
              ? 'bg-red-50/80 border-red-200 text-red-950'
              : 'bg-amber-50/80 border-amber-200 text-amber-950'
          }`}>
            {doctorStatus === 'approved' && <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
            {doctorStatus === 'rejected' && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
            {doctorStatus === 'pending' && <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}

            <div className="space-y-1">
              <div className="font-ui font-bold text-sm flex items-center gap-2">
                <span>Admin Approval Status:</span>
                <span className={`capitalize px-3 py-0.5 rounded-full text-xs font-extrabold ${
                  doctorStatus === 'approved' ? 'bg-emerald-200/80 text-emerald-900' :
                  doctorStatus === 'rejected' ? 'bg-red-200/80 text-red-900' : 'bg-amber-200/80 text-amber-900'
                }`}>
                  {doctorStatus}
                </span>
              </div>
              <p className="font-body text-xs opacity-90 leading-relaxed">
                {doctorStatus === 'approved' && 'Your practitioner profile is verified and live in the Consultation directory.'}
                {doctorStatus === 'rejected' && 'Your application request was rejected by the Admin. Please update your details and submit again.'}
                {doctorStatus === 'pending' && 'Your profile has been submitted and is pending Admin review. Once approved, it will be listed publicly in the Consultation directory.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Practitioner Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Ananya Sharma"
                  className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">AYUSH System</label>
                <select
                  value={system}
                  onChange={(e) => setSystem(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm capitalize"
                >
                  <option value="ayurveda">Ayurveda</option>
                  <option value="yoga">Yoga Therapy</option>
                  <option value="unani">Unani</option>
                  <option value="siddha">Siddha</option>
                  <option value="homeopathy">Homeopathy</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Panchakarma, Joint Pain"
                  className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Qualification</label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. BAMS, MD (Ayurveda)"
                  className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Experience (Years)</label>
                <input
                  type="number"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  placeholder="10"
                  className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Consultation Fee</label>
                <input
                  type="text"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  placeholder="e.g. ₹500 or Free"
                  className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="e.g. 919876543210"
                  className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Direct Call Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Clinic / Hospital Name</label>
                <input
                  type="text"
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="e.g. Sanjeevani Ayurveda Clinic"
                  className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">City / Location</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Full Clinic Address</label>
              <input
                type="text"
                value={clinicAddress}
                onChange={(e) => setClinicAddress(e.target.value)}
                placeholder="e.g. Plot 42, Health Sector 5, Near Central Park, New Delhi"
                className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Practitioner Bio & Special Focus</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Describe your treatment expertise, Panchakarma methods, and clinical background..."
                className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm resize-none"
              ></textarea>
            </div>

            {successMsg && (
              <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl text-sm font-ui flex items-center gap-2 border border-emerald-200">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" variant="primary" className="py-3 px-8 text-sm" disabled={saving}>
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving Profile...' : 'Save & List Live on Directory'}
              </Button>
              <Link
                to={`/doctor/${doctorId}`}
                className="py-3 px-6 bg-ayush-cream text-ayush-forest font-ui font-bold rounded-xl border border-ayush-forest/20 hover:bg-ayush-sage transition-colors text-sm flex items-center gap-1.5"
              >
                <Eye className="w-4 h-4" /> Preview Live Card
              </Link>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Publish Article */}
      {activeTab === 'article' && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-ayush-charcoal/10 space-y-6">
          <div className="flex items-center gap-3 border-b border-ayush-charcoal/10 pb-4">
            <div className="p-3 bg-ayush-sage rounded-2xl text-ayush-forest">
              <Send className="w-6 h-6 text-ayush-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-ayush-forest">Write & Publish Clinical Article</h2>
              <p className="text-sm font-ui text-ayush-charcoal/60">Share treatment guidelines, case studies, or AYUSH research with the community</p>
            </div>
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
              <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Featured Image Banner (Optional, Max 2MB)</label>
              <div className="flex items-center gap-4 bg-ayush-ivory/40 p-3.5 rounded-xl border border-ayush-forest/20">
                {postThumbnailUrl ? (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-ayush-forest/20 flex-shrink-0">
                    <img src={postThumbnailUrl} alt="Article Thumbnail" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPostThumbnailUrl('')}
                      className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-ayush-sage/40 flex items-center justify-center text-ayush-forest/50 flex-shrink-0">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => articleImageInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-ayush-forest text-white text-xs font-ui font-bold rounded-lg hover:bg-ayush-gold hover:text-ayush-forest transition-colors inline-flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" /> Upload Featured Image
                  </button>
                  <p className="text-xs text-ayush-charcoal/60 font-ui">Max 2MB limit. Compressed automatically.</p>
                  <input
                    ref={articleImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleArticleImageUpload}
                  />
                </div>
              </div>
              {postImageError && (
                <p className="text-xs text-red-600 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {postImageError}
                </p>
              )}
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
      )}
    </div>
  );
};

