import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { X, User, Edit2, Filter, Search, MessageCircle, Share2, ClipboardList } from 'lucide-react';

const Dashboard = () => {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [tab, setTab] = useState('Male');
  const [filterTag, setFilterTag] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "profiles"), (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProfiles(docs);
      const tags = new Set();
      docs.forEach(p => p.attributes?.forEach(attr => tags.add(attr.tag)));
      setAvailableTags(Array.from(tags));
    });
    return unsub;
  }, []);

  const filteredProfiles = profiles.filter(p => {
    const matchesGender = p.gender === tab;
    const matchesFilter = !filterTag || p.attributes?.some(attr => 
      attr.tag === filterTag && 
      attr.value.toLowerCase().includes(filterValue.toLowerCase())
    );
    return matchesGender && matchesFilter;
  });

  const openModal = (profile) => {
    setSelectedProfile(profile);
    setActiveImgIndex(0);
  };

  // --- WhatsApp Logic ---
  const openWhatsAppChat = (number) => {
    const cleanNumber = number.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const shareToWhatsApp = (profile) => {
    let text = `*PROFILE DETAILS: ${profile.name.toUpperCase()}*\n`;
    text += `Gender: ${profile.gender}\n\n`;
    
    if (profile.attributes?.length > 0) {
      text += `*Personal Information:*\n`;
      profile.attributes.forEach(attr => {
        if(attr.tag && attr.value) text += `• ${attr.tag}: ${attr.value}\n`;
      });
    }

    if (profile.partnerRequirements?.length > 0) {
      text += `\n*Partner Requirements:*\n`;
      profile.partnerRequirements.forEach(req => {
        if(req.tag && req.value) text += `• ${req.tag}: ${req.value}\n`;
      });
    }

    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Tab Switcher */}
      <div className="flex gap-4 sm:gap-8 mb-6 sm:mb-8 border-b border-zinc-900 overflow-x-auto no-scrollbar">
        {['Male', 'Female'].map(t => (
          <button 
            key={t}
            onClick={() => setTab(t)}
            className={`pb-4 text-sm font-medium transition-all whitespace-nowrap ${tab === t ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            {t} Candidates
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12 p-3 sm:p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl items-stretch sm:items-center">
        <div className="flex items-center gap-2 text-zinc-500 px-2">
          <Filter size={14} />
          <span className="text-[10px] uppercase font-bold tracking-widest">Filter</span>
        </div>
        <select 
          className="bg-zinc-800 text-sm p-2.5 sm:p-2 px-3 rounded-xl border-none outline-none text-zinc-300 min-w-[120px]"
          onChange={(e) => setFilterTag(e.target.value)}
          value={filterTag}
        >
          <option value="">All Attributes</option>
          {availableTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
        </select>
        <div className="flex-1 flex items-center bg-zinc-800 rounded-xl px-3 h-11 sm:h-auto">
          <Search size={14} className="text-zinc-500" />
          <input 
            placeholder="Search values..." 
            className="bg-transparent border-none p-2 text-sm outline-none w-full text-zinc-200"
            value={filterValue}
            onChange={(e) => setFilterValue(e.target.value)}
          />
        </div>
      </div>

      {/* Profile Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {filteredProfiles.map(profile => (
          <div 
            key={profile.id} 
            onClick={() => openModal(profile)}
            className="aspect-[4/5] bg-zinc-900 border border-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden cursor-pointer hover:border-zinc-500 transition-all group relative"
          >
            {profile.imageUrls?.[0] ? (
              <img src={profile.imageUrls[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-800"><User size={40} /></div>
            )}
            <div className="absolute bottom-0 inset-x-0 p-4 sm:p-6 bg-gradient-to-t from-black via-black/60 to-transparent">
              <h3 className="text-white font-semibold text-sm sm:text-lg truncate">{profile.name}</h3>
              <p className="text-zinc-500 text-[9px] uppercase tracking-wider mt-0.5">View Details</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-zinc-900 border-t sm:border border-zinc-800 w-full max-w-4xl rounded-t-[2rem] sm:rounded-[2.5rem] overflow-hidden relative flex flex-col md:flex-row h-[90vh] sm:h-auto max-h-[92vh] sm:max-h-[90vh]">
            
            <button onClick={() => setSelectedProfile(null)} className="absolute top-4 right-4 z-[70] p-2 bg-zinc-800/80 backdrop-blur rounded-full text-white hover:bg-zinc-700 transition"><X size={20} /></button>
            
            {/* Gallery Section */}
            <div className="w-full md:w-1/2 bg-black flex flex-col p-4 sm:p-6 border-b md:border-b-0 md:border-r border-zinc-800 h-[35vh] sm:h-auto">
              <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl bg-zinc-950 relative">
                {selectedProfile.imageUrls?.[activeImgIndex] ? (
                  <img src={selectedProfile.imageUrls[activeImgIndex]} className="max-h-full w-full object-contain" alt="profile" />
                ) : (
                  <User size={60} className="text-zinc-900" />
                )}
              </div>
              <div className="flex gap-2 mt-4 overflow-x-auto py-1 no-scrollbar shrink-0">
                {selectedProfile.imageUrls?.map((url, i) => (
                  <img key={i} src={url} onClick={() => setActiveImgIndex(i)} className={`w-10 h-10 sm:w-16 sm:h-16 object-cover rounded-lg cursor-pointer border-2 transition-all ${activeImgIndex === i ? 'border-white' : 'border-transparent opacity-40'}`} />
                ))}
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6 sm:p-10 md:w-1/2 overflow-y-auto flex-1 flex flex-col bg-zinc-900">
              <div className="flex-1">
                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl sm:text-4xl font-light text-white mb-2">{selectedProfile.name}</h2>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest bg-zinc-800 px-2 py-1 rounded-md">{selectedProfile.gender}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => shareToWhatsApp(selectedProfile)} className="p-3 bg-zinc-800 text-zinc-300 rounded-full hover:text-green-500 transition" title="Share Profile"><Share2 size={16} /></button>
                    <Link to={`/edit/${selectedProfile.id}`} className="p-3 bg-zinc-800 text-zinc-300 rounded-full hover:text-white transition"><Edit2 size={16} /></Link>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="space-y-4 mb-10">
                <div className="flex items-center gap-2 text-zinc-500 mb-4">
                    <User size={14}/><span className="text-[10px] uppercase font-bold tracking-widest">Personal Details</span>
                </div>
                {selectedProfile.attributes?.map((attr, i) => (
                    <div key={i} className="flex flex-col border-b border-zinc-800/50 pb-3 gap-1">
                    <span className="text-zinc-500 text-[9px] uppercase tracking-[0.15em] leading-none">
                        {attr.tag}
                    </span>
                    {/* text-right on desktop for balance, but wraps cleanly on mobile */}
                    <span className="text-zinc-100 font-medium text-sm sm:text-base leading-relaxed break-words">
                        {attr.value}
                    </span>
                    </div>
                ))}
                </div>

                {/* Requirements */}
                {selectedProfile.partnerRequirements?.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2 text-zinc-500 mb-4">
                    <ClipboardList size={14}/><span className="text-[10px] uppercase font-bold tracking-widest">Spouse Requirements</span>
                    </div>
                    {selectedProfile.partnerRequirements.map((req, i) => (
                    <div key={i} className="flex flex-col border-b border-zinc-800/50 pb-3 gap-1">
                        <span className="text-zinc-500 text-[9px] uppercase tracking-[0.15em] leading-none">
                        {req.tag}
                        </span>
                        <span className="text-zinc-100 font-medium text-sm sm:text-base leading-relaxed break-words">
                        {req.value}
                        </span>
                    </div>
                    ))}
                </div>
                )}
              </div>

              {/* WhatsApp CTA */}
              <div className="mt-8 space-y-3">
                {selectedProfile.whatsapp && (
                  <button 
                    onClick={() => openWhatsAppChat(selectedProfile.whatsapp)}
                    className="w-full py-4 bg-green-600 hover:bg-green-500 text-white rounded-xl sm:rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition"
                  >
                    <MessageCircle size={18} /> Chat on WhatsApp
                  </button>
                )}
                <button onClick={() => setSelectedProfile(null)} className="w-full py-4 bg-zinc-800 text-zinc-400 rounded-xl sm:rounded-2xl text-sm font-medium hover:text-white transition">Close Preview</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {filteredProfiles.length === 0 && (
        <div className="py-20 text-center text-zinc-600 border-2 border-dashed border-zinc-900 rounded-[2rem] mt-10">
          <p className="text-sm">No profiles found matching these filters.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;