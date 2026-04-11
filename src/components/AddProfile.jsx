import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Plus, Loader2, ClipboardList, User, MessageCircle } from 'lucide-react';

const AddProfile = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [whatsapp, setWhatsapp] = useState(''); // New state for WhatsApp
  const [attributes, setAttributes] = useState([{ tag: '', value: '' }]);
  const [requirements, setRequirements] = useState([]);
  const [images, setImages] = useState([]);
  const [existingTags, setExistingTags] = useState(["Age", "Height", "Caste", "Sect", "Education"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTags = async () => {
      const snap = await getDocs(collection(db, "profiles"));
      const tags = new Set(existingTags);
      snap.forEach(doc => {
        doc.data().attributes?.forEach(a => tags.add(a.tag));
        doc.data().partnerRequirements?.forEach(a => tags.add(a.tag));
      });
      setExistingTags(Array.from(tags));
    };
    fetchTags();
  }, []);

  const removeRow = (index, list, setList) => {
    setList(list.filter((_, i) => i !== index));
  };

  const handleAddData = (list, setList, tag = '') => {
    const next = [...list];
    const emptyIndex = next.findIndex(item => !item.tag && !item.value);

    if (emptyIndex !== -1 && tag) {
      next[emptyIndex].tag = tag;
      setList(next);
    } else {
      setList([...next, { tag, value: '' }]);
    }
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
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.5);
          setImages(prev => [...prev, compressedBase64]);
        };
      };
    });
  };

  const removeImage = (i) => setImages(images.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return alert("Required: Name");
    setLoading(true);
    try {
      await addDoc(collection(db, "profiles"), {
        name, 
        gender, 
        whatsapp, // Saving WhatsApp number to Firestore
        attributes, 
        partnerRequirements: requirements, 
        imageUrls: images, 
        createdAt: new Date()
      });
      navigate('/');
    } catch (err) { alert(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="w-full flex justify-center px-4 sm:px-0">
      <div className="w-full max-w-2xl p-6 sm:p-10 bg-zinc-900 border border-zinc-800 rounded-3xl sm:rounded-[2.5rem] text-white shadow-2xl my-10">
        <h2 className="text-xl sm:text-2xl font-light mb-6 sm:mb-8 text-center uppercase tracking-[0.2em] sm:tracking-[0.3em]">New Entry</h2>
        
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Image Upload Section */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800">
                <img src={img} className="w-full h-full object-cover" alt="" />
                <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 p-1 rounded-full"><X size={12}/></button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed border-zinc-800 rounded-xl sm:rounded-2xl flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition">
              <Camera className="text-zinc-600" />
              <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
            </label>
          </div>

          {/* 1. PERSONAL DETAILS SECTION */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800 pb-2">
              <User size={16} />
              <label className="text-[11px] font-bold uppercase tracking-widest">Personal Details</label>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <input 
                placeholder="Name" 
                className="w-full bg-zinc-800 p-4 rounded-xl sm:rounded-2xl outline-none text-sm border border-transparent focus:border-zinc-700" 
                onChange={e => setName(e.target.value)} 
              />
              
              {/* New WhatsApp Field */}
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-500 transition-colors">
                  <MessageCircle size={18} />
                </div>
                <input 
                  placeholder="WhatsApp Number (e.g. 923001234567)" 
                  value={whatsapp}
                  className="w-full bg-zinc-800 p-4 pl-12 rounded-xl sm:rounded-2xl outline-none text-sm border border-transparent focus:border-zinc-700" 
                  onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))} // Only allows numbers
                />
              </div>

              <select className="w-full bg-zinc-800 p-4 rounded-xl sm:rounded-2xl outline-none text-sm border border-transparent focus:border-zinc-700" onChange={e => setGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Quick Tags</label>
              <div className="flex flex-wrap gap-2">
                {existingTags.map(t => (
                  <button key={t} type="button" onClick={() => handleAddData(attributes, setAttributes, t)} className="text-[9px] sm:text-[10px] px-3 py-1.5 bg-zinc-800 rounded-full border border-zinc-700 active:bg-zinc-700 transition-colors">+ {t}</button>
                ))}
              </div>
              
              <div className="space-y-3">
                {attributes.map((attr, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={attr.tag} placeholder="Tag" className="w-1/3 bg-zinc-800 p-3 rounded-xl text-xs sm:text-sm outline-none border border-transparent focus:border-zinc-700" 
                      onChange={e => { const next = [...attributes]; next[i].tag = e.target.value; setAttributes(next); }} 
                    />
                    <input value={attr.value} placeholder="Value" className="w-2/3 bg-zinc-800 p-3 rounded-xl text-xs sm:text-sm outline-none border border-transparent focus:border-zinc-700" 
                      onChange={e => { const next = [...attributes]; next[i].value = e.target.value; setAttributes(next); }} 
                    />
                    <button type="button" onClick={() => removeRow(i, attributes, setAttributes)} className="text-zinc-600 hover:text-red-500 transition px-1 flex-shrink-0"><X size={18}/></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => handleAddData(attributes, setAttributes)} className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors">+ Custom Field</button>
            </div>
          </div>

          {/* 2. PARTNER REQUIREMENTS SECTION */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800 pb-2">
              <ClipboardList size={16} />
              <label className="text-[11px] font-bold uppercase tracking-widest">Partner Requirements (Optional)</label>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {["Age", "Height", "Education", "City"].map(t => (
                  <button key={t} type="button" onClick={() => handleAddData(requirements, setRequirements, t)} className="text-[9px] sm:text-[10px] px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors">+ {t}</button>
                ))}
              </div>

              <div className="space-y-3">
                {requirements.map((req, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={req.tag} placeholder="Tag" className="w-1/3 bg-zinc-800/50 p-3 rounded-xl text-xs sm:text-sm outline-none border border-zinc-800 focus:border-zinc-700" 
                      onChange={e => { const next = [...requirements]; next[i].tag = e.target.value; setRequirements(next); }} 
                    />
                    <input value={req.value} placeholder="Requirement" className="w-2/3 bg-zinc-800/50 p-3 rounded-xl text-xs sm:text-sm outline-none border border-zinc-800 focus:border-zinc-700" 
                      onChange={e => { const next = [...requirements]; next[i].value = e.target.value; setRequirements(next); }} 
                    />
                    <button type="button" onClick={() => removeRow(i, requirements, setRequirements)} className="text-zinc-600 hover:text-red-500 transition px-1 flex-shrink-0"><X size={18}/></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={() => handleAddData(requirements, setRequirements)} className="w-full py-3 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 text-[11px] hover:text-zinc-300 transition">+ Add Requirement</button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
            <button type="button" onClick={() => navigate('/')} className="order-2 sm:order-1 flex-1 p-4 border border-zinc-800 rounded-xl sm:rounded-2xl text-sm font-medium hover:bg-zinc-800 transition">Cancel</button>
            <button disabled={loading} className="order-1 sm:order-2 flex-[2] bg-white text-black p-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center text-sm hover:bg-zinc-200 transition">
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProfile;