// ============================================================
// 🌳 GROWATREE.IO — FOCUS FOREST
// Complete game engine
// ============================================================

// ============================================================
// GAME STATE
// ============================================================

let wood = 0;
let Iron = 0;
let rock = 0;
let gold = 0;
let crystal = 0;

let totalFocusSeconds = 0;
let focusSeconds = 0;
let growing = false;
let lostFocus = false;

let growthMultiplier = 1;

// ⭐ REBIRTH SYSTEM
let rebirths = 0;
let naturePoints = 0;

// How many total focus minutes are required
// for the next rebirth.
let rebirthRequirement = 100;

let secondsInterval = null;
let focusLostHideTimeout = null;

let forest = [];

let currentTreeStage = 0;


// ============================================================
// DOM ELEMENTS
// ============================================================

const timerEl = document.getElementById("timer");
const treeEl = document.getElementById("tree");

// ⭐ REBIRTH UI
const rebirthCountEl = document.getElementById("rebirthCount");
const naturePointsEl = document.getElementById("naturePoints");
const rebirthRequirementEl = document.getElementById("rebirthRequirement");
const rebirthBtn = document.getElementById("rebirthBtn");

const woodEl = document.getElementById("wood");
const IronEl = document.getElementById("Iron");
const rockEl = document.getElementById("rock");
const goldEl = document.getElementById("gold");
const crystalEl = document.getElementById("crystal");

const forestEl = document.getElementById("forest");

const growthEl = document.getElementById("growth");

const focusSecondsEl = document.getElementById("focusSecondsValue");

const IronCountdownEl = document.getElementById("IronCountdownValue");
const rockCountdownEl = document.getElementById("RockCountdownValue");
const goldCountdownEl = document.getElementById("GoldCountdownValue");
const crystalCountdownEl = document.getElementById("CrystalCountdownValue");

const growthBar = document.getElementById("growthBar");
const treeName = document.getElementById("treeName");
const treeCount = document.getElementById("treeCount");
const focusLostBanner = document.getElementById("focusLostBanner");


// ============================================================
// TREE STAGES
// ============================================================

const stages = [
    { emoji: "🌱", name: "Tiny Seedling", required: 0 },
    { emoji: "🌿", name: "Sprouting Sapling", required: 2 },
    { emoji: "🌾", name: "Young Shoot", required: 5 },
    { emoji: "🌳", name: "Growing Tree", required: 10 },
    { emoji: "🌲", name: "Mighty Tree", required: 20 },
    { emoji: "🌴", name: "Forest Guardian", required: 35 },
    { emoji: "🪵", name: "Towering Oak", required: 50 },
    { emoji: "🌰", name: "Ancient Grove", required: 70 },
    { emoji: "💠", name: "Crystal Grove", required: 95 },
    { emoji: "🎄", name: "Mystic Tree", required: 125 },
    { emoji: "🎋", name: "Spirit Tree", required: 160 },
    { emoji: "✨", name: "Eternal Forest", required: 210 }
];


// ============================================================
// TREE SPECIES
// ============================================================

const species = [
    { name: "Seed", emoji: "🌰", minimumMinutes: 1 },
    { name: "Seedling", emoji: "🌱", minimumMinutes: 2 },
    { name: "Birch", emoji: "🌳", minimumMinutes: 5 },
    { name: "Oak", emoji: "🌲", minimumMinutes: 10 },
    { name: "Maple", emoji: "🍁", minimumMinutes: 18 },
    { name: "Redwood", emoji: "🌴", minimumMinutes: 30 },
    { name: "Cedar", emoji: "🌿", minimumMinutes: 45 },
    { name: "Crystal Tree", emoji: "💠", minimumMinutes: 65 },
    { name: "Mystic Tree", emoji: "🎄", minimumMinutes: 90 },
    { name: "Spirit Tree", emoji: "🎋", minimumMinutes: 120 },
    { name: "Eternal Grove", emoji: "✨", minimumMinutes: 180 },
    { name: "Heavenly Tree", emoji: "🪽", minimumMinutes: 200 },
    { name: "Giant Sequoia", emoji: "🌲", minimumMinutes: 250 }
];


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    loadGame();
    updateUI();
    updateForest();
    updateBiome();
    console.log("🌳 Focus Forest loaded!");
});


// ============================================================
// START FOCUS
// ============================================================

function startFocus() {
    if (growing) return;

    growing = true;
    lostFocus = false;
    updateFocusLostBanner();

    focusSeconds = 0;
    currentTreeStage = 0;
    treeEl.textContent = stages[0].emoji;

    showNotification("🌱 Focus session started!");
    updateUI();

    secondsInterval = setInterval(focusTick, 1000);
}


// ============================================================
// STOP FOCUS
// ============================================================

function stopFocus() {
    if (!growing) return;

    growing = false;

    if (secondsInterval !== null) {
        clearInterval(secondsInterval);
        secondsInterval = null;
    }

    const minutes = Math.floor(focusSeconds / 60);
    if (minutes > 0) {
        finishTree();
    }

    showNotification("🛑 Focus session ended.");
    saveGame();
    updateUI();
}


// ============================================================
// MAIN TIMER TICK
// ============================================================

function focusTick() {
    if (!growing) return;

    focusSeconds++;
    totalFocusSeconds++;

    // WOOD — every 20 seconds
    if (focusSeconds % 20 === 0) {
        const woodEarned = Math.max(1, Math.round(growthMultiplier));
        wood += woodEarned;
        showNotification(`🪵 +${woodEarned} Wood`);
    }

    // IRON — every 120 seconds
    if (focusSeconds % 120 === 0) {
        Iron++;
        showIronNotification();
    }

    // ROCK — every 30 seconds
    if (focusSeconds % 30 === 0) {
        rock++;
        showNotification("🪨 +1 Rock");
    }

    // GOLD — every 60 seconds
    if (focusSeconds % 60 === 0) {
        gold++;
        showNotification("⚱️ +1 Gold");
    }

    // CRYSTAL — every 180 seconds
    if (focusSeconds % 180 === 0) {
        crystal++;
        showNotification("💎 +1 Crystal");
    }

    updateTree();
    updateUI();
    saveGame();
}


// ============================================================
// TREE GROWTH
// ============================================================

function updateTree() {
    let newStage = 0;

    for (let i = 0; i < stages.length; i++) {
        if (focusSeconds >= stages[i].required * 60) {
            newStage = i;
        }
    }

    if (newStage !== currentTreeStage) {
        currentTreeStage = newStage;
        treeEl.textContent = stages[newStage].emoji;
        treeName.textContent = stages[newStage].name;
        animateTree();
        showNotification(`🌳 Your tree grew into a ${stages[newStage].name}!`);
    }
}


// ============================================================
// TREE ANIMATION
// ============================================================

function animateTree() {
    treeEl.style.transform = "scale(1.4)";
    setTimeout(() => {
        treeEl.style.transform = "scale(1)";
    }, 500);
}


// ============================================================
// FINISH TREE
// ============================================================

function finishTree() {
    if (focusSeconds < 60) return;

    const minutes = Math.floor(focusSeconds / 60);
    const treeSpecies = getTreeSpecies(minutes);

    forest.push({
        emoji: treeSpecies.emoji,
        name: treeSpecies.name,
        minutes: minutes,
        date: new Date().toISOString()
    });

    wood += 3;
    showNotification(`🌲 ${treeSpecies.name} added to your forest! +3 Wood`);

    updateForest();
    updateBiome();
}


// ============================================================
// TREE SPECIES SELECTION
// ============================================================

function getTreeSpecies(minutes) {
    let result = species[0];
    for (const tree of species) {
        if (minutes >= tree.minimumMinutes) {
            result = tree;
        }
    }
    return result;
}


// ============================================================
// RESOURCE COUNTDOWNS
// ============================================================

function getSecondsUntilIron() {
    return 120 - (focusSeconds % 120);
}

function getSecondsUntilRock() {
    return 30 - (focusSeconds % 30);
}

function getSecondsUntilGold() {
    return 60 - (focusSeconds % 60);
}

function getSecondsUntilCrystal() {
    return 180 - (focusSeconds % 180);
}

function showIronNotification() {
    showNotification("⛓️ +1 Iron!");
}


// ============================================================
// UI UPDATE
// ============================================================

function updateUI() {
    const minutes = Math.floor(focusSeconds / 60);
    const seconds = focusSeconds % 60;

    // Timer
    timerEl.textContent = `Timer: ${minutes} min ${seconds}s`;

    // Focus seconds
    focusSecondsEl.textContent = totalFocusSeconds;

    // Resources
    woodEl.textContent = Math.floor(wood);
    IronEl.textContent = Math.floor(Iron);
    rockEl.textContent = Math.floor(rock);
    goldEl.textContent = Math.floor(gold);
    crystalEl.textContent = Math.floor(crystal);

    // Growth
    growthEl.textContent = growthMultiplier.toFixed(1) + "x";

    // Countdowns
    IronCountdownEl.textContent = growing ? getSecondsUntilIron() : "120";
    rockCountdownEl.textContent = growing ? getSecondsUntilRock() : "30";
    goldCountdownEl.textContent = growing ? getSecondsUntilGold() : "60";
    crystalCountdownEl.textContent = growing ? getSecondsUntilCrystal() : "180";

    // Tree count
    treeCount.textContent = forest.length;

    // ⭐ REBIRTH INFORMATION
    if (rebirthCountEl) rebirthCountEl.textContent = rebirths;
    if (naturePointsEl) naturePointsEl.textContent = naturePoints;
    if (rebirthRequirementEl) rebirthRequirementEl.textContent = rebirthRequirement;

    // Enable rebirth when enough focus time has been completed.
    if (rebirthBtn) {
        rebirthBtn.disabled = totalFocusSeconds < rebirthRequirement * 60;
    }

    updateGrowthBar();
}


// ============================================================
// GROWTH BAR
// ============================================================

function updateGrowthBar() {
    const previousStage = stages[currentTreeStage];
    const nextStage = stages[Math.min(currentTreeStage + 1, stages.length - 1)];

    if (currentTreeStage >= stages.length - 1) {
        growthBar.style.width = "100%";
        return;
    }

    const start = previousStage.required * 60;
    const end = nextStage.required * 60;
    const progress = ((focusSeconds - start) / (end - start)) * 100;
    const percentage = Math.max(0, Math.min(100, progress));

    growthBar.style.width = percentage + "%";
}


// ============================================================
// FOREST DISPLAY
// ============================================================

function updateForest() {
    forestEl.innerHTML = "";

    if (forest.length === 0) {
        const empty = document.createElement("p");
        empty.id = "emptyForest";
        empty.textContent = "Your forest is empty. Start focusing to grow your first tree!";
        forestEl.appendChild(empty);
        return;
    }

    forest.forEach(tree => {
        const treeElement = document.createElement("div");
        treeElement.className = "tree-icon";
        treeElement.textContent = tree.emoji;
        treeElement.title = `${tree.name} — ${tree.minutes} minute focus`;
        forestEl.appendChild(treeElement);
    });
}


// ============================================================
// BIOME SYSTEM
// ============================================================

function updateBiome() {
    const count = forest.length;

    if (count >= 50) {
        document.body.style.background = "linear-gradient(#b3e5fc, #4fc3f7)";
    } else if (count >= 25) {
        document.body.style.background = "linear-gradient(#fff8e1, #ffe082)";
    } else if (count >= 10) {
        document.body.style.background = "linear-gradient(#e8f5e9, #a5d6a7)";
    } else {
        document.body.style.background = "linear-gradient(#e8f5e9, #c8e6c9)";
    }
}


// ============================================================
// GROWTH UPGRADE
// ============================================================

function buyGrowthUpgrade() {
    const cost = 25;

    if (wood < cost) {
        showNotification("❌ You need 25 Wood!");
        return;
    }

    wood -= cost;
    growthMultiplier += 0.5;

    showNotification(`⚡ Growth speed increased to ${growthMultiplier.toFixed(1)}x!`);
    updateUI();
    saveGame();
}


// ============================================================
// CRAFTING
// ============================================================

function increaseGrowth(amount) {
    growthMultiplier += amount;
    updateUI();
}

function craftBench() {
    if (wood < 10) { showNotification("❌ You need 10 Wood!"); return; }
    wood -= 10;
    increaseGrowth(0.1);
    showNotification("🪑 Bench crafted! +0.1x Growth");
    saveGame();
}

function craftLantern() {
    if (wood < 25) { showNotification("❌ You need 25 Wood!"); return; }
    wood -= 25;
    increaseGrowth(0.3);
    showNotification("🏮 Lantern crafted! +0.3x Growth");
    saveGame();
}

function craftTreehouse() {
    if (wood < 40 || Iron < 2) { showNotification("❌ Need 40 Wood + 2 Iron!"); return; }
    wood -= 40; Iron -= 2;
    increaseGrowth(0.75);
    showNotification("🏡 Treehouse crafted! +0.75x Growth");
    saveGame();
}

function craftShrine1() {
    if (wood < 70 || Iron < 4) { showNotification("❌ Need 70 Wood + 4 Iron!"); return; }
    wood -= 70; Iron -= 4;
    increaseGrowth(2.5);
    showNotification("⛩️ Shrine crafted! +2.5x Growth");
    saveGame();
}

function craftShrine2() {
    if (wood < 50 || Iron < 6) { showNotification("❌ Need 50 Wood + 6 Iron!"); return; }
    wood -= 50; Iron -= 6;
    increaseGrowth(2.5);
    showNotification("⛩️ Iron Shrine crafted! +2.5x Growth");
    saveGame();
}

function craftRockPillar() {
    if (rock < 15) { showNotification("❌ Need 15 Rock!"); return; }
    rock -= 15;
    increaseGrowth(0.5);
    showNotification("🪨 Rock Pillar crafted! +0.5x Growth");
    saveGame();
}

function craftGoldenStatue() {
    if (gold < 8 || wood < 20) { showNotification("❌ Need 8 Gold + 20 Wood!"); return; }
    gold -= 8; wood -= 20;
    increaseGrowth(2.0);
    showNotification("🥇 Golden Statue crafted! +2.0x Growth");
    saveGame();
}

function craftCrystalAltar() {
    if (crystal < 5 || Iron < 30) { showNotification("❌ Need 5 Crystal + 30 Iron!"); return; }
    crystal -= 5; Iron -= 30;
    increaseGrowth(5.0);
    showNotification("💎 Crystal Altar crafted! +5.0x Growth");
    saveGame();
}

function craftBuilding() {
    if (wood < 80 || Iron < 10) { showNotification("❌ Need 80 Wood + 10 Iron!"); return; }
    wood -= 80; Iron -= 10;
    increaseGrowth(1.0);
    showNotification("🏠 Building crafted! +1.0x Growth");
    saveGame();
}

function craftApartment() {
    if (wood < 100 || Iron < 20) { showNotification("❌ Need 100 Wood + 20 Iron!"); return; }
    wood -= 100; Iron -= 20;
    increaseGrowth(1.5);
    showNotification("🏢 Apartment crafted! +1.5x Growth");
    saveGame();
}

function craftTemple() {
    if (wood < 500 || Iron < 50) { showNotification("❌ Need 500 Wood + 50 Iron!"); return; }
    wood -= 500; Iron -= 50;
    increaseGrowth(3.0);
    showNotification("🏯 Temple crafted! +3.0x Growth");
    saveGame();
}

function craftCastle() {
    if (wood < 700 || Iron < 80) { showNotification("❌ Need 700 Wood + 80 Iron!"); return; }
    wood -= 700; Iron -= 80;
    increaseGrowth(4.0);
    showNotification("🏰 Castle crafted! +4.0x Growth");
    saveGame();
}

function craftTown() {
    if (wood < 2000 || Iron < 700) { showNotification("❌ Need 2000 Wood + 700 Iron!"); return; }
    wood -= 2000; Iron -= 700;
    increaseGrowth(6.0);
    showNotification("🏘️ Town crafted! +6.0x Growth");
    saveGame();
}

function craftCity() {
    if (wood < 4000 || Iron < 900) { showNotification("❌ Need 4000 Wood + 900 Iron!"); return; }
    wood -= 4000; Iron -= 900;
    increaseGrowth(8.0);
    showNotification("🏙️ City crafted! +8.0x Growth");
    saveGame();
}

function craftKingdom() {
    if (wood < 9000 || Iron < 1000) { showNotification("❌ Need 9000 Wood + 1000 Iron!"); return; }
    wood -= 9000; Iron -= 1000;
    increaseGrowth(10.0);
    showNotification("🏰 Kingdom crafted! +10.0x Growth");
    saveGame();
}


// ============================================================
// NOTIFICATIONS
// ============================================================

function showNotification(message) {
    const container = document.getElementById("notificationContainer");
    if (!container) return;

    const notification = document.createElement("div");
    notification.className = "notification";
    notification.textContent = message;
    container.appendChild(notification);

    setTimeout(() => notification.remove(), 2500);
}


// ============================================================
// SAVE GAME
// ============================================================

function saveGame() {
    const gameData = {
        wood, Iron, rock, gold, crystal,
        totalFocusSeconds, focusSeconds, currentTreeStage,
        growthMultiplier, forest,
        rebirths, naturePoints, rebirthRequirement
    };
    localStorage.setItem("focusForestSave", JSON.stringify(gameData));
}


// ============================================================
// LOAD GAME
// ============================================================

function loadGame() {
    const saved = localStorage.getItem("focusForestSave");
    if (!saved) {
        resetGameData();
        return;
    }

    try {
        const data = JSON.parse(saved);
        wood = Number(data.wood) || 0;
        Iron = Number(data.Iron) || 0;
        rock = Number(data.rock) || 0;
        gold = Number(data.gold) || 0;
        crystal = Number(data.crystal) || 0;
        totalFocusSeconds = Number(data.totalFocusSeconds) || 0;
        focusSeconds = Number(data.focusSeconds) || 0;
        currentTreeStage = Math.max(0, Math.min(Number(data.currentTreeStage) || 0, stages.length - 1));
        growthMultiplier = Number(data.growthMultiplier) || 1;
        forest = Array.isArray(data.forest) ? data.forest : [];
        rebirths = Number(data.rebirths) || 0;
        naturePoints = Number(data.naturePoints) || 0;
        rebirthRequirement = Number(data.rebirthRequirement) || 100;

        treeEl.textContent = stages[currentTreeStage].emoji;
        treeName.textContent = stages[currentTreeStage].name;
    } catch (error) {
        console.error("Save file could not be loaded.", error);
        resetGameData();
    }
}

function resetGameData() {
    wood = 0; Iron = 0; rock = 0; gold = 0; crystal = 0;
    totalFocusSeconds = 0; focusSeconds = 0;
    currentTreeStage = 0; growthMultiplier = 1;
    forest = []; rebirths = 0; naturePoints = 0; rebirthRequirement = 100;
}


// ============================================================
// RESET GAME
// ============================================================

function resetGame() {
    const confirmed = confirm("Are you sure you want to reset your entire forest?");
    if (!confirmed) return;

    if (secondsInterval !== null) {
        clearInterval(secondsInterval);
        secondsInterval = null;
    }

    resetGameData();
    growing = false;
    lostFocus = false;

    localStorage.removeItem("focusForestSave");

    treeEl.textContent = stages[0].emoji;
    treeName.textContent = stages[0].name;

    updateForest();
    updateBiome();
    updateUI();

    showNotification("🗑️ Forest reset.");
}


// ============================================================
// VISIBILITY / FOCUS PROTECTION
// ============================================================

function updateFocusLostBanner() {
    focusLostBanner.style.display = lostFocus ? "block" : "none";
}

function clearLostFocus() {
    if (!lostFocus) return;

    if (focusLostHideTimeout !== null) {
        clearTimeout(focusLostHideTimeout);
    }

    focusLostHideTimeout = setTimeout(() => {
        lostFocus = false;
        updateFocusLostBanner();
        focusLostHideTimeout = null;
    }, 5000);
}

function pauseForLostFocus() {
    if (!growing) return;

    growing = false;
    lostFocus = true;
    updateFocusLostBanner();

    if (secondsInterval !== null) {
        clearInterval(secondsInterval);
        secondsInterval = null;
    }

    updateUI();
}

document.addEventListener("visibilitychange", () => {
    if (document.hidden && growing) {
        pauseForLostFocus();
    }
    if (!document.hidden) {
        clearLostFocus();
    }
});

window.addEventListener("blur", pauseForLostFocus);
window.addEventListener("focus", clearLostFocus);


// ============================================================
// ⭐ REBIRTH SYSTEM
// ============================================================

function performRebirth() {
    if (totalFocusSeconds < rebirthRequirement * 60) {
        showNotification("❌ You need more focus time!");
        return;
    }

    if (growing) {
        showNotification("🛑 Stop your focus session before rebirthing!");
        return;
    }

    const confirmed = confirm(
        "🌟 Rebirth your forest?\n\n" +
        "Your Wood, Iron, forest and growth upgrades will reset.\n\n" +
        "You will gain 1 Rebirth and 1 Nature Point."
    );
    if (!confirmed) return;

    rebirths++;
    naturePoints++;

    wood = 0; Iron = 0; rock = 0; gold = 0; crystal = 0;
    focusSeconds = 0;
    growthMultiplier = 1;
    forest = [];
    currentTreeStage = 0;

    treeEl.textContent = stages[0].emoji;
    treeName.textContent = stages[0].name;

    updateForest();
    updateBiome();
    updateUI();

    saveGame();

    showNotification(`🌟 Rebirth ${rebirths} complete! +1 Nature Point`);
}


// ============================================================
// AUTO-SAVE
// ============================================================

setInterval(() => saveGame(), 10000);


// ============================================================
// GLOBAL EXPORTS
// ============================================================

window.startFocus = startFocus;
window.stopFocus = stopFocus;
window.performRebirth = performRebirth;
window.buyGrowthUpgrade = buyGrowthUpgrade;
window.craftBench = craftBench;
window.craftLantern = craftLantern;
window.craftTreehouse = craftTreehouse;
window.craftShrine1 = craftShrine1;
window.craftShrine2 = craftShrine2;
window.craftRockPillar = craftRockPillar;
window.craftGoldenStatue = craftGoldenStatue;
window.craftCrystalAltar = craftCrystalAltar;
window.craftBuilding = craftBuilding;
window.craftApartment = craftApartment;
window.craftTemple = craftTemple;
window.craftCastle = craftCastle;
window.craftTown = craftTown;
window.craftCity = craftCity;
window.craftKingdom = craftKingdom;

// Fix: capture original loadGame before reassigning to avoid infinite recursion
const originalLoadGame = loadGame;
window.loadGame = () => {
    originalLoadGame();
    updateUI();
    updateForest();
    updateBiome();
    showNotification("📂 Game loaded!");
};

window.saveGame = () => { saveGame(); showNotification("💾 Game saved!"); };
window.resetGame = resetGame;

// Initial UI render
updateUI();
