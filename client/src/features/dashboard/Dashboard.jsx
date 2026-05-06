import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '../auth/authSlice'; 
// MAKE SURE 'updateBuild' IS EXPORTED FROM YOUR SLICE!
import { getBuilds, updateBuild } from '../builds/buildSlice'; 

function Dashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { builds } = useSelector((state) => state.builds); 

  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(getBuilds());
  }, [user, navigate, dispatch]);

  const onLogout = () => {
    dispatch(logout());
    dispatch(reset());
    navigate('/login');
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // WIRED UP TO REDUX: This now dispatches the update to your backend
  const publishToTavern = (buildId) => {
    dispatch(updateBuild({ id: buildId, buildData: { isPublic: true } })); 
    alert("Scroll sealed! Your build is now visible in the Tavern.");
  };

  return (
    // THE FIX: Changed 'min-h-screen' to 'h-screen overflow-y-auto' to guarantee mouse scrolling
    <div className="h-screen overflow-y-auto relative font-serif text-[#2C221B] overflow-x-hidden">
      
      {/* 1. IMMERSIVE MAP BACKGROUND */}
      <div className="fixed inset-0 z-0 bg-[#1A120E]">
        <img 
          src="/map.png" 
          alt="World Map" 
          className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
          onError={(e) => e.target.style.display = 'none'}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#1A120E_100%)] pointer-events-none"></div>
      </div>

      {/* 2. THE WIDE PILLAR */}
      <div 
        className="relative z-10 py-12 w-full min-h-screen bg-[#1A120E]/85 backdrop-blur-sm border-x-2 border-[#8B5A2B]/30 shadow-[0_0_60px_rgba(0,0,0,0.8)]"
        style={{ maxWidth: '1100px', margin: '0 auto' }} 
      >
        
        {/* 3. THE CONSTRAINED INNER CONTENT */}
        <div className="max-w-[800px] mx-auto px-6 sm:px-8">
          
          {/* HEADER */}
          <header className="flex flex-col md:flex-row justify-between items-center bg-[#1A120E]/60 p-8 border-y-2 border-[#8B5A2B] shadow-xl mb-12">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#E8DCC4] tracking-wider drop-shadow-md">
                Welcome, {user && user.username ? user.username : 'Traveler'}
              </h1>
              <p className="text-[#A89F91] italic mt-2 text-md">The Fellowship Hub & Armory</p>
            </div>
            
            {/* NAVIGATION BUTTONS */}
            <div className="flex flex-wrap justify-center items-center gap-4">
              
              <Link 
                to="/community" 
                className="px-5 py-3 bg-[#8B5A2B] border-2 border-[#1A120E] text-[#1A120E] font-black tracking-widest uppercase hover:bg-[#C5A059] transition-all shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-none text-xs sm:text-sm"
              >
                Enter Tavern
              </Link>

              <Link 
                to="/editor" 
                className="px-5 py-3 bg-[#3A2618] border-2 border-[#1A120E] text-[#E8DCC4] font-black tracking-widest uppercase hover:bg-[#5C4033] transition-all shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-none text-xs sm:text-sm"
              >
                + Forge New
              </Link>
              
              <button 
                onClick={onLogout} 
                className="px-5 py-3 bg-[#5C0000] border-2 border-[#1A120E] text-[#E8DCC4] font-black tracking-widest uppercase hover:bg-[#8B0000] transition-all shadow-[4px_4px_0px_#000] active:translate-y-[2px] active:shadow-none text-xs sm:text-sm"
              >
                Depart
              </button>
            </div>
          </header>

          {/* CHRONICLES SECTION */}
          <main>
             <div className="flex items-center gap-4 mb-8">
               <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-[#8B5A2B]/60"></div>
               <h2 className="text-2xl font-bold text-[#E8DCC4] uppercase tracking-widest drop-shadow-md">
                 Your Chronicles
               </h2>
               <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-[#8B5A2B]/60"></div>
             </div>

             {builds && builds.length > 0 ? (
               <div className="flex flex-col gap-6">
                 
                 {builds.map((build) => {
                   const isExpanded = expandedId === build._id;

                   return (
                     /* EXPANDABLE TILE */
                     <div key={build._id} className="relative border-2 border-[#8B5A2B] shadow-[8px_8px_0px_rgba(0,0,0,0.8)] transition-all bg-[#F4EBD0]">
                        
                        {/* Parchment Texture */}
                        <img 
                          src="/parchment.jpg" 
                          alt="" 
                          className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-multiply pointer-events-none" 
                          onError={(e) => e.target.style.display = 'none'}
                        />
                        <div className="absolute inset-0 bg-[#F4EBD0]/50 pointer-events-none"></div>

                        {/* TILE HEADER (Always visible) */}
                        <div 
                          onClick={() => toggleExpand(build._id)}
                          className="relative z-10 p-6 cursor-pointer flex justify-between items-center hover:bg-[#8B5A2B]/10 transition-colors"
                        >
                          <div>
                            <h3 className="text-xl md:text-2xl font-black text-[#1A120E] uppercase tracking-tight">
                              {build.title}
                            </h3>
                            <p className="text-sm font-bold text-[#5C4033] italic mt-1 opacity-80">
                              Forged by {user?.username || 'Unknown'}
                            </p>
                          </div>
                          
                          <div className="text-3xl font-black text-[#8B5A2B] ml-4 flex-shrink-0">
                            {isExpanded ? '−' : '+'}
                          </div>
                        </div>

                        {/* TILE BODY (Only visible when expanded) */}
                        {isExpanded && (
                          <div className="relative z-10 p-6 border-t-2 border-[#8B5A2B]/40 bg-[#E8DCC4]/50">
                            <p className="text-[#1A120E] font-bold italic text-lg leading-relaxed mb-6 border-l-4 border-[#8B0000] pl-4">
                              "{build.description || 'No chronicle written for this loadout.'}"
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                              <div className="bg-[#F4EBD0] border-2 border-[#8B5A2B] p-2 flex justify-between items-center shadow-inner">
                                <span className="text-xs font-black text-[#5C4033] uppercase tracking-wider">Vigor</span>
                                <span className="text-lg font-black text-[#8B0000]">{build.stats?.vigor || 10}</span>
                              </div>
                              <div className="bg-[#F4EBD0] border-2 border-[#8B5A2B] p-2 flex justify-between items-center shadow-inner">
                                <span className="text-xs font-black text-[#5C4033] uppercase tracking-wider">End</span>
                                <span className="text-lg font-black text-[#1A120E]">{build.stats?.endurance || 10}</span>
                              </div>
                              <div className="bg-[#F4EBD0] border-2 border-[#8B5A2B] p-2 flex justify-between items-center shadow-inner">
                                <span className="text-xs font-black text-[#5C4033] uppercase tracking-wider">Str</span>
                                <span className="text-lg font-black text-[#1A120E]">{build.stats?.strength || 10}</span>
                              </div>
                              <div className="bg-[#F4EBD0] border-2 border-[#8B5A2B] p-2 flex justify-between items-center shadow-inner">
                                <span className="text-xs font-black text-[#5C4033] uppercase tracking-wider">Dex</span>
                                <span className="text-lg font-black text-[#1A120E]">{build.stats?.dexterity || 10}</span>
                              </div>
                            </div>

                            {/* SHARE TO TAVERN BUTTON */}
                            <div className="border-t border-[#8B5A2B]/40 pt-6 flex justify-end">
                              <button 
                                onClick={() => publishToTavern(build._id)}
                                className="px-6 py-3 bg-[#1A120E] border-2 border-[#1A120E] text-[#C5A059] font-black tracking-widest uppercase hover:bg-[#3A2618] hover:text-[#E8DCC4] transition-all shadow-[4px_4px_0px_rgba(0,0,0,0.4)] active:translate-y-[2px] active:shadow-none text-xs sm:text-sm flex items-center gap-2"
                              >
                                Post to Tavern 📢
                              </button>
                            </div>

                          </div>
                        )}

                     </div>
                   );
                 })}
                 
               </div>
             ) : (
               <div className="text-center mt-12 bg-[#1A120E]/80 backdrop-blur-sm border-2 border-[#8B5A2B]/50 p-10 shadow-xl" style={{ maxWidth: '600px', margin: '0 auto' }}>
                 <span className="text-5xl block mb-4">📜</span>
                 <p className="text-[#E8DCC4] text-2xl font-black tracking-widest uppercase mb-2">Your ledger is empty</p>
                 <p className="text-[#A89F91] italic font-medium">Click "+ Forge New" to begin your tale.</p>
               </div>
             )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;