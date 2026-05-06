import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { createBuild } from './buildSlice';
import axios from 'axios';

function BuildEditor() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: '', description: '', vigor: 10, endurance: 10, strength: 10, dexterity: 10, weaponPreference: ''
  });
  const [aiAdvice, setAiAdvice] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  const { title, description, vigor, endurance, strength, dexterity, weaponPreference } = formData;

  const onChange = (e) => setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));

  const askAdvisor = async () => {
    setIsAiLoading(true);
    setAiAdvice('');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { stats: { vigor, endurance, strength, dexterity }, weaponPreference };
      const response = await axios.post('http://localhost:5000/api/advisor', payload, config);
      setAiAdvice(response.data.advice);
    } catch (error) {
      setAiAdvice("The Oracle is silent. Check your connection to the realm.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    dispatch(createBuild({ title, description, isPublic: true, stats: { vigor, endurance, strength, dexterity } }));
    navigate('/dashboard'); 
  };

  return (
    <div className="min-h-screen relative font-serif text-[#2C221B] overflow-x-hidden">
      
      {/* IMMERSIVE MAP BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[#1A120E]">
        <img 
          src="/map.png" 
          alt="World Map" 
          className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
          onError={(e) => e.target.style.display = 'none'}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#1A120E_100%)] pointer-events-none"></div>
      </div>

      {/* THE WIDE PILLAR */}
      <div 
        className="relative z-10 py-12 px-6 sm:px-12 md:px-16 w-full min-h-screen bg-[#1A120E]/85 backdrop-blur-sm border-x-2 border-[#8B5A2B]/30 shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col"
        style={{ maxWidth: '1200px', margin: '0 auto' }} 
      >
        {/* UNIVERSAL BACK BUTTON */}
        <button 
          onClick={() => navigate(-1)} 
          className="absolute top-6 left-6 md:left-12 px-5 py-2.5 bg-gradient-to-b from-[#3A2618] to-[#1A120E] border border-[#8B5A2B] text-[#C5A059] font-black tracking-widest uppercase hover:from-[#5C4033] hover:to-[#2C1A10] hover:text-[#E8DCC4] transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.8),_4px_4px_0px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-[inset_0_0_10px_rgba(0,0,0,0.8),_0px_0px_0px_rgba(0,0,0,0)] text-xs sm:text-sm"
        >
          <span>←</span> Back
        </button>
        
        {/* HEADER */}
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#E8DCC4] tracking-wider drop-shadow-md mb-3">
            The Forgemaster's Ledger
          </h1>
          <p className="text-[#A89F91] italic text-lg">
            Inscribe your martial disciplines and seek the Oracle's wisdom.
          </p>
          <div className="h-[2px] w-full max-w-2xl mx-auto bg-gradient-to-r from-transparent via-[#8B5A2B]/80 to-transparent mt-6"></div>
        </header>

        {/* 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* --- LEFT COLUMN: THE LEDGER FORM --- */}
          <form onSubmit={onSubmit} className="relative border-2 border-[#8B5A2B] shadow-[8px_8px_0px_rgba(0,0,0,0.8)] bg-[#F4EBD0] p-8 sm:p-10 flex flex-col h-full">
            
            {/* Parchment Texture */}
            <img 
              src="/parchment.jpg" 
              alt="" 
              className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply pointer-events-none" 
              onError={(e) => e.target.style.display = 'none'}
            />
            <div className="absolute inset-0 bg-[#F4EBD0]/40 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full">
              
              <div className="flex flex-col gap-6 flex-grow">
                {/* Title Input */}
                <div>
                  <label className="block text-sm font-black text-[#1A120E] uppercase tracking-widest mb-1">Tale or Title</label>
                  <input
                    type="text" name="title" value={title} onChange={onChange} required
                    placeholder="e.g. The Ranger of the North"
                    className="w-full bg-transparent border-b-2 border-[#3A2618] py-2 text-[#1A120E] text-2xl font-black focus:outline-none focus:border-[#000] placeholder-[#5C4033]/50 transition-colors"
                  />
                </div>
                
                {/* Description Input */}
                <div>
                  <label className="block text-sm font-black text-[#1A120E] uppercase tracking-widest mb-1">Chronicle (Description)</label>
                  <textarea
                    name="description" value={description} onChange={onChange} rows="3" required
                    placeholder="Record the deeds of this build..."
                    className="w-full bg-transparent border-b-2 border-[#3A2618] py-2 text-[#1A120E] text-lg font-bold focus:outline-none focus:border-[#000] placeholder-[#5C4033]/50 transition-colors resize-none"
                  ></textarea>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-6 mt-4">
                  <div className="flex flex-col border-b-2 border-[#3A2618] pb-2">
                    <label className="text-xs font-black text-[#1A120E] uppercase tracking-widest">Vitality (Vigor)</label>
                    <input type="number" name="vigor" value={vigor} onChange={onChange} className="bg-transparent text-3xl font-black text-[#8B0000] focus:outline-none text-center w-full mt-1" />
                  </div>
                  <div className="flex flex-col border-b-2 border-[#3A2618] pb-2">
                    <label className="text-xs font-black text-[#1A120E] uppercase tracking-widest">Stamina (End)</label>
                    <input type="number" name="endurance" value={endurance} onChange={onChange} className="bg-transparent text-3xl font-black text-[#1A120E] focus:outline-none text-center w-full mt-1" />
                  </div>
                  <div className="flex flex-col border-b-2 border-[#3A2618] pb-2">
                    <label className="text-xs font-black text-[#1A120E] uppercase tracking-widest">Might (Str)</label>
                    <input type="number" name="strength" value={strength} onChange={onChange} className="bg-transparent text-3xl font-black text-[#1A120E] focus:outline-none text-center w-full mt-1" />
                  </div>
                  <div className="flex flex-col border-b-2 border-[#3A2618] pb-2">
                    <label className="text-xs font-black text-[#1A120E] uppercase tracking-widest">Finesse (Dex)</label>
                    <input type="number" name="dexterity" value={dexterity} onChange={onChange} className="bg-transparent text-3xl font-black text-[#1A120E] focus:outline-none text-center w-full mt-1" />
                  </div>
                </div>
              </div>

              {/* High-Contrast "Wax Seal" Submit Button */}
              <button
                type="submit"
                className="w-full mt-12 py-5 bg-gradient-to-b from-[#7A1515] to-[#4A0B0B] border-2 border-[#1A120E] text-[#E8DCC4] text-xl font-black tracking-widest uppercase hover:from-[#931D1D] hover:to-[#5E0F0F] transition-all shadow-[6px_6px_0px_#1A120E] hover:shadow-[8px_8px_0px_#1A120E] hover:-translate-y-1 active:translate-y-[6px] active:shadow-none"
              >
                Seal into the Ledger
              </button>

            </div>
          </form>

          {/* --- RIGHT COLUMN: THE ORACLE'S SIGHT --- */}
          <div className="relative border-2 border-[#5C4033] shadow-[8px_8px_0px_rgba(0,0,0,0.8)] bg-[#130C0A] p-8 sm:p-10 flex flex-col h-full">
            
            <div className="absolute inset-2 border border-[#C5A059] opacity-20 pointer-events-none"></div>

            <div className="text-center mb-8 relative z-10">
              <h2 className="text-3xl font-bold text-[#C5A059] tracking-widest drop-shadow-[0_0_15px_rgba(197,160,89,0.4)]">
                ✦ The Oracle's Sight ✦
              </h2>
            </div>

            <div className="flex flex-col flex-grow relative z-10 gap-8">
              
              <div>
                <label className="block text-xs font-black text-[#E8DCC4] uppercase tracking-widest mb-2">Favored Armament (Optional)</label>
                <input
                  type="text" name="weaponPreference" value={weaponPreference} onChange={onChange}
                  placeholder="e.g. Elven Bow, Dwarven Axe"
                  className="w-full bg-transparent border-b-2 border-[#C5A059] py-3 px-4 text-[#E8DCC4] text-xl font-bold focus:outline-none focus:border-[#F4EBD0] placeholder-[#A89F91]/50 transition-colors"
                />
              </div>

              {/* Gold Leather Button */}
              <button
                type="button"
                onClick={askAdvisor}
                disabled={isAiLoading}
                className="w-full py-4 bg-[#A07848] border-2 border-[#1A120E] text-[#1A120E] text-lg font-black tracking-widest uppercase hover:bg-[#C5A059] disabled:opacity-50 transition-all shadow-[4px_4px_0px_#000] hover:shadow-[6px_6px_0px_#000] hover:-translate-y-[2px] active:translate-y-[4px] active:shadow-none"
              >
                {isAiLoading ? 'Scrying...' : 'Seek Counsel for these Stats'}
              </button>

              {/* Oracle Output Box */}
              <div className="flex-grow border-2 border-[#5C4033]/70 bg-[#0A0604] p-6 flex flex-col justify-start overflow-y-auto shadow-inner min-h-[250px]">
                {isAiLoading ? (
                   <p className="text-[#C5A059] font-bold text-lg animate-pulse text-center mt-8">The Oracle is consulting the ancient texts...</p>
                ) : aiAdvice ? (
                   <p className="text-[#E8DCC4] font-medium text-lg leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:text-[#C5A059] first-letter:mr-2 first-letter:float-left first-letter:mt-[-4px]">
                     {aiAdvice}
                   </p>
                ) : (
                   <p className="text-[#8B5A2B] font-bold text-lg text-center mt-8">
                     The parchment remains blank. Adjust your stats and seek counsel.
                   </p>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* RETURN TO HUB */}
        <div className="text-center mt-12">
           <Link to="/dashboard" className="text-[#A89F91] hover:text-[#C5A059] font-black uppercase tracking-widest text-sm transition-colors border-b-2 border-transparent hover:border-[#C5A059] pb-1">
             ← Return to Hub
           </Link>
        </div>

      </div>
    </div>
  );
}

export default BuildEditor;