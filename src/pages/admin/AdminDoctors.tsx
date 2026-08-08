import React, { useEffect, useState } from 'react';
import { type Doctor, getAllDoctorsAdmin, updateDoctorStatus, deleteDoctor } from '../../lib/api/doctors';
import { Check, X, Stethoscope, MapPin, Award, Trash2 } from 'lucide-react';

const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const loadDoctors = async () => {
    setLoading(true);
    const data = await getAllDoctorsAdmin();
    setDoctors(data);
    setLoading(false);
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleStatusChange = async (id: string | number, status: 'approved' | 'rejected') => {
    await updateDoctorStatus(id.toString(), status);
    setDoctors(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  const handleDeleteDoctor = async (id: string | number) => {
    if (!window.confirm('Are you sure you want to delete this doctor?')) return;
    await deleteDoctor(id);
    setDoctors(prev => prev.filter(d => d.id !== id));
  };

  const filteredDoctors = doctors.filter(d => filter === 'all' || d.status === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-ayush-forest">Doctor Approvals</h1>
          <p className="text-ayush-charcoal/70 font-body text-sm mt-1">Review practitioner applications to grant official verification.</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2 bg-white p-1 rounded-full border border-ayush-forest/10 shadow-sm self-start">
          {(['all', 'pending', 'approved', 'rejected'] as const).map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-ui font-semibold capitalize transition-all ${
                filter === type ? 'bg-ayush-forest text-white' : 'text-ayush-charcoal/70 hover:text-ayush-forest'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-ayush-charcoal/60 font-ui">Loading doctor applications...</div>
      ) : filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-ayush-forest/10 text-ayush-charcoal/60 font-ui">
          No doctor applications found for filter "{filter}".
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDoctors.map(doctor => (
            <div key={doctor.id} className="bg-white rounded-2xl p-6 border border-ayush-forest/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-xl font-display font-bold text-ayush-forest">{doctor.name}</h3>
                  <span className={`px-3 py-0.5 rounded-full text-xs font-ui font-semibold capitalize ${
                    doctor.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    doctor.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {doctor.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs font-ui text-ayush-charcoal/70">
                  <span className="flex items-center"><Stethoscope className="w-3.5 h-3.5 mr-1 text-ayush-gold" /> {doctor.system} ({doctor.specialization})</span>
                  {doctor.city && <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-ayush-gold" /> {doctor.city}</span>}
                  <span className="flex items-center"><Award className="w-3.5 h-3.5 mr-1 text-ayush-gold" /> {doctor.experience_years || doctor.experience} Experience</span>
                </div>

                {doctor.bio && (
                  <p className="font-body text-sm text-ayush-charcoal/80 line-clamp-2">{doctor.bio}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 flex-shrink-0">
                {doctor.status !== 'approved' && (
                  <button
                    onClick={() => handleStatusChange(doctor.id, 'approved')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-ui text-xs font-semibold flex items-center shadow-sm transition-all"
                  >
                    <Check className="w-4 h-4 mr-1" /> Approve
                  </button>
                )}
                {doctor.status !== 'rejected' && (
                  <button
                    onClick={() => handleStatusChange(doctor.id, 'rejected')}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-ui text-xs font-semibold flex items-center shadow-sm transition-all"
                  >
                    <X className="w-4 h-4 mr-1" /> Reject
                  </button>
                )}
                <button
                  onClick={() => handleDeleteDoctor(doctor.id)}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-ui text-xs font-semibold flex items-center shadow-sm transition-all"
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
