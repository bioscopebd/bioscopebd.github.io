// ==========================================================================
// BioscopeBD Dedicated Cinema Rooms & Watch Party System
// Real-Time Multi-Client Live Sync, Zero Fake Rooms, Global TMDB Projector
// ==========================================================================

// 1. User State & Toast Helpers
let currentUser = { id: "usr_guest", name: "Cinephile Guest", avatar: "🍿" };
try {
  const savedUser = localStorage.getItem("bioscope_user");
  if (savedUser) currentUser = JSON.parse(savedUser);
} catch (_) {}

const userChipAvatar = document.querySelector("#user-chip-avatar");
const userChipName = document.querySelector("#user-chip-name");
if (userChipAvatar && currentUser.avatar) userChipAvatar.textContent = currentUser.avatar;
if (userChipName && currentUser.name) userChipName.textContent = currentUser.name.split(" ")[0];

const toast = document.querySelector("#toast");
let toastTimer;
function notify(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3600);
}

// Theme setup
const themeButton = document.querySelector("#theme-toggle");
const savedTheme = localStorage.getItem("bioscope-theme");
if (savedTheme === "light" || savedTheme === "dark") document.body.dataset.theme = savedTheme;

if (themeButton) {
  themeButton.addEventListener("click", () => {
    const next = document.body.dataset.theme === "dark" ? "light" : "dark";
    document.body.dataset.theme = next;
    try { localStorage.setItem("bioscope-theme", next); } catch (_) {}
  });
}

// 2. DOM Elements
const tabLoungeHalls = document.querySelector("#hub-tab-halls");
const tabLoungeHost = document.querySelector("#hub-host-party-btn");
const tabLoungeJoin = document.querySelector("#hub-join-party-btn");

const panelLoungeHalls = document.querySelector("#panel-lounge-halls");
const panelLoungeHost = document.querySelector("#panel-lounge-host");
const panelLoungeJoin = document.querySelector("#panel-lounge-join");

const visPublicRadio = document.querySelector("#vis-public-radio");
const visPrivateRadio = document.querySelector("#vis-private-radio");
const lblVisPublic = document.querySelector("#lbl-vis-public");
const lblVisPrivate = document.querySelector("#lbl-vis-private");
const partyPrivateCodeBox = document.querySelector("#party-private-code-box");
const partyRoomCodeEl = document.querySelector("#party-room-code");
const btnCopyRoom = document.querySelector("#btn-copy-room");
const btnGenerateNewCode = document.querySelector("#btn-generate-new-code");
const partyHallNameInput = document.querySelector("#party-hall-name-input");
const btnRandomHallName = document.querySelector("#btn-random-hall-name");
const partyLangSelect = document.querySelector("#party-lang-select");
const partyCapacitySelect = document.querySelector("#party-capacity-select");
const btnStartParty = document.querySelector("#btn-start-party");
const btnGenerateTicket = document.querySelector("#btn-generate-ticket");

const boxOfficeGrid = document.querySelector("#box-office-grid");
const joinRoomInput = document.querySelector("#join-room-input");
const btnSubmitJoin = document.querySelector("#btn-submit-join");

// Dedicated Virtual Cinema Theatre Elements
const theatreRoomView = document.querySelector("#theatre-room-view");
const theatreCurtain = document.querySelector("#theatre-curtain");
const theatreHallBadge = document.querySelector("#theatre-hall-badge");
const theatreMovieTitle = document.querySelector("#theatre-movie-title");
const theatreCurrentCode = document.querySelector("#theatre-current-code");
const theatreCodePill = document.querySelector("#theatre-code-pill");
const btnTheatreResync = document.querySelector("#btn-theatre-resync");
const btnTheatrePauseReq = document.querySelector("#btn-theatre-pause-req");
const btnTheatreShare = document.querySelector("#btn-theatre-share");
const btnTheatreLeave = document.querySelector("#btn-theatre-leave");
const btnTheatreDismiss = document.querySelector("#btn-theatre-dismiss");
const theatrePlayerFrame = document.querySelector("#theatre-player-frame");
const theatreProjectorShield = document.querySelector("#theatre-projector-shield");
const theatreFloatingReactions = document.querySelector("#theatre-floating-reactions");
const theatreCornerChat = document.querySelector("#theatre-corner-chat");
const btnTheatreChatToggle = document.querySelector("#btn-theatre-chat-toggle");
const btnDockChatToggle = document.querySelector("#btn-dock-chat-toggle");
const playerDockChatLabel = document.querySelector("#player-dock-chat-label");
const btnDockResync = document.querySelector("#btn-dock-resync");
const btnDockPauseReq = document.querySelector("#btn-dock-pause-req");
const playerDockTitle = document.querySelector("#player-dock-title");
const btnHideCornerChat = document.querySelector("#btn-hide-corner-chat");
const btnShowCornerChat = document.querySelector("#btn-show-corner-chat");
const theatreRosterCount = document.querySelector("#theatre-roster-count");
const btnMinCornerChat = document.querySelector("#btn-min-corner-chat");
const btnToggleRoster = document.querySelector("#btn-toggle-roster");
const theatreRosterPopover = document.querySelector("#theatre-roster-popover");
const rosterPopoverCount = document.querySelector("#roster-popover-count");
const theatreRosterList = document.querySelector("#theatre-roster-list");
const theatreChatBody = document.querySelector("#theatre-chat-body");
const theatreChatForm = document.querySelector("#theatre-chat-form");
const theatreChatInput = document.querySelector("#theatre-chat-input");
const theatreSeatsTrack = document.querySelector("#theatre-seats-track");
const theatreHostDeck = document.querySelector("#theatre-host-deck");
const theatreSwitchMovie = document.querySelector("#theatre-switch-movie");
const theatreProjectorSearch = document.querySelector("#theatre-projector-search");
const theatreProjectorResults = document.querySelector("#theatre-projector-results");
const btnHostPlayPause = document.querySelector("#btn-host-playpause");
const btnHostResync = document.querySelector("#btn-host-resync");
const btnHostDismissBar = document.querySelector("#btn-host-dismiss-bar");

// 3. Room State & Real-Time Storage (Zero Fake Rooms!)
let activeHall = null;
let currentHallSession = null;
let hallAudience = [];
let currentHallFilter = "all";

// Discovered live rooms across the network (Only Real Hosts!)
const discoveredRooms = new Map();

// Helper: YouTube iFrame API Remote Commands
function sendYouTubeCommand(iframe, command, args = []) {
  if (!iframe || !iframe.contentWindow) return;
  try {
    iframe.contentWindow.postMessage(JSON.stringify({
      event: "command",
      func: command,
      args: args
    }), "*");
  } catch (_) {}
}

const RANDOM_HALL_NAMES = [
  "Star Cineplex VIP Lounge",
  "Blockbuster Premier Hall",
  "Modhumita 70mm Retro Hall",
  "IMAX Laser Dolby Cinema",
  "Midnight Cinephile Club",
  "Shyamoli Cinema Gold Class",
  "Chitramohol Classic Lounge",
  "Bioscope Ultra 4K Premiere",
  "Cyberpunk Sci-Fi Cinema",
  "Dhallywood Nostalgia Room",
  "Studio Ghibli Dream Hall",
  "Christopher Nolan Screening Room",
  "Sony Square IMAX Auditorium",
  "Balaka Cine Lounge"
];

// Host Room Code Management
let currentHostDraftCode = "";

function getRandomRoomCode() {
  return `BIOSCOPE-${Math.floor(1000 + Math.random() * 9000)}`;
}

function getHostRoomCode() {
  if (activeHall && activeHall.roomCode) return activeHall.roomCode;
  if (!currentHostDraftCode) {
    currentHostDraftCode = getRandomRoomCode();
  }
  return currentHostDraftCode;
}

function getPersistentHostRoomCode() {
  return getHostRoomCode();
}

function generateNewHostRoomCode() {
  let nextCode = getRandomRoomCode();
  while (nextCode === currentHostDraftCode) {
    nextCode = getRandomRoomCode();
  }
  currentHostDraftCode = nextCode;
  try {
    localStorage.setItem("bioscope_persistent_host_code", currentHostDraftCode);
  } catch (_) {}
  if (partyRoomCodeEl) {
    partyRoomCodeEl.textContent = currentHostDraftCode;
    partyRoomCodeEl.classList.remove("code-pop");
    void partyRoomCodeEl.offsetWidth;
    partyRoomCodeEl.classList.add("code-pop");
  }
  notify(`🎲 Generated new private room code: ${currentHostDraftCode}`);
  return currentHostDraftCode;
}

function loadActiveHallState() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get("room") || urlParams.get("code") || urlParams.get("join");
    const saved = localStorage.getItem("bioscope_active_hall");
    if (saved && roomParam) {
      const parsed = JSON.parse(saved);
      if (parsed.roomCode === roomParam) {
        activeHall = parsed;
        return;
      }
    }
    // If sitting in lobby without room in URL, purge stale session
    activeHall = null;
    localStorage.removeItem("bioscope_active_hall");
  } catch (_) {
    activeHall = null;
  }
}

function saveActiveHallState() {
  try {
    if (activeHall) {
      localStorage.setItem("bioscope_active_hall", JSON.stringify(activeHall));
    } else {
      localStorage.removeItem("bioscope_active_hall");
    }
  } catch (_) {}
  renderBoxOfficeHalls();
}

// ==========================================================================
// 4. Live Global Server Signaling (MQTT over WebSocket + BroadcastChannel)
// ==========================================================================
let mqttClient = null;
const hallChannel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("bioscope_theatre_sync") : null;

function initGlobalMqttRelay() {
  const statusEl = document.querySelector("#server-status-text");
  if (typeof Paho === "undefined" || !Paho.MQTT) {
    if (statusEl) statusEl.textContent = "LOCAL MULTI-TAB RELAY ACTIVE";
    return;
  }

  const clientId = `bioscope_${Math.random().toString(36).slice(2, 9)}`;
  // Connect to public secure WebSocket MQTT broker
  mqttClient = new Paho.MQTT.Client("broker.emqx.io", 8084, clientId);

  mqttClient.onConnectionLost = (responseObject) => {
    if (statusEl) statusEl.textContent = "RECONNECTING TO SERVER...";
    setTimeout(initGlobalMqttRelay, 4000);
  };

  mqttClient.onMessageArrived = (message) => {
    try {
      const data = JSON.parse(message.payloadString);
      handleIncomingNetworkMessage(message.destinationName, data);
    } catch (_) {}
  };

  mqttClient.connect({
    useSSL: true,
    timeout: 6,
    onSuccess: () => {
      if (statusEl) statusEl.textContent = "GLOBAL CINEMA SERVER ONLINE (REAL-TIME)";
      // Subscribe to global lobby for real-time room discovery
      mqttClient.subscribe("bioscopebd/lobby/halls");
      
      // If currently inside a room, also subscribe to room topic
      if (currentHallSession && currentHallSession.roomCode) {
        mqttClient.subscribe(`bioscopebd/room/${currentHallSession.roomCode}`);
      }

      // Request online rooms from any currently active hosts
      broadcastToLobby({ type: "request_lobby" });
    },
    onFailure: () => {
      if (statusEl) statusEl.textContent = "LOCAL RELAY ONLINE (STANDALONE)";
    }
  });
}

function broadcastToLobby(data) {
  if (mqttClient && mqttClient.isConnected()) {
    try {
      const msg = new Paho.MQTT.Message(JSON.stringify(data));
      msg.destinationName = "bioscopebd/lobby/halls";
      mqttClient.send(msg);
    } catch (_) {}
  }
  if (hallChannel) {
    try { hallChannel.postMessage({ channel: "lobby", ...data }); } catch (_) {}
  }
}

function broadcastToRoom(data) {
  if (!currentHallSession) return;
  const roomCode = currentHallSession.roomCode;
  if (mqttClient && mqttClient.isConnected()) {
    try {
      const msg = new Paho.MQTT.Message(JSON.stringify(data));
      msg.destinationName = `bioscopebd/room/${roomCode}`;
      mqttClient.send(msg);
    } catch (_) {}
  }
  if (hallChannel) {
    try { hallChannel.postMessage({ channel: "room", roomCode, ...data }); } catch (_) {}
  }
}

// Process Network Messages
function handleIncomingNetworkMessage(topic, data) {
  if (!data) return;

  // 1. Lobby Discovery Messages
  if (topic === "bioscopebd/lobby/halls" || data.channel === "lobby") {
    if (data.type === "hall_alive" && data.roomCode) {
      // Don't add if dismissed
      discoveredRooms.set(data.roomCode, {
        ...data,
        lastSeen: Date.now()
      });
      renderBoxOfficeHalls();
    } else if (data.type === "hall_closed" && data.roomCode) {
      discoveredRooms.delete(data.roomCode);
      renderBoxOfficeHalls();
    } else if (data.type === "request_lobby") {
      // If I am hosting an active room, answer immediately with my room data
      if (activeHall && activeHall.isHost) {
        publishHostHeartbeat();
      }
    }
    return;
  }

  // 2. Room Specific Events
  if (!currentHallSession) return;
  if (data.roomCode && data.roomCode !== currentHallSession.roomCode) return;

  if (data.type === "chat") {
    appendTheatreChatMessage("user", data.text, data.author, data.avatar);
  } else if (data.type === "reaction") {
    triggerSeatReaction(data.emoji, data.userId);
  } else if (data.type === "presence" && data.user) {
    if (!hallAudience.some(m => m.id === data.user.id)) {
      data.user.seat = `A${hallAudience.length + 1}`;
      hallAudience.push(data.user);
      renderHallAudienceSeats();
      appendTheatreChatMessage("system", `👥 ${data.user.name} took seat ${data.user.seat} in the hall.`);
    }
  } else if (data.type === "sync_movie") {
    if (theatreMovieTitle) theatreMovieTitle.textContent = data.movieTitle;
    currentHallSession.movieTitle = data.movieTitle;
    currentHallSession.tmdbId = data.tmdbId;
    currentHallSession.type = data.type;
    currentHallSession.trailerId = data.trailerId;
    if (data.elapsed) currentHallSession.startTime = Date.now() - (data.elapsed * 1000);
    loadTheatreScreen(data.movieTitle, data.tmdbId, data.type, data.trailerId, data.elapsed || 0);
    appendTheatreChatMessage("system", `👑 Host changed feature presentation to: ${data.movieTitle}`);
  } else if (data.type === "sync_playback") {
    if (typeof data.isPlaying === "boolean") {
      currentHallSession.isPlaying = data.isPlaying;
      if (data.isPlaying) {
        sendYouTubeCommand(theatrePlayerFrame, "playVideo");
        appendTheatreChatMessage("system", "▶️ Playback resumed.");
      } else {
        sendYouTubeCommand(theatrePlayerFrame, "pauseVideo");
        appendTheatreChatMessage("system", "⏸️ Host paused the stream.");
      }
    }
  } else if (data.type === "request_pause") {
    if (currentHallSession.isHost) {
      notify(`✋ ${data.userName} requested a pause break!`, 5000);
      const pauseMsg = document.createElement("div");
      pauseMsg.className = "c-msg c-msg--system";
      const btnId = `btn-quick-pause-${Date.now()}`;
      pauseMsg.innerHTML = `✋ <strong>${escapeHTML(data.userName)}</strong> requested a pause break! <button type="button" class="button button--glass button--xs" style="margin-left:6px;padding:2px 8px;font-size:0.75rem;" id="${btnId}">⏸️ Pause Now</button>`;
      if (theatreChatBody) {
        theatreChatBody.appendChild(pauseMsg);
        theatreChatBody.scrollTop = theatreChatBody.scrollHeight;
        pauseMsg.querySelector(`#${btnId}`)?.addEventListener("click", () => {
          toggleHostPlayPause(false);
          pauseMsg.remove();
        });
      }
    } else {
      appendTheatreChatMessage("system", `✋ <em>${escapeHTML(data.userName)}</em> requested a pause break.`);
    }
  } else if (data.type === "request_sync") {
    if (currentHallSession.isHost) {
      const elapsed = Math.max(0, Math.floor((Date.now() - (currentHallSession.startTime || Date.now())) / 1000));
      broadcastToRoom({
        type: "sync_state",
        roomCode: currentHallSession.roomCode,
        movieTitle: currentHallSession.movieTitle,
        tmdbId: currentHallSession.tmdbId,
        type: currentHallSession.type,
        trailerId: currentHallSession.trailerId,
        isPlaying: currentHallSession.isPlaying,
        elapsed: elapsed
      });
    }
  } else if (data.type === "sync_state") {
    if (!currentHallSession.isHost) {
      if (data.movieTitle && data.movieTitle !== currentHallSession.movieTitle) {
        if (theatreMovieTitle) theatreMovieTitle.textContent = data.movieTitle;
        currentHallSession.movieTitle = data.movieTitle;
        currentHallSession.tmdbId = data.tmdbId;
        currentHallSession.type = data.type;
        currentHallSession.trailerId = data.trailerId;
        loadTheatreScreen(data.movieTitle, data.tmdbId, data.type, data.trailerId, data.elapsed || 0);
      } else if (data.elapsed > 0) {
        sendYouTubeCommand(theatrePlayerFrame, "seekTo", [data.elapsed, true]);
      }
      if (typeof data.isPlaying === "boolean") {
        currentHallSession.isPlaying = data.isPlaying;
        if (data.isPlaying) sendYouTubeCommand(theatrePlayerFrame, "playVideo");
        else sendYouTubeCommand(theatrePlayerFrame, "pauseVideo");
      }
    }
  } else if (data.type === "dismiss") {
    notify(data.reason ? `🛑 ${data.reason}` : "🛑 The Host has ended this Cinema Hall. Returning to Lobby...");
    leaveTheatreHall(true);
  } else if (data.type === "host_transferred") {
    const isMeNewHost = (currentUser.id === data.newHostId || currentUser.name === data.newHostName);
    if (isMeNewHost) {
      if (currentHallSession) currentHallSession.isHost = true;
      activeHall = { ...(currentHallSession || {}), isHost: true };
      saveActiveHallState();
      if (btnTheatreDismiss) btnTheatreDismiss.hidden = false;
      if (theatreHostDeck) theatreHostDeck.hidden = false;
      if (btnTheatrePauseReq) btnTheatrePauseReq.hidden = true;
      if (btnDockPauseReq) btnDockPauseReq.hidden = true;
      notify("👑 Host role transferred to you! You now have full playback authority.");
      appendTheatreChatMessage("system", `👑 ${data.newHostName} is now the Host of this Cinema Hall.`);
    } else {
      appendTheatreChatMessage("system", `👑 Host role transferred to Co-Host ${data.newHostName}.`);
    }
    const newHost = hallAudience.find(m => m.id === data.newHostId || m.name === data.newHostName);
    if (newHost) {
      newHost.isHost = true;
      newHost.isCoHost = false;
      renderHallAudienceSeats();
      renderRosterPopoverList();
    }
  } else if (data.type === "cohost_update") {
    const mem = hallAudience.find(x => x.id === data.userId || x.name === data.userName);
    if (mem) {
      mem.isCoHost = data.isCoHost;
      renderHallAudienceSeats();
      renderRosterPopoverList();
      appendTheatreChatMessage("system", data.isCoHost ? `⭐ <em>${data.userName}</em> was appointed as Co-Host.` : `Co-Host status removed from <em>${data.userName}</em>.`);
      if (currentUser.id === data.userId || currentUser.name === data.userName) {
        notify(data.isCoHost ? "⭐ You were appointed as Co-Host! If the host leaves, you will take over." : "You are no longer a Co-Host.");
      }
    }
  } else if (data.type === "member_left") {
    hallAudience = hallAudience.filter(m => m.id !== data.userId && m.name !== data.userName);
    renderHallAudienceSeats();
    renderRosterPopoverList();
    appendTheatreChatMessage("system", `👋 <em>${escapeHTML(data.userName)}</em> left the hall.`);
  }
}

// BroadcastChannel fallback listener for local multi-tab testing
if (hallChannel) {
  hallChannel.onmessage = (e) => {
    const data = e.data;
    if (!data) return;
    const topic = data.channel === "lobby" ? "bioscopebd/lobby/halls" : `bioscopebd/room/${data.roomCode}`;
    handleIncomingNetworkMessage(topic, data);
  };
}

// Host Periodic Heartbeat (Advertises Room to Global Lobby like PUBG custom room)
function publishHostHeartbeat() {
  if (!activeHall || !activeHall.isHost) return;
  // Strictly broadcast ONLY when the host is actively present in the theatre hall!
  if (!theatreRoomView || theatreRoomView.hidden) return;

  broadcastToLobby({
    type: "hall_alive",
    roomCode: activeHall.roomCode,
    hallName: activeHall.hallName,
    movieTitle: activeHall.movieTitle,
    poster: activeHall.poster,
    isPublic: activeHall.isPublic,
    hostName: activeHall.hostName,
    hostAvatar: activeHall.hostAvatar,
    language: activeHall.language || "English",
    capacity: activeHall.capacity || "Unlimited",
    viewers: hallAudience.length || 1,
    tmdbId: activeHall.tmdbId,
    type: activeHall.type,
    trailerId: activeHall.trailerId,
    startTime: activeHall.startTime,
    isPlaying: activeHall.isPlaying
  });
}

// Run host heartbeat every 3s, purge inactive rooms without recent heartbeat in 8s
setInterval(() => {
  if (activeHall && activeHall.isHost && theatreRoomView && !theatreRoomView.hidden) {
    publishHostHeartbeat();
  }

  // Purge rooms not heard from in 8s
  const now = Date.now();
  let changed = false;
  discoveredRooms.forEach((hall, code) => {
    if (activeHall && activeHall.roomCode === code) {
      if (!theatreRoomView || theatreRoomView.hidden) {
        discoveredRooms.delete(code);
        changed = true;
      }
      return;
    }
    if (now - hall.lastSeen > 8000) {
      discoveredRooms.delete(code);
      changed = true;
    }
  });
  if (changed) renderBoxOfficeHalls();
}, 3000);

// ==========================================================================
// 5. Cinema Lounge Navigation & Tab Switching
// ==========================================================================
function switchLoungeTab(tabName) {
  const tabs = [
    { name: "halls", btn: tabLoungeHalls, panel: panelLoungeHalls },
    { name: "host", btn: tabLoungeHost, panel: panelLoungeHost },
    { name: "join", btn: tabLoungeJoin, panel: panelLoungeJoin }
  ];

  tabs.forEach(t => {
    const active = t.name === tabName;
    if (t.btn) {
      t.btn.classList.toggle("is-active", active);
      t.btn.setAttribute("aria-selected", active ? "true" : "false");
    }
    if (t.panel) {
      t.panel.hidden = !active;
      t.panel.classList.toggle("is-active", active);
    }
  });

  if (tabName === "halls") renderBoxOfficeHalls();
  if (tabName === "host") updateVisibilityToggle();
  if (tabName === "join") {
    setTimeout(() => { if (joinRoomInput) joinRoomInput.focus(); }, 120);
  }
}

if (tabLoungeHalls) tabLoungeHalls.addEventListener("click", () => switchLoungeTab("halls"));
if (tabLoungeHost) tabLoungeHost.addEventListener("click", () => switchLoungeTab("host"));
if (tabLoungeJoin) tabLoungeJoin.addEventListener("click", () => switchLoungeTab("join"));

// Public vs Private Visibility Selection in Host Panel
function updateVisibilityToggle() {
  const isPrivate = visPrivateRadio && visPrivateRadio.checked;
  if (lblVisPublic && lblVisPrivate) {
    lblVisPublic.classList.toggle("is-active", !isPrivate);
    lblVisPrivate.classList.toggle("is-active", isPrivate);
  }
  if (partyPrivateCodeBox) {
    partyPrivateCodeBox.hidden = !isPrivate;
  }
  const code = partyRoomCodeEl?.textContent?.trim() || getHostRoomCode();
  if (partyRoomCodeEl) partyRoomCodeEl.textContent = code;
}

if (visPublicRadio) visPublicRadio.addEventListener("change", updateVisibilityToggle);
if (visPrivateRadio) visPrivateRadio.addEventListener("change", updateVisibilityToggle);

// Generate New Code button trigger
if (btnGenerateNewCode) {
  btnGenerateNewCode.addEventListener("click", () => {
    generateNewHostRoomCode();
  });
}

// Random Hall Name Generator
if (btnRandomHallName && partyHallNameInput) {
  btnRandomHallName.addEventListener("click", () => {
    const randomPick = RANDOM_HALL_NAMES[Math.floor(Math.random() * RANDOM_HALL_NAMES.length)];
    partyHallNameInput.value = randomPick;
    partyHallNameInput.focus();
    notify(`🎲 Selected hall name: ${randomPick}`);
  });
}

// Copy Invite Link
async function copyHallInviteLink(code) {
  const roomCode = code || partyRoomCodeEl?.textContent?.trim() || activeHall?.roomCode || getHostRoomCode();
  const link = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(roomCode)}`;
  try {
    await navigator.clipboard.writeText(link);
    notify(`🎟️ Cinema Hall invite link copied: ${roomCode}`);
  } catch (_) {
    notify(`🎟️ Hall invite code: ${roomCode}`);
  }
}

if (btnCopyRoom) btnCopyRoom.addEventListener("click", () => copyHallInviteLink());
if (theatreCodePill) theatreCodePill.addEventListener("click", () => copyHallInviteLink(theatreCurrentCode?.textContent));
if (btnTheatreShare) btnTheatreShare.addEventListener("click", () => copyHallInviteLink(theatreCurrentCode?.textContent));

// Launch Grand Theatre Room as Host
if (btnStartParty) {
  btnStartParty.addEventListener("click", () => {
    const isPublic = visPublicRadio ? visPublicRadio.checked : true;
    const roomCode = (!isPublic && partyRoomCodeEl?.textContent?.trim())
      ? partyRoomCodeEl.textContent.trim()
      : getHostRoomCode();
    const hallName = partyHallNameInput?.value?.trim() || `${(currentUser && currentUser.name) ? currentUser.name.split(" ")[0] : "VIP"}'s Grand Cinema`;
    const language = partyLangSelect?.value || "English";
    const capacity = partyCapacitySelect?.value || "Unlimited";

    const initialMovie = (activeHall && activeHall.movieTitle) ? activeHall : {
      movieTitle: "Dune: Part Two",
      tmdbId: "693134",
      type: "movie",
      trailerId: "Way9Dexny3w",
      poster: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg"
    };

    activeHall = {
      roomCode,
      isHost: true,
      hallName,
      language,
      capacity,
      movieTitle: initialMovie.movieTitle || "Dune: Part Two",
      poster: initialMovie.poster || "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      tmdbId: initialMovie.tmdbId,
      type: initialMovie.type || "movie",
      trailerId: initialMovie.trailerId || "",
      isPublic,
      hostName: (currentUser && currentUser.name) ? currentUser.name : "VIP Host",
      hostAvatar: (currentUser && currentUser.avatar) ? currentUser.avatar : "👑",
      createdAt: Date.now(),
      startTime: Date.now(),
      isPlaying: true
    };

    saveActiveHallState();
    publishHostHeartbeat();
    enterTheatreHall(activeHall);
    notify(`🎬 Welcome to ${hallName}! Projector online.`);
  });
}

// Dismiss Hall from Dialog Alert or Banner
function dismissActiveHall() {
  const dismissedCode = activeHall?.roomCode || currentHallSession?.roomCode;
  if (!dismissedCode) return;

  // Broadcast dismissal to room & lobby
  broadcastToRoom({ type: "dismiss", roomCode: dismissedCode, reason: "Host has dismissed and ended the Cinema Hall." });
  broadcastToLobby({ type: "hall_closed", roomCode: dismissedCode });

  try {
    localStorage.removeItem("bioscope_persistent_host_code");
    localStorage.removeItem("bioscope_active_hall");
  } catch (_) {}

  discoveredRooms.delete(dismissedCode);
  activeHall = null;
  currentHostDraftCode = "";
  saveActiveHallState();
  leaveTheatreHall(true);
  notify("🛑 Cinema Hall has been dismissed and ended.");
}

if (btnTheatreDismiss) btnTheatreDismiss.addEventListener("click", dismissActiveHall);
if (btnHostDismissBar) btnHostDismissBar.addEventListener("click", dismissActiveHall);

// Join Hall by Code
function joinTheatreHallByCode(code) {
  const cleanCode = (code || "").trim().toUpperCase();
  if (!cleanCode) {
    notify("⚠️ Please enter a valid Hall Code (e.g. BIOSCOPE-7892)");
    return;
  }

  // If host joins their own room
  if (activeHall && activeHall.roomCode.toUpperCase() === cleanCode) {
    enterTheatreHall(activeHall);
    return;
  }

  // Check if room exists in live discovered rooms
  const liveHall = discoveredRooms.get(cleanCode);

  const guestHall = {
    roomCode: cleanCode,
    isHost: false,
    hallName: liveHall ? liveHall.hallName : `Auditorium · ${cleanCode}`,
    movieTitle: liveHall ? liveHall.movieTitle : "Connecting to Feature...",
    poster: liveHall ? liveHall.poster : "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
    tmdbId: liveHall ? liveHall.tmdbId : "693134",
    type: liveHall ? liveHall.type : "movie",
    trailerId: liveHall ? liveHall.trailerId : "Way9Dexny3w",
    isPublic: liveHall ? liveHall.isPublic : false,
    hostName: liveHall ? liveHall.hostName : "Grand Host",
    hostAvatar: liveHall ? liveHall.hostAvatar : "👑",
    startTime: liveHall ? liveHall.startTime : Date.now(),
    isPlaying: liveHall ? liveHall.isPlaying : true
  };

  enterTheatreHall(guestHall);
  notify(`🍿 Entering Cinema Hall ${cleanCode}... Taking seat!`);
}

if (btnSubmitJoin && joinRoomInput) {
  btnSubmitJoin.addEventListener("click", () => joinTheatreHallByCode(joinRoomInput.value));
  joinRoomInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      joinTheatreHallByCode(joinRoomInput.value);
    }
  });
}

// ==========================================================================
// 6. Virtual Cinema Theatre Hall Viewport Controller
// ==========================================================================
function enterTheatreHall(hallData, startSeconds = 0) {
  if (!theatreRoomView) return;
  currentHallSession = {
    ...hallData,
    startTime: hallData.startTime || Date.now(),
    isPlaying: typeof hallData.isPlaying === "boolean" ? hallData.isPlaying : true
  };

  // Subscribe to room topic over MQTT
  if (mqttClient && mqttClient.isConnected()) {
    mqttClient.subscribe(`bioscopebd/room/${hallData.roomCode}`);
  }

  // Activate theatre viewport
  document.body.classList.add("theatre-mode-active");
  theatreRoomView.hidden = false;

  // Reset chat state to active & visible
  if (theatreCornerChat) theatreCornerChat.classList.remove("is-chat-hidden");
  if (btnTheatreChatToggle) {
    btnTheatreChatToggle.classList.add("is-active");
    btnTheatreChatToggle.innerHTML = "<span>💬 Chat</span>";
  }

  // Cinematic dimming lights transition
  if (theatreCurtain) {
    theatreCurtain.classList.add("is-dimming");
    setTimeout(() => theatreCurtain.classList.remove("is-dimming"), 700);
  }

  // Update Marquee & Badges
  if (theatreHallBadge) theatreHallBadge.textContent = hallData.hallName ? `🎬 ${hallData.hallName.toUpperCase()}` : "🎬 BIOSCOPE GRAND HALL";
  if (theatreMovieTitle) theatreMovieTitle.textContent = hallData.movieTitle || "Feature Film";
  if (theatreCurrentCode) theatreCurrentCode.textContent = hallData.roomCode;

  // Update URL without reloading
  try {
    const newUrl = `${window.location.pathname}?room=${encodeURIComponent(hallData.roomCode)}`;
    window.history.replaceState({ room: hallData.roomCode }, "", newUrl);
  } catch (_) {}

  // Host Controls vs Audience View
  if (hallData.isHost) {
    if (btnTheatreDismiss) btnTheatreDismiss.hidden = false;
    if (theatreHostDeck) theatreHostDeck.hidden = false;
    if (btnTheatrePauseReq) btnTheatrePauseReq.hidden = true;
    if (btnDockPauseReq) btnDockPauseReq.hidden = true;
    if (btnHostPlayPause) btnHostPlayPause.textContent = currentHallSession.isPlaying ? "⏸️ Pause Stream" : "▶️ Resume Stream";
    populateTheatreMovieSwitcher(hallData.movieTitle);
  } else {
    if (btnTheatreDismiss) btnTheatreDismiss.hidden = true;
    if (theatreHostDeck) theatreHostDeck.hidden = true;
    if (btnTheatrePauseReq) btnTheatrePauseReq.hidden = false;
    if (btnDockPauseReq) btnDockPauseReq.hidden = false;
  }

  // Update Player Dock
  if (playerDockTitle) playerDockTitle.textContent = hallData.movieTitle ? `🎬 ${hallData.movieTitle}` : "🎬 LIVE CINEMA STREAM";
  if (btnDockChatToggle) {
    btnDockChatToggle.classList.add("is-active");
    if (playerDockChatLabel) playerDockChatLabel.textContent = "Chat";
  }

  // Initialize Audience Seating (Zero fake companions!)
  initHallAudience(hallData);

  // Load Stream onto Big Cinema Screen with Live TV offset
  loadTheatreScreen(hallData.title || hallData.movieTitle, hallData.tmdbId, hallData.type, hallData.trailerId, startSeconds);

  // Broadcast presence
  broadcastToRoom({
    type: "presence",
    roomCode: hallData.roomCode,
    user: {
      id: currentUser.id || "usr_me",
      name: currentUser.name || "Cinephile Guest",
      avatar: currentUser.avatar || (hallData.isHost ? "👑" : "🍿"),
      isHost: !!hallData.isHost
    }
  });

  // If audience, request live playback timestamp from host
  if (!hallData.isHost) {
    broadcastToRoom({
      type: "request_sync",
      roomCode: hallData.roomCode,
      fromUser: currentUser.name || "Guest"
    });
  }

  // Post Welcome in Lounge Chat
  appendTheatreChatMessage("system", "🎬 Welcome to the Grand Virtual Theatre! Whisper in chat or tap emojis to react live on screen.");
}

function leaveTheatreHall(isKickedOrDismissed = false) {
  if (!theatreRoomView) return;

  const wasHost = Boolean((currentHallSession && currentHallSession.isHost) || (activeHall && activeHall.isHost));
  const roomCode = currentHallSession?.roomCode || activeHall?.roomCode;

  // Check if a designated Co-Host exists among other real members
  const coHost = hallAudience.find(m => m.isCoHost && !m.isHost);

  if (wasHost && !isKickedOrDismissed) {
    if (coHost) {
      // Co-Host exists -> Transfer host authority to co-host
      broadcastToRoom({
        type: "host_transferred",
        roomCode: roomCode,
        newHostId: coHost.id,
        newHostName: coHost.name
      });
      notify(`👑 You left the hall. Host role transferred to Co-Host ${coHost.name}.`);
      activeHall = null;
      saveActiveHallState();
    } else {
      // No Co-Host exists -> Auto-close the room entirely!
      if (roomCode) {
        broadcastToRoom({
          type: "dismiss",
          roomCode: roomCode,
          reason: "The Host has left the auditorium and no co-host was assigned. Room is now closed."
        });
        broadcastToLobby({
          type: "hall_closed",
          roomCode: roomCode
        });
        discoveredRooms.delete(roomCode);
      }
      activeHall = null;
      saveActiveHallState();
      try {
        localStorage.removeItem("bioscope_active_hall");
        localStorage.removeItem("bioscope_persistent_host_code");
      } catch (_) {}
      currentHostDraftCode = "";
      notify("🚪 You left the hall. No co-host was assigned, so the room has automatically closed.");
    }
  } else if (!wasHost && !isKickedOrDismissed) {
    // Normal audience member leaving
    if (roomCode) {
      broadcastToRoom({
        type: "member_left",
        roomCode: roomCode,
        userId: currentUser.id || "guest_me",
        userName: currentUser.name || "Audience Member"
      });
    }
    notify("🚪 You left the Cinema Hall.");
  }

  if (roomCode && mqttClient && mqttClient.isConnected()) {
    try { mqttClient.unsubscribe(`bioscopebd/room/${roomCode}`); } catch (_) {}
  }

  document.body.classList.remove("theatre-mode-active");
  theatreRoomView.hidden = true;
  if (theatrePlayerFrame) theatrePlayerFrame.src = "";
  currentHallSession = null;
  hallAudience = [];

  try {
    window.history.replaceState({}, "", window.location.pathname);
  } catch (_) {}

  renderBoxOfficeHalls();
}

if (btnTheatreLeave) btnTheatreLeave.addEventListener("click", () => leaveTheatreHall(false));

// Immediate emergency dismissal if host tab is closed or navigated away without a co-host
window.addEventListener("pagehide", () => {
  const isHost = Boolean((currentHallSession && currentHallSession.isHost) || (activeHall && activeHall.isHost));
  const hasCoHost = hallAudience.some(m => m.isCoHost && !m.isHost);
  const code = currentHallSession?.roomCode || activeHall?.roomCode;

  if (isHost && !hasCoHost && code) {
    broadcastToLobby({ type: "hall_closed", roomCode: code });
    broadcastToRoom({ type: "dismiss", roomCode: code, reason: "Host has left and no co-host was assigned. Room closed." });
    try {
      localStorage.removeItem("bioscope_active_hall");
      localStorage.removeItem("bioscope_persistent_host_code");
    } catch (_) {}
  }
});

// Load Cinema Screen Video Stream with Live Sync Offset
function loadTheatreScreen(title, tmdbId, type = "movie", trailerId = "", startSeconds = 0) {
  if (!theatrePlayerFrame) return;
  if (theatreProjectorShield) theatreProjectorShield.hidden = false;

  const catalogEntry = (typeof BUILTIN_CATALOG !== "undefined" ? BUILTIN_CATALOG : []).find(
    m => (m.title && m.title.toLowerCase() === (title || "").toLowerCase()) ||
         (m.banglaTitle && title && title.includes(m.banglaTitle)) ||
         (m.tmdbId && m.tmdbId === String(tmdbId))
  );

  const isBangla = Boolean(
    type === "bangla" ||
    catalogEntry?.bangla ||
    /[\u0980-\u09FF]/.test(title || "") ||
    (title && (
      title.includes("Hawa") || title.includes("Priyotoma") || title.includes("Toofan") ||
      title.includes("Aynabaji") || title.includes("Surongo") || title.includes("Shurongo") ||
      title.includes("Poran") || title.includes("Monpura") || title.includes("Pather Panchali")
    ))
  );

  const isYoutube = type === "youtube" || isBangla || !tmdbId;
  let url = "";
  const startParam = startSeconds > 0 ? `&start=${Math.floor(startSeconds)}` : "";

  if (isYoutube) {
    const yId = trailerId || catalogEntry?.trailerId || "K9W52rpdlLQ";
    url = `https://www.youtube-nocookie.com/embed/${yId}?autoplay=1&controls=1&rel=0&modestbranding=1&enablejsapi=1${startParam}&origin=${encodeURIComponent(window.location.origin)}`;
  } else {
    url = (typeof CONFIG !== "undefined" && CONFIG.STREAM_SERVERS) ? CONFIG.STREAM_SERVERS[0].getUrl(tmdbId, type) : `https://vidsrc.me/embed/${tmdbId}`;
  }

  theatrePlayerFrame.src = url;
  theatrePlayerFrame.onload = () => {
    if (theatreProjectorShield) theatreProjectorShield.hidden = true;
    if (startSeconds > 0 && isYoutube) {
      setTimeout(() => {
        sendYouTubeCommand(theatrePlayerFrame, "seekTo", [Math.floor(startSeconds), true]);
      }, 500);
    }
  };
  setTimeout(() => {
    if (theatreProjectorShield) theatreProjectorShield.hidden = true;
  }, 2400);
}

// Host Play/Pause Authority Controller
function toggleHostPlayPause(forcePlay) {
  if (!currentHallSession || !currentHallSession.isHost) return;
  const nextIsPlaying = typeof forcePlay === "boolean" ? forcePlay : !currentHallSession.isPlaying;
  currentHallSession.isPlaying = nextIsPlaying;

  if (btnHostPlayPause) {
    btnHostPlayPause.textContent = nextIsPlaying ? "⏸️ Pause Stream" : "▶️ Resume Stream";
  }

  if (nextIsPlaying) {
    sendYouTubeCommand(theatrePlayerFrame, "playVideo");
    appendTheatreChatMessage("system", "▶️ Host resumed playback for all auditorium seats.");
    notify("▶️ Stream resumed for everyone.");
  } else {
    sendYouTubeCommand(theatrePlayerFrame, "pauseVideo");
    appendTheatreChatMessage("system", "⏸️ Host paused the stream for a break.");
    notify("⏸️ Stream paused for everyone.");
  }

  broadcastToRoom({
    type: "sync_playback",
    roomCode: currentHallSession.roomCode,
    isPlaying: nextIsPlaying,
    timestamp: Date.now()
  });
}

if (btnHostPlayPause) {
  btnHostPlayPause.addEventListener("click", () => toggleHostPlayPause());
}

// Audience Request Pause Break
if (btnTheatrePauseReq) {
  btnTheatrePauseReq.addEventListener("click", () => {
    if (!currentHallSession) return;
    if (currentHallSession.isHost) {
      notify("👑 You are the host! Use host controls at the bottom to pause.");
      return;
    }

    const myName = currentUser.name || "Audience Member";
    broadcastToRoom({
      type: "request_pause",
      roomCode: currentHallSession.roomCode,
      userName: myName,
      userId: currentUser.id || "guest_me"
    });

    appendTheatreChatMessage("system", "✋ You requested a pause break.");
    notify("✋ Pause request sent to the Host!");
  });
}

// Re-Sync Stream with Host (Zero Delay)
function triggerTheatreResync() {
  if (!currentHallSession) return;
  if (currentHallSession.isHost) {
    const elapsed = Math.max(0, Math.floor((Date.now() - (currentHallSession.startTime || Date.now())) / 1000));
    broadcastToRoom({
      type: "sync_movie",
      roomCode: currentHallSession.roomCode,
      movieTitle: currentHallSession.movieTitle,
      tmdbId: currentHallSession.tmdbId,
      type: currentHallSession.type,
      trailerId: currentHallSession.trailerId,
      elapsed: elapsed,
      isPlaying: currentHallSession.isPlaying
    });
    notify("⚡ Forced live timestamp sync to all auditorium seats!");
  } else {
    broadcastToRoom({
      type: "request_sync",
      roomCode: currentHallSession.roomCode,
      fromUser: currentUser.name || "Guest"
    });
    if (currentHallSession.startTime) {
      const elapsed = Math.max(0, Math.floor((Date.now() - currentHallSession.startTime) / 1000));
      sendYouTubeCommand(theatrePlayerFrame, "seekTo", [elapsed, true]);
    }
    notify("⚡ Stream re-synchronized with Host (Zero Delay)!");
  }
}

if (btnTheatreResync) btnTheatreResync.addEventListener("click", triggerTheatreResync);

// Populate Host Movie Switcher Dropdown
function populateTheatreMovieSwitcher(currentTitle) {
  if (!theatreSwitchMovie) return;
  const catalog = (typeof BUILTIN_CATALOG !== "undefined" ? BUILTIN_CATALOG : []);
  theatreSwitchMovie.innerHTML = catalog.slice(0, 24).map(m => `
    <option value="${m.tmdbId}|${m.type || 'movie'}|${m.trailerId || ''}" ${m.title === currentTitle ? 'selected' : ''}>
      ${m.title} (${m.year || '2024'})
    </option>
  `).join("");

  theatreSwitchMovie.onchange = () => {
    const val = theatreSwitchMovie.value.split("|");
    const tmdbId = val[0];
    const type = val[1];
    const trailerId = val[2];
    const newTitle = theatreSwitchMovie.options[theatreSwitchMovie.selectedIndex].text.split("(")[0].trim();

    if (activeHall) {
      activeHall.movieTitle = newTitle;
      activeHall.tmdbId = tmdbId;
      activeHall.type = type;
      activeHall.trailerId = trailerId;
      activeHall.startTime = Date.now();
      activeHall.isPlaying = true;
      saveActiveHallState();
    }

    if (currentHallSession) {
      currentHallSession.movieTitle = newTitle;
      currentHallSession.tmdbId = tmdbId;
      currentHallSession.type = type;
      currentHallSession.trailerId = trailerId;
      currentHallSession.startTime = Date.now();
      currentHallSession.isPlaying = true;
    }

    if (theatreMovieTitle) theatreMovieTitle.textContent = newTitle;
    loadTheatreScreen(newTitle, tmdbId, type, trailerId, 0);

    broadcastToRoom({
      type: "sync_movie",
      roomCode: currentHallSession?.roomCode,
      movieTitle: newTitle,
      tmdbId,
      type,
      trailerId,
      elapsed: 0,
      isPlaying: true
    });

    appendTheatreChatMessage("system", `👑 Host changed feature presentation to: ${newTitle}`);
    notify(`🎬 Cinema Projector tuned to: ${newTitle}`);
  };
}

if (btnHostResync) {
  btnHostResync.addEventListener("click", () => triggerTheatreResync());
}

// ==========================================================================
// 7. Audience VIP Plush Front-Row Seating (Zero Fake Companions!)
// ==========================================================================
function initHallAudience(hall) {
  hallAudience = [];
  
  // Host always gets Seat A1
  const hostUser = {
    id: hall.isHost ? (currentUser.id || "host_me") : "host_primary",
    name: hall.hostName || "VIP Host",
    avatar: hall.hostAvatar || "👑",
    isHost: true,
    seat: "A1"
  };
  hallAudience.push(hostUser);

  // If user is guest, assign Seat A2
  if (!hall.isHost) {
    hallAudience.push({
      id: currentUser.id || "guest_me",
      name: currentUser.name || "Cinephile Guest",
      avatar: currentUser.avatar || "🍿",
      isHost: false,
      seat: "A2"
    });
  }

  // NOTE: Strictly ZERO fake companions! Only real connected users will be rendered!
  renderHallAudienceSeats();
}

function renderHallAudienceSeats() {
  if (!theatreSeatsTrack) return;
  theatreSeatsTrack.innerHTML = hallAudience.map(member => `
    <div class="cinema-seat" id="seat-${member.id}" title="${member.name} (${member.isHost ? 'Host' : (member.isCoHost ? 'Co-Host' : 'Audience')} · Seat ${member.seat})">
      <div class="cinema-seat__chair">
        ${member.isHost ? '<span class="cinema-seat__crown">👑</span>' : (member.isCoHost ? '<span class="cinema-seat__crown" style="filter:drop-shadow(0 0 6px #00d2ff);">⭐</span>' : '')}
        <span class="cinema-seat__avatar">${member.avatar || '🍿'}</span>
      </div>
      <span class="cinema-seat__tag">${member.seat}</span>
      <span class="cinema-seat__name">${member.name.split(" ")[0]}</span>
    </div>
  `).join("");

  const count = hallAudience.length;
  if (theatreRosterCount) theatreRosterCount.textContent = `${count} Watching`;
  if (rosterPopoverCount) rosterPopoverCount.textContent = count;

  renderRosterPopoverList();
}

function renderRosterPopoverList() {
  if (!theatreRosterList) return;
  theatreRosterList.innerHTML = hallAudience.map(m => `
    <li class="roster-user-item" style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.06);">
      <span class="roster-avatar">${m.avatar || '🍿'}</span>
      <span class="roster-name" style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHTML(m.name)}</span>
      ${m.isHost ? '<span class="roster-role-badge">HOST</span>' : (m.isCoHost ? '<span class="roster-role-badge" style="background:#00d2ff;color:#000;">CO-HOST</span>' : '<span style="font-size:0.65rem;color:#888;">Seat ' + m.seat + '</span>')}
      ${(currentHallSession?.isHost && !m.isHost) ? `
        <button type="button" class="btn-toggle-cohost" data-user-id="${m.id}" style="margin-left:auto;font-size:0.68rem;padding:2px 7px;background:${m.isCoHost ? 'rgba(255,71,87,0.2)' : 'rgba(0,210,255,0.15)'};color:${m.isCoHost ? '#ff6b81' : '#00d2ff'};border:1px solid ${m.isCoHost ? 'rgba(255,71,87,0.4)' : 'rgba(0,210,255,0.3)'};border-radius:4px;cursor:pointer;">
          ${m.isCoHost ? 'Demote' : '⭐ Make Co-Host'}
        </button>
      ` : ''}
    </li>
  `).join("");

  theatreRosterList.querySelectorAll(".btn-toggle-cohost").forEach(btn => {
    btn.addEventListener("click", () => {
      const uId = btn.dataset.userId;
      const targetMember = hallAudience.find(x => x.id === uId);
      if (targetMember) {
        targetMember.isCoHost = !targetMember.isCoHost;
        broadcastToRoom({
          type: "cohost_update",
          roomCode: currentHallSession?.roomCode,
          userId: targetMember.id,
          isCoHost: targetMember.isCoHost,
          userName: targetMember.name
        });
        renderHallAudienceSeats();
        notify(targetMember.isCoHost ? `⭐ ${targetMember.name} appointed as Co-Host!` : `Removed Co-Host role from ${targetMember.name}`);
      }
    });
  });
}

// ==========================================================================
// 8. 100% Transparent Hideable In-Player Chat & Emoji Reactions
// ==========================================================================
if (btnMinCornerChat && theatreCornerChat) {
  btnMinCornerChat.addEventListener("click", () => {
    theatreCornerChat.classList.toggle("is-minimized");
    btnMinCornerChat.textContent = theatreCornerChat.classList.contains("is-minimized") ? "▴" : "▾";
  });
}

function toggleTheatreChat(forceShow) {
  if (!theatreCornerChat) return;
  const isCurrentlyHidden = theatreCornerChat.classList.contains("is-chat-hidden");
  const shouldHide = typeof forceShow === "boolean" ? !forceShow : !isCurrentlyHidden;

  theatreCornerChat.classList.toggle("is-chat-hidden", shouldHide);

  // Permanently suppress floating screen popup button so video controls are never blocked
  if (btnShowCornerChat) {
    btnShowCornerChat.hidden = true;
  }

  // Update top marquee action button state
  if (btnTheatreChatToggle) {
    btnTheatreChatToggle.classList.toggle("is-active", !shouldHide);
    btnTheatreChatToggle.innerHTML = shouldHide
      ? `<span>💬 Show Chat</span>`
      : `<span>💬 Chat</span>`;
  }

  // Update integrated player bottom dock button state
  if (btnDockChatToggle) {
    btnDockChatToggle.classList.toggle("is-active", !shouldHide);
    if (playerDockChatLabel) {
      playerDockChatLabel.textContent = shouldHide ? "Show Chat" : "Chat";
    }
  }

  if (shouldHide) {
    notify("👁️ Chat hidden. Tap '💬 Show Chat' in the player dock or press 'C' to restore.");
  } else {
    notify("💬 Cinema Hall Chat restored.");
  }
}

if (btnDockChatToggle) btnDockChatToggle.addEventListener("click", () => toggleTheatreChat());
if (btnDockResync) btnDockResync.addEventListener("click", triggerTheatreResync);
if (btnDockPauseReq) {
  btnDockPauseReq.addEventListener("click", () => {
    if (btnTheatrePauseReq) btnTheatrePauseReq.click();
  });
}
if (btnTheatreChatToggle) btnTheatreChatToggle.addEventListener("click", () => toggleTheatreChat());
if (btnHideCornerChat) btnHideCornerChat.addEventListener("click", () => toggleTheatreChat(false));
if (btnShowCornerChat) btnShowCornerChat.addEventListener("click", () => toggleTheatreChat(true));

window.addEventListener("keydown", (e) => {
  if (!theatreRoomView || theatreRoomView.hidden) return;
  if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
  if (e.key === "c" || e.key === "C") {
    e.preventDefault();
    toggleTheatreChat();
  }
});

if (btnToggleRoster && theatreRosterPopover) {
  btnToggleRoster.addEventListener("click", () => {
    theatreRosterPopover.hidden = !theatreRosterPopover.hidden;
  });
}

function appendTheatreChatMessage(type, text, author = "", avatar = "") {
  if (!theatreChatBody) return;
  const msgEl = document.createElement("div");

  if (type === "system") {
    msgEl.className = "c-msg c-msg--system";
    msgEl.innerHTML = text;
  } else {
    msgEl.className = "c-msg";
    msgEl.innerHTML = `
      <span class="c-msg__avatar">${avatar || '🍿'}</span>
      <span class="c-msg__author">${author}:</span>
      <span class="c-msg__text">${escapeHTML(text)}</span>
    `;
  }

  theatreChatBody.appendChild(msgEl);
  theatreChatBody.scrollTop = theatreChatBody.scrollHeight;
}

function escapeHTML(str) {
  const p = document.createElement("p");
  p.textContent = str;
  return p.innerHTML;
}

if (theatreChatForm && theatreChatInput) {
  theatreChatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = theatreChatInput.value.trim();
    if (!text || !currentHallSession) return;

    const myName = currentUser.name || "Cinephile Guest";
    const myAvatar = currentUser.avatar || (currentHallSession.isHost ? "👑" : "🍿");

    appendTheatreChatMessage("user", text, myName, myAvatar);
    broadcastToRoom({
      type: "chat",
      roomCode: currentHallSession.roomCode,
      author: myName,
      avatar: myAvatar,
      text: text,
      timestamp: Date.now()
    });

    theatreChatInput.value = "";
  });
}

function triggerSeatReaction(emoji, userId) {
  if (theatreFloatingReactions) {
    const floatEl = document.createElement("span");
    floatEl.className = "theatre-floating-emoji";
    floatEl.textContent = emoji;
    floatEl.style.left = `${15 + Math.random() * 70}%`;
    floatEl.style.bottom = "20px";
    theatreFloatingReactions.appendChild(floatEl);
    setTimeout(() => floatEl.remove(), 3200);
  }

  const targetSeat = document.querySelector(`#seat-${userId}`);
  if (targetSeat) {
    const bubble = document.createElement("span");
    bubble.className = "cinema-seat__bubble";
    bubble.textContent = emoji;
    targetSeat.appendChild(bubble);
    setTimeout(() => bubble.remove(), 2400);
  }
}

document.querySelectorAll(".quick-emoji-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const emoji = btn.dataset.emoji || "🍿";
    const myId = currentHallSession?.isHost ? (currentUser.id || "host_me") : (currentUser.id || "guest_me");
    triggerSeatReaction(emoji, myId);

    if (currentHallSession) {
      broadcastToRoom({
        type: "reaction",
        roomCode: currentHallSession.roomCode,
        userId: myId,
        emoji: emoji
      });
    }
  });
});

// ==========================================================================
// 9. Real Live Box Office Halls Directory (Zero Fake Rooms!)
// ==========================================================================
function renderBoxOfficeHalls() {
  const grid = document.querySelector("#box-office-grid");
  if (!grid) return;
  const list = [];

  // Add user's active hall only if actively inside the theatre hall
  if (activeHall && theatreRoomView && !theatreRoomView.hidden) {
    list.push({
      roomCode: activeHall.roomCode,
      hallName: activeHall.hallName || "Your Live Cinema Hall",
      movieTitle: activeHall.movieTitle || "Dune: Part Two",
      poster: activeHall.poster || "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
      hostName: `${(currentUser && currentUser.name) ? currentUser.name : 'You'} (Host)`,
      hostAvatar: (currentUser && currentUser.avatar) ? currentUser.avatar : "👑",
      viewers: hallAudience.length || 1,
      tmdbId: activeHall.tmdbId,
      type: activeHall.type,
      trailerId: activeHall.trailerId,
      isPublic: activeHall.isPublic ?? true,
      isMyHall: true,
      language: activeHall.language || "English",
      capacity: activeHall.capacity || "Unlimited"
    });
  }

  // Add real discovered rooms from other live hosts across the network
  discoveredRooms.forEach(hall => {
    if (!list.some(item => item.roomCode === hall.roomCode)) {
      list.push({ ...hall, isMyHall: false });
    }
  });

  const countEl = document.querySelector("#hub-halls-count");
  if (countEl) countEl.textContent = list.length;

  const filteredList = list.filter(hall => {
    if (currentHallFilter === "public") return hall.isPublic;
    if (currentHallFilter === "private") return !hall.isPublic;
    return true;
  });

  // Zero Fake Rooms: Show Clean Empty State when 0 rooms active
  if (filteredList.length === 0) {
    grid.innerHTML = `
      <div class="box-office-empty" style="grid-column: 1 / -1; padding: 48px 20px; text-align: center; background: rgba(255,255,255,0.02); border: 1px dashed var(--color-line); border-radius: var(--radius-md);">
        <div class="box-office-empty-icon" style="font-size: 2.8rem; margin-bottom: 12px;">🏛️</div>
        <h4 style="font-size: 1.2rem; margin-bottom: 6px;">No Active Cinema Rooms Right Now</h4>
        <p style="color: var(--color-muted); max-width: 480px; margin: 0 auto 18px; font-size: 0.9rem;">
          There are currently no active public or private rooms. Host your own auditorium and invite friends to watch together in real-time!
        </p>
        <button type="button" class="button button--primary button--sm" id="btn-empty-host-now">🍿 Host First Room Now</button>
      </div>
    `;
    grid.querySelector("#btn-empty-host-now")?.addEventListener("click", () => switchLoungeTab("host"));
    return;
  }

  grid.innerHTML = filteredList.map(hall => `
    <div class="box-office-card" id="card-${hall.roomCode}">
      <div class="box-office-card__top">
        <h4 class="box-office-card__hall-name" title="${escapeHTML(hall.hallName)}">${escapeHTML(hall.hallName)}</h4>
        <div style="display:flex;gap:6px;align-items:center;">
          ${hall.language ? `<span style="font-size:0.65rem;background:rgba(255,255,255,0.08);padding:2px 6px;border-radius:4px;color:#ddd;">🗣️ ${escapeHTML(hall.language)}</span>` : ''}
          <span class="hall-tag-badge ${hall.isPublic ? 'hall-tag-badge--public' : 'hall-tag-badge--private'}">
            ${hall.isPublic ? '🌐 Public' : '🔒 Private'}
          </span>
        </div>
      </div>

      <div class="hall-screening-banner">
        <img class="hall-screening-poster" src="${hall.poster || 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg'}" alt="${escapeHTML(hall.movieTitle)}" loading="lazy" onerror="this.src='https://picsum.photos/seed/movie/120/180'">
        <div class="hall-screening-info">
          <div class="hall-live-tag"><span class="pulse-dot"></span> NOW SCREENING</div>
          <h5 class="hall-screening-title" title="${escapeHTML(hall.movieTitle)}">${escapeHTML(hall.movieTitle)}</h5>
          <div class="hall-host-meta">
            <span>${hall.hostAvatar} ${escapeHTML(hall.hostName)}</span>
            <span>·</span>
            <span>👥 ${hall.viewers} Watching</span>
            ${hall.capacity && hall.capacity !== 'Unlimited' ? `<span>· Max ${hall.capacity}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="hall-card-actions">
        ${hall.isPublic ? `
          <button type="button" class="button button--primary button--full btn-enter-public-hall" data-code="${hall.roomCode}">
            🎬 Enter Hall (1-Click)
          </button>
        ` : `
          <div class="hall-private-join-wrap">
            <input type="text" class="input-hall-code" id="input-card-${hall.roomCode}" placeholder="Enter Invite Code" autocomplete="off">
            <button type="button" class="button button--primary btn-join-private-hall" data-code="${hall.roomCode}">
              Enter
            </button>
          </div>
        `}
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".btn-enter-public-hall").forEach(btn => {
    btn.addEventListener("click", () => {
      const code = btn.dataset.code;
      const targetHall = list.find(h => h.roomCode === code);
      if (targetHall) {
        if (targetHall.isMyHall && activeHall) {
          enterTheatreHall(activeHall);
        } else {
          enterTheatreHall(targetHall);
        }
      } else {
        joinTheatreHallByCode(code);
      }
    });
  });

  grid.querySelectorAll(".btn-join-private-hall").forEach(btn => {
    btn.addEventListener("click", () => {
      const code = btn.dataset.code;
      const input = document.querySelector(`#input-card-${code}`);
      const enteredCode = input ? input.value.trim().toUpperCase() : "";
      if (!enteredCode) {
        notify("⚠️ Please enter the Invite Code for this private room.");
        input?.focus();
        return;
      }
      if (enteredCode === code.toUpperCase() || (activeHall && activeHall.roomCode.toUpperCase() === enteredCode)) {
        joinTheatreHallByCode(enteredCode);
      } else {
        notify("❌ Invalid room code. Please ask the host for the correct invite code.");
      }
    });
  });
}

document.querySelectorAll("#hall-filter-pills .hall-pill").forEach(pill => {
  pill.addEventListener("click", () => {
    document.querySelectorAll("#hall-filter-pills .hall-pill").forEach(p => p.classList.remove("is-active"));
    pill.classList.add("is-active");
    currentHallFilter = pill.dataset.filter || "all";
    renderBoxOfficeHalls();
  });
});

// ==========================================================================
// 10. In-Room Real-Time Movie Projector Search (Local Catalog + Global TMDB)
// ==========================================================================
async function searchTmdbPrefix(query) {
  try {
    const apiKey = (typeof CONFIG !== "undefined" && CONFIG.TMDB_API_KEY) ? CONFIG.TMDB_API_KEY : "b3858eeef994f31c260d3d526ad01ee8";
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&query=${encodeURIComponent(query)}&include_adult=false`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || [])
      .filter(i => (i.media_type === "movie" || i.media_type === "tv") && (i.title || i.name))
      .slice(0, 6)
      .map(item => ({
        title: item.title || item.name,
        year: (item.release_date || item.first_air_date || "2024").slice(0, 4),
        tmdb: String(item.id),
        type: item.media_type,
        trailer: "",
        poster: item.poster_path ? `https://image.tmdb.org/t/p/w92${item.poster_path}` : "https://picsum.photos/seed/movie/120/180"
      }));
  } catch (_) {
    return [];
  }
}

function setupTheatreProjectorSearch() {
  if (!theatreProjectorSearch || !theatreProjectorResults) return;

  let searchDebounceTimer = null;

  theatreProjectorSearch.addEventListener("input", () => {
    clearTimeout(searchDebounceTimer);
    const query = theatreProjectorSearch.value.trim().toLowerCase();
    if (!query || query.length < 2) {
      theatreProjectorResults.hidden = true;
      theatreProjectorResults.innerHTML = "";
      return;
    }

    searchDebounceTimer = setTimeout(async () => {
      const catalog = (typeof BUILTIN_CATALOG !== "undefined" ? BUILTIN_CATALOG : []);
      const catalogMatches = catalog.filter(m =>
        (m.title && m.title.toLowerCase().includes(query)) ||
        (m.genre && m.genre.toLowerCase().includes(query))
      ).slice(0, 8);

      let allResults = [...catalogMatches];

      if (query.length >= 3) {
        try {
          const tmdbList = await searchTmdbPrefix(query);
          tmdbList.forEach(item => {
            if (!allResults.some(r => (r.tmdbId && r.tmdbId === item.tmdb) || (r.title && r.title.toLowerCase() === item.title.toLowerCase()))) {
              allResults.push({
                title: item.title,
                year: item.year,
                tmdbId: item.tmdb,
                type: item.type || "movie",
                trailerId: item.trailer || "",
                poster: item.poster,
                isTmdb: true
              });
            }
          });
        } catch (_) {}
      }

      if (allResults.length === 0) {
        theatreProjectorResults.hidden = false;
        theatreProjectorResults.innerHTML = `<div style="padding:10px;font-size:0.75rem;color:var(--color-muted);text-align:center;">No movies found for "${escapeHTML(query)}". Try another title!</div>`;
        return;
      }

      theatreProjectorResults.hidden = false;
      theatreProjectorResults.innerHTML = allResults.slice(0, 10).map(m => `
        <div class="theatre-search-item" data-tmdb="${m.tmdbId || ''}" data-type="${m.type || 'movie'}" data-trailer="${m.trailerId || ''}" data-title="${escapeHTML(m.title)}" data-poster="${m.poster}">
          <img src="${m.poster}" alt="${escapeHTML(m.title)}" onerror="this.src='https://picsum.photos/seed/movie/120/180'">
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:0.8rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHTML(m.title)} (${m.year || '2024'})</div>
            <div style="font-size:0.68rem;color:var(--color-muted);">${m.isTmdb ? '🌐 TMDB Global' : '🎞️ Bioscope Catalog'}</div>
          </div>
          <span style="font-size:0.68rem;background:rgba(245,197,24,0.2);color:#ffe071;padding:3px 8px;border-radius:4px;font-weight:700;">📽️ Project</span>
        </div>
      `).join("");

      theatreProjectorResults.querySelectorAll(".theatre-search-item").forEach(item => {
        item.addEventListener("click", () => {
          const tmdbId = item.dataset.tmdb;
          const type = item.dataset.type;
          const trailerId = item.dataset.trailer;
          const newTitle = item.dataset.title;
          const newPoster = item.dataset.poster;

          theatreProjectorResults.hidden = true;
          theatreProjectorSearch.value = "";

          if (activeHall) {
            activeHall.movieTitle = newTitle;
            activeHall.poster = newPoster;
            activeHall.tmdbId = tmdbId;
            activeHall.type = type;
            activeHall.trailerId = trailerId;
            activeHall.startTime = Date.now();
            activeHall.isPlaying = true;
            saveActiveHallState();
            publishHostHeartbeat();
          }

          if (currentHallSession) {
            currentHallSession.movieTitle = newTitle;
            currentHallSession.poster = newPoster;
            currentHallSession.tmdbId = tmdbId;
            currentHallSession.type = type;
            currentHallSession.trailerId = trailerId;
            currentHallSession.startTime = Date.now();
            currentHallSession.isPlaying = true;
          }

          if (theatreMovieTitle) theatreMovieTitle.textContent = newTitle;
          loadTheatreScreen(newTitle, tmdbId, type, trailerId, 0);

          broadcastToRoom({
            type: "sync_movie",
            roomCode: currentHallSession?.roomCode,
            movieTitle: newTitle,
            tmdbId,
            type,
            trailerId,
            elapsed: 0,
            isPlaying: true
          });

          appendTheatreChatMessage("system", `👑 Host projected a new feature: ${newTitle}`);
          notify(`🎬 Cinema Projector tuned to: ${newTitle}`);
        });
      });
    }, 250);
  });

  document.addEventListener("click", (e) => {
    if (!theatreProjectorSearch.contains(e.target) && !theatreProjectorResults.contains(e.target)) {
      theatreProjectorResults.hidden = true;
    }
  });
}

setupTheatreProjectorSearch();

// ==========================================================================
// 11. Digital Movie Ticket Invite Generator (HTML5 Canvas)
// ==========================================================================
const ticketDialog = document.querySelector("#ticket-dialog");
const ticketCloseBtn = document.querySelector("#ticket-close-btn");
const ticketCanvas = document.querySelector("#ticket-canvas");
const btnDownloadTicket = document.querySelector("#btn-download-ticket");
const btnShareTicket = document.querySelector("#btn-share-ticket");

function drawMovieTicketCanvas() {
  if (!ticketCanvas) return;
  const ctx = ticketCanvas.getContext("2d");
  const w = ticketCanvas.width;
  const h = ticketCanvas.height;

  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, "#15151c");
  grad.addColorStop(1, "#0a0a0e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(245, 197, 24, 0.4)";
  ctx.lineWidth = 2;
  ctx.strokeRect(10, 10, w - 20, h - 20);

  ctx.beginPath();
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.moveTo(420, 10);
  ctx.lineTo(420, h - 10);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = "#f5c518";
  ctx.font = "bold 14px 'Inter', sans-serif";
  ctx.fillText("🍿 BIOSCOPEBD CINEMA TICKET", 30, 40);

  const movieText = activeHall?.movieTitle || currentHallSession?.movieTitle || "Dune: Part Two (2024)";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px 'Inter', sans-serif";
  ctx.fillText(movieText.slice(0, 26), 30, 80);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "13px 'Inter', sans-serif";
  ctx.fillText("HOST: " + (currentUser.name || "VIP Host"), 30, 120);
  ctx.fillText("STATUS: Real-Time Synced Cinema Room", 30, 145);
  ctx.fillText("STREAM: 1080p Full HD · Zero Lag Multi-View", 30, 170);
  ctx.fillText("ROOM CODE: " + (partyRoomCodeEl?.textContent || getPersistentHostRoomCode()), 30, 195);

  ctx.fillStyle = "rgba(245, 197, 24, 0.8)";
  ctx.font = "11px 'Inter', sans-serif";
  ctx.fillText("Zero Ads · Zero Plugins · bioscopebd.com/room", 30, 265);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px 'Inter', sans-serif";
  ctx.fillText("ADMIT ONE", 440, 50);

  ctx.fillStyle = "#f5c518";
  ctx.font = "bold 18px 'Inter', sans-serif";
  ctx.fillText(partyRoomCodeEl?.textContent || getPersistentHostRoomCode(), 440, 90);

  ctx.fillStyle = "rgba(255,255,255,0.8)";
  for (let i = 0; i < 28; i++) {
    const barW = (i % 3 === 0) ? 4 : 2;
    ctx.fillRect(440 + i * 5, 120, barW, 40);
  }
}

if (btnGenerateTicket && ticketDialog) {
  btnGenerateTicket.addEventListener("click", () => {
    drawMovieTicketCanvas();
    ticketDialog.showModal();
  });
}
if (ticketCloseBtn && ticketDialog) {
  ticketCloseBtn.addEventListener("click", () => ticketDialog.close());
}
if (btnDownloadTicket && ticketCanvas) {
  btnDownloadTicket.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `bioscope-ticket-${getPersistentHostRoomCode()}.png`;
    link.href = ticketCanvas.toDataURL("image/png");
    link.click();
    notify("🎟️ Digital Cinema Ticket downloaded!");
  });
}
if (btnShareTicket) {
  btnShareTicket.addEventListener("click", () => copyHallInviteLink());
}

// ==========================================================================
// 12. Startup Initialization & URL Routing
// ==========================================================================
loadActiveHallState();
renderBoxOfficeHalls();
initGlobalMqttRelay();

window.addEventListener("DOMContentLoaded", () => {
  loadActiveHallState();
  if (!activeHall) {
    currentHostDraftCode = getRandomRoomCode();
    if (partyRoomCodeEl) partyRoomCodeEl.textContent = currentHostDraftCode;
  }
  renderBoxOfficeHalls();

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const roomParam = urlParams.get("room") || urlParams.get("code") || urlParams.get("join");
    const tabParam = urlParams.get("tab");
    if (tabParam && (tabParam === "host" || tabParam === "join" || tabParam === "halls")) {
      switchLoungeTab(tabParam);
    }
    if (roomParam) {
      if (activeHall && activeHall.roomCode.toUpperCase() === roomParam.toUpperCase()) {
        enterTheatreHall(activeHall);
      } else {
        joinTheatreHallByCode(roomParam);
      }
    }
  } catch (_) {}
});
