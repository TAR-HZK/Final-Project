import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getCommunityBuilds } from '../builds/buildSlice'; // Make sure this path matches!

function CommunityHub() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. PULL REAL DATA FROM REDUX
  const { communityBuilds, isLoading } = useSelector((state) => state.builds);
  const { user } = useSelector((state) => state.auth);

  const [expandedComments, setExpandedComments] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  // 2. FETCH PUBLIC BUILDS ON LOAD
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(getCommunityBuilds());
  }, [user, navigate, dispatch]);

  const toggleComments = (id) => {
    setExpandedComments((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleVote = (id, value) => {
    // Note: To make votes save permanently, you will need a backend route and a Redux thunk here!
    console.log(`Voted ${value} on build ${id}`);
    alert("The Gods acknowledge your vote. (Needs backend route to save permanently)");
  };

  const handleCopy = (build) => {
    const textToCopy = `Build: ${build.title}\nStats: Vigor ${build.stats?.vigor}, End ${build.stats?.endurance}, Str ${build.stats?.strength}, Dex ${build.stats?.dexterity}\nDescription: ${build.description}`;
    navigator.clipboard.writeText(textToCopy);
    
    setCopiedId(build._id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="h-screen bg-[#1A120E] flex items-center justify-center font-serif">
        <p className="text-[#C5A059] text-2xl animate-pulse">Opening the Tavern doors...</p>
      </div>
    );
  }

  return (
    // THE SCROLL FIX: Changed to h-screen overflow-y-auto
    <div className="h-screen overflow-y-auto relative font-serif text-[#2C221B] overflow-x-hidden">
      
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
        className="relative z-10 py-12 px-4 sm:px-8 w-full min-h-screen bg-[#1A120E]/85 backdrop-blur-sm border-x-2 border-[#8B5A2B]/30 shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col" 
        style={{ maxWidth: '1000px', margin: '0 auto' }}
      >
        
        {/* UNIVERSAL BACK BUTTON */}
        <div className="max-w-[800px] w-full mx-auto mb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="text-[#A89F91] hover:text-[#C5A059] font-black uppercase tracking-widest text-sm transition-colors border-b-2 border-transparent hover:border-[#C5A059] pb-1 flex items-center gap-2 w-max"
          >
            <span>←</span> Return
          </button>
        </div>

        {/* HEADER */}
        <header className="text-center mb-12 max-w-[800px] w-full mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#E8DCC4] tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-3">
            The Grand Tavern
          </h1>
          <p className="text-[#A89F91] italic text-lg mb-6">
            Share knowledge, seek counsel, and rate the builds of fellow travelers.
          </p>
          <div className="flex justify-center gap-6 border-y-2 border-[#8B5A2B]/50 py-4 w-full bg-[#1A120E]/40 shadow-lg">
             <Link to="/dashboard" className="text-[#C5A059] font-bold uppercase tracking-widest text-sm hover:text-[#E8DCC4] transition-colors">My Ledger</Link>
             <span className="text-[#5C4033]">♦</span>
             <Link to="/editor" className="text-[#C5A059] font-bold uppercase tracking-widest text-sm hover:text-[#E8DCC4] transition-colors">Forge New Build</Link>
          </div>
        </header>

        {/* FEED */}
        <main className="flex flex-col gap-10 max-w-[800px] w-full mx-auto">
          
          {/* 3. RENDER REAL DATA */}
          {communityBuilds && communityBuilds.length > 0 ? (
            communityBuilds.map((build) => (
              <article key={build._id} className="relative border-2 border-[#8B5A2B] shadow-[8px_8px_0px_rgba(0,0,0,0.8)] bg-[#F4EBD0] transition-transform">
                
                {/* Parchment Texture */}
                <img 
                  src="/parchment.jpg" 
                  alt="" 
                  className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply pointer-events-none" 
                  onError={(e) => e.target.style.display = 'none'}
                />
                <div className="absolute inset-0 bg-[#F4EBD0]/40 pointer-events-none"></div>

                <div className="relative z-10 p-6 sm:p-8 flex gap-4 sm:gap-6 items-stretch">
                  
                  {/* LEFT: Voting Column */}
                  <div className="flex flex-col items-center justify-start gap-1 bg-[#E8DCC4] border-2 border-[#8B5A2B] p-2 sm:p-3 shadow-inner h-max">
                    <button onClick={() => handleVote(build._id, 1)} className="text-2xl text-[#8B5A2B] hover:text-[#8B0000] hover:-translate-y-1 transition-transform">▲</button>
                    <span className="font-black text-xl text-[#1A120E]">
                      {build.votes || 0}
                    </span>
                    <button onClick={() => handleVote(build._id, -1)} className="text-2xl text-[#8B5A2B] hover:text-[#8B0000] hover:translate-y-1 transition-transform">▼</button>
                  </div>

                  {/* RIGHT: Content Column */}
                  <div className="flex-grow flex flex-col">
                    
                    <h2 className="text-2xl md:text-3xl font-black text-[#1A120E] uppercase tracking-tight mb-1">
                      {build.title}
                    </h2>
                    {/* FIXED CODE */}
                    <p className="text-sm font-bold text-[#5C4033] italic mb-4">
                    Forged by <span className="text-[#8B0000]">{build.authorId?.username || 'Unknown Traveler'}</span>
                    </p>
                    
                    <p className="text-[#1A120E] text-md font-medium leading-relaxed mb-6 border-l-4 border-[#8B0000] pl-4">
                      {build.description}
                    </p>

                    {/* Compact Stats Grid */}
                    <div className="grid grid-cols-4 gap-2 mb-8 bg-[#E8DCC4]/80 border-2 border-[#8B5A2B] p-2 shadow-inner">
                      <div className="flex flex-col items-center border-r border-[#8B5A2B]/50 px-1">
                        <span className="text-[10px] font-black text-[#5C4033] uppercase">Vigor</span>
                        <span className="text-lg font-black text-[#8B0000]">{build.stats?.vigor || 10}</span>
                      </div>
                      <div className="flex flex-col items-center border-r border-[#8B5A2B]/50 px-1">
                        <span className="text-[10px] font-black text-[#5C4033] uppercase">End</span>
                        <span className="text-lg font-black text-[#1A120E]">{build.stats?.endurance || 10}</span>
                      </div>
                      <div className="flex flex-col items-center border-r border-[#8B5A2B]/50 px-1">
                        <span className="text-[10px] font-black text-[#5C4033] uppercase">Str</span>
                        <span className="text-lg font-black text-[#1A120E]">{build.stats?.strength || 10}</span>
                      </div>
                      <div className="flex flex-col items-center px-1">
                        <span className="text-[10px] font-black text-[#5C4033] uppercase">Dex</span>
                        <span className="text-lg font-black text-[#1A120E]">{build.stats?.dexterity || 10}</span>
                      </div>
                    </div>

                    {/* Interaction Buttons */}
                    <div className="mt-auto border-t-2 border-[#8B5A2B]/40 pt-4 flex justify-between items-center flex-wrap gap-4">
                      <button 
                        onClick={() => toggleComments(build._id)}
                        className="text-[#1A120E] text-sm font-black tracking-widest uppercase hover:text-[#8B0000] transition-colors flex items-center gap-2 bg-transparent border-none outline-none"
                      >
                        <span className="text-xl">📜</span> Scrolls ({build.comments?.length || 0})
                      </button>
                      
                      <button 
                        onClick={() => handleCopy(build)}
                        className="px-6 py-2 bg-gradient-to-b from-[#3A2618] to-[#1A120E] border-2 border-[#1A120E] text-[#C5A059] text-xs font-black tracking-widest uppercase hover:from-[#5C4033] hover:to-[#2C1A10] transition-all shadow-[4px_4px_0px_#1A120E] active:translate-y-[2px] active:shadow-none"
                      >
                        {copiedId === build._id ? 'Copied!' : 'Copy Build'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* COMMENTS SECTION */}
                {expandedComments[build._id] && (
                  <div className="relative z-10 border-t-2 border-[#8B5A2B] bg-[#E8DCC4]/60 p-6 sm:p-8">
                    <h4 className="text-[#1A120E] text-sm font-black uppercase tracking-widest mb-4 border-b-2 border-[#8B5A2B]/30 pb-2">Tavern Chatter</h4>
                    
                    {build.comments && build.comments.length > 0 ? (
                      <ul className="flex flex-col gap-4 mb-6">
                        {build.comments.map(c => (
                          <li key={c._id || c.id} className="text-sm bg-[#F4EBD0] border border-[#8B5A2B] p-3 shadow-sm">
                            <span className="font-black text-[#8B0000] mr-2">{c.user}:</span>
                            <span className="text-[#1A120E] font-medium">{c.text}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[#5C4033] font-bold text-sm italic mb-6">No scrolls have been written about this yet.</p>
                    )}

                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Add your counsel..." 
                        className="flex-grow bg-[#F4EBD0] border-2 border-[#8B5A2B] py-2 px-3 text-[#1A120E] font-bold focus:outline-none focus:border-[#3A2618]" 
                      />
                      <button className="px-6 bg-[#1A120E] text-[#E8DCC4] font-black text-xs tracking-widest uppercase hover:bg-[#3A2618] transition-colors border-2 border-[#1A120E]">
                        Post
                      </button>
                    </div>
                  </div>
                )}

              </article>
            ))
          ) : (
             <div className="text-center mt-12 bg-[#1A120E]/80 backdrop-blur-sm border-2 border-[#8B5A2B]/50 p-10 shadow-xl" style={{ maxWidth: '600px', margin: '0 auto' }}>
               <span className="text-5xl block mb-4">🍻</span>
               <p className="text-[#E8DCC4] text-2xl font-black tracking-widest uppercase mb-2">The Tavern is empty</p>
               <p className="text-[#A89F91] italic font-medium">Be the first to share a build from your Dashboard!</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default CommunityHub;