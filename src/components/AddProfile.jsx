import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Loader2, ClipboardList, User, MessageCircle } from 'lucide-react';

const AddProfile = () => {
  const navigate = useNavigate();
  
  // Configuration for Default Templates
  const defaultPersonalTags = ["Age", "Caste", "City", "Education", "Height", "Occupation", "Sect"].sort();
  const defaultReqTags = ["Age", "City", "Education", "Height", "Requirement"].sort();

  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [whatsapp, setWhatsapp] = useState('');
  
  // Pre-load the attributes and requirements with empty values (The Template)
  const [attributes, setAttributes] = useState(defaultPersonalTags.map(t => ({ tag: t, value: '' })));
  const [requirements, setRequirements] = useState(defaultReqTags.map(t => ({ tag: t, value: '' })));
  
  const [images, setImages] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      const snap = await getDocs(collection(db, "profiles"));
      const tags = new Set([...defaultPersonalTags, ...defaultReqTags]);
      snap.forEach(doc => {
        doc.data().attributes?.forEach(a => tags.add(a.tag));
        doc.data().partnerRequirements?.forEach(a => tags.add(a.tag));
      });
      // Always keep the list alphabetical
      setExistingTags(Array.from(tags).sort());
    };
    fetchTags();
  }, []);

  const removeRow = (index, list, setList) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleAddTag = (list, setList, tag = '') => {
    // Add new tag and sort the whole list alphabetically
    const newList = [...list, { tag, value: '' }].sort((a, b) => a.tag.localeCompare(b.tag));
    setList(newList);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_DIM = 600; 
          if (width > height) {
            if (width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; }
          } else {
            if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          setImages(prev => [...prev, canvas.toDataURL('image/jpeg', 0.5)]);
        };
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return alert("Required: Name");
    setLoading(true);

    // Filter out rows where both tag and value are empty before saving
    const cleanAttributes = attributes.filter(a => a.tag || a.value);
    const cleanRequirements = requirements.filter(r => r.tag || r.value);

    try {
      await addDoc(collection(db, "profiles"), {
        name, 
        gender, 
        whatsapp, 
        attributes: cleanAttributes, 
        partnerRequirements: cleanRequirements, 
        imageUrls: images, 
        createdAt: new Date()
      });
      navigate('/');
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  // Helper to find which tags are NOT yet used in a specific section
  const getUnusedTags = (currentList) => {
    const usedTags = new Set(currentList.map(item => item.tag));
    return existingTags.filter(t => !usedTags.has(t));
  };

  return (
    <div className="w-full flex justify-center px-4 sm:px-0">
      <div className="w-full max-w-2xl p-6 sm:p-10 bg-zinc-900 border border-zinc-800 rounded-3xl sm:rounded-[2.5rem] text-white shadow-2xl my-10">
        <h2 className="text-xl sm:text-2xl font-light mb-8 text-center uppercase tracking-[0.3em]">New Entry</h2>
        
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Images */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800">
                <img src={img} className="w-full h-full object-cover" alt="" />
                <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full"><X size={12}/></button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition">
              <Camera className="text-zinc-600" />
              <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
            </label>
          </div>

          {/* 1. PERSONAL DETAILS */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800 pb-2">
              <User size={16} /><label className="text-[11px] font-bold uppercase tracking-widest">Personal Details</label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input placeholder="Name" className="w-full bg-zinc-800 p-4 rounded-2xl outline-none text-sm border border-transparent focus:border-zinc-700" onChange={e => setName(e.target.value)} />
              <div className="relative">
                <MessageCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input placeholder="WhatsApp" className="w-full bg-zinc-800 p-4 pl-12 rounded-2xl outline-none text-sm border border-transparent focus:border-zinc-700" onChange={e => setWhatsapp(e.target.value)} />
              </div>
              <select className="w-full bg-zinc-800 p-4 rounded-2xl outline-none text-sm border border-transparent focus:border-zinc-700 sm:col-span-2" onChange={e => setGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="space-y-4 pt-4">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Add Remaining Tags</label>
              <div className="flex flex-wrap gap-2">
                {getUnusedTags(attributes).map(t => (
                  <button key={t} type="button" onClick={() => handleAddTag(attributes, setAttributes, t)} className="text-[10px] px-3 py-1.5 bg-zinc-800 rounded-full border border-zinc-700 hover:border-zinc-500 transition-colors">+ {t}</button>
                ))}
                <button type="button" onClick={() => handleAddTag(attributes, setAttributes)} className="text-[10px] px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors">+ Custom</button>
              </div>
              
              <div className="space-y-3 bg-zinc-950/30 p-4 rounded-3xl border border-zinc-800/50">
                {attributes.map((attr, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={attr.tag} placeholder="Tag" className="w-1/3 bg-zinc-800 p-3 rounded-xl text-xs outline-none border border-transparent focus:border-zinc-700" onChange={e => { const next = [...attributes]; next[i].tag = e.target.value; setAttributes(next); }} />
                    <input value={attr.value} placeholder="Value" className="w-2/3 bg-zinc-800 p-3 rounded-xl text-xs outline-none border border-transparent focus:border-zinc-700" onChange={e => { const next = [...attributes]; next[i].value = e.target.value; setAttributes(next); }} />
                    <button type="button" onClick={() => removeRow(i, attributes, setAttributes)} className="text-zinc-600 hover:text-red-500 transition"><X size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. PARTNER REQUIREMENTS */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800 pb-2">
              <ClipboardList size={16} /><label className="text-[11px] font-bold uppercase tracking-widest">Partner Requirements</label>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {getUnusedTags(requirements).map(t => (
                  <button key={t} type="button" onClick={() => handleAddTag(requirements, setRequirements, t)} className="text-[10px] px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors">+ {t}</button>
                ))}
              </div>

              <div className="space-y-3 bg-zinc-950/30 p-4 rounded-3xl border border-zinc-800/50">
                {requirements.map((req, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={req.tag} placeholder="Tag" className="w-1/3 bg-zinc-800/50 p-3 rounded-xl text-xs outline-none border border-zinc-800 focus:border-zinc-700" onChange={e => { const next = [...requirements]; next[i].tag = e.target.value; setRequirements(next); }} />
                    <input value={req.value} placeholder="Requirement" className="w-2/3 bg-zinc-800/50 p-3 rounded-xl text-xs outline-none border border-zinc-800 focus:border-zinc-700" onChange={e => { const next = [...requirements]; next[i].value = e.target.value; setRequirements(next); }} />
                    <button type="button" onClick={() => removeRow(i, requirements, setRequirements)} className="text-zinc-600 hover:text-red-500 transition"><X size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button type="button" onClick={() => navigate('/')} className="flex-1 p-4 border border-zinc-800 rounded-2xl text-sm font-medium hover:bg-zinc-800 transition">Cancel</button>
            <button disabled={loading} className="flex-[2] bg-white text-black p-4 rounded-2xl font-bold flex items-center justify-center text-sm hover:bg-zinc-200 transition">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProfile;