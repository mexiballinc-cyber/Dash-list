// icons.js - Mapeo de packs de imágenes por temporada/evento
const SEASON_PACKS = {
  normal: {
    logoDark: "https://i.imgur.com/1YzWijH.png",
    logoLight: "https://i.imgur.com/EMeHUb5.png",
    borders: "https://i.imgur.com/NiTv1aA.png",
    easy: "https://i.imgur.com/aehGnWn.png",
    normal: "https://i.imgur.com/WNix2GD.png",
    hard: "https://i.imgur.com/xeZqpcb.png",
    harder: "https://i.imgur.com/qNZACnJ.png",
    insane: "https://i.imgur.com/HrfwtGN.png",
    demon: "https://i.imgur.com/P0RuPWT.png",
    extreme_demon: "https://i.imgur.com/XnNF3NA.png"
  },
  otono: {
    logoDark: "https://i.imgur.com/ISvQYCo.png",
    logoLight: "https://i.imgur.com/qF6y99N.png",
    borders: "https://i.imgur.com/801ofZk.png",
    easy: "https://i.imgur.com/27ORuWJ.png",
    normal: "https://i.imgur.com/lTAYMFO.png",
    hard: "https://i.imgur.com/X0CMj45.png",
    harder: "https://i.imgur.com/1axVNxV.png",
    insane: "https://i.imgur.com/pzgNBTh.png",
    demon: "https://i.imgur.com/UI0mNff.png",
    extreme_demon: "https://i.imgur.com/7jnRORb.png"
  },
  invierno: {
    logoDark: "https://i.imgur.com/Y7wlzY4.png",
    logoLight: "https://i.imgur.com/88zJFWm.png",
    borders: "https://i.imgur.com/tdfBYLY.png",
    easy: "https://i.imgur.com/AhT9g7J.png",
    normal: "https://i.imgur.com/A2PPbjg.png",
    hard: "https://i.imgur.com/RYrY9dD.png",
    harder: "https://i.imgur.com/6VjkAQi.png",
    insane: "https://i.imgur.com/CaHXmPx.png",
    demon: "https://i.imgur.com/S1DOBiy.png",
    extreme_demon: "https://i.imgur.com/ufwChE3.png"
  },
  mexico: {
    logoDark: "https://i.imgur.com/ZH5zAci.png",
    logoLight: "https://i.imgur.com/qZQvPoz.png",
    borders: "https://i.imgur.com/X7RkFcP.png",
    easy: "https://i.imgur.com/I25Iu3B.png",
    normal: "https://i.imgur.com/FE9x01P.png",
    hard: "https://i.imgur.com/Q9Ywqxm.png",
    harder: "https://i.imgur.com/5AZmmb4.png",
    insane: "https://i.imgur.com/GSrgPBB.png",
    demon: "https://i.imgur.com/FKd8Byv.png",
    extreme_demon: "https://i.imgur.com/dBiJsRj.png"
  }
};

let currentSeason = 'normal';

function getActivePack() {
  return SEASON_PACKS[currentSeason] || SEASON_PACKS.normal;
}

function setSeason(packName) {
  if (SEASON_PACKS[packName]) {
    currentSeason = packName;
    updateUIImages();
  }
}
