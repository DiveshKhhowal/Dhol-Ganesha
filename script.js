(function(){
  const app = document.getElementById('app');
  const track = document.getElementById('track');
  const lanesEls = Array.from(document.querySelectorAll('.lane'));
  const targets = lanesEls.map(l=>l.querySelector('.target'));

  const scoreEl = document.getElementById('scoreValue');
  const comboEl = document.getElementById('combo-value');
  const multEl = document.getElementById('comboMultiplier');
  const bestEl = document.getElementById('bestValue');
  const energyInner = document.getElementById('energyBarInner');
  const energyPct = document.getElementById('energyPct');
  const startScreen = document.getElementById('startScreen');
  const startBtn = document.getElementById('startBtn');
  const gameOverScreen = document.getElementById('gameOverScreen');
  const gameOverTitle = document.getElementById('gameOverTitle');
  const gameOverMsg = document.getElementById('gameOverMsg');
  const retryBtn = document.getElementById('retryBtn');
  const homeBtn = document.getElementById('homeBtn');
  const finalScoreEl = document.getElementById('finalScore');
  const finalComboEl = document.getElementById('finalCombo');
  const finalAccEl = document.getElementById('finalAccuracy');
  const celebrateEl = document.getElementById('celebrate');
  const mascot = document.getElementById('mascotWrap');
  const toast = document.getElementById('toast');
  const fireLevel = document.getElementById('fireLevel');
  const niatIdInput = document.getElementById('niatId');
  const playerNameInput = document.getElementById('playerName');
  const campusNameInput = document.getElementById('campusName');
  const formError = document.getElementById('formError');
  const lbTabCampus = document.getElementById('lbTabCampus');
  const lbTabAll = document.getElementById('lbTabAll');
  const lbStatus = document.getElementById('lbStatus');
  const lbList = document.getElementById('lbList');
  const lbScopeNote = document.getElementById('lbScopeNote');
  const lbMeta = document.getElementById('lbMeta');
  const shareBtn = document.getElementById('shareBtn');
  const badgeShelf = document.getElementById('badgeShelf');

  const pauseBtn = document.getElementById('pauseBtn');
  const infoBtn = document.getElementById('infoBtn');
  const muteBtn = document.getElementById('muteBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const langBtn = document.getElementById('langBtn');
  const aboutBtn = document.getElementById('aboutBtn');
  const pauseScreen = document.getElementById('pauseScreen');
  const resumeBtn = document.getElementById('resumeBtn');
  const infoScreen = document.getElementById('infoScreen');
  const closeInfoBtn = document.getElementById('closeInfoBtn');
  const aboutScreen = document.getElementById('aboutScreen');
  const closeAboutBtn = document.getElementById('closeAboutBtn');
  const settingsScreen = document.getElementById('settingsScreen');
  const closeSettingsBtn = document.getElementById('closeSettingsBtn');
  const beatVolumeSlider = document.getElementById('beatVolumeSlider');
  const sfxVolumeSlider = document.getElementById('sfxVolumeSlider');

  const gameTitle = document.getElementById('gameTitle');
  const adminScreen = document.getElementById('adminScreen');
  const closeAdminBtn = document.getElementById('closeAdminBtn');
  const demoModeCheck = document.getElementById('demoModeCheck');
  const clearLeaderboardBtn = document.getElementById('clearLeaderboardBtn');
  const qrUrlInput = document.getElementById('qrUrlInput');
  const generateQrBtn = document.getElementById('generateQrBtn');
  const qrContainer = document.getElementById('qrContainer');
  const demoBanner = document.getElementById('demoBanner');

  const diffTabs = Array.from(document.querySelectorAll('.diff-tab'));
  const practiceCheck = document.getElementById('practiceCheck');
  const tbList = document.getElementById('tbList');
  const skinSection = document.getElementById('skinSection');
  const skinGoldenCheck = document.getElementById('skinGoldenCheck');

  let currentLbTab = 'campus';
  let lbCache = null;

  let playerInfo = { niatId:'', name:'', campus:'' };
  let selectedDifficulty = 'medium';
  let practiceMode = false;
  let adminDemoMode = false;
  let useGoldenSkin = false;
  let currentLang = 'en';

  const KEYS = ['ArrowLeft','ArrowUp','ArrowRight','ArrowDown'];
  const LANE_ARROWS = ['←','↑','→','↓'];
  const VICTORY_TIME = 120000;
  const MILESTONES = [1000,3000,6000,10000,15000,20000,30000];
  const GOLDEN_SKIN_UNLOCK_SCORE = 5000;
  const ADMIN_CODE = 'GANESH2026';

  const DIFFICULTY_PRESETS = {
    easy:   { speedMult:0.72, bpmMult:0.8,  windowMult:1.4 },
    medium: { speedMult:1,    bpmMult:1,    windowMult:1 },
    hard:   { speedMult:1.3,  bpmMult:1.18, windowMult:0.78 },
  };

  const ACHIEVEMENTS = [
    { id:'first_perfect', icon:'🎯', name:{en:'First Perfect', hi:'पहला परफेक्ट'} },
    { id:'combo_25',      icon:'⚡', name:{en:'25 Combo', hi:'25 कॉम्बो'} },
    { id:'combo_50',      icon:'✨', name:{en:'50 Combo', hi:'50 कॉम्बो'} },
    { id:'celebration',   icon:'🎉', name:{en:'Golden Streak', hi:'गोल्डन स्ट्रीक'} },
    { id:'score_10000',   icon:'💰', name:{en:'10,000 Points', hi:'10,000 अंक'} },
    { id:'procession_complete', icon:'🏁', name:{en:'Mandap Completed', hi:'मंडप पूर्ण'} },
  ];

  let state = null;
  let bestScore = 0;
  let audioCtx = null;
  let masterGain = null, beatGain = null, sfxGain = null;
  let isMuted = false;
  let beatVolume = 0.9, sfxVolume = 0.8;
  let ambientNodes = null;

  // ---------------- i18n ----------------
  const STRINGS = {
    en:{
      intro:"The mandap celebration begins! Hit the keys in rhythm with the dhol to bring light and music to the mandap.",
      introSub:"Press the matching key as the note reaches the arch. Keep the rhythm going for maximum combo points and survive 2 minutes!",
      topBannerTitle:"🏆 Today's Top 3",
      difficultyLabel:"Difficulty",
      practiceLabel:"Practice Mode (no game over, score not saved)",
      skinLabel:"✨ Use Golden Mushak skin (unlocked!)",
      labelNiat:"NIAT ID", labelName:"Player Name", labelCampus:"Campus Name",
      formError:"Please fill in all three fields to begin.",
      startBtn:"Enter the Mandap",
      pauseTitle:"⏸️ Paused", pauseText:"Take a moment — the mandap rhythms will wait for you.", resumeBtn:"Resume",
      infoTitle:"How to Play",
      howto:[
        "←/↑/→/↓ — press the matching key as the note reaches the arch (or tap on mobile).",
        "Perfect timing scores more than a Good hit.",
        "Chain hits to build combo — every 10 combo raises your multiplier, up to ×5.",
        "15 perfect hits in a row triggers a bonus celebration.",
        "Missing a beat drains devotion energy — if it empties, the round ends.",
        "Survive 2 minutes to complete the ritual and win!"
      ],
      closeInfoBtn:"Got it",
      aboutTitle:"About Dhol Ganesha",
      aboutText1:"A rhythm game set in a golden mandap — hit dhol beats in time, build combos, and climb the leaderboard.",
      aboutText2:"Built with HTML, CSS & JavaScript. Audio synthesizes live via the Web Audio API without heavy audio downloads.",
      closeAboutBtn:"Close",
      settingsTitle:"Sound Settings", beatVolumeLabel:"Dhol Beat Volume", sfxVolumeLabel:"Effects Volume", closeSettingsBtn:"Done",
      statScoreLabel:"Score", statComboLabel:"Best Combo", statAccLabel:"Accuracy",
      shareBtn:"📤 Share My Score",
      lbTabCampus:"My Campus", lbTabAll:"All Campuses",
      retryBtn:"Try Again", homeBtn:"🏠 Home",
      newHighScore:"New High Score! 🏆",
      letsGo:(name,campus)=>`Welcome, ${name} from ${campus}! 🥁`,
      milestone:(n)=>`🎊 Milestone! ${n} points!`,
      stageSpeedUp:"The rhythms quicken!",
      stageFire:"Golden energy surges! ✨",
      practiceNotSaved:"Practice runs aren't saved to the leaderboard.",
      demoNotSaved:"Demo Mode run — not saved to the leaderboard.",
      victoryTitle:"🎉 Mandap Ritual Complete!",
      victoryMsg:"You kept the beat radiant through the whole celebration! Ganpati Bappa Morya!",
      loseTitle:"The Beat Fades…",
      loseMsg:"The devotion energy waned, but the mandap remains bright! Try again.",
      achievementUnlocked:(name)=>`🏅 Achievement unlocked: ${name}`,
      skinUnlocked:"✨ Golden Mushak skin unlocked!",
      scoreCopied:"Score copied to clipboard!",
      couldNotCopy:"Could not copy — try manually.",
      shareUnsupported:"Sharing not supported on this browser.",
      nothingToExport:"Nothing to export yet.",
      leaderboardCleared:"Leaderboard cleared.",
    },
    hi:{
      intro:"मंडप उत्सव शुरू हो रहा है! मंडप में प्रकाश और संगीत लाने के लिए ढोल की ताल पर सही समय पर कुंजी दबाएं।",
      introSub:"नोट के मेहराब तक पहुंचते ही सही कुंजी दबाएं। अधिकतम कॉम्बो अंकों के लिए ताल बनाए रखें और 2 मिनट तक टिके रहें!",
      topBannerTitle:"🏆 आज के टॉप 3",
      difficultyLabel:"कठिनाई",
      practiceLabel:"अभ्यास मोड (गेम ओवर नहीं होगा, स्कोर सेव नहीं होगा)",
      skinLabel:"✨ गोल्डन मूषक स्किन इस्तेमाल करें (अनलॉक!)",
      labelNiat:"NIAT आईडी", labelName:"खिलाड़ी का नाम", labelCampus:"कैंपस का नाम",
      formError:"शुरू करने के लिए कृपया तीनों फ़ील्ड भरें।",
      startBtn:"मंडप में प्रवेश करें",
      pauseTitle:"⏸️ रुका हुआ", pauseText:"आराम कर लीजिए — ताल आपका इंतज़ार करेगी।", resumeBtn:"जारी रखें",
      infoTitle:"कैसे खेलें",
      howto:[
        "←/↑/→/↓ — मेहराब तक पहुंचने पर सही कुंजी दबाएं।",
        "सटीक समय पर 'गुड' से ज्यादा अंक मिलते हैं।",
        "लगातार हिट से कॉम्बो बनाएं — हर 10 कॉम्बो पर मल्टीप्लायर बढ़ता है।",
        "लगातार 15 परफेक्ट हिट से बोनस उत्सव मिलता है।",
        "बीट चूकने से ऊर्जा घटती है।",
        "2 मिनट टिके रहें और जीतें!"
      ],
      closeInfoBtn:"समझ गया",
      aboutTitle:"Dhol Ganesha के बारे में",
      aboutText1:"स्वर्ण मंडप पर आधारित एक रिदम गेम।",
      aboutText2:"Web Audio API से लाइव साउंड इफेक्ट्स।",
      closeAboutBtn:"बंद करें",
      settingsTitle:"साउंड सेटिंग्स", beatVolumeLabel:"ढोल की आवाज़", sfxVolumeLabel:"इफ़ेक्ट्स की आवाज़", closeSettingsBtn:"हो गया",
      statScoreLabel:"स्कोर", statComboLabel:"बेस्ट कॉम्बो", statAccLabel:"सटीकता",
      shareBtn:"📤 स्कोर शेयर करें",
      lbTabCampus:"मेरा कैंपस", lbTabAll:"सभी कैंपस",
      retryBtn:"फिर कोशिश करें", homeBtn:"🏠 होम",
      newHighScore:"नया हाई स्कोर! 🏆",
      letsGo:(name,campus)=>`स्वागत है, ${name} (${campus})! 🥁`,
      milestone:(n)=>`🎊 माइलस्टोन! ${n} अंक!`,
      stageSpeedUp:"ताल तेज़ हो रही है!",
      stageFire:"गोल्डन ऊर्जा बढ़ गई! ✨",
      practiceNotSaved:"अभ्यास राउंड सेव नहीं होते।",
      demoNotSaved:"डेमो मोड राउंड सेव नहीं हुआ।",
      victoryTitle:"🎉 मंडप अनुष्ठान पूर्ण हुआ!",
      victoryMsg:"गणपति बप्पा मोरया!",
      loseTitle:"ताल थम गई…",
      loseMsg:"फिर कोशिश करें।",
      achievementUnlocked:(name)=>`🏅 उपलब्धि अनलॉक: ${name}`,
      skinUnlocked:"✨ गोल्डन मूषक स्किन अनलॉक हुई!",
      scoreCopied:"स्कोर कॉपी हुआ!",
      couldNotCopy:"कॉपी नहीं हो सका।",
      shareUnsupported:"शेयरिंग समर्थित नहीं है।",
      nothingToExport:"एक्सपोर्ट करने के लिए कुछ नहीं है।",
      leaderboardCleared:"लीडरबोर्ड साफ़ कर दिया गया।",
    }
  };

  function T(key, ...args){
    const v = STRINGS[currentLang][key];
    return typeof v === 'function' ? v(...args) : v;
  }

  function applyLanguage(lang){
    currentLang = STRINGS[lang] ? lang : 'en';
    langBtn.textContent = currentLang === 'en' ? 'EN' : 'हिं';
    document.getElementById('introText').textContent = T('intro');
    document.getElementById('introSubText').textContent = T('introSub');
    document.getElementById('topBannerTitle').textContent = T('topBannerTitle');
    document.getElementById('difficultyLabel').textContent = T('difficultyLabel');
    document.getElementById('practiceLabel').textContent = T('practiceLabel');
    document.getElementById('skinLabel').textContent = T('skinLabel');
    document.getElementById('labelNiat').textContent = T('labelNiat');
    document.getElementById('labelName').textContent = T('labelName');
    document.getElementById('labelCampus').textContent = T('labelCampus');
    document.getElementById('formError').textContent = T('formError');
    startBtn.textContent = T('startBtn');
    document.getElementById('pauseTitle').textContent = T('pauseTitle');
    document.getElementById('pauseText').textContent = T('pauseText');
    resumeBtn.textContent = T('resumeBtn');
    document.getElementById('infoTitle').textContent = T('infoTitle');
    const howtoList = document.getElementById('howtoList');
    howtoList.innerHTML = T('howto').map(li=>'<li>'+li+'</li>').join('');
    closeInfoBtn.textContent = T('closeInfoBtn');
    document.getElementById('aboutTitle').textContent = T('aboutTitle');
    document.getElementById('aboutText1').textContent = T('aboutText1');
    document.getElementById('aboutText2').textContent = T('aboutText2');
    closeAboutBtn.textContent = T('closeAboutBtn');
    document.getElementById('settingsTitle').textContent = T('settingsTitle');
    document.getElementById('beatVolumeLabel').textContent = T('beatVolumeLabel');
    document.getElementById('sfxVolumeLabel').textContent = T('sfxVolumeLabel');
    closeSettingsBtn.textContent = T('closeSettingsBtn');
    document.getElementById('statScoreLabel').textContent = T('statScoreLabel');
    document.getElementById('statComboLabel').textContent = T('statComboLabel');
    document.getElementById('statAccLabel').textContent = T('statAccLabel');
    shareBtn.textContent = T('shareBtn');
    lbTabCampus.textContent = T('lbTabCampus');
    lbTabAll.textContent = T('lbTabAll');
    retryBtn.textContent = T('retryBtn');
    homeBtn.textContent = T('homeBtn');
  }

  langBtn.addEventListener('click', ()=>{
    applyLanguage(currentLang === 'en' ? 'hi' : 'en');
    saveProfile();
  });

  const PROFILE_KEY = 'profile:main';

  async function loadProfile(){
    const storage = getStorage();
    if(!storage) return;
    try{
      const res = await storage.get(PROFILE_KEY, false);
      if(res && res.value){
        const p = JSON.parse(res.value);
        if(p.niatId) niatIdInput.value = p.niatId;
        if(p.name) playerNameInput.value = p.name;
        if(p.campus) campusNameInput.value = p.campus;
        if(p.difficulty && DIFFICULTY_PRESETS[p.difficulty]){
          selectedDifficulty = p.difficulty;
          diffTabs.forEach(b=>b.classList.toggle('active', b.dataset.diff===p.difficulty));
        }
        if(typeof p.beatVolume === 'number'){ beatVolume = p.beatVolume; beatVolumeSlider.value = Math.round(beatVolume*100); }
        if(typeof p.sfxVolume === 'number'){ sfxVolume = p.sfxVolume; sfxVolumeSlider.value = Math.round(sfxVolume*100); }
        if(typeof p.bestScore === 'number'){ bestScore = p.bestScore; }
        if(p.lang){ applyLanguage(p.lang); }
        if(p.useGoldenSkin){ useGoldenSkin = true; }
        window.__unlockedAchievements = Array.isArray(p.achievements) ? p.achievements : [];
      } else {
        window.__unlockedAchievements = [];
      }
    }catch(e){
      window.__unlockedAchievements = [];
    }
    updateSkinAvailability();
    updateHUD();
  }

  async function saveProfile(){
    const storage = getStorage();
    if(!storage) return;
    const profile = {
      niatId: niatIdInput.value.trim(),
      name: playerNameInput.value.trim(),
      campus: campusNameInput.value.trim(),
      difficulty: selectedDifficulty,
      beatVolume, sfxVolume,
      bestScore,
      lang: currentLang,
      useGoldenSkin,
      achievements: window.__unlockedAchievements || [],
    };
    try{ await storage.set(PROFILE_KEY, JSON.stringify(profile), false); }catch(e){ /* ignore */ }
  }

  function updateSkinAvailability(){
    const unlocked = bestScore >= GOLDEN_SKIN_UNLOCK_SCORE;
    skinSection.style.display = unlocked ? 'block' : 'none';
    skinGoldenCheck.checked = unlocked && useGoldenSkin;
    applySkin();
  }
  function applySkin(){
    app.classList.toggle('skin-golden', useGoldenSkin && bestScore >= GOLDEN_SKIN_UNLOCK_SCORE);
  }
  skinGoldenCheck.addEventListener('change', ()=>{
    useGoldenSkin = skinGoldenCheck.checked;
    applySkin();
    saveProfile();
  });

  function unlockAchievement(id){
    window.__unlockedAchievements = window.__unlockedAchievements || [];
    if(window.__unlockedAchievements.includes(id)) return;
    window.__unlockedAchievements.push(id);
    state._newlyUnlocked = state._newlyUnlocked || [];
    state._newlyUnlocked.push(id);
    const def = ACHIEVEMENTS.find(a=>a.id===id);
    if(def) showToast(T('achievementUnlocked')(def.name[currentLang]||def.name.en));
    saveProfile();
    if(!useGoldenSkin && bestScore >= GOLDEN_SKIN_UNLOCK_SCORE){
      updateSkinAvailability();
    }
  }

  function checkGameplayAchievements(){
    if(state.combo >= 25) unlockAchievement('combo_25');
    if(state.combo >= 50) unlockAchievement('combo_50');
    if(state.score >= 10000) unlockAchievement('score_10000');
  }

  function renderBadgeShelf(){
    badgeShelf.innerHTML = ACHIEVEMENTS.map(a=>{
      const earned = (window.__unlockedAchievements||[]).includes(a.id);
      const isNew = state && state._newlyUnlocked && state._newlyUnlocked.includes(a.id);
      return '<div class="badge '+(earned?'earned ':'')+(isNew?'new':'')+'" title="'+(a.name[currentLang]||a.name.en)+'">'
        +'<div class="badge-icon">'+a.icon+'</div>'
        +'<div class="badge-name">'+(a.name[currentLang]||a.name.en)+'</div>'
        +'</div>';
    }).join('');
  }

  // ---------------- Audio ----------------
  function ensureAudio(){
    if(!audioCtx){
      audioCtx = new (window.AudioContext||window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = isMuted ? 0 : 1;
      masterGain.connect(audioCtx.destination);
      beatGain = audioCtx.createGain();
      beatGain.gain.value = beatVolume;
      beatGain.connect(masterGain);
      sfxGain = audioCtx.createGain();
      sfxGain.gain.value = sfxVolume;
      sfxGain.connect(masterGain);
    }
    if(audioCtx.state === 'suspended') audioCtx.resume();
  }

  function noiseBurst(duration, volume, bus){
    const bufferSize = audioCtx.sampleRate * duration;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<bufferSize;i++){ data[i] = (Math.random()*2-1) * (1 - i/bufferSize); }
    const src = audioCtx.createBufferSource();
    src.buffer = buffer;
    const gain = audioCtx.createGain();
    gain.gain.value = volume;
    src.connect(gain).connect(bus);
    src.start();
  }

  function dholStroke(t, deep, pitchMult){
    pitchMult = pitchMult || 1;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    if(deep){
      osc.frequency.setValueAtTime(115*pitchMult, t);
      osc.frequency.exponentialRampToValueAtTime(42*pitchMult, t+0.16);
      gain.gain.setValueAtTime(0.95, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.24);
      osc.connect(gain).connect(beatGain);
      osc.start(t); osc.stop(t+0.26);
      noiseBurst(0.05, 0.16, beatGain);
    } else {
      osc.frequency.setValueAtTime(260*pitchMult, t);
      osc.frequency.exponentialRampToValueAtTime(150*pitchMult, t+0.09);
      gain.gain.setValueAtTime(0.55, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t+0.13);
      osc.connect(gain).connect(beatGain);
      osc.start(t); osc.stop(t+0.14);
      noiseBurst(0.035, 0.12, beatGain);
    }
  }

  function playDhol(){
    if(!audioCtx) return;
    const stage = state ? state.stage : 1;
    const pitchMult = 1 + (stage-1)*0.06;
    const t = audioCtx.currentTime;
    dholStroke(t, true, pitchMult);
    dholStroke(t+0.14, false, pitchMult);
  }

  function playHit(perfect){
    if(!audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(perfect?880:600, t);
    osc.frequency.exponentialRampToValueAtTime(perfect?1400:900, t+0.08);
    gain.gain.setValueAtTime(0.25,t);
    gain.gain.exponentialRampToValueAtTime(0.001, t+0.14);
    osc.connect(gain).connect(sfxGain);
    osc.start(t); osc.stop(t+0.15);
  }

  function playMiss(){
    if(!audioCtx) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(60, t+0.2);
    gain.gain.setValueAtTime(0.2,t);
    gain.gain.exponentialRampToValueAtTime(0.001, t+0.22);
    osc.connect(gain).connect(sfxGain);
    osc.start(t); osc.stop(t+0.25);
  }

  function playCelebration(){
    if(!audioCtx) return;
    const notes = [523,659,784,1046,1318];
    notes.forEach((f,i)=>{
      const t = audioCtx.currentTime + i*0.09;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type='triangle';
      osc.frequency.setValueAtTime(f,t);
      gain.gain.setValueAtTime(0.2,t);
      gain.gain.exponentialRampToValueAtTime(0.001,t+0.3);
      osc.connect(gain).connect(sfxGain);
      osc.start(t); osc.stop(t+0.32);
    });
  }

  function playVictoryStinger(){
    if(!audioCtx) return;
    const notes = [392,523,659,784,1046,1318];
    notes.forEach((f,i)=>{
      const t = audioCtx.currentTime + i*0.12;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type='triangle';
      osc.frequency.setValueAtTime(f,t);
      gain.gain.setValueAtTime(0.22,t);
      gain.gain.exponentialRampToValueAtTime(0.001,t+0.35);
      osc.connect(gain).connect(sfxGain);
      osc.start(t); osc.stop(t+0.37);
    });
  }

  function playLoseStinger(){
    if(!audioCtx) return;
    const notes = [440,392,330,262];
    notes.forEach((f,i)=>{
      const t = audioCtx.currentTime + i*0.15;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type='sawtooth';
      osc.frequency.setValueAtTime(f,t);
      gain.gain.setValueAtTime(0.18,t);
      gain.gain.exponentialRampToValueAtTime(0.001,t+0.3);
      osc.connect(gain).connect(sfxGain);
      osc.start(t); osc.stop(t+0.32);
    });
  }

  function startAmbientPad(){
    if(!audioCtx || ambientNodes) return;
    const o1 = audioCtx.createOscillator();
    const o2 = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const lfo = audioCtx.createOscillator();
    const lfoGain = audioCtx.createGain();
    o1.type='sine'; o1.frequency.value = 110;
    o2.type='sine'; o2.frequency.value = 165;
    lfo.type='sine'; lfo.frequency.value = 0.15;
    lfoGain.gain.value = 0.02;
    g.gain.value = 0.05;
    lfo.connect(lfoGain).connect(g.gain);
    o1.connect(g); o2.connect(g);
    g.connect(beatGain);
    o1.start(); o2.start(); lfo.start();
    ambientNodes = {o1,o2,lfo,g};
  }

  function stopAmbientPad(){
    if(!ambientNodes) return;
    try{
      ambientNodes.g.gain.setTargetAtTime(0, audioCtx.currentTime, 0.2);
      setTimeout(()=>{
        try{ ambientNodes.o1.stop(); ambientNodes.o2.stop(); ambientNodes.lfo.stop(); }catch(e){}
      }, 400);
    }catch(e){}
    ambientNodes = null;
  }

  muteBtn.addEventListener('click', ()=>{
    isMuted = !isMuted;
    muteBtn.textContent = isMuted ? '🔇' : '🔊';
    if(masterGain) masterGain.gain.value = isMuted ? 0 : 1;
  });

  settingsBtn.addEventListener('click', ()=>{ settingsScreen.style.display='flex'; });
  closeSettingsBtn.addEventListener('click', ()=>{ settingsScreen.style.display='none'; saveProfile(); });
  beatVolumeSlider.addEventListener('input', ()=>{
    beatVolume = beatVolumeSlider.value/100;
    if(beatGain) beatGain.gain.value = beatVolume;
  });
  sfxVolumeSlider.addEventListener('input', ()=>{
    sfxVolume = sfxVolumeSlider.value/100;
    if(sfxGain) sfxGain.gain.value = sfxVolume;
  });

  // ---------------- Decorative Mandap Petals ----------------
  function spawnPetal(){
    const p = document.createElement('div');
    p.className='petal';
    const rand = Math.random();
    p.textContent = rand < 0.33 ? '✨' : rand < 0.66 ? '🌼' : '🪔';
    p.style.left = Math.random()*100+'%';
    const dur = 6+Math.random()*6;
    p.style.animationDuration = dur+'s';
    p.style.fontSize = (12+Math.random()*10)+'px';
    app.appendChild(p);
    setTimeout(()=>p.remove(), dur*1000+200);
  }
  setInterval(()=>{ if(Math.random()<0.6 && !isPausedOrOverlayOpen()) spawnPetal(); }, 1400);

  function isPausedOrOverlayOpen(){
    return (state && state.paused) || pauseScreen.style.display==='flex' || infoScreen.style.display==='flex' || aboutScreen.style.display==='flex' || settingsScreen.style.display==='flex' || adminScreen.style.display==='flex';
  }

  // ---------------- Game Setup ----------------
  const HIT_LINE_RATIO = 0.86;
  const BASE_PERFECT_WINDOW = 30;
  const BASE_GOOD_WINDOW = 70;
  const BASE_MISS_PAST = 70;

  function laneHeight(){ return lanesEls[0].clientHeight; }

  function newState(){
    const preset = DIFFICULTY_PRESETS[selectedDifficulty];
    return {
      running:true,
      paused:false,
      practice: practiceMode,
      demo: adminDemoMode,
      preset,
      score:0,
      combo:0,
      bestCombo:0,
      perfectStreak:0,
      energy:100,
      totalNotes:0,
      hitNotes:0,
      elapsed:0,
      notes:[],
      lastSpawn:0,
      lastAmbient:0,
      speed:130,
      stage:1,
      celebratedAt:-1,
      lastTime:null,
      milestoneIdx:0,
      victoryTriggered:false,
      _newlyUnlocked:[],
    };
  }

  function updateHUD(){
    if(!state) return;
    scoreEl.textContent = state.score;
    comboEl.textContent = state.combo;
    const mult = comboMultiplier(state.combo);
    multEl.textContent = '×'+mult;
    bestEl.textContent = Math.max(bestScore, state.score);
    energyInner.style.width = Math.max(0,state.energy)+'%';
    energyPct.textContent = state.practice ? '∞' : Math.round(Math.max(0,state.energy))+'%';
    updateMascotMood();
  }

  function updateMascotMood(){
    mascot.classList.toggle('low', !state.practice && state.energy < 30);
    mascot.classList.toggle('hype', state.combo >= 15);
  }

  function comboMultiplier(combo){
    return Math.min(5, 1 + Math.floor(combo/10));
  }

  function showToast(msg){
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(showToast._t);
    showToast._t = setTimeout(()=>toast.classList.remove('show'), 1600);
  }

  function checkMilestones(){
    while(state.milestoneIdx < MILESTONES.length && state.score >= MILESTONES[state.milestoneIdx]){
      showToast(T('milestone')(MILESTONES[state.milestoneIdx]));
      state.milestoneIdx++;
    }
  }

  function updateStageVisuals(){
    const icons = ['🥁','🥁✨','🥁✨🪔','✨🪔✨'];
    fireLevel.textContent = icons[Math.min(state.stage-1,3)];
    fireLevel.classList.add('show');
    app.classList.remove('stage-1','stage-2','stage-3','stage-4');
    app.classList.add('stage-'+state.stage);
  }

  function difficultyForElapsed(t){
    let base;
    if(t < 22000) base = {stage:1, bpm:66, chordChance:0};
    else if(t < 48000) base = {stage:2, bpm:80, chordChance:0.15};
    else if(t < 80000) base = {stage:3, bpm:96, chordChance:0.28};
    else base = {stage:4, bpm:114, chordChance:0.45};
    const preset = state.preset;
    const baseSpeed = [null,130,160,195,235][base.stage];
    return {
      stage: base.stage,
      bpm: base.bpm * preset.bpmMult,
      chordChance: base.chordChance,
      speed: baseSpeed * preset.speedMult,
    };
  }

  function spawnNote(laneIdx){
    const id = Math.random().toString(36).slice(2);
    const noteEl = document.createElement('div');
    noteEl.className='note';
    noteEl.dataset.id = id;
    noteEl.innerHTML = '<span>'+LANE_ARROWS[laneIdx]+'</span>';
    lanesEls[laneIdx].appendChild(noteEl);
    state.notes.push({lane:laneIdx, y:-40, id, el:noteEl, judged:false});
    state.totalNotes++;
  }

  function spawnBeat(){
    const diff = difficultyForElapsed(state.elapsed);
    playDhol();
    const primary = Math.floor(Math.random()*4);
    spawnNote(primary);
    if(Math.random() < diff.chordChance){
      let second = Math.floor(Math.random()*4);
      if(second === primary) second = (second+1)%4;
      spawnNote(second);
      if(diff.stage>=4 && Math.random()<0.35){
        let third = Math.floor(Math.random()*4);
        while(third===primary||third===second) third=(third+1)%4;
        spawnNote(third);
      }
    }
    if(diff.stage !== state.stage){
      state.stage = diff.stage;
      updateStageVisuals();
      showToast(diff.stage===4 ? T('stageFire') : T('stageSpeedUp'));
    }
  }

  function popJudge(text, color, laneIdx){
    const el = document.createElement('div');
    el.className='judge-pop';
    el.textContent = text;
    el.style.color = color;
    lanesEls[laneIdx].appendChild(el);
    setTimeout(()=>el.remove(), 520);
  }

  function burstParticles(laneIdx, color){
    const laneRect = lanesEls[laneIdx].getBoundingClientRect();
    const cx = laneRect.width/2, cy = laneRect.height*HIT_LINE_RATIO;
    for(let i=0;i<10;i++){
      const p = document.createElement('div');
      p.className='particle';
      p.style.background = color;
      p.style.left = cx+'px';
      p.style.top = cy+'px';
      lanesEls[laneIdx].appendChild(p);
      const angle = Math.random()*Math.PI*2;
      const dist = 30+Math.random()*40;
      const dx = Math.cos(angle)*dist, dy = Math.sin(angle)*dist;
      p.animate([
        {transform:'translate(0,0)', opacity:1},
        {transform:`translate(${dx}px, ${dy}px)`, opacity:0}
      ], {duration:450, easing:'ease-out'});
      setTimeout(()=>p.remove(), 460);
    }
  }

  function bounceMascot(){
    mascot.style.transform = 'translateX(-50%) translateY(-10px) scale(1.1)';
    setTimeout(()=>{ if(!mascot.classList.contains('hype')) mascot.style.transform='translateX(-50%)'; }, 140);
  }

  function shakeScreen(){
    track.style.transform = 'translateX(-4px)';
    setTimeout(()=>{ track.style.transform='translateX(4px)'; }, 60);
    setTimeout(()=>{ track.style.transform='translateX(0)'; }, 120);
  }

  function laneColor(idx){
    return ['#d95d39','#f3cf7a','#7a9a60','#e5a93c'][idx];
  }

  function judgeLane(laneIdx){
    if(!state || !state.running || state.paused) return;
    targets[laneIdx].classList.add('pressed');
    setTimeout(()=>targets[laneIdx].classList.remove('pressed'),90);

    const preset = state.preset;
    const PERFECT_WINDOW = BASE_PERFECT_WINDOW * preset.windowMult;
    const GOOD_WINDOW = BASE_GOOD_WINDOW * preset.windowMult;

    const H = laneHeight();
    const hitY = H*HIT_LINE_RATIO;
    let best = null, bestDist = Infinity;
    for(const n of state.notes){
      if(n.judged || n.lane !== laneIdx) continue;
      const d = Math.abs(n.y - hitY);
      if(d < bestDist){ bestDist = d; best = n; }
    }
    if(best && bestDist <= GOOD_WINDOW){
      best.judged = true;
      best.el.remove();
      state.notes = state.notes.filter(n=>n!==best);
      const perfect = bestDist <= PERFECT_WINDOW;
      const mult = comboMultiplier(state.combo);
      const pts = (perfect?100:50) * mult;
      state.score += pts;
      state.combo++;
      state.bestCombo = Math.max(state.bestCombo, state.combo);
      state.hitNotes++;
      state.energy = Math.min(100, state.energy + (perfect?2.5:1.2));
      popJudge(perfect?'Perfect! +'+pts:'Good +'+pts, perfect?'#f3cf7a':'#7a9a60', laneIdx);
      burstParticles(laneIdx, laneColor(laneIdx));
      bounceMascot();
      playHit(perfect);
      if(perfect){
        state.perfectStreak++;
        unlockAchievement('first_perfect');
        if(state.perfectStreak>0 && state.perfectStreak % 15 === 0){
          triggerCelebration();
        }
      } else {
        state.perfectStreak = 0;
      }
      checkMilestones();
      checkGameplayAchievements();
      updateHUD();
    }
  }

  function triggerCelebration(){
    playCelebration();
    celebrateEl.style.display='flex';
    spawnConfetti(40);
    setTimeout(()=>{ celebrateEl.style.display='none'; }, 1800);
    state.score += 250;
    unlockAchievement('celebration');
    updateHUD();
  }

  function spawnConfetti(n){
    const colors = ['#f3cf7a','#e5a93c','#d95d39','#7a9a60','#fbf7ee'];
    for(let i=0;i<n;i++){
      const c = document.createElement('div');
      c.className='confetti';
      c.style.left = Math.random()*100+'%';
      c.style.background = colors[Math.floor(Math.random()*colors.length)];
      c.style.animationDuration = (1.6+Math.random()*1.4)+'s';
      c.style.borderRadius = Math.random()<0.5 ? '50%' : '2px';
      app.appendChild(c);
      setTimeout(()=>c.remove(), 3200);
    }
  }

  function missNote(n){
    n.judged = true;
    n.el.remove();
    state.combo = 0;
    state.perfectStreak = 0;
    if(!state.practice){
      state.energy -= 14;
    } else {
      state.energy = Math.max(20, state.energy - 5);
    }
    popJudge('Missed', '#d95d39', n.lane);
    playMiss();
    shakeScreen();
    updateHUD();
    if(!state.practice && state.energy <= 0){
      endGame('lost');
    }
  }

  function slug(str){
    return String(str).trim().replace(/[\/\\'"\s]+/g,'-').slice(0,120);
  }

  const LOCAL_PREFIX = 'dholGanesha:';
  const localFallbackStorage = {
    async get(key, shared){
      const raw = localStorage.getItem(LOCAL_PREFIX+key);
      if(raw === null) throw new Error('key not found: '+key);
      return { key, value: raw, shared: !!shared };
    },
    async set(key, value, shared){
      try{
        localStorage.setItem(LOCAL_PREFIX+key, value);
        return { key, value, shared: !!shared };
      }catch(e){ return null; }
    },
    async delete(key, shared){
      try{
        localStorage.removeItem(LOCAL_PREFIX+key);
        return { key, deleted:true, shared: !!shared };
      }catch(e){ return null; }
    },
    async list(prefix, shared){
      const keys = [];
      for(let i=0;i<localStorage.length;i++){
        const k = localStorage.key(i);
        if(k && k.indexOf(LOCAL_PREFIX)===0){
          const stripped = k.slice(LOCAL_PREFIX.length);
          if(!prefix || stripped.indexOf(prefix)===0) keys.push(stripped);
        }
      }
      return { keys, prefix, shared: !!shared };
    }
  };

  let storageMode = null;

  function getStorage(){
    if(storageMode === 'claude') return window.storage;
    if(storageMode === 'local') return localFallbackStorage;
    if(typeof window.storage !== 'undefined' && window.storage){
      storageMode = 'claude';
      return window.storage;
    }
    try{
      const testKey = '__dhol_test__';
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      storageMode = 'local';
      return localFallbackStorage;
    }catch(e){
      storageMode = null;
      return null;
    }
  }

  async function saveScoreToLeaderboard(){
    const storage = getStorage();
    if(!storage || !playerInfo.niatId) return;
    const key = 'scores:'+slug(playerInfo.niatId);
    const entry = {
      niatId: playerInfo.niatId,
      name: playerInfo.name,
      campus: playerInfo.campus,
      score: state.score,
      combo: state.bestCombo,
      updatedAt: Date.now()
    };
    try{
      let existing = null;
      try{
        const res = await storage.get(key, true);
        existing = res ? JSON.parse(res.value) : null;
      }catch(e){ existing = null; }
      if(!existing || entry.score > existing.score){
        await storage.set(key, JSON.stringify(entry), true);
      }
    }catch(e){
      console.error('Leaderboard save failed', e);
    }
  }

  async function fetchAllLeaderboardEntries(){
    const storage = getStorage();
    if(!storage) return [];
    const listRes = await storage.list('scores:', true);
    const keys = (listRes && listRes.keys) || [];
    const entries = [];
    for(const k of keys){
      try{
        const res = await storage.get(k, true);
        if(res && res.value) entries.push(JSON.parse(res.value));
      }catch(e){ /* skip unreadable entry */ }
    }
    entries.sort((a,b)=> b.score - a.score);
    return entries;
  }

  async function clearAllLeaderboardEntries(){
    const storage = getStorage();
    if(!storage) return;
    const listRes = await storage.list('scores:', true);
    const keys = (listRes && listRes.keys) || [];
    for(const k of keys){
      try{ await storage.delete(k, true); }catch(e){ /* ignore */ }
    }
  }

  function renderLeaderboard(){
    if(!lbCache){ return; }
    let entries = lbCache;
    if(currentLbTab === 'campus'){
      const myCampus = (playerInfo.campus||'').trim().toLowerCase();
      entries = entries.filter(e => (e.campus||'').trim().toLowerCase() === myCampus);
    }
    if(lbCache.length){
      const avg = Math.round(lbCache.reduce((s,e)=>s+e.score,0)/lbCache.length);
      lbMeta.textContent = lbCache.length+' player'+(lbCache.length===1?'':'s')+' • avg '+avg+' pts';
    } else {
      lbMeta.textContent = '';
    }
    if(entries.length === 0){
      lbList.innerHTML = '';
      lbStatus.textContent = currentLbTab==='campus'
        ? 'No scores from your campus yet — be the first!'
        : 'No scores yet — be the first to make the board!';
      lbStatus.style.display='block';
      return;
    }
    lbStatus.style.display='none';
    lbList.innerHTML = entries.slice(0,50).map((e,i)=>{
      const rank = i+1;
      const isMe = playerInfo.niatId && e.niatId === playerInfo.niatId;
      return '<div class="lb-row '+(isMe?'me ':'')+'rank-'+rank+'">'
        +'<div class="lb-rank">'+rank+'</div>'
        +'<div class="lb-info"><div class="lb-name">'+escapeHtml(e.name||'—')+'</div>'
        +'<div class="lb-campus">'+escapeHtml(e.campus||'')+'</div></div>'
        +'<div class="lb-score">'+e.score+'</div>'
        +'</div>';
    }).join('');
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function updateScopeNote(){
    if(!lbScopeNote) return;
    if(storageMode === 'claude'){
      lbScopeNote.textContent = 'Shared with everyone playing this game inside Claude.';
    } else if(storageMode === 'local'){
      lbScopeNote.textContent = 'Saved on this device/browser only.';
    } else {
      lbScopeNote.textContent = '';
    }
  }

  async function loadLeaderboard(){
    const storage = getStorage();
    updateScopeNote();
    if(!storage){
      lbStatus.textContent = 'Leaderboard storage isn\'t available in this browser.';
      lbStatus.style.display = 'block';
      lbList.innerHTML='';
      lbMeta.textContent='';
      return;
    }
    lbStatus.textContent = 'Loading leaderboard…';
    lbStatus.style.display = 'block';
    lbList.innerHTML='';
    try{
      lbCache = await fetchAllLeaderboardEntries();
      renderLeaderboard();
    }catch(e){
      console.error(e);
      lbStatus.textContent = 'Could not load the leaderboard right now.';
      lbStatus.style.display='block';
    }
  }

  async function refreshTopBanner(){
    const storage = getStorage();
    if(!storage){ tbList.textContent = 'Not available in this browser.'; return; }
    try{
      const entries = await fetchAllLeaderboardEntries();
      if(!entries.length){ tbList.textContent = 'No scores yet — be the first!'; return; }
      tbList.innerHTML = entries.slice(0,3).map((e,i)=>
        '<div class="tb-row"><span class="tb-rank">'+(i+1)+'</span><span class="tb-name">'+escapeHtml(e.name||'—')+' ('+escapeHtml(e.campus||'')+')</span><span class="tb-score">'+e.score+'</span></div>'
      ).join('');
    }catch(e){
      tbList.textContent = 'Could not load leaderboard.';
    }
  }

  lbTabCampus.addEventListener('click', ()=>{
    currentLbTab='campus';
    lbTabCampus.classList.add('active');
    lbTabAll.classList.remove('active');
    renderLeaderboard();
  });
  lbTabAll.addEventListener('click', ()=>{
    currentLbTab='all';
    lbTabAll.classList.add('active');
    lbTabCampus.classList.remove('active');
    renderLeaderboard();
  });

  shareBtn.addEventListener('click', async ()=>{
    if(!state) return;
    const text = `I scored ${state.score} points (best combo ${state.bestCombo}) in Dhol Ganesha! 🥁✨ Can you beat me in ${playerInfo.campus||'my campus'}?`;
    if(navigator.share){
      try{ await navigator.share({ title:'Dhol Ganesha', text }); }catch(e){ /* user cancelled */ }
    } else if(navigator.clipboard){
      try{
        await navigator.clipboard.writeText(text);
        showToast(T('scoreCopied'));
      }catch(e){
        showToast(T('couldNotCopy'));
      }
    } else {
      showToast(T('shareUnsupported'));
    }
  });

  // ---------------- Admin Panel ----------------
  let titleClickCount = 0, titleClickTimer = null;
  gameTitle.addEventListener('click', ()=>{
    titleClickCount++;
    clearTimeout(titleClickTimer);
    titleClickTimer = setTimeout(()=>{ titleClickCount = 0; }, 3000);
    if(titleClickCount >= 5){
      titleClickCount = 0;
      const code = window.prompt('Enter admin code:');
      if(code === ADMIN_CODE){
        qrUrlInput.value = window.location.href;
        adminScreen.style.display = 'flex';
      } else if(code !== null){
        showToast('Incorrect code.');
      }
    }
  });
  closeAdminBtn.addEventListener('click', ()=>{ adminScreen.style.display = 'none'; });
  demoModeCheck.addEventListener('change', ()=>{
    adminDemoMode = demoModeCheck.checked;
    demoBanner.classList.toggle('show', adminDemoMode);
  });
  clearLeaderboardBtn.addEventListener('click', async ()=>{
    if(!window.confirm('Clear ALL leaderboard scores? This cannot be undone.')) return;
    await clearAllLeaderboardEntries();
    lbCache = [];
    showToast(T('leaderboardCleared'));
    refreshTopBanner();
  });
  let qrLibLoading = null;
  function loadQrLib(){
    if(window.QRCode) return Promise.resolve();
    if(qrLibLoading) return qrLibLoading;
    qrLibLoading = new Promise((resolve, reject)=>{
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
    return qrLibLoading;
  }
  generateQrBtn.addEventListener('click', async ()=>{
    const url = qrUrlInput.value.trim();
    if(!url) return;
    qrContainer.innerHTML = 'Loading…';
    try{
      await loadQrLib();
      qrContainer.innerHTML = '';
      new window.QRCode(qrContainer, { text:url, width:180, height:180 });
    }catch(e){
      qrContainer.textContent = 'Could not load QR library (needs internet).';
    }
  });

  function endGame(reason){
    state.running = false;
    stopAmbientPad();
    bestScore = Math.max(bestScore, state.score);
    const acc = state.totalNotes ? Math.round((state.hitNotes/state.totalNotes)*100) : 0;
    finalScoreEl.textContent = state.score;
    finalComboEl.textContent = state.bestCombo;
    finalAccEl.textContent = acc+'%';

    if(reason === 'completed'){
      unlockAchievement('procession_complete');
      gameOverTitle.textContent = T('victoryTitle');
      gameOverMsg.textContent = T('victoryMsg');
      playVictoryStinger();
    } else {
      gameOverTitle.textContent = T('loseTitle');
      gameOverMsg.textContent = T('loseMsg');
      playLoseStinger();
    }
    if(playerInfo.name){
      gameOverMsg.textContent += ' — '+playerInfo.name+' ('+playerInfo.niatId+'), '+playerInfo.campus;
    }

    renderBadgeShelf();
    gameOverScreen.style.display='flex';
    updateSkinAvailability();
    saveProfile();

    if(!state.practice && !state.demo && bestScore === state.score && state.score>0){
      showToast(T('newHighScore'));
    }

    currentLbTab = 'campus';
    lbTabCampus.classList.add('active');
    lbTabAll.classList.remove('active');

    if(state.practice){
      lbStatus.textContent = T('practiceNotSaved');
      lbStatus.style.display = 'block';
      lbList.innerHTML='';
      lbMeta.textContent='';
      lbScopeNote.textContent='';
    } else if(state.demo){
      lbStatus.textContent = T('demoNotSaved');
      lbStatus.style.display = 'block';
      lbList.innerHTML='';
      lbMeta.textContent='';
      lbScopeNote.textContent='';
    } else {
      saveScoreToLeaderboard().then(()=>{ loadLeaderboard(); refreshTopBanner(); });
    }
  }

  // ---------------- Main Loop ----------------
  function loop(ts){
    if(!state || !state.running || state.paused) return;
    if(state.lastTime===null) state.lastTime = ts;
    const dt = ts - state.lastTime;
    state.lastTime = ts;
    state.elapsed += dt;

    if(!state.victoryTriggered && state.elapsed >= VICTORY_TIME){
      state.victoryTriggered = true;
      endGame('completed');
      return;
    }

    const diff = difficultyForElapsed(state.elapsed);
    state.speed = diff.speed;
    const beatMs = 60000/diff.bpm;
    if(state.elapsed - state.lastSpawn >= beatMs){
      state.lastSpawn = state.elapsed;
      spawnBeat();
    }
    if(state.elapsed - state.lastAmbient >= beatMs/2 && state.elapsed - state.lastSpawn >= beatMs*0.4){
      state.lastAmbient = state.elapsed;
      if(audioCtx) dholStroke(audioCtx.currentTime, false, 1+(state.stage-1)*0.06);
    }

    const H = laneHeight();
    const hitY = H*HIT_LINE_RATIO;
    const dySec = state.speed * (dt/1000);
    for(const n of state.notes.slice()){
      if(n.judged) continue;
      n.y += dySec;
      n.el.style.top = n.y+'px';
      if(n.y - hitY > BASE_MISS_PAST * state.preset.windowMult){
        missNote(n);
        state.notes = state.notes.filter(x=>x!==n);
      }
    }

    updateHUD();
    if(state.running && !state.paused) requestAnimationFrame(loop);
  }

  // ---------------- Pause / Info / About ----------------
  function togglePause(){
    if(!state || !state.running) return;
    state.paused = !state.paused;
    if(state.paused){
      pauseBtn.textContent = '▶️';
      pauseScreen.style.display = 'flex';
    } else {
      pauseBtn.textContent = '⏸️';
      pauseScreen.style.display = 'none';
      state.lastTime = null;
      requestAnimationFrame(loop);
    }
  }
  pauseBtn.addEventListener('click', togglePause);
  resumeBtn.addEventListener('click', togglePause);

  function openInfo(){
    const wasRunning = state && state.running && !state.paused;
    if(wasRunning) togglePause();
    infoScreen.style.display = 'flex';
    infoScreen.dataset.resume = wasRunning ? '1' : '0';
  }
  function closeInfo(){
    infoScreen.style.display = 'none';
    if(infoScreen.dataset.resume === '1' && state && state.paused) togglePause();
  }
  infoBtn.addEventListener('click', openInfo);
  closeInfoBtn.addEventListener('click', closeInfo);

  aboutBtn.addEventListener('click', ()=>{ aboutScreen.style.display='flex'; });
  closeAboutBtn.addEventListener('click', ()=>{ aboutScreen.style.display='none'; });

  window.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape' && state && state.running){
      e.preventDefault();
      togglePause();
      return;
    }
    const idx = KEYS.indexOf(e.key);
    if(idx === -1) return;
    e.preventDefault();
    if(!state || !state.running || state.paused) return;
    judgeLane(idx);
  });

  lanesEls.forEach((lane, idx)=>{
    lane.addEventListener('pointerdown', (e)=>{
      if(e.target.closest('.target') || e.target === lane || e.target.classList.contains('lane-glow')){
        if(!audioCtx) ensureAudio();
        if(state && state.running && !state.paused) judgeLane(idx);
      }
    });
  });

  // ---------------- Difficulty & Practice Selection ----------------
  diffTabs.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      diffTabs.forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      selectedDifficulty = btn.dataset.diff;
      saveProfile();
    });
  });
  practiceCheck.addEventListener('change', ()=>{
    practiceMode = practiceCheck.checked;
  });

  // ---------------- Form Validation & Navigation ----------------
  function validateForm(){
    const niat = niatIdInput.value.trim();
    const name = playerNameInput.value.trim();
    const campus = campusNameInput.value.trim();
    [niatIdInput, playerNameInput, campusNameInput].forEach(el=>el.classList.remove('invalid'));
    let ok = true;
    if(!niat){ niatIdInput.classList.add('invalid'); ok = false; }
    if(!name){ playerNameInput.classList.add('invalid'); ok = false; }
    if(!campus){ campusNameInput.classList.add('invalid'); ok = false; }
    formError.classList.toggle('show', !ok);
    if(ok){ playerInfo = { niatId:niat, name, campus }; }
    return ok;
  }

  function startGame(){
    if(startScreen.style.display !== 'none'){
      if(!validateForm()) return;
    }
    ensureAudio();
    saveProfile();
    document.querySelectorAll('.note, .judge-pop').forEach(e=>e.remove());
    state = newState();
    startScreen.style.display='none';
    gameOverScreen.style.display='none';
    celebrateEl.style.display='none';
    pauseScreen.style.display='none';
    pauseBtn.textContent = '⏸️';
    fireLevel.classList.remove('show');
    app.classList.remove('stage-1','stage-2','stage-3','stage-4');
    app.classList.add('stage-1');
    demoBanner.classList.toggle('show', adminDemoMode);
    updateHUD();
    startAmbientPad();
    requestAnimationFrame(loop);
    if(playerInfo.name){
      showToast(T('letsGo')(playerInfo.name, playerInfo.campus));
    }
  }

  function goHome(){
    state = null;
    stopAmbientPad();
    document.querySelectorAll('.note, .judge-pop').forEach(e=>e.remove());
    gameOverScreen.style.display='none';
    pauseScreen.style.display='none';
    celebrateEl.style.display='none';
    infoScreen.style.display='none';
    aboutScreen.style.display='none';
    fireLevel.classList.remove('show');
    app.classList.remove('stage-1','stage-2','stage-3','stage-4');
    pauseBtn.textContent = '⏸️';
    mascot.classList.remove('low','hype');
    mascot.style.transform = 'translateX(-50%)';
    scoreEl.textContent = '0';
    comboEl.textContent = '0';
    multEl.textContent = '×1';
    energyInner.style.width = '100%';
    energyPct.textContent = '100%';
    demoBanner.classList.remove('show');
    startScreen.style.display='flex';
    refreshTopBanner();
  }

  startBtn.addEventListener('click', startGame);
  retryBtn.addEventListener('click', startGame);
  homeBtn.addEventListener('click', goHome);

  if('serviceWorker' in navigator){
    window.addEventListener('load', ()=>{
      navigator.serviceWorker.register('service-worker.js').catch(()=>{ /* ignore in unsupported contexts */ });
    });
  }

  updateHUD();
  loadProfile().then(refreshTopBanner);
})();