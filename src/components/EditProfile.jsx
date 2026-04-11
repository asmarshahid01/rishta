import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';
import { Camera, X, ArrowLeft, Loader2, Trash2, MessageCircle, ClipboardList, User } from 'lucide-react';

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Default configurations
  const defaultPersonalTags = ["Age", "Caste", "City", "Education", "Height", "Occupation", "Sect"].sort();
  const defaultReqTags = ["Age", "City", "Education", "Height", "Requirement"].sort();

  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [whatsapp, setWhatsapp] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [images, setImages] = useState([]);
  const [existingTags, setExistingTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfileAndTags = async () => {
      // Fetch Profile
      const snap = await getDoc(doc(db, "profiles", id));
      if (snap.exists()) {
        const d = snap.data();
        setName(d.name || '');
        setGender(d.gender || 'Male');
        setWhatsapp(d.whatsapp || '');
        // Sort existing attributes alphabetically immediately
        setAttributes((d.attributes || []).sort((a, b) => a.tag.localeCompare(b.tag)));
        setRequirements((d.partnerRequirements || []).sort((a, b) => a.tag.localeCompare(b.tag)));
        setImages(d.imageUrls || []);
      }

      // Fetch Global Tags for the "Quick Tags" suggestions
      const allProfiles = await getDocs(collection(db, "profiles"));
      const tags = new Set([...defaultPersonalTags, ...defaultReqTags]);
      allProfiles.forEach(doc => {
        doc.data().attributes?.forEach(a => tags.add(a.tag));
        doc.data().partnerRequirements?.forEach(a => tags.add(a.tag));
      });
      setExistingTags(Array.from(tags).sort());
      setLoading(false);
    };
    fetchProfileAndTags();
  }, [id]);

  const handleAddTag = (list, setList, tag = '') => {
    const newList = [...list, { tag, value: '' }].sort((a, b) => a.tag.localeCompare(b.tag));
    setList(newList);
  };

  const getUnusedTags = (currentList) => {
    const usedTags = new Set(currentList.map(item => item.tag));
    return existingTags.filter(t => !usedTags.has(t));
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this profile?")) {
      setSaving(true);
      try {
        await deleteDoc(doc(db, "profiles", id));
        navigate('/');
      } catch (err) { alert("Error deleting: " + err.message); } 
      finally { setSaving(false); }
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
          const MAX_DIM = 600;
          let w = img.width; let h = img.height;
          if (w > h) { if (w > MAX_DIM) { h *= MAX_DIM / w; w = MAX_DIM; } }
          else { if (h > MAX_DIM) { w *= MAX_DIM / h; h = MAX_DIM; } }
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          setImages(prev => [...prev, canvas.toDataURL('image/jpeg', 0.5)]);
        };
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const cleanAttributes = attributes.filter(a => a.tag || a.value);
    const cleanRequirements = requirements.filter(r => r.tag || r.value);
    try {
      await updateDoc(doc(db, "profiles", id), {
        name, gender, whatsapp,
        attributes: cleanAttributes,
        partnerRequirements: cleanRequirements,
        imageUrls: images,
        updatedAt: new Date()
      });
      navigate('/');
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-zinc-500" size={32} />
      <p className="text-zinc-500 text-xs font-mono tracking-widest uppercase">Fetching Profile</p>
    </div>
  );

  return (
    <div className="w-full flex justify-center px-4 sm:px-0">
      <div className="w-full max-w-2xl p-6 sm:p-10 bg-zinc-900 border border-zinc-800 rounded-3xl sm:rounded-[2.5rem] text-white shadow-2xl my-10">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-sm font-medium">Back</span>
          </button>
          <button type="button" onClick={handleDelete} className="p-2 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          {/* Photos */}
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border border-zinc-800">
                <img src={img} className="w-full h-full object-cover" alt="" />
                <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/70 p-1.5 rounded-full"><X size={12}/></button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed border-zinc-800 rounded-2xl flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition">
              <Camera className="text-zinc-600"/><input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
            </label>
          </div>

          {/* Personal Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800 pb-2">
              <User size={16} /><label className="text-[11px] font-bold uppercase tracking-widest">Personal Details</label>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input value={name} placeholder="Name" className="w-full bg-zinc-800 p-4 rounded-2xl outline-none border border-transparent focus:border-zinc-700 text-sm" onChange={e => setName(e.target.value)} />
              <div className="relative">
                <MessageCircle size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input placeholder="WhatsApp" value={whatsapp} className="w-full bg-zinc-800 p-4 pl-12 rounded-2xl outline-none border border-transparent focus:border-zinc-700 text-sm" onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Available Attributes</label>
              <div className="flex flex-wrap gap-2">
                {/* Existing Tag Suggestions */}
                {getUnusedTags(attributes).map(t => (
                  <button key={t} type="button" onClick={() => handleAddTag(attributes, setAttributes, t)} className="text-[10px] px-3 py-1.5 bg-zinc-800 rounded-full border border-zinc-700 hover:border-zinc-500 transition-colors">+ {t}</button>
                ))}
                
                {/* NEW: Custom Tag Button */}
                <button 
                  type="button" 
                  onClick={() => handleAddTag(attributes, setAttributes, '')} 
                  className="text-[10px] px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 hover:text-white transition-colors"
                >
                  + Custom
                </button>
              </div>
              
              <div className="space-y-3 bg-zinc-950/30 p-4 rounded-3xl border border-zinc-800/50">
                {attributes.map((attr, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={attr.tag} className="w-1/3 bg-zinc-800 p-3 rounded-xl text-xs outline-none" onChange={e => { const n = [...attributes]; n[i].tag = e.target.value; setAttributes(n); }} />
                    <input value={attr.value} className="w-2/3 bg-zinc-800 p-3 rounded-xl text-xs outline-none" onChange={e => { const n = [...attributes]; n[i].value = e.target.value; setAttributes(n); }} />
                    <button type="button" onClick={() => setAttributes(attributes.filter((_, idx) => idx !== i))} className="text-zinc-600 hover:text-red-500"><X size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Partner Requirements */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800 pb-2">
              <ClipboardList size={16} /><label className="text-[11px] font-bold uppercase tracking-widest">Partner Requirements</label>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {getUnusedTags(requirements).map(t => (
                  <button key={t} type="button" onClick={() => handleAddTag(requirements, setRequirements, t)} className="text-[10px] px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-500 hover:text-zinc-300 transition-colors">+ {t}</button>
                ))}
                
                {/* NEW: Custom Requirement Button */}
                <button 
                  type="button" 
                  onClick={() => handleAddTag(requirements, setRequirements, '')} 
                  className="text-[10px] px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors"
                >
                  + Custom
                </button>
              </div>

              <div className="space-y-3 bg-zinc-950/30 p-4 rounded-3xl border border-zinc-800/50">
                {requirements.map((req, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={req.tag} className="w-1/3 bg-zinc-800/50 p-3 rounded-xl text-xs outline-none border border-zinc-800" onChange={e => { const n = [...requirements]; n[i].tag = e.target.value; setRequirements(n); }} />
                    <input value={req.value} className="w-2/3 bg-zinc-800/50 p-3 rounded-xl text-xs outline-none border border-zinc-800" onChange={e => { const n = [...requirements]; n[i].value = e.target.value; setRequirements(n); }} />
                    <button type="button" onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))} className="text-zinc-600 hover:text-red-500"><X size={18}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button disabled={saving} className="w-full bg-white text-black p-4 rounded-2xl font-bold hover:bg-zinc-200 transition-all text-sm">
            {saving ? <Loader2 className="animate-spin mx-auto" size={18} /> : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;