import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Camera, X, ArrowLeft, Loader2, Plus, Trash2, MessageCircle, ClipboardList, User } from 'lucide-react';

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [whatsapp, setWhatsapp] = useState('');
  const [attributes, setAttributes] = useState([]);
  const [requirements, setRequirements] = useState([]); // New state
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const snap = await getDoc(doc(db, "profiles", id));
      if (snap.exists()) {
        const d = snap.data();
        setName(d.name || '');
        setGender(d.gender || 'Male');
        setWhatsapp(d.whatsapp || '');
        setAttributes(d.attributes || []);
        setRequirements(d.partnerRequirements || []);
        setImages(d.imageUrls || []);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this profile?")) {
      setSaving(true);
      try {
        await deleteDoc(doc(db, "profiles", id));
        navigate('/');
      } catch (err) { alert("Error deleting profile: " + err.message); } 
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
          let width = img.width; let height = img.height;
          const MAX_DIM = 600;
          if (width > height) { if (width > MAX_DIM) { height *= MAX_DIM / width; width = MAX_DIM; } } 
          else { if (height > MAX_DIM) { width *= MAX_DIM / height; height = MAX_DIM; } }
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          setImages(prev => [...prev, canvas.toDataURL('image/jpeg', 0.5)]);
        };
      };
    });
  };

  const handleDataChange = (index, field, value, list, setList) => {
    const next = [...list];
    next[index][field] = value;
    setList(next);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, "profiles", id), {
        name,
        gender,
        whatsapp,
        attributes,
        partnerRequirements: requirements,
        imageUrls: images,
        updatedAt: new Date()
      });
      navigate('/');
    } catch (err) { alert(err.message); } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="h-96 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-zinc-500" size={32} />
      <p className="text-zinc-500 text-sm font-mono tracking-widest">LOADING DATA</p>
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
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-800">
                <img src={img} className="w-full h-full object-cover" alt="" />
                <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/70 p-1.5 rounded-full hover:bg-red-500"><X size={12}/></button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-all">
              <Camera className="text-zinc-600"/><input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
            </label>
          </div>

          {/* Personal Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800 pb-2">
              <User size={16} /><label className="text-[11px] font-bold uppercase tracking-widest">Edit Personal Details</label>
            </div>
            <div className="space-y-4">
              <input value={name} placeholder="Name" className="w-full bg-zinc-800 p-4 rounded-xl outline-none border border-transparent focus:border-zinc-700 text-sm" onChange={e => setName(e.target.value)} />
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-green-500 transition-colors"><MessageCircle size={18} /></div>
                <input placeholder="WhatsApp (e.g. 923001234567)" value={whatsapp} className="w-full bg-zinc-800 p-4 pl-12 rounded-xl outline-none border border-transparent focus:border-zinc-700 text-sm" onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))} />
              </div>
              <select value={gender} className="w-full bg-zinc-800 p-4 rounded-xl outline-none border border-transparent focus:border-zinc-700 text-sm" onChange={e => setGender(e.target.value)}>
                <option value="Male">Male</option><option value="Female">Female</option>
              </select>
            </div>

            <div className="space-y-3">
              {attributes.map((attr, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={attr.tag} placeholder="Tag" className="w-1/3 bg-zinc-800 p-3 rounded-xl text-xs outline-none" onChange={e => handleDataChange(i, 'tag', e.target.value, attributes, setAttributes)} />
                  <input value={attr.value} placeholder="Value" className="w-2/3 bg-zinc-800 p-3 rounded-xl text-xs outline-none" onChange={e => handleDataChange(i, 'value', e.target.value, attributes, setAttributes)} />
                  <button type="button" onClick={() => setAttributes(attributes.filter((_, idx) => idx !== i))} className="text-zinc-600 hover:text-red-500 transition px-1"><X size={18}/></button>
                </div>
              ))}
              <button type="button" onClick={() => setAttributes([...attributes, {tag:'', value:''}])} className="text-[11px] text-zinc-500 hover:text-white transition">+ Add Attribute</button>
            </div>
          </div>

          {/* Requirements */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2 text-zinc-500 border-b border-zinc-800 pb-2">
              <ClipboardList size={16} /><label className="text-[11px] font-bold uppercase tracking-widest">Edit Partner Requirements</label>
            </div>
            <div className="space-y-3">
              {requirements.map((req, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input value={req.tag} placeholder="Tag" className="w-1/3 bg-zinc-800/50 p-3 rounded-xl text-xs outline-none border border-zinc-800" onChange={e => handleDataChange(i, 'tag', e.target.value, requirements, setRequirements)} />
                  <input value={req.value} placeholder="Requirement" className="w-2/3 bg-zinc-800/50 p-3 rounded-xl text-xs outline-none border border-zinc-800" onChange={e => handleDataChange(i, 'value', e.target.value, requirements, setRequirements)} />
                  <button type="button" onClick={() => setRequirements(requirements.filter((_, idx) => idx !== i))} className="text-zinc-600 hover:text-red-500 transition px-1"><X size={18}/></button>
                </div>
              ))}
              <button type="button" onClick={() => setRequirements([...requirements, {tag:'', value:''}])} className="w-full py-3 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 text-[11px] hover:text-zinc-300 transition">+ Add Requirement</button>
            </div>
          </div>

          <button disabled={saving} className="w-full bg-white text-black p-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center hover:bg-zinc-200 transition-all disabled:opacity-50 text-sm">
            {saving ? <Loader2 className="animate-spin" size={18} /> : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;