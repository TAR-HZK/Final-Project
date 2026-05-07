import { useState, useEffect, useCallback, useRef } from "react";
import { useItems } from "../hooks/useItems";

// ─── Constants ────────────────────────────────────────────────────────────────
const WEAPON_CATEGORIES  = ["Straight Sword","Greatsword","Halberd","Dagger","Spear","Ultra Greatsword","Curved Sword","Axe","Hammer","Shield"];
const ARMOR_CATEGORIES   = ["Helm","Chest","Gauntlets","Leggings"];
const OTHER_CATEGORIES   = ["Ring","Consumable"];
const ALL_CATEGORIES     = [...WEAPON_CATEGORIES, ...ARMOR_CATEGORIES, ...OTHER_CATEGORIES];
const ITEM_TYPES         = ["weapon","armor","ring","consumable"];
const SCALING_GRADES     = ["S","A","B","C","D","E","-"];
const STAT_KEYS          = ["strength","dexterity","intelligence","faith"];
const STAT_LABELS        = { strength:"STR", dexterity:"DEX", intelligence:"INT", faith:"FAI" };

const EMPTY_FORM = {
  name:"", type:"weapon", category:"Straight Sword", description:"", imageUrl:"",
  baseAttack:0, weight:0, durability:100,
  requiredStats:{ strength:0, dexterity:0, intelligence:0, faith:0 },
  scaling:{ strength:"-", dexterity:"-", intelligence:"-", faith:"-" },
  isAvailable:true,
};

const TYPE_COLOR = { weapon:"#f5c842", armor:"#60a5fa", ring:"#c084fc", consumable:"#4ade80" };
const GRADE_COLOR = { S:"#f5c842", A:"#a3e635", B:"#38bdf8", C:"#a78bfa", D:"#fb923c", E:"#9ca3af", "-":"#374151" };

// ─── Style tokens ─────────────────────────────────────────────────────────────
const C = {
  bg0:     "#0a0806",
  bg1:     "#110e0b",
  bg2:     "#1a1410",
  bg3:     "#241c15",
  border:  "#2e1f0f",
  borderHi:"#5a3418",
  gold:    "#c47a3a",
  goldHi:  "#e8a84a",
  text:    "#e8d5b0",
  textMid: "#a08060",
  textDim: "#5a4030",
  red:     "#c43a3a",
  green:   "#3ac43a",
  blue:    "#3a8ac4",
};

const inp = (extra={}) => ({
  width:"100%", background:C.bg0, border:`1px solid ${C.border}`,
  color:C.text, borderRadius:6, padding:"8px 12px",
  fontFamily:"'Crimson Text',serif", fontSize:15,
  outline:"none", boxSizing:"border-box",
  transition:"border-color .15s",
  ...extra,
});

const btn = (v="primary", extra={}) => {
  const base = {
    fontFamily:"'Cinzel',serif", letterSpacing:1, fontSize:13,
    border:"1px solid", borderRadius:6, padding:"8px 18px",
    cursor:"pointer", transition:"all .15s", whiteSpace:"nowrap",
    ...extra,
  };
  if (v==="primary") return {...base, background:"#3a1e08", borderColor:C.gold, color:C.text};
  if (v==="danger")  return {...base, background:"#3a0808", borderColor:C.red, color:"#f5a8a8"};
  if (v==="success") return {...base, background:"#083a08", borderColor:C.green, color:"#a8f5a8"};
  if (v==="ghost")   return {...base, background:"transparent", borderColor:"#3a2a1a", color:C.textMid};
  if (v==="icon")    return {...base, padding:"5px 8px", background:"transparent", borderColor:"transparent", color:C.textMid, fontSize:16};
  return base;
};

const label = (extra={}) => ({
  display:"flex", flexDirection:"column", gap:5,
  color:C.textMid, fontSize:12,
  fontFamily:"'Cinzel',serif", letterSpacing:.8,
  ...extra,
});

// ─── Tiny components ──────────────────────────────────────────────────────────

function GradeBadge({ grade }) {
  const c = GRADE_COLOR[grade] || GRADE_COLOR["-"];
  return (
    <span style={{
      display:"inline-block", minWidth:22, textAlign:"center",
      background:c+"18", color:c, border:`1px solid ${c}44`,
      borderRadius:4, fontSize:11, fontWeight:700,
      padding:"1px 5px", fontFamily:"'Cinzel',serif", letterSpacing:1,
    }}>
      {grade}
    </span>
  );
}

function TypePill({ type }) {
  const c = TYPE_COLOR[type] || "#aaa";
  return (
    <span style={{
      fontSize:11, fontFamily:"'Cinzel',serif", letterSpacing:1,
      border:`1px solid ${c}44`, borderRadius:4,
      padding:"2px 8px", background:c+"15", color:c,
    }}>
      {type}
    </span>
  );
}

function Toast({ message, type="info", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return ()=>clearTimeout(t); }, [onClose]);
  const c = { success:C.green, error:C.red, info:C.blue }[type] || C.blue;
  const icon = { success:"⚔", error:"✖", info:"◆" }[type];
  return (
    <div style={{
      position:"fixed", bottom:28, right:28, zIndex:9999,
      background:C.bg2, border:`1px solid ${c}`,
      color:c, borderRadius:8, padding:"13px 20px",
      fontSize:14, fontFamily:"'Cinzel',serif", letterSpacing:.5,
      display:"flex", alignItems:"center", gap:10,
      boxShadow:"0 8px 32px #0008", minWidth:260,
      animation:"slideIn .2s ease",
    }}>
      <style>{`@keyframes slideIn{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}`}</style>
      {icon} {message}
      <button onClick={onClose} style={{background:"none",border:"none",color:"inherit",cursor:"pointer",marginLeft:"auto",fontSize:18,lineHeight:1}}>×</button>
    </div>
  );
}

function ConfirmModal({ itemName, onConfirm, onCancel }) {
  return (
    <div style={{position:"fixed",inset:0,background:"#000b",zIndex:8000,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{
        background:C.bg2, border:`1px solid ${C.red}`,
        borderRadius:12, padding:"36px 40px", maxWidth:380, width:"90%",
        textAlign:"center", fontFamily:"'Cinzel',serif",
      }}>
        <div style={{fontSize:40,marginBottom:12,opacity:.8}}>☠</div>
        <p style={{color:C.text,fontSize:15,marginBottom:8,lineHeight:1.6}}>
          Permanently remove
        </p>
        <p style={{color:C.gold,fontSize:17,marginBottom:24,fontWeight:700}}>"{itemName}"</p>
        <p style={{color:C.textMid,fontSize:13,marginBottom:28}}>This action cannot be undone.</p>
        <div style={{display:"flex",gap:12,justifyContent:"center"}}>
          <button onClick={onConfirm} style={btn("danger")}>Remove Item</button>
          <button onClick={onCancel}  style={btn("ghost")}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Item Form Modal ──────────────────────────────────────────────────────────
function ItemFormModal({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const [imgError, setImgError] = useState(false);

  const set = (k, v) => setForm(f => ({...f, [k]:v}));
  const setSub = (group, k, v) => setForm(f => ({...f, [group]:{...f[group],[k]:v}}));

  const isEdit = !!initial?._id;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  // Section header style
  const SH = ({children}) => (
    <p style={{
      fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:3,
      color:C.gold, margin:"0 0 10px", textTransform:"uppercase",
      borderBottom:`1px solid ${C.border}`, paddingBottom:6,
    }}>
      {children}
    </p>
  );

  const Row = ({children, cols="1fr 1fr"}) => (
    <div style={{display:"grid",gridTemplateColumns:cols,gap:14,marginBottom:16}}>
      {children}
    </div>
  );

  return (
    <div style={{
      position:"fixed",inset:0,background:"#000c",zIndex:7000,
      display:"flex",alignItems:"flex-start",justifyContent:"center",
      overflowY:"auto",padding:"28px 16px",
    }}>
      <div style={{
        background:C.bg2, border:`1px solid ${C.borderHi}`,
        borderRadius:14, width:"100%", maxWidth:700,
        padding:"32px 36px", fontFamily:"'Crimson Text',serif",
        position:"relative",
      }}>
        {/* Title bar */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28}}>
          <div>
            <h2 style={{fontFamily:"'Cinzel',serif",color:C.gold,margin:0,fontSize:20,letterSpacing:3}}>
              {isEdit ? "⚙ Edit Item" : "⚔ Forge New Item"}
            </h2>
            <p style={{color:C.textDim,fontSize:13,margin:"4px 0 0",fontFamily:"'Cinzel',serif",letterSpacing:1}}>
              {isEdit ? `ID: ${initial._id}` : "Admin — Item Management"}
            </p>
          </div>
          <button onClick={onClose} style={btn("icon")}>✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <SH>Identity</SH>
          <Row cols="2fr 1fr 1fr">
            <label style={label()}>
              Item Name *
              <input required style={inp()} value={form.name}
                onChange={e=>set("name",e.target.value)} placeholder="e.g. Zweihander" />
            </label>
            <label style={label()}>
              Type *
              <select style={inp()} value={form.type} onChange={e=>set("type",e.target.value)}>
                {ITEM_TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </label>
            <label style={label()}>
              Category *
              <select style={inp()} value={form.category} onChange={e=>set("category",e.target.value)}>
                {ALL_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </label>
          </Row>

          <label style={{...label(),marginBottom:16}}>
            Lore / Description
            <textarea style={inp({minHeight:72,resize:"vertical"})} value={form.description}
              onChange={e=>set("description",e.target.value)} placeholder="In-world lore or patch note..." />
          </label>

          <label style={{...label(),marginBottom:20}}>
            Image URL
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <input style={inp({flex:1})} value={form.imageUrl}
                onChange={e=>{set("imageUrl",e.target.value);setImgError(false);}}
                placeholder="https://example.com/weapon.png" />
              {form.imageUrl && !imgError && (
                <img src={form.imageUrl} alt="preview"
                  onError={()=>setImgError(true)}
                  style={{width:44,height:44,objectFit:"contain",borderRadius:6,
                    border:`1px solid ${C.border}`,background:C.bg0,flexShrink:0}} />
              )}
              {imgError && <span style={{color:C.red,fontSize:12}}>✖ Bad URL</span>}
            </div>
          </label>

          <SH>Base Stats</SH>
          <Row cols="1fr 1fr 1fr">
            <label style={label()}>
              Base Attack
              <input type="number" min={0} style={inp()} value={form.baseAttack}
                onChange={e=>set("baseAttack",+e.target.value)} />
            </label>
            <label style={label()}>
              Weight
              <input type="number" min={0} step={0.1} style={inp()} value={form.weight}
                onChange={e=>set("weight",+e.target.value)} />
            </label>
            <label style={label()}>
              Durability
              <input type="number" min={0} style={inp()} value={form.durability}
                onChange={e=>set("durability",+e.target.value)} />
            </label>
          </Row>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:28,marginBottom:20}}>
            <div>
              <SH>Stat Requirements</SH>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {STAT_KEYS.map(s=>(
                  <label key={s} style={label()}>
                    {STAT_LABELS[s]}
                    <input type="number" min={0} max={99} style={inp()} value={form.requiredStats[s]}
                      onChange={e=>setSub("requiredStats",s,+e.target.value)} />
                  </label>
                ))}
              </div>
            </div>
            <div>
              <SH>Scaling</SH>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {STAT_KEYS.map(s=>(
                  <label key={s} style={label()}>
                    {STAT_LABELS[s]}
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <select style={inp({flex:1})} value={form.scaling[s]}
                        onChange={e=>setSub("scaling",s,e.target.value)}>
                        {SCALING_GRADES.map(g=><option key={g} value={g}>{g}</option>)}
                      </select>
                      <GradeBadge grade={form.scaling[s]} />
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Availability */}
          <label style={{
            display:"flex",alignItems:"center",gap:10,
            cursor:"pointer",userSelect:"none",marginBottom:28,
            padding:"12px 16px", background:C.bg3, borderRadius:8,
            border:`1px solid ${form.isAvailable ? C.borderHi : C.border}`,
          }}>
            <input type="checkbox" checked={form.isAvailable}
              onChange={e=>set("isAvailable",e.target.checked)}
              style={{accentColor:C.gold,width:16,height:16}} />
            <span style={{
              fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:1,
              color:form.isAvailable ? C.gold : C.textDim,
            }}>
              {form.isAvailable ? "✔ Available in-game" : "✖ Unavailable / Hidden"}
            </span>
            <span style={{marginLeft:"auto",fontSize:12,color:C.textDim,fontFamily:"'Cinzel',serif"}}>
              Controls visibility in Build Editor & Item Database
            </span>
          </label>

          {/* Actions */}
          <div style={{display:"flex",gap:12,justifyContent:"flex-end",borderTop:`1px solid ${C.border}`,paddingTop:20}}>
            <button type="button" onClick={onClose} style={btn("ghost")} disabled={saving}>Cancel</button>
            <button type="submit" style={btn("success")} disabled={saving}>
              {saving ? "Saving…" : isEdit ? "⚔ Save Changes" : "⚔ Create Item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Table Row ────────────────────────────────────────────────────────────────
function ItemRow({ item, onEdit, onDelete, onToggle }) {
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    await onToggle(item._id);
    setToggling(false);
  };

  const td = (extra={}) => ({padding:"13px 12px",verticalAlign:"middle",fontSize:14,...extra});

  return (
    <tr style={{borderBottom:`1px solid ${C.border}`,transition:"background .1s"}}
      onMouseEnter={e=>e.currentTarget.style.background=C.bg3}
      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>

      {/* Name & image */}
      <td style={td()}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {item.imageUrl
            ? <img src={item.imageUrl} alt={item.name}
                style={{width:38,height:38,objectFit:"contain",borderRadius:5,
                  border:`1px solid ${C.border}`,background:C.bg0,flexShrink:0}}
                onError={e=>{e.target.style.display="none"}} />
            : <div style={{width:38,height:38,borderRadius:5,border:`1px solid ${C.border}`,
                background:C.bg0,display:"flex",alignItems:"center",justifyContent:"center",
                fontSize:18,color:C.textDim,flexShrink:0}}>⚔</div>
          }
          <div>
            <div style={{color:C.text,fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:.5}}>{item.name}</div>
            <div style={{color:C.textDim,fontSize:12,marginTop:2}}>{item.category}</div>
          </div>
        </div>
      </td>

      {/* Type */}
      <td style={td()}><TypePill type={item.type} /></td>

      {/* Base ATK */}
      <td style={td({textAlign:"center"})}>
        <span style={{color:"#f5c842",fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:15}}>
          {item.baseAttack}
        </span>
      </td>

      {/* Weight */}
      <td style={td({textAlign:"center",color:C.textMid})}>{item.weight}</td>

      {/* Scaling */}
      <td style={td()}>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {STAT_KEYS.map(s => item.scaling?.[s] && item.scaling[s]!=="-"
            ? <span key={s} title={s} style={{fontSize:11,color:C.textDim,fontFamily:"'Cinzel',serif"}}>{STAT_LABELS[s]}: <GradeBadge grade={item.scaling[s]} /></span>
            : null
          )}
        </div>
      </td>

      {/* Status */}
      <td style={td()}>
        <button onClick={handleToggle} disabled={toggling}
          style={{
            background:"none", border:`1px solid ${item.isAvailable ? C.green+"44" : C.red+"44"}`,
            borderRadius:20, padding:"3px 10px", cursor:"pointer",
            color:item.isAvailable ? C.green : C.red,
            fontSize:12, fontFamily:"'Cinzel',serif", letterSpacing:.5,
            transition:"all .15s",
          }}>
          {toggling ? "…" : item.isAvailable ? "● Active" : "● Disabled"}
        </button>
      </td>

      {/* Actions */}
      <td style={td({textAlign:"right",whiteSpace:"nowrap"})}>
        <button title="Edit" onClick={()=>onEdit(item)} style={{...btn("icon"),color:C.gold,marginRight:2}}>✎</button>
        <button title="Delete" onClick={()=>onDelete(item)} style={{...btn("icon"),color:C.red}}>⌫</button>
      </td>
    </tr>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ items }) {
  const counts = ITEM_TYPES.reduce((acc,t)=>({...acc,[t]:items.filter(i=>i.type===t).length}),{});
  const active  = items.filter(i=>i.isAvailable).length;
  return (
    <div style={{display:"flex",gap:12,flexWrap:"wrap",padding:"14px 32px",
      borderBottom:`1px solid ${C.border}`,background:C.bg1}}>
      {ITEM_TYPES.map(t=>(
        <div key={t} style={{
          background:C.bg2, border:`1px solid ${C.border}`,
          borderRadius:8, padding:"8px 16px", minWidth:80,
        }}>
          <div style={{fontSize:11,color:C.textDim,fontFamily:"'Cinzel',serif",letterSpacing:1}}>{t.toUpperCase()}</div>
          <div style={{fontSize:20,color:TYPE_COLOR[t],fontFamily:"'Cinzel',serif",fontWeight:700}}>{counts[t]}</div>
        </div>
      ))}
      <div style={{
        background:C.bg2, border:`1px solid ${C.green}44`,
        borderRadius:8, padding:"8px 16px", minWidth:80, marginLeft:"auto",
      }}>
        <div style={{fontSize:11,color:C.textDim,fontFamily:"'Cinzel',serif",letterSpacing:1}}>ACTIVE</div>
        <div style={{fontSize:20,color:C.green,fontFamily:"'Cinzel',serif",fontWeight:700}}>{active}</div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ItemManagement() {
  const { items, total, totalPages, loading, saving, error,
          fetchItems, createItem, updateItem, deleteItem, toggleItem } = useItems();

  const [search,      setSearch]      = useState("");
  const [filterType,  setFilterType]  = useState("");
  const [filterCat,   setFilterCat]   = useState("");
  const [page,        setPage]        = useState(1);
  const [modalItem,   setModalItem]   = useState(null);  // undefined=closed, null=new, obj=edit
  const [toDelete,    setToDelete]    = useState(null);
  const [toast,       setToast]       = useState(null);

  const showToast = useCallback((message, type="info")=>setToast({message,type}), []);

  const load = useCallback(() => {
    fetchItems({ search, type:filterType, category:filterCat, page, limit:10 });
  }, [fetchItems, search, filterType, filterCat, page]);

  useEffect(()=>{ load(); }, [load]);
  // Reset page when filters change
  useEffect(()=>{ setPage(1); }, [search, filterType, filterCat]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSave = async (form) => {
    const isEdit = !!form._id;
    const res = isEdit
      ? await updateItem(form._id, form)
      : await createItem(form);

    if (res.success) {
      showToast(isEdit ? `"${form.name}" updated.` : `"${form.name}" forged.`, "success");
      setModalItem(undefined);
      load();
    } else {
      showToast(res.message, "error");
    }
  };

  const handleDelete = async () => {
    const item = toDelete;
    setToDelete(null);
    const res = await deleteItem(item._id);
    if (res.success) { showToast(`"${item.name}" removed.`, "success"); load(); }
    else              showToast(res.message, "error");
  };

  const handleToggle = async (id) => {
    const res = await toggleItem(id);
    if (res.success) load();
    else showToast(res.message, "error");
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  const TH = ({children, align="left"}) => (
    <th style={{
      padding:"10px 12px", textAlign:align,
      fontFamily:"'Cinzel',serif", fontSize:10, letterSpacing:2,
      color:C.gold, fontWeight:400, textTransform:"uppercase",
      borderBottom:`1px solid ${C.borderHi}`,
    }}>{children}</th>
  );

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box}
        select option{background:#1a1410;color:#e8d5b0}
        input:focus,select:focus,textarea:focus{border-color:#5a3418!important;outline:none}
        input[type=number]::-webkit-inner-spin-button{opacity:.4}
        ::-webkit-scrollbar{width:6px;height:6px}
        ::-webkit-scrollbar-track{background:#0a0806}
        ::-webkit-scrollbar-thumb{background:#3d2810;border-radius:3px}
      `}</style>

      <div style={{minHeight:"100vh",background:C.bg0,color:C.text,fontFamily:"'Crimson Text',serif"}}>

        {/* ── Header ── */}
        <div style={{
          padding:"22px 32px", display:"flex", alignItems:"center",
          justifyContent:"space-between", borderBottom:`1px solid ${C.border}`,
          background:C.bg1,
        }}>
          <div>
            <h1 style={{fontFamily:"'Cinzel',serif",color:C.gold,margin:0,fontSize:22,letterSpacing:3}}>
              ⚙ Item Management
            </h1>
            <p style={{color:C.textDim,margin:"4px 0 0",fontSize:13,fontFamily:"'Cinzel',serif",letterSpacing:1.5}}>
              Admin Panel · Weapons, Armor &amp; Relics
            </p>
          </div>
          <button style={btn("primary")} onClick={()=>setModalItem(null)}>+ Forge New Item</button>
        </div>

        {/* ── Summary bar ── */}
        <StatsBar items={items} />

        {/* ── Filters ── */}
        <div style={{
          padding:"16px 32px", display:"flex", gap:12,
          flexWrap:"wrap", alignItems:"center",
          borderBottom:`1px solid ${C.border}`, background:C.bg1,
        }}>
          <input
            style={inp({maxWidth:280,flex:1,fontFamily:"'Crimson Text',serif"})}
            value={search} onChange={e=>setSearch(e.target.value)}
            placeholder="Search by name, category, lore…"
          />
          <select style={inp({maxWidth:150,flex:"0 0 auto"})} value={filterType} onChange={e=>setFilterType(e.target.value)}>
            <option value="">All Types</option>
            {ITEM_TYPES.map(t=><option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
          </select>
          <select style={inp({maxWidth:180,flex:"0 0 auto"})} value={filterCat} onChange={e=>setFilterCat(e.target.value)}>
            <option value="">All Categories</option>
            {ALL_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
          </select>
          <button style={btn("ghost")} onClick={load}>↻ Refresh</button>
          <span style={{
            marginLeft:"auto", color:C.textDim, fontSize:13,
            fontFamily:"'Cinzel',serif", letterSpacing:1,
          }}>
            {total} item{total!==1?"s":""}
          </span>
        </div>

        {/* ── Table ── */}
        <div style={{padding:"0 32px 40px"}}>
          {error && (
            <div style={{
              margin:"24px 0", padding:"14px 20px",
              background:"#2a0808", border:`1px solid ${C.red}`,
              borderRadius:8, color:"#f5a8a8",
              fontFamily:"'Cinzel',serif", fontSize:13,
            }}>
              ✖ {error}
            </div>
          )}

          {loading ? (
            <div style={{textAlign:"center",padding:"80px 0",color:C.textDim,fontFamily:"'Cinzel',serif",letterSpacing:3}}>
              <div style={{fontSize:44,marginBottom:16,opacity:.4}}>⚔</div>
              Loading the Armory…
            </div>
          ) : items.length===0 ? (
            <div style={{textAlign:"center",padding:"80px 0",color:C.textDim,fontFamily:"'Cinzel',serif",letterSpacing:3}}>
              <div style={{fontSize:44,marginBottom:12,opacity:.3}}>◇</div>
              No items found.
              {(search||filterType||filterCat) && (
                <div style={{marginTop:16}}>
                  <button style={btn("ghost")} onClick={()=>{setSearch("");setFilterType("");setFilterCat("");}}>
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{overflowX:"auto",marginTop:4}}>
              <table style={{width:"100%",borderCollapse:"collapse",minWidth:700}}>
                <thead>
                  <tr>
                    <TH>Item</TH>
                    <TH>Type</TH>
                    <TH align="center">Base ATK</TH>
                    <TH align="center">Weight</TH>
                    <TH>Scaling</TH>
                    <TH>Status</TH>
                    <TH align="right">Actions</TH>
                  </tr>
                </thead>
                <tbody>
                  {items.map(item=>(
                    <ItemRow key={item._id} item={item}
                      onEdit={setModalItem}
                      onDelete={setToDelete}
                      onToggle={handleToggle} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages>1 && (
            <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:32}}>
              <button style={btn("ghost")} disabled={page<=1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
              {Array.from({length:totalPages},(_,i)=>i+1).map(p=>(
                <button key={p} onClick={()=>setPage(p)} style={{
                  ...btn(p===page?"primary":"ghost"),
                  minWidth:38,padding:"8px 10px",
                  ...(p===page?{borderColor:C.gold}:{}),
                }}>
                  {p}
                </button>
              ))}
              <button style={btn("ghost")} disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {modalItem !== undefined && (
        <ItemFormModal
          initial={modalItem}
          onSave={handleSave}
          onClose={()=>setModalItem(undefined)}
          saving={saving}
        />
      )}
      {toDelete && (
        <ConfirmModal
          itemName={toDelete.name}
          onConfirm={handleDelete}
          onCancel={()=>setToDelete(null)}
        />
      )}
      {toast && <Toast {...toast} onClose={()=>setToast(null)} />}
    </>
  );
}
