import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MessageSquare, Search, User, Star, Clock, Activity, Wand2, ArrowRight, Mic, MicOff, X, Phone, Eye } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { getApprovedDoctors, type Doctor } from '../lib/api/doctors';
import { getApprovedDiscussions, createDiscussion, type Discussion } from '../lib/api/discussions';
import { createAppointment } from '../lib/api/appointments';
import { getRepliesForDiscussion, createReply, type DiscussionReply } from '../lib/api/discussionReplies';

// Voice Recognition setup
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const Consult = () => {
  const [activeTab, setActiveTab] = useState<'book' | 'discuss' | 'match'>('book');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [newComment, setNewComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Smart Match State
  const [symptoms, setSymptoms] = useState('');
  const [matchedDoctor, setMatchedDoctor] = useState<any>(null);
  const [isMatching, setIsMatching] = useState(false);

  // Appointment Booking State
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingTime, setBookingTime] = useState('');
  const [bookingMessage, setBookingMessage] = useState('');
  const [bookingResult, setBookingResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Discussion Replies State
  const [replyingTo, setReplyingTo] = useState<Discussion | null>(null);
  const [replyText, setReplyText] = useState('');
  const [repliesMap, setRepliesMap] = useState<Record<string | number, DiscussionReply[]>>({});

  // Voice Recognition States
  const [isListeningMatch, setIsListeningMatch] = useState(false);
  const [isListeningDiscuss, setIsListeningDiscuss] = useState(false);
  const [recognitionMatch, setRecognitionMatch] = useState<any>(null);
  const [recognitionDiscuss, setRecognitionDiscuss] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const docsData = await getApprovedDoctors();
      setDoctors(docsData);

      const discData = await getApprovedDiscussions();
      setDiscussions(discData);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (SpeechRecognition) {
      // Setup for Match
      const recMatch = new SpeechRecognition();
      recMatch.continuous = false;
      recMatch.interimResults = false;
      recMatch.lang = 'en-US';

      recMatch.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSymptoms(prev => prev ? prev + ' ' + transcript : transcript);
        setIsListeningMatch(false);
      };
      
      recMatch.onerror = () => setIsListeningMatch(false);
      recMatch.onend = () => setIsListeningMatch(false);
      setRecognitionMatch(recMatch);

      // Setup for Discuss
      const recDiscuss = new SpeechRecognition();
      recDiscuss.continuous = false;
      recDiscuss.interimResults = false;
      recDiscuss.lang = 'en-US';

      recDiscuss.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setNewComment(prev => {
          const newText = prev ? prev + ' ' + transcript : transcript;
          const lines = newText.split('\n');
          return lines.length <= 10 ? newText : prev; // respect 10 line limit
        });
        setIsListeningDiscuss(false);
      };
      
      recDiscuss.onerror = () => setIsListeningDiscuss(false);
      recDiscuss.onend = () => setIsListeningDiscuss(false);
      setRecognitionDiscuss(recDiscuss);
    }
  }, []);

  const toggleListenMatch = () => {
    if (isListeningMatch) {
      recognitionMatch?.stop();
      setIsListeningMatch(false);
    } else {
      recognitionMatch?.start();
      setIsListeningMatch(true);
    }
  };

  const toggleListenDiscuss = () => {
    if (isListeningDiscuss) {
      recognitionDiscuss?.stop();
      setIsListeningDiscuss(false);
    } else {
      recognitionDiscuss?.start();
      setIsListeningDiscuss(true);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const lines = text.split('\n');
    if (lines.length <= 10) {
      setNewComment(text);
    }
  };

  const handlePostDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTopic.trim() && newComment.trim()) {
      const res = await createDiscussion(newTopic, newComment);
      if (res.success && res.data) {
        setDiscussions([res.data, ...discussions]);
        setNewTopic('');
        setNewComment('');
      }
    }
  };

  const handleSmartMatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    
    setIsMatching(true);
    setMatchedDoctor(null);

    // Simulate AI match delay
    setTimeout(() => {
      const lowerSymptoms = symptoms.toLowerCase();
      // Find a doctor whose expertise or specialization matches keywords in symptoms
      let found = doctors.find(doc => {
        const specs = doc.specialization ? doc.specialization.toLowerCase() : '';
        const exps = doc.expertise ? doc.expertise.join(' ').toLowerCase() : '';
        return specs.includes(lowerSymptoms) || exps.includes(lowerSymptoms) || lowerSymptoms.includes(doc.system.toLowerCase());
      });
      
      // Fallback to first doctor if no direct match
      if (!found && doctors.length > 0) {
        found = doctors[0];
      }

      setMatchedDoctor(found);
      setIsMatching(false);
    }, 1200);
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingDoctor) return;
    setIsBooking(true);
    setBookingResult(null);
    const res = await createAppointment({
      doctor_id: bookingDoctor.id.toString(),
      patient_name: 'Guest User',
      preferred_date: bookingDate,
      preferred_time: bookingTime,
      message: bookingMessage,
    });
    setBookingResult(res);
    setIsBooking(false);
    if (res.success) {
      setBookingDate('');
      setBookingTime('');
      setBookingMessage('');
    }
  };

  const handleOpenBooking = (doc: Doctor) => {
    setBookingDoctor(doc);
    setBookingResult(null);
    setBookingDate('');
    setBookingTime('');
    setBookingMessage('');
  };

  const handleCloseBooking = () => {
    setBookingDoctor(null);
    setBookingResult(null);
  };

  const handleShowReplies = async (post: Discussion) => {
    setReplyingTo(post);
    setReplyText('');
    if (!repliesMap[post.id]) {
      const replies = await getRepliesForDiscussion(post.id);
      setRepliesMap(prev => ({ ...prev, [post.id]: replies }));
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingTo || !replyText.trim()) return;
    const res = await createReply(replyingTo.id, 'Guest User', replyText);
    if (res.success && res.data) {
      setRepliesMap(prev => ({
        ...prev,
        [replyingTo.id]: [...(prev[replyingTo.id] || []), res.data!]
      }));
      setReplyText('');
    }
  };

  const filteredDoctors = doctors.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.system.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-ayush-cream min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-ayush-forest mb-4">
            Consult & Connect
          </h1>
          <p className="font-body text-ayush-charcoal/80 text-lg max-w-2xl mx-auto">
            Find the right practitioner, book an appointment, or discuss your health concerns with the community.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <div className="bg-white rounded-full shadow-md p-1 inline-flex overflow-x-auto">
            <button
              onClick={() => setActiveTab('book')}
              className={`flex items-center px-6 py-3 rounded-full font-ui font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'book' ? 'bg-ayush-forest text-white' : 'text-ayush-charcoal/70 hover:text-ayush-forest'
              }`}
            >
              <Calendar className="w-5 h-5 mr-2" />
              Book a Doctor
            </button>
            <button
              onClick={() => setActiveTab('match')}
              className={`flex items-center px-6 py-3 rounded-full font-ui font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'match' ? 'bg-ayush-forest text-white' : 'text-ayush-charcoal/70 hover:text-ayush-forest'
              }`}
            >
              <Wand2 className="w-5 h-5 mr-2" />
              Smart Match
            </button>
            <button
              onClick={() => setActiveTab('discuss')}
              className={`flex items-center px-6 py-3 rounded-full font-ui font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'discuss' ? 'bg-ayush-forest text-white' : 'text-ayush-charcoal/70 hover:text-ayush-forest'
              }`}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Discussion Forum
            </button>
          </div>
        </div>

        {/* Smart Match Section */}
        {activeTab === 'match' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-ayush-forest/10 mb-8 text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-ayush-sage text-ayush-forest flex items-center justify-center mx-auto mb-6">
                <Activity className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-display font-bold text-ayush-forest mb-4">
                Not sure who to consult?
              </h2>
              <p className="font-body text-ayush-charcoal/80 mb-8 max-w-xl mx-auto">
                Tell us about your disease, symptoms, or what you're feeling. You can type or use your voice. Our system will automatically connect you with the most specialized AYUSH practitioner.
              </p>
              
              <form onSubmit={handleSmartMatch} className="space-y-4 max-w-2xl mx-auto relative">
                <div className="relative">
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={4}
                    className="w-full pl-5 pr-14 py-4 rounded-2xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui resize-none text-lg"
                    placeholder="e.g. I have been suffering from severe back pain..."
                    required
                  ></textarea>
                  
                  {/* Voice Button */}
                  {SpeechRecognition && (
                    <button 
                      type="button" 
                      onClick={toggleListenMatch}
                      className={`absolute right-3 top-4 p-2 rounded-full transition-all ${isListeningMatch ? 'bg-red-100 text-red-500 animate-pulse' : 'bg-ayush-sage text-ayush-forest hover:bg-ayush-gold/20'}`}
                      title={isListeningMatch ? "Listening..." : "Click to speak"}
                    >
                      {isListeningMatch ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                  )}
                </div>
                
                <Button variant="primary" type="submit" className="w-full justify-center py-4 text-lg" disabled={isMatching}>
                  {isMatching ? 'Finding the right specialist...' : 'Find My Specialist'}
                </Button>
              </form>
            </div>

            {/* Match Result */}
            {matchedDoctor && (
              <div className="bg-ayush-sage rounded-3xl p-8 shadow-md border border-ayush-gold/30 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
                <img
                  src={matchedDoctor.image || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80'}
                  alt={matchedDoctor.name}
                  className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(matchedDoctor.name)}&background=2d5a27&color=fff&size=200`;
                  }}
                />
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-ayush-forest/10 text-ayush-forest font-ui text-xs font-bold uppercase tracking-wider mb-2">
                    Best Match Found
                  </div>
                  <h3 className="text-2xl font-display font-bold text-ayush-forest mb-1">{matchedDoctor.name}</h3>
                  <p className="text-ayush-gold font-semibold font-ui text-sm mb-3">{matchedDoctor.system} Specialist</p>
                  
                  <div className="flex items-center justify-center md:justify-start space-x-4 text-sm text-ayush-charcoal/70 mb-6">
                    <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {matchedDoctor.experience}</span>
                    <span className="flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-500" /> {matchedDoctor.rating}</span>
                  </div>
                  
                  <Button variant="primary" className="inline-flex items-center">
                    Connect Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Book a Doctor Section */}
        {activeTab === 'book' && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <h2 className="text-2xl font-display font-bold text-ayush-forest">Available Practitioners</h2>
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name or specialty..."
                  className="w-full pl-10 pr-4 py-3 rounded-full border border-ayush-forest/20 focus:outline-none focus:ring-2 focus:ring-ayush-gold font-ui"
                />
                <Search className="absolute left-4 top-3.5 text-ayush-charcoal/40 w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredDoctors.map((doc) => (
                <div key={doc.id} className="bg-white rounded-2xl p-6 shadow-sm border border-ayush-forest/5 hover:shadow-md transition-all flex flex-col justify-between">
                  <div>
                    <Link to={`/doctor/${doc.id}`} className="block group">
                      <img
                        src={doc.image || `https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80`}
                        alt={doc.name}
                        className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-ayush-gold/30 object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name)}&background=2d5a27&color=fff&size=200`;
                        }}
                      />
                      <div className="text-center">
                        <h3 className="font-display font-bold text-xl text-ayush-forest mb-1 group-hover:text-ayush-gold transition-colors">{doc.name}</h3>
                        <p className="text-ayush-gold font-semibold font-ui text-sm mb-3">{doc.system} ({doc.specialization})</p>
                      </div>
                    </Link>
                    
                    <div className="flex items-center justify-center space-x-4 text-sm text-ayush-charcoal/70 mb-6">
                      <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {doc.experience || `${doc.experience_years} Years`}</span>
                      <span className="flex items-center"><Star className="w-4 h-4 mr-1 text-yellow-500" /> {doc.rating || 4.8}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Link
                      to={`/doctor/${doc.id}`}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-ayush-forest text-white rounded-xl font-ui font-semibold text-sm hover:bg-ayush-gold hover:text-ayush-forest transition-colors shadow-xs"
                    >
                      <Eye className="w-4 h-4" /> View Full Profile
                    </Link>
                    <Button variant="secondary" className="w-full justify-center text-xs py-2" onClick={() => handleOpenBooking(doc)}>
                      Book Appointment
                    </Button>
                    {doc.whatsapp && (
                      <a
                        href={`https://wa.me/${doc.whatsapp.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(doc.name)},%20I%20found%20your%20profile%20on%20AYUSHLINE%20and%20would%20like%20to%20consult%20you.`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-2 bg-emerald-600 text-white rounded-xl font-ui font-semibold text-xs hover:bg-emerald-700 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5" /> WhatsApp Direct
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Booking Modal */}
        {bookingDoctor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-ayush-forest/10 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-display font-bold text-ayush-forest">Book Appointment</h3>
                <button onClick={handleCloseBooking} className="text-ayush-charcoal/50 hover:text-ayush-charcoal">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="flex items-center space-x-4 mb-6">
                <img
                  src={bookingDoctor.image || `https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80`}
                  alt={bookingDoctor.name}
                  className="w-16 h-16 rounded-full border-2 border-ayush-gold/30 object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(bookingDoctor.name)}&background=2d5a27&color=fff&size=200`;
                  }}
                />
                <div>
                  <p className="font-display font-bold text-lg text-ayush-forest">{bookingDoctor.name}</p>
                  <p className="text-sm font-ui text-ayush-gold">{bookingDoctor.system} — {bookingDoctor.specialization}</p>
                </div>
              </div>
              <form onSubmit={handleBookAppointment} className="space-y-4">
                <div>
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={bookingDate}
                    onChange={(e) => setBookingDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Preferred Time</label>
                  <input
                    type="time"
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Message (optional)</label>
                  <textarea
                    value={bookingMessage}
                    onChange={(e) => setBookingMessage(e.target.value)}
                    rows={3}
                    placeholder="Describe your concern or preferred consultation type..."
                    className="w-full px-4 py-3 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-ayush-ivory/50 font-ui resize-none"
                  ></textarea>
                </div>
                {bookingResult && (
                  <div className={`px-4 py-3 rounded-xl text-sm font-ui ${bookingResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {bookingResult.message}
                  </div>
                )}
                <Button type="submit" variant="primary" className="w-full justify-center py-3" disabled={isBooking}>
                  {isBooking ? 'Booking...' : 'Confirm Booking'}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Discussion Forum Section */}
        {activeTab === 'discuss' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Discussion List */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-display font-bold text-ayush-forest mb-6">Recent Discussions</h2>
              {discussions.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl p-6 shadow-sm border border-ayush-forest/5">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-ayush-sage flex items-center justify-center">
                      <User className="w-5 h-5 text-ayush-forest" />
                    </div>
                    <div>
                      <p className="font-ui font-semibold text-ayush-forest">{post.user}</p>
                      <p className="text-xs text-ayush-charcoal/60">Posted recently</p>
                    </div>
                  </div>
                  <h3 className="font-display font-bold text-xl text-ayush-forest mb-2">{post.topic}</h3>
                  <p className="font-body text-ayush-charcoal/80 mb-4 whitespace-pre-wrap">{post.text}</p>
                  <button
                    onClick={() => handleShowReplies(post)}
                    className="flex items-center text-sm text-ayush-gold font-semibold hover:text-ayush-forest transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    {(post.replies || 0) + (repliesMap[post.id]?.length || 0)} Replies
                  </button>

                  {/* Replies Section */}
                  {replyingTo?.id === post.id && (
                    <div className="mt-4 pt-4 border-t border-ayush-charcoal/10">
                      {repliesMap[post.id]?.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {repliesMap[post.id].map((reply) => (
                            <div key={reply.id} className="bg-ayush-sage/50 rounded-xl p-4">
                              <div className="flex items-center space-x-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-ayush-gold/30 flex items-center justify-center">
                                  <User className="w-3 h-3 text-ayush-forest" />
                                </div>
                                <p className="text-xs font-ui font-semibold text-ayush-forest">{reply.user_name}</p>
                              </div>
                              <p className="text-sm font-body text-ayush-charcoal/80">{reply.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <form onSubmit={handlePostReply} className="flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write a reply..."
                          className="flex-1 px-4 py-2 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-white font-ui text-sm"
                          required
                        />
                        <Button type="submit" variant="primary" className="px-4 py-2 text-sm">Reply</Button>
                      </form>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Post a Problem Form */}
            <div className="lg:col-span-1">
              <div className="bg-ayush-sage rounded-2xl p-6 sticky top-24">
                <h3 className="font-display font-bold text-xl text-ayush-forest mb-4">Ask the Community</h3>
                <form onSubmit={handlePostDiscussion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1">Topic / Subject</label>
                    <input
                      type="text"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="e.g. Back pain remedies"
                      className="w-full px-4 py-2 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-white font-ui text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-ui font-semibold text-ayush-forest mb-1 flex justify-between">
                      <span>Describe your problem</span>
                      <span className="text-xs text-ayush-charcoal/50">Max 10 lines</span>
                    </label>
                    <div className="relative">
                      <textarea
                        value={newComment}
                        onChange={handleCommentChange}
                        rows={5}
                        placeholder="Share your concerns here..."
                        className="w-full px-4 py-3 pr-10 rounded-xl border border-ayush-forest/20 focus:ring-2 focus:ring-ayush-gold bg-white font-ui text-sm resize-none"
                        required
                      ></textarea>
                      
                      {/* Voice Button */}
                      {SpeechRecognition && (
                        <button 
                          type="button" 
                          onClick={toggleListenDiscuss}
                          className={`absolute right-2 bottom-3 p-1.5 rounded-full transition-all ${isListeningDiscuss ? 'bg-red-100 text-red-500 animate-pulse' : 'text-ayush-forest/50 hover:bg-ayush-sage hover:text-ayush-forest'}`}
                          title={isListeningDiscuss ? "Listening..." : "Click to speak"}
                        >
                          {isListeningDiscuss ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-ayush-charcoal/50 mt-1 text-right">
                      Lines: {newComment.split('\n').length}/10
                    </p>
                  </div>
                  <Button variant="primary" className="w-full justify-center" type="submit">
                    Post Discussion
                  </Button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consult;
