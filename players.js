{
  "branch": "main",
  "files": [
    {
      "path": "index.html",
      "content":"<!DOCTYPE html>
<html lang=\"es\" class=\"dark\">
<head>
  <meta charset=\"UTF-8\" />
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>
  <title>DashList - GD List</title>
  <script src=\"https://cdn.tailwindcss.com\"></script>
  <link rel=\"stylesheet\" href=\"style.css\">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            darkBg: '#0b0b0e',
            darkCard: '#13131a',
          }
        }
      }
    }
  </script>
</head>
<body class=\"bg-darkBg text-zinc-100 min-h-screen relative font-sans antialiased overflow-x-hidden\">

  <div id=\"borderLeft\" class=\"border-side\"></div>
  <div id=\"borderRight\" class=\"border-side\"></div>

  <div id=\"menuOverlay\" class=\"fixed inset-0 bg-black/60 backdrop-blur-sm z-30 hidden transition-opacity duration-300\"></div>

  <header class=\"fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl z-40 glass-nav rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl\">
    <div class=\"flex items-center gap-3\">
      <img id=\"mainLogo\" src=\"\" alt=\"DashList Logo\" class=\"h-7 w-auto object-contain transition-all\">
    </div>

    <div class=\"flex items-center gap-2 sm:gap-3\">
      <button id=\"themeToggleBtn\" aria-label=\"Cambiar Tema\" class=\"p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition\">
        <svg id=\"sunIcon\" class=\"w-5 h-5 hidden\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M12 3v1m0 16v1m9-9h-[...]\"/></svg>
        <svg id=\"moonIcon\" class=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M20.354 15.354A9 9 0 018.6[...]
      </button>

      <button id=\"openSubmitModalBtn\" class=\"bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5\">
        <span class=\"text-base\">+</span>
        <span class=\"hidden sm:inline\">Enviar Récord</span>
      </button>

      <button id=\"menuToggleBtn\" aria-label=\"Abrir Menú\" class=\"p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition\">
        <svg class=\"w-6 h-6\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"2\" d=\"M4 6h16M4 12h16M4 18h16\"/></svg>
      </button>
    </div>
  </header>

  <aside id=\"sideMenu\" class=\"fixed top-0 right-0 h-full w-80 max-w-[85vw] glass-nav border-l border-white/10 z-50 transform translate-x-full transition-transform duration-300 ease-in-out p-6 flex flex-col justify-between\">
    <div>
      <div class=\"flex items-center justify-between pb-4 mb-6 border-b border-white/10\">
        <h2 class=\"font-bold text-lg text-white\">Menú</h2>
        <button id=\"closeMenuBtn\" class=\"flex items-center gap-2 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 font-semibold px-3 py-1.5 rounded-lg border border-red-500/20 transition\">
          ✕ Volver a la lista
        </button>
      </div>

      <div id=\"userProfile\" class=\"mb-6 p-4 rounded-xl bg-white/5 border border-white/10\">
        <button id=\"discordLoginBtn\" class=\"w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition text-sm\">
          <svg class=\"w-5 h-5 fill-current\" viewBox=\"0 0 24 24\"><path d=\"M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 1[...]
          Iniciar Sesión
        </button>

        <div id=\"userInfo\" class=\"hidden flex items-center gap-3\">
          <img id=\"userAvatar\" src=\"\" class=\"w-10 h-10 rounded-full border border-indigo-500 object-cover\" />
          <div class=\"overflow-hidden\">
            <p id=\"userName\" class=\"font-bold text-sm text-white truncate\"></p>
            <p id=\"userId\" class=\"text-xs text-zinc-400 font-mono\"></p>
          </div>
        </div>
      </div>

      <nav class=\"space-y-2\">
        <button id=\"navSubmitRecordBtn\" class=\"w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition flex items-center justify-between\">
          <span>Enviar Récord</span>
          <span class=\"text-zinc-500\">→</span>
        </button>
        <button id=\"navAddLevelBtn\" class=\"w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-sm font-medium transition flex items-center justify-between\">
          <span>Añadir Nivel / Solicitud</span>
          <span class=\"text-zinc-500\">→</span>
        </button>
      </nav>
    </div>

    <div class=\"pt-4 border-t border-white/10 flex items-center justify-around text-xs text-zinc-400 mt-6\">
      <a href=\"https://discord.gg/efZqW2rhn5\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"hover:text-indigo-400 transition font-bold\">Discord</a>
      <a href=\"https://www.tiktok.com/@dash_list?is_from_webapp=1&sender_device=pc\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"hover:text-pink-400 transition font-bold\">TikTok</a>
    </div>
  </aside>

  <main class=\"pt-24 pb-16 px-4 max-w-4xl mx-auto z-20 relative\">
    <div class=\"flex items-center justify-center mb-8\">
      <div class=\"glass-nav p-1 rounded-2xl flex gap-1 border border-white/10\">
        <button id=\"btnTabLista\" class=\"px-6 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-lg transition\">Lista</button>
        <button id=\"btnTabLeaderboard\" class=\"px-6 py-2.5 rounded-xl font-bold text-sm text-zinc-400 hover:text-white transition\">Leaderboard</button>
      </div>
    </div>

    <div id=\"levelsContainer\" class=\"space-y-3\">
    </div>
  </main>

  <div id=\"submitModal\" class=\"fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4\">
    <div class=\"glass-nav max-w-md w-full p-6 rounded-2xl border border-white/10 shadow-2xl relative\">
      <button id=\"closeSubmitModalBtn\" class=\"absolute top-4 right-4 text-zinc-400 hover:text-white text-xl\">✕</button>
      <h2 class=\"text-xl font-bold text-center mb-4 text-white\">Enviar Récord</h2>
      
      <form id=\"recordForm\" class=\"space-y-3\">
        <div>
          <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">ELEGIR NIVEL</label>
          <select id=\"recordLevel\" required class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
          </select>
        </div>

        <div>
          <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">NOMBRE DEL JUGADOR</label>
          <input type=\"text\" id=\"recordPlayer\" placeholder=\"Nombre en GD\" required class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
        </div>

        <div>
          <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">PROGRESO (%)</label>
          <input type=\"number\" id=\"recordProgress\" min=\"1\" max=\"100\" placeholder=\"ej: 100%\" required class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
        </div>

        <div>
          <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">VIDEO PRUEBA (YouTube / Twitch)</label>
          <input type=\"url\" id=\"recordVideo\" placeholder=\"https://www.youtube.com/watch?v=...\" required class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
        </div>

        <div>
          <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">NACIONALIDAD (Opcional)</label>
          <input type=\"text\" id=\"recordCountry\" placeholder=\"Ej: MX, CL, AR, ES\" class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
        </div>

        <button type=\"submit\" class=\"w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30\">
          Enviar Récord
        </button>
      </form>
    </div>
  </div>

  <div id=\"addLevelModal\" class=\"fixed inset-0 bg-black/80 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4\">
    <div class=\"glass-nav max-w-lg w-full p-6 rounded-2xl border border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto\">
      <button id=\"closeAddLevelModalBtn\" class=\"absolute top-4 right-4 text-zinc-400 hover:text-white text-xl\">✕</button>
      <h2 class=\"text-xl font-bold text-center mb-4 text-white\">Solicitar / Añadir Nivel</h2>
      
      <form id=\"addLevelForm\" class=\"space-y-3 text-left\">
        <div>
          <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">NOMBRE DEL NIVEL</label>
          <input type=\"text\" id=\"lvlName\" required placeholder=\"Ej: Bloodlust\" class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
        </div>

        <div class=\"grid grid-cols-2 gap-2\">
          <div>
            <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">ID CREADOR (Discord/GD)</label>
            <input type=\"text\" id=\"lvlCreatorId\" required placeholder=\"ID Creador\" class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
          </div>
          <div>
            <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">ID VERIFICADOR</label>
            <input type=\"text\" id=\"lvlVerifierId\" required placeholder=\"ID Verificador\" class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
          </div>
        </div>

        <div class=\"grid grid-cols-2 gap-2\">
          <div>
            <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">DIFICULTAD</label>
            <select id=\"lvlDifficulty\" required class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
              <option value=\"easy\">Easy</option>
              <option value=\"normal\">Normal</option>
              <option value=\"hard\">Hard</option>
              <option value=\"harder\">Harder</option>
              <option value=\"insane\">Insane</option>
              <option value=\"demon\">Demon</option>
              <option value=\"extreme_demon\">Extreme Demon</option>
            </select>
          </div>
          <div>
            <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">ID DEL NIVEL (GD)</label>
            <input type=\"text\" id=\"lvlGdId\" required placeholder=\"Ej: 12345678\" class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
          </div>
        </div>

        <div>
          <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">VIDEO SHOWCASE (YouTube)</label>
          <input type=\"url\" id=\"lvlShowcase\" required placeholder=\"https://...\" class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
        </div>

        <div>
          <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">VIDEO VERIFICACIÓN</label>
          <input type=\"url\" id=\"lvlVerification\" required placeholder=\"https://...\" class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
        </div>

        <div>
          <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">PORTADA (Link Imgur)</label>
          <input type=\"url\" id=\"lvlImgur\" required placeholder=\"https://i.imgur.com/...\" class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
        </div>

        <div class=\"grid grid-cols-3 gap-2\">
          <div>
            <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">DURACIÓN</label>
            <input type=\"text\" id=\"lvlDuration\" placeholder=\"ej: 1m 45s\" required class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
          </div>
          <div>
            <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">OBJETOS</label>
            <input type=\"number\" id=\"lvlObjects\" placeholder=\"40000\" required class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
          </div>
          <div>
            <label class=\"block text-xs font-semibold text-zinc-400 mb-1\">SONIDO/CANCIÓN</label>
            <input type=\"text\" id=\"lvlSong\" placeholder=\"ID o Nombre\" required class=\"w-full bg-zinc-900/90 border border-zinc-700 rounded-lg p-2.5 text-white text-sm focus:border-indigo-500 focus:outline-none\">
          </div>
        </div>

        <button type=\"submit\" class=\"w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 mt-2\">
          Enviar Nivel a Revisión
        </button>
      </form>
    </div>
  </div>

  <script src=\"icons.js\"></script>
  <script src=\"players.js\"></script>
  <script type=\"module\" src=\"app.js\"></script>
</body>
</html>
"}
  ]
}
