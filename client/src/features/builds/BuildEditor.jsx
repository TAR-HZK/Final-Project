import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
    // Outer container: Replaced dark background with a deep, muted forest/autumn brown
    <div className="min-h-screen bg-[#2C221B] py-12 font-serif transition-colors duration-500">
      <div className="max-w-5xl mx-auto px-6">
        
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-[#E8DCC4] tracking-wider" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
            The Forgemaster's Ledger
          </h1>
          <p className="text-[#A89F91] mt-3 italic text-lg">Inscribe your martial disciplines and seek the Oracle's wisdom.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          
          {/* LEFT COLUMN: The Parchment Form */}
          <div className="bg-[#F4EBD0] p-8 relative shadow-[8px_8px_0px_0px_rgba(26,18,14,1)] border-4 border-double border-[#5C4033]">
            {/* Decorative Corner Pins */}
            <div className="absolute top-2 left-2 w-3 h-3 bg-[#3A2618] rounded-full border border-[#1A120E]"></div>
            <div className="absolute top-2 right-2 w-3 h-3 bg-[#3A2618] rounded-full border border-[#1A120E]"></div>
            <div className="absolute bottom-2 left-2 w-3 h-3 bg-[#3A2618] rounded-full border border-[#1A120E]"></div>
            <div className="absolute bottom-2 right-2 w-3 h-3 bg-[#3A2618] rounded-full border border-[#1A120E]"></div>

            <form onSubmit={onSubmit} className="space-y-5 mt-2">
              <div>
                <label className="block text-lg font-bold text-[#3A2618]">Tale or Title</label>
                <input type="text" name="title" value={title} onChange={onChange} required 
                  className="w-full px-4 py-2 mt-1 text-[#2C221B] bg-[#E8DCC4] border-2 border-[#8B5A2B] focus:outline-none focus:border-[#5C4033] focus:ring-0 placeholder-[#A89F91]" 
                  placeholder="e.g. The Ranger of the North" />
              </div>
              
              <div>
                <label className="block text-lg font-bold text-[#3A2618]">Chronicle (Description)</label>
                <textarea name="description" value={description} onChange={onChange} rows="2"
                  className="w-full px-4 py-2 mt-1 text-[#2C221B] bg-[#E8DCC4] border-2 border-[#8B5A2B] focus:outline-none focus:border-[#5C4033] focus:ring-0 placeholder-[#A89F91]" 
                  placeholder="Record the deeds of this build..."></textarea>
              </div>

              <div className="grid grid-cols-2 gap-6 pt-2 border-t border-[#8B5A2B] border-dashed">
                <div>
                  <label className="block text-md font-bold text-[#5C4033]">Vitality (Vigor)</label>
                  <input type="number" name="vigor" value={vigor} onChange={onChange} className="w-full px-3 py-2 mt-1 text-center font-bold text-[#2C221B] bg-[#E8DCC4] border-2 border-[#8B5A2B]" />
                </div>
                <div>
                  <label className="block text-md font-bold text-[#5C4033]">Stamina (End)</label>
                  <input type="number" name="endurance" value={endurance} onChange={onChange} className="w-full px-3 py-2 mt-1 text-center font-bold text-[#2C221B] bg-[#E8DCC4] border-2 border-[#8B5A2B]" />
                </div>
                <div>
                  <label className="block text-md font-bold text-[#5C4033]">Might (Str)</label>
                  <input type="number" name="strength" value={strength} onChange={onChange} className="w-full px-3 py-2 mt-1 text-center font-bold text-[#2C221B] bg-[#E8DCC4] border-2 border-[#8B5A2B]" />
                </div>
                <div>
                  <label className="block text-md font-bold text-[#5C4033]">Finesse (Dex)</label>
                  <input type="number" name="dexterity" value={dexterity} onChange={onChange} className="w-full px-3 py-2 mt-1 text-center font-bold text-[#2C221B] bg-[#E8DCC4] border-2 border-[#8B5A2B]" />
                </div>
              </div>

              <button type="submit" className="w-full py-3 mt-6 text-lg font-bold text-[#F4EBD0] bg-[#5C4033] border-2 border-[#3A2618] hover:bg-[#8B5A2B] transition-colors shadow-md">
                Seal into the Ledger
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: The AI Oracle (Darker Leather/Book Cover Theme) */}
          <div className="bg-[#3A2618] p-8 border-4 border-[#1A120E] shadow-[8px_8px_0px_0px_rgba(26,18,14,1)] flex flex-col relative">
            {/* Gold trim accent */}
            <div className="absolute inset-2 border border-[#C5A059] opacity-30 pointer-events-none"></div>

            <h2 className="text-3xl font-bold text-[#C5A059] mb-6 text-center" style={{ textShadow: '1px 1px 2px #000' }}>
              ✦ The Oracle's Sight ✦
            </h2>
            
            <div className="mb-6 relative z-10">
              <label className="block text-sm font-bold text-[#D4C4A8]">Favored Armament (Optional)</label>
              <input type="text" name="weaponPreference" value={weaponPreference} onChange={onChange} 
                className="w-full px-3 py-2 mt-1 text-[#F4EBD0] bg-[#2C221B] border border-[#5C4033] focus:outline-none focus:border-[#C5A059] placeholder-[#5C4033]" 
                placeholder="e.g. Elven Bow, Dwarven Axe" />
            </div>

            <button 
              type="button" 
              onClick={askAdvisor}
              disabled={isAiLoading}
              className="w-full py-2 mb-6 text-md font-bold text-[#1A120E] bg-[#C5A059] border-2 border-[#8A6A32] hover:bg-[#D4B473] disabled:bg-[#5C4033] disabled:text-[#A89F91] transition-colors relative z-10"
            >
              {isAiLoading ? 'Scrying the flames...' : 'Seek Counsel for these Stats'}
            </button>

            <div className="flex-1 bg-[#1A120E] p-5 border border-[#5C4033] overflow-y-auto min-h-[180px] relative z-10 shadow-inner">
              {isAiLoading ? (
                 <p className="text-[#C5A059] italic animate-pulse text-center mt-4">The Oracle is consulting the ancient texts...</p>
              ) : aiAdvice ? (
                 <p className="text-[#D4C4A8] leading-relaxed first-letter:text-4xl first-letter:font-bold first-letter:text-[#C5A059] first-letter:mr-1 first-letter:float-left">
                   {aiAdvice}
                 </p>
              ) : (
                 <p className="text-[#5C4033] italic text-center mt-4">The parchment remains blank. Adjust your stats and seek counsel.</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default BuildEditor;