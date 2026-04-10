import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'; // Added deleteDoc
import { Camera, X, ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [gender, setGender] = useState('Male');
  const [attributes, setAttributes] = useState([]);
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
        setAttributes(d.attributes || []);
        setImages(d.imageUrls || []);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  // Delete Profile Logic
  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this profile? This action cannot be undone.")) {
      setSaving(true);
      try {
        await deleteDoc(doc(db, "profiles", id));
        navigate('/');
      } catch (err) {
        alert("Error deleting profile: " + err.message);
      } finally {
        setSaving(false);
      }
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

  const addAttr = (tag = '') => setAttributes([...attributes, { tag, value: '' }]);

  const handleAttrChange = (index, field, value) => {
    const next = [...attributes];
    next[index][field] = value;
    setAttributes(next);
  };

  const removeAttr = (index) => setAttributes(attributes.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateDoc(doc(db, "profiles", id), {
        name,
        gender,
        attributes,
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
      <div className="w-full max-w-2xl p-6 sm:p-10 bg-zinc-900 border border-zinc-800 rounded-3xl sm:rounded-[2.5rem] text-white shadow-2xl transition-all">
        <div className="flex justify-between items-center mb-6">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-sm font-medium">Back</span>
          </button>
          
          {/* Delete Button */}
          <button 
            type="button"
            onClick={handleDelete}
            className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
            title="Delete Profile"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 sm:gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-800">
                <img src={img} className="w-full h-full object-cover" alt="" />
                <button 
                  type="button" 
                  onClick={() => setImages(images.filter((_, idx) => idx !== i))} 
                  className="absolute top-1 right-1 bg-black/70 p-1.5 rounded-full hover:bg-red-500 transition-colors"
                >
                  <X size={12}/>
                </button>
              </div>
            ))}
            <label className="aspect-square border-2 border-dashed border-zinc-800 rounded-xl sm:rounded-2xl flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-all hover:border-zinc-600">
              <Camera className="text-zinc-600"/>
              <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
            </label>
          </div>

          <div className="space-y-3 sm:space-y-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Basic Info</label>
            <input 
              value={name} 
              placeholder="Name"
              className="w-full bg-zinc-800 p-4 rounded-xl sm:rounded-2xl outline-none border border-transparent focus:border-zinc-700 transition-all text-sm sm:text-base" 
              onChange={e => setName(e.target.value)} 
            />
            <select 
              value={gender} 
              className="w-full bg-zinc-800 p-4 rounded-xl sm:rounded-2xl outline-none border border-transparent focus:border-zinc-700 text-sm sm:text-base" 
              onChange={e => setGender(e.target.value)}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Edit Attributes</label>
            <div className="space-y-3">
              {attributes.map((attr, i) => (
                <div key={i} className="flex gap-2 group items-center">
                  <input 
                    value={attr.tag} 
                    placeholder="Tag" 
                    className="w-1/3 bg-zinc-800 p-3 rounded-xl text-xs sm:text-sm outline-none focus:ring-1 ring-zinc-600" 
                    onChange={e => handleAttrChange(i, 'tag', e.target.value)} 
                  />
                  <input 
                    value={attr.value} 
                    placeholder="Value" 
                    className="w-2/3 bg-zinc-800 p-3 rounded-xl text-xs sm:text-sm outline-none focus:ring-1 ring-zinc-600" 
                    onChange={e => handleAttrChange(i, 'value', e.target.value)} 
                  />
                  <button 
                    type="button" 
                    onClick={() => removeAttr(i)} 
                    className="text-zinc-600 hover:text-red-500 transition px-1 flex-shrink-0"
                  >
                    <X size={18}/>
                  </button>
                </div>
              ))}
            </div>
            
            <button 
              type="button" 
              onClick={() => addAttr()} 
              className="flex items-center gap-2 text-xs text-zinc-500 hover:text-white transition-colors py-1"
            >
              <Plus size={14}/> Add New Field
            </button>
          </div>

          <div className="pt-2 sm:pt-4">
            <button 
              disabled={saving} 
              className="w-full bg-white text-black p-4 rounded-xl sm:rounded-2xl font-bold flex items-center justify-center hover:bg-zinc-200 transition-all active:scale-[0.98] disabled:opacity-50 text-sm sm:text-base"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;