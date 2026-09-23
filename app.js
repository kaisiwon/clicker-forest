// ============================================================
// 🌳 CLICKER FOREST — MAIN GAME
// Click to grow trees, gather resources, build your forest
// ============================================================

// ============================================================
// GAME STATE
// ============================================================

let wood = 0;
let Iron = 0;
let rock = 0;
let gold = 0;
let crystal = 0;

let growthMultiplier = 1;
let clickPower = 1;
let fertLevel = 0;

let totalClicks = 0;
let totalTreesGrown = 0;
let currentTreeStage = 0;
let treeProgress = 0;

let forest = [];

let rebirths = 0;
let naturePoints = 0;
let totalFocusSeconds = 0;
let permanentUpgrades = { growthLevel: 0, focusTimeLevel: 0, resourceLevel: 0 };
let rebirthRequirement = 100;

let autoClickerLevel = 0;
let autoClickerInterval = null;

let resourceInterval = null;

// ============================================================
// TREE STAGES
// ============================================================

const stages = [
    { emoji: "🌱", name: "Tiny Seedling", required: 0 },
    { emoji: "🌿", name: "Sprouting Sapling", required: 5 },
    { emoji: "🌾", name: "Young Shoot", required: 15 },
    { emoji: "🌳", name: "Growing Tree", required: 30 },
    { emoji: "🌲", name: "Mighty Tree", required: 50 },
    { emoji: "🌴", name: "Forest Guardian", required: 75 },
    { emoji: "🪵", name: "Towering Oak", required: 100 },
    { emoji: "🌰", name: "Ancient Grove", required: 140 },
    { emoji: "💠", name: "Crystal Grove", required: 190 },
    { emoji: "🎄", name: "Mystic Tree", required: 250 },
    { emoji: "🎋", name: "Spirit Tree", required: 320 },
    { emoji: "✨", name: "Eternal Forest", required: 400 }
];

// ============================================================
// TREE SPECIES
// ============================================================

const species = [
    { name: "Seed", emoji: "🌰", minTrees: 0 },
    { name: "Seedling", emoji: "🌱", minTrees: 1 },
    { name: "Birch", emoji: "🌳", minTrees: 3 },
    { name: "Oak", emoji: "🌲", minTrees: 6 },
    { name: "Maple", emoji: "🍁", minTrees: 10 },
    { name: "Redwood", emoji: "🌴", minTrees: 15 },
    { name: "Cedar", emoji: "🌿", minTrees: 22 },
    { name: "Crystal Tree", emoji: "💠", minTrees: 30 },
    { name: "Mystic Tree", emoji: "🎄", minTrees: 40 },
    { name: "Spirit Tree", emoji: "🎋", minTrees: 55 },
    { name: "Eternal Grove", emoji: "✨", minTrees: 70 },
    { name: "Heavenly Tree", emoji: "🪽", minTrees: 90 },
    { name: "Giant Sequoia", emoji: "🌳", minTrees: 120 }
];

// ============================================================
// DOM ELEMENTS
// ============================================================

const woodEl = document.getElementById("wood");
const IronEl = document.getElementById("Iron");
const rockEl = document.getElementById("rock");
const goldEl = document.getElementById("gold");
const crystalEl = document.getElementById("crystal");
const growthEl = document.getElementById("growth");
const treeCountEl = document.getElementById("treeCount");
const treeEl = document.getElementById("tree");
const treeNameEl = document.getElementById("treeName");
const growthBar = document.getElementById("growthBar");
const forestEl = document.getElementById("forest");
const emptyForestEl = document.getElementById("emptyForest");
const mainTreeArea = document.getElementById("mainTreeArea");
const forestModeDiv = document.getElementById("forestMode");

const rebirthCountEl = document.getElementById("rebirthCount");
const naturePointsEl = document.getElementById("naturePoints");
const rebirthRequirementEl = document.getElementById("rebirthRequirement");
const rebirthBtn = document.getElementById("rebirthBtn");

const axeUpgradeBtn = document.getElementById("axeUpgradeBtn");
const fertUpgradeBtn = document.getElementById("fertUpgradeBtn");
const autoClickerBtn = document.getElementById("autoClickerBtn");

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    loadGame();
    updateUI();
    updateForest();
    startPassiveResources();
    updateAutoClicker();

    mainTreeArea.addEventListener('click', (e) => {
        const clickValue = clickPower * growthMultiplier;
        wood += clickValue;
        totalClicks++;
        treeProgress++;

        updateTreeProgress();
        updateUI();
        saveGame();

        treeEl.classList.add('grow');
        setTimeout(() => treeEl.classList.remove('grow'), 300);

        showFloatingText(e.clientX, e.clientY, `+${clickValue.toFixed(1)} 🪵`);

        if (Math.random() < 0.05) {
            const bonus = Math.floor(Math.random() * 3) + 1;
            if (Math.random() < 0.5) {
                Iron += bonus;
                showNotification(`⛓️ +${bonus} Iron!`);
            } else {
                rock += bonus;
                showNotification(`🪨 +${bonus} Rock!`);
            }
        }

        if (Math.random() < 0.01) {
            gold += 1;
            showNotification(`⚱️ +1 Gold!`);
        }

        if (Math.random() < 0.005) {
            crystal += 1;
            showNotification(`💎 +1 Crystal!`);
        }
    });
});

// ============================================================
// TREE GROWTH
// ============================================================

function updateTreeProgress() {
    const nextStage = stages[currentTreeStage + 1];
    if (!nextStage) return;

    if (treeProgress >= nextStage.required) {
        treeProgress = 0;
        currentTreeStage++;

        treeEl.textContent = stages[currentTreeStage].emoji;
        treeNameEl.textContent = stages[currentTreeStage].name;

        showNotification(`🌳 Your tree grew into a ${stages[currentTreeStage].name}!`);

        // Check if tree is complete
        if (currentTreeStage >= stages.length - 1) {
            finishTree();
        }
    }

    updateGrowthBar();
}

function updateGrowthBar() {
    const current = stages[currentTreeStage];
    const next = stages[currentTreeStage + 1];

    if (!next) {
        growthBar.style.width = "100%";
        return;
    }

    const start = current.required;
    const end = next.required;
    const progress = ((treeProgress - start) / (end - start)) * 100;
    const percentage = Math.max(0, Math.min(100, progress));

    growthBar.style.width = percentage + "%";
}

function finishTree() {
    const minutes = Math.floor(totalClicks / 60) + 1;
    const treeSpecies = getTreeSpecies(totalTreesGrown);

    forest.push({
        emoji: treeSpecies.emoji,
        name: treeSpecies.name,
        clicks: totalClicks,
        date: new Date().toLocaleDateString()
    });

    totalTreesGrown++;
    wood += 10;

    showNotification(`🌲 ${treeSpecies.name} added to your forest! +10 Wood`);

    // Reset tree
    currentTreeStage = 0;
    treeProgress = 0;
    treeEl.textContent = stages[0].emoji;
    treeNameEl.textContent = stages[0].name;

    updateForest();
    updateUI();
    saveGame();
}

function getTreeSpecies(treeCount) {
    let result = species[0];
    for (const tree of species) {
        if (treeCount >= tree.minTrees) {
            result = tree;
        }
    }
    return result;
}

// ============================================================
// UPGRADES
// ============================================================

function buyAxeUpgrade() {
    const cost = 15 + (clickPower - 1) * 10;
    if (wood < cost) {
        showNotification("❌ Not enough wood!");
        return;
    }
    wood -= cost;
    clickPower++;
    showNotification(`🪓 Axe upgraded! +1 click power (${clickPower} total)`);
    updateUI();
    saveGame();
}

function buyAutoClickerUpgrade() {
    const cost = 50 + autoClickerLevel * 100;
    if (wood < cost) {
        showNotification("❌ Not enough wood!");
        return;
    }
    wood -= cost;
    autoClickerLevel++;
    showNotification(`🤖 Auto-Clicker level ${autoClickerLevel}! +${autoClickerLevel} wood/sec`);
    updateAutoClicker();
    updateUI();
    saveGame();
}

function applyPermanentUpgrades() {
    growthMultiplier += permanentUpgrades.growthLevel * 0.25;
}

function getPermanentGrowthCost() {
    return 2 * (permanentUpgrades.growthLevel + 1);
}

function buyPermanentGrowth() {
    const cost = getPermanentGrowthCost();
    if (naturePoints < cost) {
        showNotification("❌ Not enough Nature Points!");
        return;
    }
    naturePoints -= cost;
    permanentUpgrades.growthLevel++;
    growthMultiplier += 0.25;
    showNotification(`🌱 Permanent growth upgraded! ${growthMultiplier.toFixed(2)}x total`);
    updateUI();
    saveGame();
}

function getPermanentResourceCost() {
    return 3 * (permanentUpgrades.resourceLevel + 1);
}

function buyPermanentResources() {
    const cost = getPermanentResourceCost();
    if (naturePoints < cost) {
        showNotification("❌ Not enough Nature Points!");
        return;
    }
    naturePoints -= cost;
    permanentUpgrades.resourceLevel++;
    showNotification(`🌿 Resource boost upgraded! Level ${permanentUpgrades.resourceLevel}`);
    updateUI();
    saveGame();
}

function getFocusTimeCost() {
    return 5 * (permanentUpgrades.focusTimeLevel + 1);
}

function buyFocusTime() {
    const cost = getFocusTimeCost();
    if (naturePoints < cost) {
        showNotification("❌ Not enough Nature Points!");
        return;
    }
    naturePoints -= cost;
    permanentUpgrades.focusTimeLevel++;
    totalFocusSeconds += 600;
    showNotification("⏱️ Added 10 minutes of focus time!");
    updateUI();
    saveGame();
}

function updateAutoClicker() {
    if (autoClickerInterval) clearInterval(autoClickerInterval);
    if (autoClickerLevel <= 0) return;

    autoClickerInterval = setInterval(() => {
        if (forestModeDiv?.classList?.contains('hidden')) return;
        const amount = autoClickerLevel * clickPower * growthMultiplier;
        wood += amount;
        totalClicks += autoClickerLevel;
        updateUI();
    }, 1000);
}

function startPassiveResources() {
    if (resourceInterval) clearInterval(resourceInterval);
    resourceInterval = setInterval(() => {
        if (forestModeDiv?.classList?.contains('hidden')) return;

        const bonus = Math.max(1, Math.floor(growthMultiplier));

        if (Math.random() < 0.3) {
            Iron += bonus;
        }
        if (Math.random() < 0.5) {
            rock += bonus;
        }
        if (Math.random() < 0.2) {
            gold += 1;
        }
        if (Math.random() < 0.1) {
            crystal += 1;
        }

        if (permanentUpgrades.resourceLevel > 0) {
            wood += permanentUpgrades.resourceLevel;
        }

        updateUI();
        saveGame();
    }, 3000);
}

function buyFertUpgrade() {
    const cost = 30 + fertLevel * 20;
    if (wood < cost) {
        showNotification("❌ Not enough wood!");
        return;
    }
    wood -= cost;
    fertLevel++;
    growthMultiplier = 1 + (fertLevel * 0.25);
    showNotification(`🌱 Fertilizer upgraded! ${growthMultiplier.toFixed(2)}x growth`);
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
    if (wood < 10) { showNotification("❌ Need 10 Wood!"); return; }
    wood -= 10;
    increaseGrowth(0.1);
    showNotification("🪑 Bench crafted! +0.1x Growth");
    saveGame();
}

function craftLantern() {
    if (wood < 25) { showNotification("❌ Need 25 Wood!"); return; }
    wood -= 25;
    increaseGrowth(0.3);
    showNotification("🏮 Lantern crafted! +0.3x Growth");
    saveGame();
}

function craftTreehouse() {
    if (wood < 40 || Iron < 2) { showNotification("❌ Need 40 Wood + 2 Iron!"); return; }
    wood -= 40;
    Iron -= 2;
    increaseGrowth(0.75);
    showNotification("🏡 Treehouse crafted! +0.75x Growth");
    saveGame();
}

function craftShrine1() {
    if (wood < 70 || Iron < 4) { showNotification("❌ Need 70 Wood + 4 Iron!"); return; }
    wood -= 70;
    Iron -= 4;
    increaseGrowth(2.5);
    showNotification("⛩️ Shrine crafted! +2.5x Growth");
    saveGame();
}

function craftShrine2() {
    if (wood < 50 || Iron < 6) { showNotification("❌ Need 50 Wood + 6 Iron!"); return; }
    wood -= 50;
    Iron -= 6;
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
    gold -= 8;
    wood -= 20;
    increaseGrowth(2.0);
    showNotification("🥇 Golden Statue crafted! +2.0x Growth");
    saveGame();
}

function craftCrystalAltar() {
    if (crystal < 5 || Iron < 30) { showNotification("❌ Need 5 Crystal + 30 Iron!"); return; }
    crystal -= 5;
    Iron -= 30;
    increaseGrowth(5.0);
    showNotification("💎 Crystal Altar crafted! +5.0x Growth");
    saveGame();
}

function craftBuilding() {
    if (wood < 80 || Iron < 10) { showNotification("❌ Need 80 Wood + 10 Iron!"); return; }
    wood -= 80;
    Iron -= 10;
    increaseGrowth(1.0);
    showNotification("🏠 Building crafted! +1.0x Growth");
    saveGame();
}

function craftApartment() {
    if (wood < 100 || Iron < 20) { showNotification("❌ Need 100 Wood + 20 Iron!"); return; }
    wood -= 100;
    Iron -= 20;
    increaseGrowth(1.5);
    showNotification("🏢 Apartment crafted! +1.5x Growth");
    saveGame();
}

function craftTemple() {
    if (wood < 500 || Iron < 50) { showNotification("❌ Need 500 Wood + 50 Iron!"); return; }
    wood -= 500;
    Iron -= 50;
    increaseGrowth(3.0);
    showNotification("🏯 Temple crafted! +3.0x Growth");
    saveGame();
}

function craftCastle() {
    if (wood < 700 || Iron < 80) { showNotification("❌ Need 700 Wood + 80 Iron!"); return; }
    wood -= 700;
    Iron -= 80;
    increaseGrowth(4.0);
    showNotification("🏰 Castle crafted! +4.0x Growth");
    saveGame();
}

function craftTown() {
    if (wood < 2000 || Iron < 700) { showNotification("❌ Need 2000 Wood + 700 Iron!"); return; }
    wood -= 2000;
    Iron -= 700;
    increaseGrowth(6.0);
    showNotification("🏘️ Town crafted! +6.0x Growth");
    saveGame();
}

function craftCity() {
    if (wood < 4000 || Iron < 900) { showNotification("❌ Need 4000 Wood + 900 Iron!"); return; }
    wood -= 4000;
    Iron -= 900;
    increaseGrowth(8.0);
    showNotification("🏙️ City crafted! +8.0x Growth");
    saveGame();
}

function craftKingdom() {
    if (wood < 9000 || Iron < 1000) { showNotification("❌ Need 9000 Wood + 1000 Iron!"); return; }
    wood -= 9000;
    Iron -= 1000;
    increaseGrowth(10.0);
    showNotification("🏰 Kingdom crafted! +10.0x Growth");
    saveGame();
}

// ============================================================
// FOREST DISPLAY
// ============================================================

function updateForest() {
    forestEl.innerHTML = "";

    if (forest.length === 0) {
        const empty = document.createElement("p");
        empty.id = "emptyForest";
        empty.textContent = "Your forest is empty. Click the tree to grow your first tree!";
        forestEl.appendChild(empty);
        return;
    }

    forest.forEach(tree => {
        const treeElement = document.createElement("div");
        treeElement.className = "tree-icon";
        treeElement.textContent = tree.emoji;
        treeElement.title = `${tree.name} — ${tree.clicks} clicks`;
        forestEl.appendChild(treeElement);
    });
}

// ============================================================
// UI UPDATE
// ============================================================

function updateUI() {
    woodEl.textContent = Math.floor(wood);
    IronEl.textContent = Math.floor(Iron);
    rockEl.textContent = Math.floor(rock);
    goldEl.textContent = Math.floor(gold);
    crystalEl.textContent = Math.floor(crystal);
    growthEl.textContent = growthMultiplier.toFixed(1) + "x";
    treeCountEl.textContent = forest.length;

    // Rebirth
    rebirthCountEl.textContent = rebirths;
    naturePointsEl.textContent = naturePoints;
    rebirthRequirementEl.textContent = rebirthRequirement;

    const naturePointsShopEl = document.getElementById("naturePointsShop");
    if (naturePointsShopEl) naturePointsShopEl.textContent = naturePoints;

    const pgCost = getPermanentGrowthCost();
    const pgBtn = document.getElementById("buyPermanentGrowthBtn");
    if (pgBtn) {
        pgBtn.textContent = `Buy — ${pgCost} 🌱`;
        pgBtn.disabled = naturePoints < pgCost;
    }
    const prCost = getPermanentResourceCost();
    const prBtn = document.getElementById("buyPermanentResourceBtn");
    if (prBtn) {
        prBtn.textContent = `Buy — ${prCost} 🌿`;
        prBtn.disabled = naturePoints < prCost;
    }
    const ftCost = getFocusTimeCost();
    const ftBtn = document.getElementById("buyFocusTimeBtn");
    if (ftBtn) {
        ftBtn.textContent = `Buy — ${ftCost} ⏱️`;
        ftBtn.disabled = naturePoints < ftCost;
    }

    const totalMinutes = Math.floor(totalClicks / 60);
    rebirthBtn.disabled = totalMinutes < rebirthRequirement;

    // Upgrade buttons
    const axeCost = 15 + (clickPower - 1) * 10;
    axeUpgradeBtn.textContent = `Upgrade — ${axeCost} 🪵`;
    axeUpgradeBtn.disabled = wood < axeCost;

    const fertCost = 30 + fertLevel * 20;
    fertUpgradeBtn.textContent = `Upgrade — ${fertCost} 🪵`;
    fertUpgradeBtn.disabled = wood < fertCost;

    const autoCost = 50 + autoClickerLevel * 100;
    autoClickerBtn.textContent = `Upgrade — ${autoCost} 🪵`;
    autoClickerBtn.disabled = wood < autoCost;
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

function showFloatingText(x, y, text) {
    const el = document.createElement("div");
    el.textContent = text;
    el.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        color: #fff;
        font-weight: bold;
        font-size: 18px;
        pointer-events: none;
        z-index: 999;
        animation: floatUp 1s ease-out forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
}

// Add float animation
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% { opacity: 1; transform: translateY(0); }
        100% { opacity: 0; transform: translateY(-50px); }
    }
`;
document.head.appendChild(style);

// ============================================================
// REBIRTH
// ============================================================

function performRebirth() {
    const totalMinutes = Math.floor(totalClicks / 60);
    if (totalMinutes < rebirthRequirement) {
        showNotification("❌ Need more clicks!");
        return;
    }

    const confirmed = confirm("🌟 Rebirth your forest?\n\nYour resources and forest will reset.\nYou will gain 1 Rebirth and 1 Nature Point.");
    if (!confirmed) return;

    rebirths++;
    naturePoints++;
    applyPermanentUpgrades();

    wood = 0;
    Iron = 0;
    rock = 0;
    gold = 0;
    crystal = 0;
    growthMultiplier = 1;
    clickPower = 1;
    fertLevel = 0;
    totalClicks = 0;
    totalTreesGrown = 0;
    currentTreeStage = 0;
    treeProgress = 0;
    forest = [];

    treeEl.textContent = stages[0].emoji;
    treeNameEl.textContent = stages[0].name;

    updateForest();
    updateUI();
    saveGame();

    showNotification(`🌟 Rebirth ${rebirths} complete! +1 Nature Point`);
}

// ============================================================
// SAVE / LOAD / RESET
// ============================================================

function saveGame() {
    const gameData = {
        wood, Iron, rock, gold, crystal,
        growthMultiplier, clickPower, fertLevel, autoClickerLevel,
        totalClicks, totalTreesGrown,
        currentTreeStage, treeProgress,
        forest,
        rebirths, naturePoints, rebirthRequirement, totalFocusSeconds,
        permanentUpgrades
    };
    localStorage.setItem("clickerForestSave", JSON.stringify(gameData));
}

function loadGame() {
    const saved = localStorage.getItem("clickerForestSave");
    if (!saved) return;

    try {
        const data = JSON.parse(saved);
        wood = Number(data.wood) || 0;
        Iron = Number(data.Iron) || 0;
        rock = Number(data.rock) || 0;
        gold = Number(data.gold) || 0;
        crystal = Number(data.crystal) || 0;
        growthMultiplier = Number(data.growthMultiplier) || 1;
        clickPower = Number(data.clickPower) || 1;
        fertLevel = Number(data.fertLevel) || 0;
        autoClickerLevel = Number(data.autoClickerLevel) || 0;
        clickPower = Number(data.clickPower) || 1;
        fertLevel = Number(data.fertLevel) || 0;
        totalClicks = Number(data.totalClicks) || 0;
        totalTreesGrown = Number(data.totalTreesGrown) || 0;
        currentTreeStage = Math.max(0, Math.min(Number(data.currentTreeStage) || 0, stages.length - 1));
        treeProgress = Number(data.treeProgress) || 0;
        forest = Array.isArray(data.forest) ? data.forest : [];
        rebirths = Number(data.rebirths) || 0;
        naturePoints = Number(data.naturePoints) || 0;
        totalFocusSeconds = Number(data.totalFocusSeconds) || 0;
        rebirthRequirement = Number(data.rebirthRequirement) || 100;
        permanentUpgrades = { growthLevel: 0, focusTimeLevel: 0, resourceLevel: 0, ...(data.permanentUpgrades || {}) };

        treeEl.textContent = stages[currentTreeStage].emoji;
        treeNameEl.textContent = stages[currentTreeStage].name;
    } catch (error) {
        console.error("Save file could not be loaded.", error);
    }
}

function resetGame() {
    const confirmed = confirm("Are you sure you want to reset your entire forest?");
    if (!confirmed) return;

    wood = 0;
    Iron = 0;
    rock = 0;
    gold = 0;
    crystal = 0;
    growthMultiplier = 1;
    clickPower = 1;
    fertLevel = 0;
    autoClickerLevel = 0;
    totalClicks = 0;
    totalTreesGrown = 0;
    currentTreeStage = 0;
    treeProgress = 0;
    forest = [];
    rebirths = 0;
    naturePoints = 0;
    totalFocusSeconds = 0;
    permanentUpgrades = { growthLevel: 0, focusTimeLevel: 0, resourceLevel: 0 };

    localStorage.removeItem("clickerForestSave");

    treeEl.textContent = stages[0].emoji;
    treeNameEl.textContent = stages[0].name;

    updateForest();
    updateUI();
    showNotification("🗑️ Forest reset.");
}

// ============================================================
// ============================================================
// GLOBAL EXPORTS
// ============================================================

const originalLoadGame = loadGame;
window.loadGame = () => { originalLoadGame(); updateUI(); updateForest(); showNotification("📂 Game loaded!"); };

window.saveGame = saveGame;
window.resetGame = resetGame;
window.performRebirth = performRebirth;
window.buyAxeUpgrade = buyAxeUpgrade;
window.buyFertUpgrade = buyFertUpgrade;
window.buyAutoClickerUpgrade = buyAutoClickerUpgrade;
window.buyPermanentGrowth = buyPermanentGrowth;
window.buyPermanentResources = buyPermanentResources;
window.buyFocusTime = buyFocusTime;
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
