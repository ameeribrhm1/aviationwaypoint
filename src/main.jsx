import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { PlaneTakeoff, PlaneLanding, Search, ListChecks, ChevronLeft, ZoomIn, ZoomOut, RotateCcw, ArrowLeft, MapPin, Navigation, Home } from 'lucide-react';
import { procedures, waypoints } from './data';
import './style.css';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register(import.meta.env.BASE_URL + 'sw.js').catch(() => {}));
}

function App() {
  const [page,setPage]=useState('home');
  const [kind,setKind]=useState('departure');
  const [selected,setSelected]=useState(null);
  const [query,setQuery]=useState('');
  const [zoom,setZoom]=useState(null);
  const grouped=useMemo(()=> {
    const list=procedures.filter(p=>p.type===kind);
    const groups={};
    list.forEach(p=>(groups[p.runway]??=[]).push(p));
    return groups;
  },[kind]);
  const chosenWaypoint=useMemo(()=>{
    const q=query.trim().toUpperCase();
    if(!q) return [];
    return waypoints.filter(w=>w.identifier.includes(q)).slice(0,30);
  },[query]);
  const openProcedure=(p)=>{setSelected(p);setPage('procedure');};
  const backHome=()=>{setPage('home');setSelected(null);setZoom(null);};
  const wpById=(id)=> {
    const aliases={NLOO1:'NL001',NLOO2:'NL002',SLOO1:'SL001',SLO04:'SL004',SLOOS:'SL005',NCOOS:'NC005',NCO003:'NC003',NCO01:'NC001',NCO04:'NC004',NCO05:'NC005',SCO001:'SC001'};
    const key=aliases[id]||id;
    return waypoints.find(w=>w.identifier===key)||waypoints.find(w=>w.identifier===id);
  };
  return <div className="app-shell">
    <header className="topbar">
      <div className="brand-mark"><Navigation size={19}/></div>
      <div><div className="eyebrow">AIRPORT REFERENCE</div><div className="brand-title">Aviation Procedures</div></div>
      {page!=='home' && <button className="icon-button top-back" onClick={backHome} aria-label="Back to home"><ArrowLeft size={19}/></button>}
    </header>

    {page==='home' && <main className="main home-main">
      <div className="welcome"><div className="eyebrow">PROCEDURE LIBRARY</div><h1>Departures &<br/>Arrivals</h1><p>Select a runway procedure to view its chart and waypoint details.</p></div>
      <div className="segmented">
        <button className={kind==='departure'?'active':''} onClick={()=>setKind('departure')}><PlaneTakeoff size={17}/> Departures</button>
        <button className={kind==='arrival'?'active':''} onClick={()=>setKind('arrival')}><PlaneLanding size={17}/> Arrivals</button>
      </div>
      {Object.entries(grouped).map(([runway,items])=><section className="runway-section" key={runway}>
        <div className="section-heading"><span className="runway-dot"/><h2>Runway: {runwayName(runway)}</h2><span className="runway-code">{runway}</span></div>
        <div className="procedure-list">{items.map(p=><button className="procedure-row" key={p.name} onClick={()=>openProcedure(p)}>
          <span className="procedure-icon">{kind==='departure'?<PlaneTakeoff size={18}/>:<PlaneLanding size={18}/>}</span>
          <span className="procedure-name">{p.name}</span><span className="row-chevron">›</span>
        </button>)}</div>
      </section>)}
    </main>}

    {page==='procedure' && selected && <main className="main detail-main">
      <button className="back-link" onClick={backHome}><ChevronLeft size={17}/> All procedures</button>
      <div className="detail-heading"><span className={'type-pill '+selected.type}>{selected.type==='departure'?'DEPARTURE':'ARRIVAL'} · RWY {selected.runway}</span><h1>{selected.name}</h1><p>Chart and procedure information</p></div>
      <section className="chart-card">
        <div className="chart-toolbar"><span>PROCEDURE CHART</span><span className="chart-hint">Pinch to zoom · Drag to move</span></div>
        <TransformWrapper initialScale={1} minScale={0.65} maxScale={5} centerOnInit={true} wheel={{step:0.15}} doubleClick={{mode:'reset'}}>
          {({zoomIn,zoomOut,resetTransform})=><>
            <div className="chart-controls">
              <button onClick={()=>zoomIn()} aria-label="Zoom in"><ZoomIn size={18}/></button>
              <button onClick={()=>zoomOut()} aria-label="Zoom out"><ZoomOut size={18}/></button>
              <button onClick={()=>resetTransform()} aria-label="Reset zoom"><RotateCcw size={17}/></button>
            </div>
            <div className="chart-viewport"><TransformComponent wrapperStyle={{width:'100%',height:'100%'}} contentStyle={{width:'100%',height:'100%',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <img className="chart-image" src={import.meta.env.BASE_URL + selected.image.replace(/^\//,'')} alt={selected.name+' procedure chart'} />
            </TransformComponent></div>
          </>}
        </TransformWrapper>
      </section>
      <section className="info-card">
        <div className="card-kicker">PROCEDURE DESCRIPTION</div><h2>{selected.name}</h2><p className="description">{selected.description}</p>
        <div className="waypoint-title"><div><div className="card-kicker">ROUTE SEQUENCE</div><h3>Waypoints</h3></div><span>{selected.waypoints.length} points</span></div>
        <div className="waypoint-list">{selected.waypoints.map((id,i)=>{
          const w=wpById(id);
          return <div className="waypoint-item" key={id}>
            <div className="waypoint-number">{i+1}</div><div className="waypoint-content">
              <div className="waypoint-id">{id}</div>
              {w?<><div className="coordinate-line"><span>Lat</span><strong>{w.lat.toFixed(6)}</strong></div><div className="coordinate-line"><span>Lon</span><strong>{w.lon.toFixed(6)}</strong></div><div className="waypoint-description">{w.description}</div></>:<div className="missing-data">Coordinate not confidently identified in the supplied waypoint tables.</div>}
            </div>
          </div>;
        })}</div>
      </section>
      <button className="select-another" onClick={backHome}><Home size={18}/> Select another procedure</button>
      <div className="safety-note">Reference only. Always verify against current approved aeronautical information and operational instructions.</div>
    </main>}

    {page==='search' && <main className="main search-main">
      <div className="welcome compact"><div className="eyebrow">WAYPOINT DATABASE</div><h1>Search waypoints</h1><p>Search by waypoint identifier to view its coordinates and classification.</p></div>
      <label className="search-box"><Search size={20}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Enter identifier (e.g. NODDY)" autoComplete="off"/>{query&&<button onClick={()=>setQuery('')}>Clear</button>}</label>
      {!query.trim()?<div className="empty-state"><div className="empty-icon"><MapPin size={25}/></div><h3>Find a waypoint</h3><p>Start typing an identifier to search the waypoint tables supplied with the app.</p><div className="popular">{['NODDY','GUNER','NLEND','SPIKE','CALYX'].map(s=><button key={s} onClick={()=>setQuery(s)}>{s}</button>)}</div></div>:
      <div className="search-results"><div className="results-count">{chosenWaypoint.length} matching {chosenWaypoint.length===1?'waypoint':'waypoints'}</div>
        {chosenWaypoint.map(w=><article className="waypoint-result" key={w.identifier}><div className="result-top"><div><div className="card-kicker">IDENTIFIER</div><h2>{w.identifier}</h2></div><span className="result-type">{w.description}</span></div><div className="result-coordinates"><div><span>LATITUDE</span><strong>{w.lat.toFixed(6)}</strong></div><div><span>LONGITUDE</span><strong>{w.lon.toFixed(6)}</strong></div></div><div className="result-description"><span>DESCRIPTION</span><strong>{w.description}</strong></div></article>)}
        {!chosenWaypoint.length&&<div className="no-results">No matching identifier found in the supplied waypoint tables.</div>}
      </div>}
      <div className="source-note">Waypoint records transcribed from Waypoints location images 1–6. Verify all data before operational use.</div>
    </main>}

    <nav className="bottom-nav">
      <button className={page==='home'?'selected':''} onClick={backHome}><PlaneTakeoff size={20}/><span>Departures & Arrivals</span></button>
      <button className={page==='procedure'?'selected':''} onClick={()=>selected?setPage('procedure'):setPage('home')}><ListChecks size={20}/><span>Selected procedure</span></button>
      <button className={page==='search'?'selected':''} onClick={()=>setPage('search')}><Search size={20}/><span>Search waypoint</span></button>
    </nav>
  </div>;
}
function runwayName(code) {
  return ({NL:'North Left',NR:'North Right',SC:'South Center',NC:'North Center',SL:'South Left'})[code]||code;
}
createRoot(document.getElementById('root')).render(<App/>);
