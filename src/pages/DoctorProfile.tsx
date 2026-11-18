import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin, Star, Phone, MessageSquare, Calendar, Award, Clock,
  ArrowLeft, CheckCircle, Stethoscope, Share2, Heart, Shield,
  ChevronRight, Mail, Send
} from 'lucide-react';
import { getDoctorById, getApprovedDoctors, getDoctorReviews, addDoctorReview, type Doctor, type DoctorReview } from '../lib/api/doctors';
import { createAppointment } from '../lib/api/appointments';
import { Button } from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import { AuthRequiredModal } from '../components/auth/AuthRequiredModal';

const SYSTEM_COLORS: Record<string, string> = {
  ayurveda: 'bg-emerald-100 text-emerald-800',
  homeopathy: 'bg-blue-100 text-blue-800',
  yoga: 'bg-purple-100 text-purple-800',
  'yoga therapy': 'bg-purple-100 text-purple-800',
  unani: 'bg-amber-100 text-amber-800',
  siddha: 'bg-rose-100 text-rose-800',
};

const CONDITION_TAGS = [
  'Arthritis', 'Joint Pain', 'Back Pain', 'Skin Care', 'Stress & Anxiety',
  'Digestion', 'Weight Management', 'Immunity', 'Sleep Disorders', 'Fertility',
  'Diabetes', 'Hypertension', 'Mental Wellness', 'Respiratory', 'Detox'
];

const BookingModal = ({ doctor, onClose }: { doctor: Doctor; onClose: () => void }) => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState((user as Record<string, any> | null)?.phone || (user as Record<string, any> | null)?.whatsapp || '');
  const [preferredDate, setPreferredDate] = useState(new Date().toISOString().split('T')[0]);
  const [preferredTime, setPreferredTime] = useState('10:00 AM');
  const [concern, setConcern] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (user?.name && !name) setName(user.name);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    await createAppointment({
      doctor_id: String(doctor.id),
      doctor_name: doctor.name,
      patient_id: user?.id || 'guest',
      patient_name: name || user?.name || 'AYUSH Patient',
      patient_email: user?.email || phone || 'user@ayushline.gov.in',
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      message: concern,
    });

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-2xl font-display font-bold text-ayush-forest mb-2">Appointment Requested!</h3>
          <p className="text-ayush-charcoal/70 font-body text-sm mb-6">
            Your appointment request for <strong>{preferredDate} at {preferredTime}</strong> has been sent to <strong>{doctor.name}</strong>. It will appear on their dashboard for approval.
          </p>
          {doctor.whatsapp && (
            <a
              href={`https://wa.me/${doctor.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(doctor.name)}%2C%20I%20just%20submitted%20an%20appointment%20request%20on%20AYUSHLINE%20for%20${encodeURIComponent(preferredDate)}%20at%20${encodeURIComponent(preferredTime)}.%20My%20name%20is%20${encodeURIComponent(name)}.`}
              target="_blank"
              rel="noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-2xl font-ui font-semibold mb-3 hover:bg-emerald-700 transition-colors"
            >
              <MessageSquare className="w-4 h-4" /> Chat on WhatsApp Now
            </a>
          )}
          <button onClick={onClose} className="w-full py-3 rounded-2xl border border-ayush-forest/20 font-ui text-ayush-forest hover:bg-ayush-cream transition-colors">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-display font-bold text-ayush-forest">Book Appointment</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-ayush-cream transition-colors text-ayush-charcoal/60">✕</button>
        </div>
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-ayush-sage/30 border border-ayush-forest/10 mb-6">
          <img src={doctor.image || doctor.profile_image_url || ''} alt={doctor.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-ayush-gold" />
          <div>
            <p className="font-ui font-bold text-ayush-forest text-sm">{doctor.name}</p>
            <p className="text-xs text-ayush-charcoal/60 font-ui">{doctor.specialization} • {doctor.city || 'India'}</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Your Full Name</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm" />
          </div>
          <div>
            <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">WhatsApp / Contact Number</label>
            <input type="text" required value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-ui font-semibold text-ayush-forest mb-1">Preferred Date</label>
              <input type="date" required value={preferredDate} onChange={e => setPreferredDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-xs" />
            </div>
            <div>
              <label className="block text-xs font-ui font-semibold text-ayush-forest mb-1">Preferred Time</label>
              <select value={preferredTime} onChange={e => setPreferredTime(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-xs">
                <option value="10:00 AM">10:00 AM</option>
                <option value="12:00 PM">12:00 PM</option>
                <option value="03:00 PM">03:00 PM</option>
                <option value="05:00 PM">05:00 PM</option>
                <option value="07:00 PM">07:00 PM</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Health Concern / Reason</label>
            <textarea required value={concern} onChange={e => setConcern(e.target.value)} rows={3}
              placeholder="Describe your symptoms or what you'd like to consult about..."
              className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/40 font-ui text-sm resize-none" />
          </div>
          <Button type="submit" variant="primary" className="w-full justify-center py-3" disabled={submitting}>
            {submitting ? 'Submitting Request...' : 'Submit Appointment Request'}
          </Button>
        </form>
      </div>
    </div>
  );
};

const DoctorProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { isSignedIn } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [similar, setSimilar] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);
  const [liked, setLiked] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<DoctorReview[]>([]);
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmittedMsg, setReviewSubmittedMsg] = useState('');

  // Auth Guard Modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authActionName, setAuthActionName] = useState('');

  const requireAuth = (action: string, callback?: () => void) => {
    if (!isSignedIn) {
      setAuthActionName(action);
      setAuthModalOpen(true);
      return false;
    }
    if (callback) callback();
    return true;
  };

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!id) return;
      setLoading(true);

      const [doc, allDocs] = await Promise.all([
        getDoctorById(id),
        getApprovedDoctors()
      ]);

      if (!isMounted) return;

      setDoctor(doc);
      if (doc && allDocs) {
        setSimilar(allDocs.filter(d => String(d.id) !== String(id) && (d.system || '').toLowerCase() === (doc.system || '').toLowerCase()).slice(0, 3));
        setReviews(getDoctorReviews(doc.id));
      }
      setLoading(false);
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requireAuth('submit a review')) return;
    if (!doctor || !comment.trim()) return;
    const updated = addDoctorReview(
      doctor.id,
      reviewerName.trim() || 'Anonymous Patient',
      rating,
      comment.trim()
    );
    setReviews(updated);
    setComment('');
    setReviewerName('');
    setReviewSubmittedMsg('Thank you! Your review has been added.');
    setTimeout(() => setReviewSubmittedMsg(''), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ayush-cream flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-ayush-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-ayush-cream flex flex-col items-center justify-center gap-4">
        <Stethoscope className="w-16 h-16 text-ayush-forest/30" />
        <h1 className="text-2xl font-display font-bold text-ayush-forest">Practitioner Not Found</h1>
        <Link to="/consult" className="text-ayush-gold hover:underline font-ui">← Back to Consultation</Link>
      </div>
    );
  }

  if (doctor.status === 'pending' || doctor.status === 'rejected') {
    return (
      <div className="min-h-screen bg-ayush-cream flex flex-col items-center justify-center p-6 text-center">
        <Clock className="w-16 h-16 text-amber-600/70 mb-4 animate-pulse" />
        <h1 className="text-2xl font-display font-bold text-ayush-forest mb-2">Profile Pending Admin Approval</h1>
        <p className="font-body text-sm text-ayush-charcoal/70 max-w-md mb-6">
          This doctor's consultation profile is currently under review by the Ayushline® Admin panel. It will go live once verified and approved.
        </p>
        <Link to="/consult" className="px-6 py-2.5 bg-ayush-forest text-white rounded-xl font-ui text-sm font-bold shadow-md hover:bg-ayush-forest/90 transition-all">
          ← Back to Consultation Directory
        </Link>
      </div>
    );
  }

  const whatsappNum = (doctor.whatsapp || doctor.phone || '919876543210').replace(/[^0-9]/g, '');
  const systemKey = (doctor.system || 'Ayurveda').toLowerCase().replace(' therapy', '').trim();
  const systemColor = SYSTEM_COLORS[systemKey] || 'bg-ayush-forest/10 text-ayush-forest';

  return (
    <div className="bg-ayush-cream min-h-screen">
      <AuthRequiredModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        actionName={authActionName}
      />

      {showBooking && <BookingModal doctor={doctor} onClose={() => setShowBooking(false)} />}

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-ayush-forest via-slate-800 to-emerald-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <Link to="/consult" className="inline-flex items-center text-ayush-ivory/70 hover:text-white text-sm font-ui mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Consultation Directory
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
            {/* Profile Photo */}
            <div className="relative flex-shrink-0">
              <img
                src={doctor.image || doctor.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=2d5a27&color=fff&size=200`}
                alt={doctor.name}
                className="w-36 h-36 rounded-3xl object-cover border-4 border-ayush-gold shadow-xl"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.onerror = null;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doctor.name)}&background=2d5a27&color=fff&size=200`;
                }}
              />
              <span className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-bold ${systemColor}`}>
                {doctor.system}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex flex-wrap items-start gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-display font-bold">{doctor.name}</h1>
                <Shield className="w-6 h-6 text-ayush-gold mt-1" />
              </div>
              <p className="text-lg text-ayush-ivory/80 font-body mb-3">{doctor.specialization}</p>

              <div className="flex flex-wrap gap-4 text-sm font-ui text-ayush-ivory/70 mb-4">
                {doctor.qualification && (
                  <span className="flex items-center gap-1"><Award className="w-4 h-4 text-ayush-gold" />{doctor.qualification}</span>
                )}
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-ayush-gold" />{doctor.experience_years || doctor.experience} Yrs Exp</span>
                {doctor.city && <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-ayush-gold" />{doctor.city}</span>}
                {doctor.clinic_name && <span className="flex items-center gap-1"><Stethoscope className="w-4 h-4 text-ayush-gold" />{doctor.clinic_name}</span>}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-white">{doctor.rating || '4.8'}</span>
                  <span className="text-ayush-ivory/60 text-xs">({doctor.total_reviews || 47} reviews)</span>
                </div>
                {doctor.consultation_fee && (
                  <div className="bg-ayush-gold/20 px-3 py-1.5 rounded-full text-ayush-gold font-bold text-sm">
                    Consultation: {doctor.consultation_fee}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 w-full md:w-auto">
              <button
                onClick={() => requireAuth('book an appointment', () => setShowBooking(true))}
                className="px-8 py-3.5 bg-ayush-gold text-ayush-forest font-ui font-bold rounded-2xl hover:bg-white transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <Calendar className="w-5 h-5" /> Book Appointment
              </button>
              <a
                href={`https://wa.me/${whatsappNum}?text=Hello%20${encodeURIComponent(doctor.name)}%2C%20I%20found%20your%20profile%20on%20AYUSHLINE%20and%20would%20like%20to%20consult%20you.`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  if (!requireAuth('contact doctor on WhatsApp')) {
                    e.preventDefault();
                  }
                }}
                className="px-8 py-3.5 bg-emerald-600 text-white font-ui font-bold rounded-2xl hover:bg-emerald-500 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-5 h-5" /> WhatsApp Direct
              </a>
              <div className="flex gap-2">
                <button
                  onClick={() => setLiked(!liked)}
                  className={`flex-1 py-2.5 rounded-xl border font-ui text-sm font-semibold flex items-center justify-center gap-1.5 transition-all ${liked ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-red-500' : ''}`} /> {liked ? 'Saved' : 'Save'}
                </button>
                <button
                  onClick={() => navigator.share ? navigator.share({ title: doctor.name, url: window.location.href }) : navigator.clipboard.writeText(window.location.href)}
                  className="flex-1 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white font-ui text-sm font-semibold hover:bg-white/20 flex items-center justify-center gap-1.5 transition-all"
                >
                  <Share2 className="w-4 h-4" /> Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left — Bio & Details */}
          <div className="lg:col-span-2 space-y-8">

            {/* About */}
            {doctor.bio && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-ayush-charcoal/10">
                <h2 className="text-2xl font-display font-bold text-ayush-forest mb-4 flex items-center gap-2">
                  <Stethoscope className="w-6 h-6 text-ayush-gold" /> About the Practitioner
                </h2>
                <p className="font-body text-ayush-charcoal/80 leading-relaxed text-base">{doctor.bio}</p>
              </div>
            )}

            {/* Expertise / Conditions Treated */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-ayush-charcoal/10">
              <h2 className="text-2xl font-display font-bold text-ayush-forest mb-5">Conditions Treated</h2>
              <div className="flex flex-wrap gap-2">
                {(doctor.expertise || CONDITION_TAGS.slice(0, 8)).map((tag, i) => (
                  <span key={i} className="px-4 py-2 bg-ayush-sage/50 text-ayush-forest rounded-full text-sm font-ui font-semibold border border-ayush-forest/10 capitalize">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Patient Reviews Section (JustDial style) */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-ayush-charcoal/10 space-y-6">
              <div className="flex items-center justify-between border-b border-ayush-charcoal/10 pb-4">
                <h2 className="text-2xl font-display font-bold text-ayush-forest flex items-center gap-2">
                  <Star className="w-6 h-6 text-ayush-gold fill-ayush-gold" /> Patient Reviews & Ratings
                </h2>
                <span className="text-sm font-ui font-bold text-ayush-forest bg-ayush-sage/40 px-3 py-1 rounded-full">
                  {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>

              {/* Reviews List */}
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="p-5 rounded-2xl bg-ayush-cream/60 border border-ayush-charcoal/5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-display font-bold text-ayush-forest text-base">{r.patientName || (r as any).reviewer_name || 'Verified Patient'}</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`w-4 h-4 ${j < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                        <span className="text-xs text-ayush-charcoal/50 font-ui ml-2">{r.createdAt || (r as any).created_at || 'Recently'}</span>
                      </div>
                    </div>
                    <p className="font-body text-sm text-ayush-charcoal/80">"{r.comment}"</p>
                  </div>
                ))}
              </div>

              {/* Add Review Form */}
              <div className="pt-6 border-t border-ayush-charcoal/10">
                <h3 className="font-display font-bold text-lg text-ayush-forest mb-3">Leave a Consultation Review</h3>
                <form onSubmit={handleAddReview} className="space-y-4 bg-ayush-cream/40 p-5 rounded-2xl border border-ayush-forest/10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-ui font-semibold text-ayush-forest mb-1">Your Name</label>
                      <input
                        type="text"
                        value={reviewerName}
                        onChange={(e) => setReviewerName(e.target.value)}
                        placeholder="e.g. Rahul Verma"
                        className="w-full px-3 py-2 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-white font-ui text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-ui font-semibold text-ayush-forest mb-1">Rating</label>
                      <select
                        value={rating}
                        onChange={(e) => setRating(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-white font-ui text-sm"
                      >
                        <option value={5}>⭐⭐⭐⭐⭐ 5 Stars (Excellent)</option>
                        <option value={4}>⭐⭐⭐⭐ 4 Stars (Very Good)</option>
                        <option value={3}>⭐⭐⭐ 3 Stars (Average)</option>
                        <option value={2}>⭐⭐ 2 Stars (Poor)</option>
                        <option value={1}>⭐ 1 Star (Very Bad)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-ui font-semibold text-ayush-forest mb-1">Your Feedback / Review</label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={3}
                      placeholder="Share your experience with Dr. consultation, treatment advice, and diagnosis..."
                      className="w-full px-3 py-2 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-white font-ui text-sm resize-none"
                      required
                    ></textarea>
                  </div>

                  {reviewSubmittedMsg && (
                    <p className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                      {reviewSubmittedMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="py-2.5 px-6 bg-ayush-forest text-white font-ui font-bold rounded-xl hover:bg-ayush-gold hover:text-ayush-forest transition-colors text-xs flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Review
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">

            {/* Quick Info Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-ayush-charcoal/10">
              <h3 className="text-lg font-display font-bold text-ayush-forest mb-4">Practitioner Info</h3>
              <div className="space-y-3 text-sm font-ui">
                <div className="flex justify-between items-center py-2 border-b border-ayush-charcoal/5">
                  <span className="text-ayush-charcoal/60">System</span>
                  <span className="font-semibold text-ayush-forest capitalize">{doctor.system}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-ayush-charcoal/5">
                  <span className="text-ayush-charcoal/60">Qualification</span>
                  <span className="font-semibold text-ayush-forest">{doctor.qualification || 'BAMS'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-ayush-charcoal/5">
                  <span className="text-ayush-charcoal/60">Experience</span>
                  <span className="font-semibold text-ayush-forest">{doctor.experience_years || doctor.experience} Years</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-ayush-charcoal/5">
                  <span className="text-ayush-charcoal/60">Location</span>
                  <span className="font-semibold text-ayush-forest">{doctor.city || 'India'}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-ayush-charcoal/60">Fee</span>
                  <span className="font-bold text-ayush-gold text-base">{doctor.consultation_fee || 'Contact'}</span>
                </div>
              </div>
              <button
                onClick={() => requireAuth('book an appointment', () => setShowBooking(true))}
                className="mt-5 w-full py-3 bg-ayush-forest text-white rounded-2xl font-ui font-semibold hover:bg-ayush-gold hover:text-ayush-forest transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" /> Book Now
              </button>
            </div>

            {/* Contact */}
            {whatsappNum && (
              <div className="bg-emerald-50 rounded-3xl p-6 border border-emerald-200">
                <h3 className="text-lg font-display font-bold text-emerald-800 mb-2">Direct Contact</h3>
                <p className="text-sm text-emerald-700 font-body mb-4">Chat directly with {doctor.name.trim().split(/\s+/)[0] || doctor.name} on WhatsApp.</p>
                <a
                  href={`https://wa.me/${whatsappNum}?text=Hello%20${encodeURIComponent(doctor.name)}%2C%20I%20found%20your%20profile%20on%20AYUSHLINE.%20I%20would%20like%20to%20know%20more%20about%20your%20consultation.`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    if (!requireAuth('contact doctor on WhatsApp')) {
                      e.preventDefault();
                    }
                  }}
                  className="w-full py-3 bg-emerald-600 text-white rounded-2xl font-ui font-semibold flex items-center justify-center gap-2 hover:bg-emerald-700 transition-colors"
                >
                  <Phone className="w-4 h-4" /> Open WhatsApp
                </a>
              </div>
            )}

            {/* Similar Practitioners */}
            {similar.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-ayush-charcoal/10">
                <h3 className="text-lg font-display font-bold text-ayush-forest mb-4">Similar Practitioners</h3>
                <div className="space-y-4">
                  {similar.map(doc => (
                    <Link key={doc.id} to={`/doctor/${doc.id}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-ayush-cream transition-colors group">
                      <img
                        src={doc.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=2d5a27&color=fff`}
                        alt={doc.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-ayush-forest/20"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.onerror = null;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=2d5a27&color=fff`;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-ui font-bold text-ayush-forest text-sm truncate">{doc.name}</p>
                        <p className="text-xs text-ayush-charcoal/60 font-ui truncate">{doc.specialization}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold text-ayush-charcoal/80">{doc.rating || '4.8'}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-ayush-charcoal/30 group-hover:text-ayush-gold transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                </div>
                <Link to="/consult" className="mt-4 w-full py-2.5 rounded-xl border border-ayush-forest/20 text-ayush-forest font-ui font-semibold text-sm flex items-center justify-center gap-1.5 hover:bg-ayush-sage transition-colors">
                  View All Practitioners
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfile;
