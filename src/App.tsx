// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, collection, getDocs, updateDoc, addDoc } from 'firebase/firestore';
import { 
  Trophy, Coins, UserPlus, UserMinus, Activity, X, Users, 
  LayoutDashboard, Shirt, Search, Filter, Shield, TrendingUp, 
  TrendingDown, Star, Settings, Award, Clock, Calendar, CheckCircle2, ChevronRight, LogOut, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

// --- FASE DE GRUPOS Y PLAYOFFS ---
const tournamentData = {
  grupos: [
    {
      nombre: "Grupo A",
      posiciones: [
        { pos: 1, equipo: "Industrial Gunners", pts: 9, pg: 3, pe: 0, pp: 1, pj: 4, gf: 20, gc: 6, dif: 14 },
        { pos: 2, equipo: "REAL EFINEZA FC", pts: 9, pg: 3, pe: 0, pp: 1, pj: 4, gf: 16, gc: 6, dif: 10 },
        { pos: 3, equipo: "Comercial Niupi FC", pts: 6, pg: 2, pe: 0, pp: 2, pj: 4, gf: 2, gc: 16, dif: -14 },
        { pos: 4, equipo: "KinesterCity FC", pts: 3, pg: 1, pe: 0, pp: 3, pj: 4, gf: 10, gc: 10, dif: 0 },
        { pos: 5, equipo: "Manchester Watts", pts: 3, pg: 1, pe: 0, pp: 3, pj: 4, gf: 8, gc: 18, dif: -10 }
      ]
    },
    {
      nombre: "Grupo B",
      posiciones: [
        { pos: 1, equipo: "Manchester Civil", pts: 12, pg: 4, pe: 0, pp: 0, pj: 4, gf: 13, gc: 5, dif: 8 },
        { pos: 2, equipo: "EFI United", pts: 9, pg: 3, pe: 0, pp: 1, pj: 4, gf: 19, gc: 7, dif: 12 },
        { pos: 3, equipo: "CA Bucal Juniors", pts: 5, pg: 1, pe: 1, pp: 2, pj: 4, gf: 5, gc: 5, dif: 0 },
        { pos: 4, equipo: "Corte Supremo", pts: 3, pg: 1, pe: 0, pp: 3, pj: 4, gf: 4, gc: 24, dif: -20 },
        { pos: 5, equipo: "Comercial United", pts: 2, pg: 0, pe: 1, pp: 3, pj: 4, gf: 6, gc: 6, dif: 0 }
      ]
    },
    {
      nombre: "Grupo C",
      posiciones: [
        { pos: 1, equipo: "West hambiental", pts: 9, pg: 3, pe: 0, pp: 0, pj: 3, gf: 24, gc: 3, dif: 21 },
        { pos: 2, equipo: "Club Atletico Kineiro", pts: 9, pg: 3, pe: 0, pp: 0, pj: 3, gf: 24, gc: 7, dif: 17 },
        { pos: 3, equipo: "Periodismo FC", pts: 6, pg: 2, pe: 0, pp: 2, pj: 4, gf: 11, gc: 19, dif: -8 },
        { pos: 4, equipo: "CD Historia B", pts: 3, pg: 1, pe: 0, pp: 3, pj: 4, gf: 10, gc: 17, dif: -7 },
        { pos: 5, equipo: "ElectricsDeMarsella", pts: 0, pg: 0, pe: 0, pp: 4, pj: 4, gf: 3, gc: 26, dif: -23 }
      ]
    },
    {
      nombre: "Grupo D",
      posiciones: [
        { pos: 1, equipo: "INDU-FU", pts: 9, pg: 3, pe: 0, pp: 0, pj: 3, gf: 18, gc: 7, dif: 11 },
        { pos: 2, equipo: "Real Construcción", pts: 3, pg: 1, pe: 0, pp: 1, pj: 2, gf: 13, gc: 7, dif: 6 },
        { pos: 3, equipo: "NUTRINAITED", pts: 3, pg: 1, pe: 0, pp: 1, pj: 2, gf: 11, gc: 7, dif: 4 },
        { pos: 4, equipo: "Hipergolémicos FC", pts: 0, pg: 0, pe: 0, pp: 3, pj: 3, gf: 5, gc: 26, dif: -21 }
      ]
    }
  ],
  playoffs: [
    {
      id: 'P1',
      fase: "Cuartos de Final",
      estado: "Finalizado",
      fecha: "14 oct, 2026 - 12:00",
      equipoLocal: "Manchester Civil",
      equipoVisita: "Club Atletico Kineiro",
      golesLocal: 7,
      golesVisita: 3
    },
    {
      id: 'P2',
      fase: "Cuartos de Final",
      estado: "Finalizado",
      fecha: "13 oct, 2026 - 12:00",
      equipoLocal: "INDU-FU",
      equipoVisita: "EFI United",
      golesLocal: 5,
      golesVisita: 2
    },
    {
      id: 'P3',
      fase: "Cuartos de Final",
      estado: "Finalizado",
      fecha: "Por definir",
      equipoLocal: "West hambiental",
      equipoVisita: "Industrial Gunners",
      golesLocal: 9,
      golesVisita: 8
    },
    {
      id: 'P4',
      fase: "Cuartos de Final",
      estado: "Finalizado",
      fecha: "14 oct, 2026 - 12:00",
      equipoLocal: "REAL EFINEZA FC",
      equipoVisita: "Real Construcción",
      golesLocal: 7,
      golesVisita: 3
    },
    {
      id: 'P5',
      fase: "Semifinal - Ida",
      estado: "Finalizado",
      fecha: "Sábado 7 de noviembre",
      equipoLocal: "INDU-FU",
      equipoVisita: "Manchester Civil",
      golesLocal: 0,
      golesVisita: 0
    },
    {
      id: 'P6',
      fase: "Semifinal - Ida",
      estado: "Por jugar",
      fecha: "Jueves 12 de noviembre, 17:00",
      equipoLocal: "REAL EFINEZA FC",
      equipoVisita: "West hambiental",
      golesLocal: "-",
      golesVisita: "-"
    }
  ]
};

// Componente de Resultados y Playoffs con Votación Integrada
const ResultadosSection = ({ onVote }) => (
  <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl mb-8 text-slate-200">
    <h2 className="text-2xl font-black mb-6 text-white uppercase tracking-wider">Resultados del Campeonato</h2>
    
    {/* Playoffs */}
    <h3 className="text-xl font-bold mb-4 border-b-2 border-slate-800 pb-2 text-slate-300">Llaves Finales (Playoffs)</h3>
    <div className="grid gap-4 md:grid-cols-2 mb-10">
      {tournamentData.playoffs.map((partido, index) => (
        <div key={index} className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-center shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs text-slate-500 font-bold mb-3">{partido.fase} | {partido.fecha}</p>
            <div className="flex justify-between items-center px-2">
              <span className="font-semibold w-2/5 truncate text-right text-white">{partido.equipoLocal}</span>
              <span className="text-xl font-black bg-slate-800 text-emerald-400 px-3 py-1 rounded mx-2 w-1/5 border border-slate-700">
                {partido.golesLocal} - {partido.golesVisita}
              </span>
              <span className="font-semibold w-2/5 truncate text-left text-white">{partido.equipoVisita}</span>
            </div>
            <div className="mt-4">
              <span className={`text-[10px] uppercase inline-block px-3 py-1 rounded-full font-bold ${partido.estado === 'Finalizado' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 'bg-amber-900/50 text-amber-400 border border-amber-800'}`}>
                {partido.estado}
              </span>
            </div>
          </div>
          {/* Botón de Votación MVP */}
          {partido.estado === 'Finalizado' && (
            <button 
              onClick={() => onVote(partido)} 
              className="mt-4 w-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 py-2 rounded font-bold text-xs uppercase tracking-wider transition-colors">
              Votar MVP del Partido
            </button>
          )}
        </div>
      ))}
    </div>

    {/* Fase de Grupos */}
    <h3 className="text-xl font-bold mb-4 border-b-2 border-slate-800 pb-2 text-slate-300">Fase de Grupos</h3>
    <div className="grid gap-6 md:grid-cols-2">
      {tournamentData.grupos.map((grupo, gIndex) => (
        <div key={gIndex} className="bg-slate-900 border border-slate-800 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-[#28638a] text-white font-bold px-4 py-2 text-sm">{grupo.nombre}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-2 py-2">Pos</th>
                  <th className="px-2 py-2">Equipo</th>
                  <th className="px-1 py-2 text-center font-bold">PTS</th>
                  <th className="px-1 py-2 text-center">PJ</th>
                  <th className="px-1 py-2 text-center">PG</th>
                  <th className="px-1 py-2 text-center">DIF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {grupo.posiciones.map((equipo, eIndex) => (
                  <tr key={eIndex} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-2 py-2 font-semibold text-white">{equipo.pos}</td>
                    <td className="px-2 py-2 truncate max-w-[120px] text-slate-300">{equipo.equipo}</td>
                    <td className="px-1 py-2 text-center font-black text-[#28638a]">{equipo.pts}</td>
                    <td className="px-1 py-2 text-center text-slate-500">{equipo.pj}</td>
                    <td className="px-1 py-2 text-center text-slate-500">{equipo.pg}</td>
                    <td className="px-1 py-2 text-center text-slate-500">{equipo.dif}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Gráfico CSS/SVG Personalizado para la Evolución de Mercado
const MarketTrendChart = ({ players }) => {
  if (!players || players.length === 0) return null;
  const maxVal = Math.max(...players.map(p => p.currentValue), ...players.map(p => p.baseValue)) + 0.5;
  const minVal = Math.max(0, Math.min(...players.map(p => p.currentValue), ...players.map(p => p.baseValue)) - 0.5);
  
  const mapY = (val) => 100 - ((val - minVal) / (maxVal - minVal)) * 100;
  const colors = ['#34d399', '#38bdf8', '#fbbf24', '#f472b6', '#a78bfa']; 
  
  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 relative shadow-xl col-span-1 lg:col-span-2">
      <h3 className="text-xl font-black text-white mb-6 uppercase flex items-center gap-2"><TrendingUp className="text-emerald-400"/> Evolución de Mercado (Top 5 Alzas)</h3>
      <div className="relative h-48 mt-4 ml-8 mr-4">
        {/* Eje Y Labels */}
        <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-[9px] text-slate-500 font-bold h-[100px] z-10 w-8">
           <span className="absolute top-0 -mt-2">${maxVal.toFixed(1)}</span>
           <span className="absolute top-1/2 -mt-2">${((maxVal+minVal)/2).toFixed(1)}</span>
           <span className="absolute top-full -mt-2">${minVal.toFixed(1)}</span>
        </div>

        <svg viewBox="0 0 300 100" className="w-full h-[100px] overflow-visible" preserveAspectRatio="none">
          {/* Grid de fondo */}
          <line x1="0" y1="0" x2="300" y2="0" stroke="#1e293b" strokeWidth="1" />
          <line x1="0" y1="50" x2="300" y2="50" stroke="#1e293b" strokeWidth="1" strokeDasharray="4" />
          <line x1="0" y1="100" x2="300" y2="100" stroke="#1e293b" strokeWidth="1" />
          
          {players.map((p, i) => {
            const j0 = p.baseValue;
            const j3 = p.currentValue;
            const diff = j3 - j0;
            // Simulamos puntos intermedios para generar la curva de historial
            const j1 = j0 + (diff * 0.25) + (Math.random() * 0.1); 
            const j2 = j0 + (diff * 0.70) + (Math.random() * 0.1);
            
            const points = `0,${mapY(j0)} 100,${mapY(j1)} 200,${mapY(j2)} 300,${mapY(j3)}`;
            
            return (
              <g key={p.id}>
                <polyline points={points} stroke={colors[i]} fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="0" cy={mapY(j0)} r="3" fill={colors[i]} />
                <circle cx="100" cy={mapY(j1)} r="3" fill={colors[i]} />
                <circle cx="200" cy={mapY(j2)} r="3" fill={colors[i]} />
                <circle cx="300" cy={mapY(j3)} r="4" fill="#0f172a" stroke={colors[i]} strokeWidth="2" />
              </g>
            );
          })}
        </svg>
        {/* Eje X Labels */}
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] font-bold text-slate-500 uppercase">
          <span className="w-8 text-left -ml-4">J0</span>
          <span className="w-8 text-center -ml-4">J1</span>
          <span className="w-8 text-center -mr-4">J2</span>
          <span className="w-8 text-right -mr-4 text-emerald-400">J3</span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4 justify-center border-t border-slate-800 pt-4">
         {players.map((p, i) => (
           <div key={p.id} className="flex items-center gap-1.5 text-xs font-bold">
             <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: colors[i] }}></span>
             <span className="text-slate-300">{p.name} <span className="text-slate-500 text-[10px]">({p.team})</span></span>
           </div>
         ))}
      </div>
    </div>
  );
};

// --- 1. FIREBASE INITIALIZATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBW2t2zSbMdc1xXuUAdjgzUpHpPos-Bp7Q",
  authDomain: "fantasy-ufro.firebaseapp.com",
  projectId: "fantasy-ufro",
  storageBucket: "fantasy-ufro.firebasestorage.app",
  messagingSenderId: "236492290972",
  appId: "1:236492290972:web:c90da36075dab45fe3a659",
  measurementId: "G-KK77GSK4P1"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'fantasy-ufro-app';

// --- 2. CONFIGURACIÓN DEL JUEGO ---
const POSITIONS = ['POR', 'DEF', 'MED', 'DEL'];
const SQUAD_REQUIREMENTS = { POR: 2, DEF: 4, MED: 4, DEL: 4 }; 
const STARTING_LIMITS = { POR: 1, DEF: 2, MED: 2, DEL: 2 }; 

const ADMIN_EMAIL = 'a.soto16@ufromail.cl';
const JORNADA_ACTUAL = 3;

const POINTS_RULES = {
  played: 1,
  goal: { POR: 6, DEF: 6, MED: 5, DEL: 4 },
  cleanSheet: { POR: 4, DEF: 4, MED: 1, DEL: 0 },
  mvp: 3,
  captainMultiplier: 2,
};

const calcPlayerPoints = (pos, stat) => {
  if (!stat || !stat.played) return 0;
  return (
    POINTS_RULES.played +
    (stat.goals || 0) * POINTS_RULES.goal[pos] +
    (stat.cleanSheet ? POINTS_RULES.cleanSheet[pos] : 0) +
    (stat.mvp ? POINTS_RULES.mvp : 0)
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authMode, setAuthMode] = useState('login'); 
  const [authForm, setAuthForm] = useState({ email: '', password: '', displayName: '' });
  const [authError, setAuthError] = useState('');

  const [activeView, setActiveView] = useState('dashboard');
  const [notification, setNotification] = useState(null);
  
  const [managers, setManagers] = useState([]);
  const [myManagerData, setMyManagerData] = useState(null);
  const [votes, setVotes] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);
  const [adminMatch, setAdminMatch] = useState(null);
  
  const [marketFilters, setMarketFilters] = useState({ search: '', pos: 'ALL' });
  const [selectedPlayerForEdit, setSelectedPlayerForEdit] = useState(null);
  const [newJerseyNum, setNewJerseyNum] = useState('');
  const [selectedMatchForVote, setSelectedMatchForVote] = useState(null);

  const [staticMarket, setStaticMarket] = useState([]);
  const [marketLoading, setMarketLoading] = useState(true);

  // Carga Base Market (Google Sheets)
  useEffect(() => {
    const fetchRealMarket = () => {
      const sheetCSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ5-5s8ZEuwdPOaYLM4xY4haLM0DqXmsm6pDsCuZH_RcJlMrI7zJX3QlQvCdTgq2P8y3TxlnshQtoNZ/pub?gid=0&single=true&output=csv"; 
      
      Papa.parse(sheetCSV_URL, {
        download: true,
        header: true,
        complete: (results) => {
          const realPlayers = results.data
            .filter(row => row['ID Jugador'] && row['Nombre Jugador']) 
            .map(row => ({
              id: row['ID Jugador'],
              name: row['Nombre Jugador'],
              team: row['Equipo'],
              pos: row['Posición'],
              value: parseFloat(row['Valor de Mercado ($)']) || 5.0, // Base Value
              rating: parseFloat(row['Valoración general']) || 4.0, 
              goals: parseInt(row['Goles']) || 0,
              cleanSheets: parseInt(row['Vallas Invictas']) || 0,
            }));
          setStaticMarket(realPlayers);
          setMarketLoading(false);
        }
      });
    };
    fetchRealMarket();
  }, []);

  // --- CALCULO DINAMICO DE MERCADO (OFERTA/DEMANDA) ---
  const dynamicMarket = useMemo(() => {
    if (!staticMarket || staticMarket.length === 0) return [];
    
    // 1. Contar a cuántos equipos pertenece cada jugador
    const ownershipCounts = {};
    managers.forEach(m => {
      (m.squad || []).forEach(sq => {
        ownershipCounts[sq.id] = (ownershipCounts[sq.id] || 0) + 1;
      });
    });

    // 2. Calcular nuevo valor
    return staticMarket.map(p => {
      const baseVal = p.value || 5.0; 
      const owners = ownershipCounts[p.id] || 0;
      
      // Oferta/Demanda: +$0.2M por cada mánager que lo compre
      const ownershipBonus = owners * 0.2; 
      
      // Rendimiento: Bonus por goles e invictos
      const performanceBonus = (p.goals * 0.15) + (p.cleanSheets * 0.1); 
      
      // Depreciación base si nadie lo tiene
      const depreciation = JORNADA_ACTUAL * 0.05; 

      let currentVal = baseVal + ownershipBonus + performanceBonus - depreciation;
      currentVal = Math.max(0.5, currentVal); // Valor mínimo $0.5M
      
      return {
        ...p,
        baseValue: baseVal,
        currentValue: parseFloat(currentVal.toFixed(2)),
        valueDiff: parseFloat((currentVal - baseVal).toFixed(2)),
        ownersCount: owners
      };
    });
  }, [staticMarket, managers]);


  // Init Auth & Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const managersRef = collection(db, 'artifacts', appId, 'public', 'data', 'managers');
    const unsubManagers = onSnapshot(managersRef, (snapshot) => {
      const allManagers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setManagers(allManagers);
      
      const me = allManagers.find(m => m.id === user.uid);
      if (me) {
        setMyManagerData(me);
      } else {
        const initialData = {
          name: user.displayName || 'Manager',
          teamName: 'Mi Equipo FC',
          color: '#28638a',
          budget: 50.0,
          points: 0,
          totalValue: 0,
          squad: []
        };
        setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'managers', user.uid), initialData);
      }
    });

    const votesRef = collection(db, 'artifacts', appId, 'public', 'data', 'votes');
    const unsubVotes = onSnapshot(votesRef, (snapshot) => {
      setVotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const statsRef = collection(db, 'artifacts', appId, 'public', 'data', 'playerStats');
    const unsubStats = onSnapshot(statsRef, (snapshot) => {
      setPlayerStats(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubManagers(); unsubVotes(); unsubStats(); };
  }, [user]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (authMode === 'login') await signInWithEmailAndPassword(auth, authForm.email, authForm.password);
      else await createUserWithEmailAndPassword(auth, authForm.email, authForm.password);
    } catch (err) { setAuthError(err.message); }
  };

  const notify = (message, type = 'error') => setNotification({ message, type });
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Derived Squad Data
  const squadDetails = useMemo(() => {
    if (!myManagerData) return [];
    return myManagerData.squad.map(sq => {
      const playerInfo = dynamicMarket.find(p => p.id === sq.id) || {};
      return { ...playerInfo, ...sq };
    });
  }, [myManagerData, dynamicMarket]);

  const squadValue = squadDetails.reduce((sum, p) => sum + (p.currentValue || 0), 0);
  
  useEffect(() => {
    if (myManagerData && Math.abs(myManagerData.totalValue - squadValue) > 0.1) {
      updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'managers', user.uid), {
        totalValue: squadValue
      });
    }
  }, [squadValue, myManagerData, user]);

  const filteredMarket = useMemo(() => {
    return dynamicMarket.filter(p => {
      const isOwned = squadDetails.some(sq => sq.id === p.id);
      if (isOwned) return false;
      const matchSearch = p.name.toLowerCase().includes(marketFilters.search.toLowerCase()) || 
                          p.team.toLowerCase().includes(marketFilters.search.toLowerCase());
      const matchPos = marketFilters.pos === 'ALL' || p.pos === marketFilters.pos;
      return matchSearch && matchPos;
    }).sort((a, b) => b.rating - a.rating);
  }, [squadDetails, marketFilters, dynamicMarket]);

  // Actions
  const handleBuyPlayer = async (player) => {
    if (squadDetails.length >= 14) return notify('Límite de 14 jugadores alcanzado.');
    if (myManagerData.budget < player.currentValue) return notify('Presupuesto insuficiente.');

    const newSquad = [...myManagerData.squad, { id: player.id, isStarter: false, isCaptain: false, number: Math.floor(Math.random() * 99) + 1 }];
    const newBudget = parseFloat((myManagerData.budget - player.currentValue).toFixed(1));

    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'managers', user.uid), { squad: newSquad, budget: newBudget });
    notify(`Fichaste a ${player.name}`, 'success');
  };

  const handleSellPlayer = async (player) => {
    const newSquad = myManagerData.squad.filter(sq => sq.id !== player.id);
    const newBudget = parseFloat((myManagerData.budget + player.currentValue).toFixed(1));
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'managers', user.uid), { squad: newSquad, budget: newBudget });
    notify(`Vendiste a ${player.name} por $${player.currentValue.toFixed(1)}M`, 'success');
  };

  const toggleStarter = async (player) => {
    const isCurrentlyStarter = player.isStarter;
    let newSquad = [...myManagerData.squad];
    const playerIdx = newSquad.findIndex(sq => sq.id === player.id);

    if (isCurrentlyStarter) {
      newSquad[playerIdx].isStarter = false;
      if (newSquad[playerIdx].isCaptain) newSquad[playerIdx].isCaptain = false;
    } else {
      const posStarters = squadDetails.filter(p => p.isStarter && p.pos === player.pos).length;
      const totalStarters = squadDetails.filter(p => p.isStarter).length;
      
      if (posStarters >= STARTING_LIMITS[player.pos]) return notify(`Límite de titulares en ${player.pos} alcanzado.`);
      if (totalStarters >= 7) return notify(`Límite de 7 titulares alcanzado.`);
      
      newSquad[playerIdx].isStarter = true;
    }
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'managers', user.uid), { squad: newSquad });
  };

  const savePlayerEdit = async () => {
    if (!selectedPlayerForEdit) return;
    let newSquad = [...myManagerData.squad];
    const idx = newSquad.findIndex(sq => sq.id === selectedPlayerForEdit.id);
    if (idx !== -1) {
      newSquad[idx].number = parseInt(newJerseyNum) || newSquad[idx].number;
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'managers', user.uid), { squad: newSquad });
    }
    setSelectedPlayerForEdit(null);
  };

  const setCaptain = async (playerId) => {
    let newSquad = myManagerData.squad.map(sq => ({ ...sq, isCaptain: sq.id === playerId }));
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'managers', user.uid), { squad: newSquad });
    notify('Capitán actualizado', 'success');
  };

  const handleVoteMVP = async (matchId, playerId) => {
    if (!user) return;
    const existingVote = votes.find(v => v.userId === user.uid && v.matchId === matchId);
    if (existingVote) return notify('Ya votaste en este partido');

    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'votes'), {
      userId: user.uid, matchId: matchId, playerId: playerId, timestamp: new Date().toISOString()
    });
    notify('Voto registrado', 'success');
    setSelectedMatchForVote(null);
  };

  const getStat = (playerId) => playerStats.find(s => s.id === `J${JORNADA_ACTUAL}_${playerId}`) || {};
  const saveStat = (playerId, changes) => setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'playerStats', `J${JORNADA_ACTUAL}_${playerId}`), { playerId, jornada: JORNADA_ACTUAL, ...changes }, { merge: true });

  const calculateJornadaPoints = async () => {
    for (const m of managers) {
      let total = 0;
      for (const sq of m.squad || []) {
        if (!sq.isStarter) continue;
        const p = dynamicMarket.find(x => x.id === sq.id);
        if (!p) continue;
        let pts = calcPlayerPoints(p.pos, getStat(sq.id));
        if (sq.isCaptain) pts *= POINTS_RULES.captainMultiplier;
        total += pts;
      }
      const jornadaPoints = { ...(m.jornadaPoints || {}), [`J${JORNADA_ACTUAL}`]: total };
      const points = Object.values(jornadaPoints).reduce((a, b) => a + b, 0);
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'managers', m.id), { jornadaPoints, points });
    }
    notify('Puntos calculados', 'success');
  };

  const JerseyIcon = ({ color, number, name, isCaptain, pos }) => (
    <div className="relative flex flex-col items-center justify-center group cursor-pointer hover:scale-105 transition-transform w-20 h-24">
      <svg width="60" height="60" viewBox="0 0 24 24" fill={color} stroke="rgba(255,255,255,0.2)" strokeWidth="1" className="drop-shadow-xl z-10">
        <path d="M 6 4 L 18 4 L 23 10 L 19 13 L 18 9 L 18 22 L 6 22 L 6 9 L 5 13 L 1 10 Z" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center z-20 pb-4">
        <span className="font-black text-white text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-tighter" style={{ textShadow: '0px 2px 4px rgba(0,0,0,0.8)' }}>{number}</span>
      </div>
      {isCaptain && <div className="absolute top-2 right-1 z-30 bg-amber-400 text-black text-[10px] font-black px-1.5 rounded-sm shadow-md border border-amber-600 rotate-12">C</div>}
      <span className="text-[10px] font-bold text-white bg-slate-900/90 px-1.5 rounded mt-1 truncate max-w-[70px] z-30 shadow-sm border border-slate-700 uppercase">{name}</span>
      <div className="absolute -top-1 -left-1 z-30 opacity-80">
        <span className="text-[8px] bg-black text-white font-bold px-1 rounded">{pos}</span>
      </div>
    </div>
  );

  const renderPitchRow = (pos, limit) => {
    const players = squadDetails.filter(p => p.isStarter && p.pos === pos);
    let slots = [];
    for (let i = 0; i < limit; i++) {
      if (players[i]) {
        slots.push(
          <div key={players[i].id} onClick={() => toggleStarter(players[i])}>
            <JerseyIcon color={myManagerData?.color || '#28638a'} number={players[i].number} name={players[i].name} isCaptain={players[i].isCaptain} pos={pos} />
          </div>
        );
      } else {
        slots.push(
          <div key={`${pos}-${i}`} className="flex flex-col items-center justify-center w-20 h-24 opacity-30">
            <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2">
              <path d="M 6 4 L 18 4 L 22 10 L 19 12 L 18 9 L 18 22 L 6 22 L 6 9 L 5 12 L 2 10 Z" />
            </svg>
            <span className="text-[9px] font-bold text-white bg-black/40 px-1.5 rounded uppercase mt-1">{pos}</span>
          </div>
        );
      }
    }
    return <div className="flex justify-evenly w-full px-2 my-2">{slots}</div>;
  };

  const getPosColor = (pos) => ({ DEL: 'text-rose-400 border-rose-500/30 bg-rose-500/10', MED: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10', DEF: 'text-sky-400 border-sky-500/30 bg-sky-500/10', POR: 'text-amber-400 border-amber-500/30 bg-amber-500/10' }[pos] || 'text-slate-400');

  const useTimer = () => {
    const [timeLeft, setTimeLeft] = useState('');
    useEffect(() => {
      const now = new Date();
      const nextFriday = new Date();
      nextFriday.setDate(now.getDate() + ((5 - now.getDay() + 7) % 7 || 7));
      nextFriday.setHours(20, 0, 0, 0);

      const timer = setInterval(() => {
        const diff = nextFriday - new Date();
        if (diff <= 0) setTimeLeft('Jornada en curso');
        else {
          const d = Math.floor(diff / (1000 * 60 * 60 * 24));
          const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
          const m = Math.floor((diff / 1000 / 60) % 60);
          setTimeLeft(`${d}d ${h}h ${m}m`);
        }
      }, 1000);
      return () => clearInterval(timer);
    }, []);
    return timeLeft;
  };
  const timerText = useTimer();

  if (authLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><Activity className="animate-spin text-[#28638a]" size={48}/></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 w-full max-w-md shadow-2xl text-white">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-[#28638a] p-3 rounded-xl shadow-[0_0_20px_rgba(40,99,138,0.5)] mb-4"><Trophy size={32} strokeWidth={2.5} /></div>
            <h1 className="text-2xl font-black uppercase tracking-widest text-center">Fantasy <span className="text-[#28638a]">UFRO</span></h1>
            <p className="text-slate-400 text-sm mt-2 text-center">Inicia sesión para gestionar tu plantilla</p>
          </div>
          <form onSubmit={handleAuth} className="space-y-4">
            {authMode === 'register' && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Nombre / Apodo</label>
                <input type="text" required value={authForm.displayName} onChange={e => setAuthForm({...authForm, displayName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 mt-1 text-white focus:border-[#28638a] outline-none" />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Correo UFRO</label>
              <input type="email" required value={authForm.email} onChange={e => setAuthForm({...authForm, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 mt-1 text-white focus:border-[#28638a] outline-none" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">Contraseña</label>
              <input type="password" required value={authForm.password} onChange={e => setAuthForm({...authForm, password: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 mt-1 text-white focus:border-[#28638a] outline-none" />
            </div>
            {authError && <p className="text-rose-400 text-xs font-bold bg-rose-500/10 p-2 rounded">{authError}</p>}
            <button type="submit" className="w-full bg-[#28638a] hover:bg-[#1e4a68] text-white font-bold py-3 rounded-lg shadow-lg transition-colors mt-6 uppercase tracking-wider">
              {authMode === 'login' ? 'Ingresar' : 'Crear Cuenta'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-400 mt-6">
            {authMode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-[#28638a] font-bold ml-2 hover:underline">{authMode === 'login' ? 'Regístrate' : 'Inicia Sesión'}</button>
          </p>
        </div>
      </div>
    );
  }

  if (!myManagerData || marketLoading) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><Activity className="animate-spin text-[#28638a]" size={48}/></div>;

  return (
    <div className="min-h-screen bg-slate-900 font-sans text-slate-200 selection:bg-[#28638a] selection:text-white pb-20">
      <header className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap lg:flex-nowrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#28638a] p-2 rounded-xl text-white shadow-[0_0_15px_rgba(40,99,138,0.5)]"><Trophy size={20} strokeWidth={2.5} /></div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none uppercase hidden sm:block">Fantasy <span className="text-[#28638a]">INTERCARRERAS</span></h1>
          </div>
          <nav className="flex gap-1 bg-slate-900 p-1.5 rounded-lg border border-slate-800 overflow-x-auto w-full lg:w-auto text-sm no-scrollbar">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Inicio' }, { id: 'squad', icon: Shirt, label: 'Mi Plantilla' },
              { id: 'market', icon: Users, label: 'Mercado' }, { id: 'stats', icon: Activity, label: 'Estadísticas' },
              { id: 'community', icon: Trophy, label: 'Ranking' }, ...(user.email === ADMIN_EMAIL ? [{ id: 'admin', icon: Settings, label: 'Admin' }] : [])
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveView(tab.id)} 
                className={`flex items-center gap-2 px-3 py-2 rounded-md font-bold transition-all whitespace-nowrap ${activeView === tab.id ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/50'}`}>
                <tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl flex-col items-end">
               <span className="text-[9px] font-bold text-slate-500 uppercase">Presupuesto</span>
               <span className="text-base font-black text-emerald-400">${myManagerData.budget.toFixed(1)}M</span>
             </div>
             <button onClick={() => signOut(auth)} className="text-slate-500 hover:text-rose-400 p-2"><LogOut size={20}/></button>
          </div>
        </div>
      </header>

      {notification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in">
          <div className={`border p-3 rounded-lg shadow-2xl flex items-center gap-3 backdrop-blur-md ${notification.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100' : 'bg-rose-900/90 border-rose-500/50 text-rose-100'}`}>
            <span className="font-bold text-sm">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100"><X size={16} /></button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-8 relative">
        {/* === DASHBOARD === */}
        {activeView === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 -mr-10 -mt-10 opacity-5"><Trophy size={200} /></div>
                   <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Fase Regular</h2>
                   <h1 className="text-4xl font-black text-white mb-6">JORNADA {JORNADA_ACTUAL}</h1>
                   <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 flex flex-wrap items-center gap-6">
                      <div>
                         <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Cierre de Fichajes en</p>
                         <div className="flex items-center gap-2 text-2xl font-black text-amber-400"><Clock size={24} /> {timerText}</div>
                      </div>
                      <div className="h-12 w-px bg-slate-700 hidden sm:block"></div>
                      <div>
                         <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Tu Posición General</p>
                         <div className="flex items-center gap-2 text-2xl font-black text-white"># {managers.sort((a,b)=>b.points - a.points).findIndex(m => m.id === user.uid) + 1} <span className="text-sm text-slate-400">/ {managers.length}</span></div>
                      </div>
                   </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
                   <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Resumen Plantilla</h3>
                   <div className="space-y-4 flex-1">
                      <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                         <span className="text-xs font-bold text-slate-500 uppercase">Valor Total</span>
                         <span className="font-black text-emerald-400">${myManagerData.totalValue.toFixed(1)}M</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                         <span className="text-xs font-bold text-slate-500 uppercase">Puntos</span>
                         <span className="font-black text-[#28638a]">{myManagerData.points} pts</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-900 p-3 rounded-lg border border-slate-800">
                         <span className="text-xs font-bold text-slate-500 uppercase">Jugadores</span>
                         <span className="font-black text-white">{myManagerData.squad.length}/14</span>
                      </div>
                   </div>
                   <button onClick={()=>setActiveView('squad')} className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 rounded-lg border border-slate-700 uppercase transition-colors">Gestionar Equipo</button>
                </div>
             </div>
             <ResultadosSection onVote={setSelectedMatchForVote} />
          </div>
        )}

        {/* === MI PLANTILLA === */}
        {activeView === 'squad' && (
          <div className="animate-in fade-in space-y-6">
            <div className="bg-slate-950 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-wrap justify-between gap-6 items-center">
               <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 shadow-lg" style={{ backgroundColor: myManagerData.color, borderColor: `${myManagerData.color}80` }}>
                    <Shield size={32} className="text-white drop-shadow-md" />
                  </div>
                  <div className="flex-1">
                    <input type="text" value={myManagerData.teamName} onChange={e => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'managers', user.uid), { teamName: e.target.value })} 
                           className="bg-transparent text-2xl font-black text-white focus:outline-none border-b border-transparent focus:border-slate-700 w-full mb-1" />
                    <div className="flex items-center gap-4">
                       <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-2">
                         Color <input type="color" value={myManagerData.color} onChange={e => updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'managers', user.uid), { color: e.target.value })} className="w-5 h-5 rounded cursor-pointer bg-slate-900 border-0" />
                       </label>
                    </div>
                  </div>
               </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              <div className="xl:col-span-8">
                <div className="flex justify-between items-end mb-3">
                  <h3 className="font-black text-white uppercase tracking-wider">Titulares (1-4-4-2)</h3>
                  <span className="text-xs font-bold bg-[#28638a] px-3 py-1 rounded text-white">{squadDetails.filter(p=>p.isStarter).length}/7 Jugando</span>
                </div>
                <div className="relative w-full h-[700px] sm:h-[800px] bg-gradient-to-b from-green-800 to-green-900 border-4 border-slate-700/50 rounded-xl shadow-2xl overflow-hidden py-6 flex flex-col justify-between">
                  <div className="absolute inset-0 pointer-events-none opacity-30">
                     <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white"></div>
                     <div className="absolute top-1/2 left-1/2 w-32 h-32 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
                     <div className="absolute bottom-0 left-1/2 w-3/5 h-48 border-2 border-b-0 border-white -translate-x-1/2"></div>
                     <div className="absolute top-0 left-1/2 w-3/5 h-48 border-2 border-t-0 border-white -translate-x-1/2"></div>
                  </div>
                  <div className="z-10 h-full flex flex-col justify-between">
                     <div className="flex-1 flex items-end">{renderPitchRow('DEL', STARTING_LIMITS.DEL)}</div>
                     <div className="flex-1 flex items-center">{renderPitchRow('MED', STARTING_LIMITS.MED)}</div>
                     <div className="flex-1 flex items-start">{renderPitchRow('DEF', STARTING_LIMITS.DEF)}</div>
                     <div className="h-32 flex items-end">{renderPitchRow('POR', STARTING_LIMITS.POR)}</div>
                  </div>
                </div>
              </div>
              <div className="xl:col-span-4 flex flex-col gap-6">
                <div>
                  <div className="flex justify-between items-end mb-3">
                    <h3 className="font-black text-white uppercase tracking-wider">Banca</h3>
                    <span className="text-xs font-bold bg-slate-800 px-3 py-1 rounded text-slate-400 border border-slate-700">{squadDetails.filter(p=>!p.isStarter).length}/7 Suplentes</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-lg max-h-[400px] overflow-y-auto no-scrollbar">
                    {squadDetails.filter(p => !p.isStarter).map(player => (
                      <div key={player.id} className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex items-center justify-between group transition-all">
                        <div className="flex items-center gap-3 cursor-pointer" onClick={() => toggleStarter(player)}>
                           <span className={`w-9 text-center py-1 rounded text-[9px] font-black uppercase ${getPosColor(player.pos)}`}>{player.pos}</span>
                           <div>
                              <p className="font-bold text-sm text-white">{player.name} <span className="text-slate-500">#{player.number}</span></p>
                              <p className="text-[10px] font-bold text-emerald-400">Val: ${player.currentValue.toFixed(1)}M</p>
                           </div>
                        </div>
                        <div className="flex gap-2">
                           <button onClick={() => setSelectedPlayerForEdit(player)} className="text-slate-500 hover:text-white p-1.5"><Settings size={16}/></button>
                           <button onClick={() => handleSellPlayer(player)} className="text-rose-500 hover:bg-rose-500/20 p-1.5 rounded"><UserMinus size={16}/></button>
                        </div>
                      </div>
                    ))}
                    {Array.from({length: Math.max(0, 7 - squadDetails.filter(p=>!p.isStarter).length)}).map((_, i) => (
                      <div key={i} className="border-2 border-dashed border-slate-800 rounded-lg h-[64px] flex items-center justify-center opacity-50 bg-slate-900/50">
                         <span className="text-[10px] font-bold text-slate-600 uppercase">Espacio Libre</span>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedPlayerForEdit && (
                  <div className="bg-slate-900 border border-[#28638a] rounded-xl p-4 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-black text-white">Editar {selectedPlayerForEdit.name}</h4>
                      <button onClick={()=>setSelectedPlayerForEdit(null)}><X size={16} className="text-slate-500"/></button>
                    </div>
                    <div className="space-y-4">
                       <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase">Número de Camiseta (1-99)</label>
                          <input type="number" min="1" max="99" placeholder={selectedPlayerForEdit.number} value={newJerseyNum} onChange={e=>setNewJerseyNum(e.target.value)}
                                 className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white mt-1" />
                       </div>
                       <div className="flex gap-2">
                          <button onClick={savePlayerEdit} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded text-xs">Guardar N°</button>
                          <button onClick={() => setCaptain(selectedPlayerForEdit.id)} className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-2 rounded text-xs flex items-center justify-center gap-1">
                            <Award size={14}/> Capitán
                          </button>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* === MERCADO === */}
        {activeView === 'market' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-wrap gap-4 items-end shadow-lg">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Buscar Jugador</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-500 w-5 h-5" />
                  <input type="text" placeholder="Ej. Nacho, Real Medicina..." value={marketFilters.search} onChange={e => setMarketFilters({...marketFilters, search: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-[#28638a] text-white text-sm transition-colors"/>
                </div>
              </div>
              <div className="w-full sm:w-auto">
                <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Posición</label>
                <select value={marketFilters.pos} onChange={e => setMarketFilters({...marketFilters, pos: e.target.value})}
                  className="w-full py-2 px-4 bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-[#28638a] text-white text-sm font-bold">
                  <option value="ALL">Todas</option>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredMarket.map(player => (
                <div key={player.id} className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex flex-col hover:border-[#28638a] transition-all group relative">
                  <div className="h-14 bg-slate-900 flex items-center px-3 relative border-b border-slate-800">
                    <span className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${getPosColor(player.pos)}`}>{player.pos}</span>
                    <div className="flex flex-col pt-1">
                      <span className="text-white font-black text-sm truncate pr-8">{player.name}</span>
                      <span className="text-slate-400 text-[9px] font-bold uppercase truncate">{player.team}</span>
                    </div>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-2 flex-grow text-xs text-slate-300">
                     <div className="col-span-2 flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="font-bold flex items-center gap-1"><Users size={12} className="text-slate-400"/> {player.ownersCount} prop.</span>
                        <div className="text-right">
                          <span className="font-black text-emerald-400 block">${player.currentValue.toFixed(1)}M</span>
                          {player.valueDiff > 0 && <span className="text-[8px] text-emerald-400 flex items-center justify-end">+{player.valueDiff.toFixed(1)} <ArrowUpRight size={10}/></span>}
                          {player.valueDiff < 0 && <span className="text-[8px] text-rose-400 flex items-center justify-end">{player.valueDiff.toFixed(1)} <ArrowDownRight size={10}/></span>}
                        </div>
                     </div>
                     <div className="flex flex-col bg-slate-900 p-1.5 rounded text-center border border-slate-800/50">
                       <span className="text-[8px] uppercase text-slate-500">Goles</span>
                       <span className="font-bold text-white">{player.goals}</span>
                     </div>
                     <div className="flex flex-col bg-slate-900 p-1.5 rounded text-center border border-slate-800/50">
                       <span className="text-[8px] uppercase text-slate-500">P. Cero</span>
                       <span className="font-bold text-white">{player.cleanSheets}</span>
                     </div>
                  </div>
                  <button onClick={() => handleBuyPlayer(player)} className="w-full py-2.5 bg-slate-900 hover:bg-[#28638a] text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors border-t border-slate-800">
                    <UserPlus size={14} /> Fichar
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* === ESTADISTICAS AVANZADAS Y MERCADO === */}
        {activeView === 'stats' && (
          <div className="space-y-8 animate-in fade-in">
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Goleadores Top 5 */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                   <h3 className="text-xl font-black text-white mb-6 uppercase flex items-center gap-2"><Trophy className="text-amber-400"/> Máximos Goleadores</h3>
                   <div className="space-y-2">
                     {[...dynamicMarket].sort((a,b)=>b.goals - a.goals).slice(0, 5).map((p, i) => (
                       <div key={p.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-4">
                            <span className="font-black text-slate-500 w-4">{i+1}</span>
                            <div>
                              <p className="font-bold text-white text-sm">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.team} | {p.pos}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="font-black text-2xl text-amber-400">{p.goals}</p>
                             <p className="text-[9px] uppercase text-slate-500">Goles</p>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Porterias a Cero Top 5 */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                   <h3 className="text-xl font-black text-white mb-6 uppercase flex items-center gap-2"><Shield className="text-sky-400"/> Porterías a Cero</h3>
                   <div className="space-y-2">
                     {[...dynamicMarket].filter(p => p.pos === 'POR' || p.pos === 'DEF').sort((a,b)=>b.cleanSheets - a.cleanSheets).slice(0, 5).map((p, i) => (
                       <div key={p.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                          <div className="flex items-center gap-4">
                            <span className="font-black text-slate-500 w-4">{i+1}</span>
                            <div>
                              <p className="font-bold text-white text-sm">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.team} | {p.pos}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="font-black text-2xl text-sky-400">{p.cleanSheets}</p>
                             <p className="text-[9px] uppercase text-slate-500">Invictas</p>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* GRAFICO EVOLUCION */}
                <MarketTrendChart players={[...dynamicMarket].sort((a,b) => b.valueDiff - a.valueDiff).slice(0, 5)} />

                {/* Top 5 Alzas de Valor */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                   <h3 className="text-xl font-black text-white mb-6 uppercase flex items-center gap-2"><ArrowUpRight className="text-emerald-400"/> Mayores Alzas</h3>
                   <div className="space-y-2">
                     {[...dynamicMarket].sort((a,b) => b.valueDiff - a.valueDiff).slice(0, 5).map((p, i) => (
                       <div key={p.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-emerald-900/50">
                          <div className="flex items-center gap-4">
                            <span className="font-black text-slate-500 w-4">{i+1}</span>
                            <div>
                              <p className="font-bold text-white text-sm">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.ownersCount} mánagers lo tienen</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="font-black text-lg text-emerald-400 block">${p.currentValue.toFixed(1)}M</p>
                             <p className="text-[9px] font-bold uppercase text-emerald-500 flex items-center justify-end">+{p.valueDiff.toFixed(1)} <ArrowUpRight size={12}/></p>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>

                {/* Top 5 Bajas de Valor */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                   <h3 className="text-xl font-black text-white mb-6 uppercase flex items-center gap-2"><ArrowDownRight className="text-rose-400"/> Mayores Caídas</h3>
                   <div className="space-y-2">
                     {[...dynamicMarket].sort((a,b) => a.valueDiff - b.valueDiff).slice(0, 5).map((p, i) => (
                       <div key={p.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-rose-900/50">
                          <div className="flex items-center gap-4">
                            <span className="font-black text-slate-500 w-4">{i+1}</span>
                            <div>
                              <p className="font-bold text-white text-sm">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.ownersCount === 0 ? 'Nadie lo tiene' : `${p.ownersCount} mánagers`}</p>
                            </div>
                          </div>
                          <div className="text-right">
                             <p className="font-black text-lg text-rose-400 block">${p.currentValue.toFixed(1)}M</p>
                             <p className="text-[9px] font-bold uppercase text-rose-500 flex items-center justify-end">{p.valueDiff.toFixed(1)} <ArrowDownRight size={12}/></p>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>

             </div>
          </div>
        )}

        {/* === RANKING COMUNIDAD === */}
        {activeView === 'community' && (
          <div className="animate-in fade-in space-y-6">
             <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-6">Clasificación General</h2>
             <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-slate-800 bg-slate-900 text-xs font-bold text-slate-500 uppercase tracking-wider">
                   <div className="col-span-1 text-center">Pos</div>
                   <div className="col-span-6 md:col-span-4">Mánager</div>
                   <div className="col-span-5 md:col-span-4 hidden md:block">Valor Plantilla</div>
                   <div className="col-span-5 md:col-span-3 text-right">Puntos</div>
                </div>
                <div className="divide-y divide-slate-800/50">
                   {managers.sort((a,b) => (b.points || 0) - (a.points || 0)).map((m, i) => (
                      <div key={m.id} className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${m.id === user?.uid ? 'bg-[#28638a]/10 border-l-4 border-[#28638a]' : 'hover:bg-slate-900/50 border-l-4 border-transparent'}`}>
                         <div className="col-span-1 text-center font-black text-slate-400 text-lg">{i+1}</div>
                         <div className="col-span-6 md:col-span-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center border shadow-sm" style={{ backgroundColor: m.color || '#28638a', borderColor: `${m.color || '#28638a'}80` }}>
                              <Shield size={20} className="text-white drop-shadow-md" />
                            </div>
                            <div>
                               <p className="font-bold text-white">{m.teamName}</p>
                               <p className="text-[10px] text-slate-500 uppercase">{m.name}</p>
                            </div>
                         </div>
                         <div className="col-span-5 md:col-span-4 hidden md:flex flex-col">
                            <span className="font-bold text-emerald-400">${(m.totalValue || 0).toFixed(1)}M</span>
                            <span className="text-[10px] text-slate-500 uppercase">{m.squad?.length || 0} Jugadores</span>
                         </div>
                         <div className="col-span-5 md:col-span-3 text-right">
                            <span className="font-black text-xl text-white">{m.points || 0}</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}

        {/* === ADMIN === */}
        {activeView === 'admin' && user?.email === ADMIN_EMAIL && (
          <div className="animate-in fade-in space-y-6">
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">Admin · Jornada {JORNADA_ACTUAL}</h2>
            <div className="flex flex-wrap gap-2">
              {tournamentData.playoffs.map(m => (
                <button key={m.id} onClick={() => setAdminMatch(m)}
                  className={`px-3 py-2 rounded-lg text-sm font-bold border ${adminMatch?.id === m.id ? 'bg-[#28638a] border-[#28638a] text-white' : 'bg-slate-900 border-slate-700 text-slate-300'}`}>
                  {m.equipoLocal} vs {m.equipoVisita}
                </button>
              ))}
            </div>
            {adminMatch && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                {dynamicMarket.filter(p => p.team === adminMatch.equipoLocal || p.team === adminMatch.equipoVisita).map(p => {
                  const s = getStat(p.id);
                  return (
                    <div key={p.id} className="flex flex-wrap items-center gap-4 bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs">
                      <div className="w-40">
                        <p className="font-bold text-white text-sm">{p.name}</p>
                        <p className="text-slate-400">{p.team} | {p.pos}</p>
                      </div>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={!!s.played} onChange={e => saveStat(p.id, { played: e.target.checked })} /> Jugó
                      </label>
                      <label className="flex items-center gap-1">
                        Goles
                        <input type="number" min="0" value={s.goals || 0}
                          onChange={e => saveStat(p.id, { goals: parseInt(e.target.value) || 0 })}
                          className="w-14 bg-slate-950 border border-slate-700 rounded p-1 text-white" />
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={!!s.cleanSheet} onChange={e => saveStat(p.id, { cleanSheet: e.target.checked })} /> P. cero
                      </label>
                      <label className="flex items-center gap-1">
                        <input type="checkbox" checked={!!s.mvp} onChange={e => saveStat(p.id, { mvp: e.target.checked })} /> MVP
                      </label>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={calculateJornadaPoints} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-6 py-3 rounded-lg uppercase text-sm tracking-wider">
              Calcular puntos de la jornada
            </button>
          </div>
        )}

        {/* === MODAL GLOBAL DE VOTACIÓN MVP === */}
        {selectedMatchForVote && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-slate-950 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                   <h3 className="text-xl font-black text-white">Vota: MVP {selectedMatchForVote.equipoLocal} vs {selectedMatchForVote.equipoVisita}</h3>
                   <button onClick={()=>setSelectedMatchForVote(null)}><X className="text-slate-400 hover:text-white"/></button>
                </div>
                <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
                   {dynamicMarket.filter(p => p.team === selectedMatchForVote.equipoLocal || p.team === selectedMatchForVote.equipoVisita).map(p => (
                      <div key={p.id} onClick={() => handleVoteMVP(selectedMatchForVote.id, p.id)} className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between cursor-pointer hover:border-amber-500 transition-colors group">
                         <div>
                            <p className="font-bold text-white text-sm">{p.name}</p>
                            <p className="text-[10px] text-slate-400">{p.team}</p>
                         </div>
                         <ChevronRight className="text-slate-600 group-hover:text-amber-500" size={16} />
                      </div>
                   ))}
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}