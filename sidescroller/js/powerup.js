let powerUp = [];

const powerUps = {
    totalPowerUps: 0, //used for mods that count power ups at the end of a level
    choose(type, index) {
        if (type === "gun") {
            b.giveGuns(index)
            // game.replaceTextLog = true;
            // game.makeTextLog(`${game.SVGleftMouse} <strong style='font-size:30px;'>${b.guns[index].name}</strong><br><br>${b.guns[index].description}`, 500);
            // game.replaceTextLog = false;
        } else if (type === "field") {
            mech.setField(index)
            // game.replaceTextLog = true;
            // game.makeTextLog(`${game.SVGrightMouse}<strong style='font-size:30px;'> ${mech.fieldUpgrades[mech.fieldMode].name}</strong><br><span class='faded'></span><br>${mech.fieldUpgrades[mech.fieldMode].description}`, 600);
            // game.replaceTextLog = false;
        } else if (type === "mod") {
            mod.giveMod(index)
            // game.replaceTextLog = true;
            // game.makeTextLog(`<div class="circle mod"></div> &nbsp; <strong style='font-size:30px;'>${mod.mods[index].name}</strong><br><br> ${mod.mods[index].description}`, 500);
            // game.replaceTextLog = false;
        }
        powerUps.endDraft(type);
    },
    showDraft() {
        // document.getElementById("choose-grid").style.gridTemplateColumns = "repeat(2, minmax(370px, 1fr))"
        document.getElementById("choose-grid").style.display = "grid"
        document.getElementById("choose-background").style.display = "inline"

        document.body.style.cursor = "auto";
        if (mod.isExtraChoice) {
            document.body.style.overflowY = "scroll";
            document.body.style.overflowX = "hidden";
        }
        game.paused = true;
        game.isChoosing = true; //stops p from un pausing on key down
        build.pauseGrid(true)
    },
    endDraft(type, isCanceled = false) {
        if (isCanceled) {
            if (mod.isCancelDuplication) mod.cancelCount++
            if (mod.isCancelRerolls) {
                let spawnType = (mech.health < 0.25 || mod.isEnergyNoAmmo) ? "heal" : "ammo"
                if (Math.random() < 0.33) {
                    spawnType = "heal"
                } else if (Math.random() < 0.5 && !mod.isSuperDeterminism) {
                    spawnType = "reroll"
                }
                for (let i = 0; i < 6; i++) powerUps.spawn(mech.pos.x + 40 * (Math.random() - 0.5), mech.pos.y + 40 * (Math.random() - 0.5), spawnType, false);
            }
            if (mod.isBanish && type === 'mod') { // banish rerolled mods by adding them to the list of banished mods
                const banishLength = mod.isDeterminism ? 1 : 3 + mod.isExtraChoice * 2
                if (powerUps.mod.choiceLog.length > banishLength || powerUps.mod.choiceLog.length === banishLength) { //I'm not sure this check is needed
                    for (let i = 0; i < banishLength; i++) {
                        powerUps.mod.banishLog.push(powerUps.mod.choiceLog[powerUps.mod.choiceLog.length - 1 - i])
                    }
                }
                game.makeTextLog(`about ${Math.max(0,powerUps.mod.lastTotalChoices - powerUps.mod.banishLog.length)} estimated <strong class='color-m'>mods</strong> left`, 300)
            }
        }
        if (mod.manyWorlds && powerUps.reroll.rerolls < 1) {
            powerUps.spawn(mech.pos.x + 40 * (Math.random() - 0.5), mech.pos.y + 40 * (Math.random() - 0.5), "reroll", false);
        }
        document.getElementById("choose-grid").style.display = "none"
        document.getElementById("choose-background").style.display = "none"
        document.body.style.cursor = "none";
        document.body.style.overflow = "hidden"
        game.paused = false;
        game.isChoosing = false; //stops p from un pausing on key down
        mech.immuneCycle = mech.cycle + 60; //player is immune to collision damage for 30 cycles
        build.unPauseGrid()
        requestAnimationFrame(cycle);
    },
    reroll: {
        rerolls: 0,
        name: "reroll",
        color: "#f7b",
        size() {
            return 20;
        },
        effect() {
            powerUps.reroll.changeRerolls(1)
            game.makeTextLog(`<div class='circle reroll'></div> &nbsp; <span style='font-size:115%;'><strong>rerolls:</strong> ${powerUps.reroll.rerolls}</span>`, 300)
        },
        changeRerolls(amount) {
            powerUps.reroll.rerolls += amount
            if (powerUps.reroll.rerolls < 0) powerUps.reroll.rerolls = 0

            if (mod.isRerollBots) {
                const limit = 5
                for (; powerUps.reroll.rerolls > limit - 1; powerUps.reroll.rerolls -= limit) {
                    b.randomBot()
                    if (mod.renormalization) {
                        for (let i = 0; i < limit; i++) {
                            if (Math.random() < 0.37) {
                                mech.fieldCDcycle = mech.cycle + 30;
                                powerUps.spawn(mech.pos.x, mech.pos.y, "reroll");
                            }
                        }
                    }
                }
            }
            if (mod.isDeathAvoid && document.getElementById("mod-anthropic")) {
                document.getElementById("mod-anthropic").innerHTML = `-${powerUps.reroll.rerolls}`
            }
            if (mod.renormalization && Math.random() < 0.37 && amount < 0) powerUps.spawn(mech.pos.x, mech.pos.y, "reroll");
            if (mod.isRerollHaste) {
                if (powerUps.reroll.rerolls === 0) {
                    mod.rerollHaste = 0.66;
                    b.setFireCD();
                } else {
                    mod.rerollHaste = 1;
                    b.setFireCD();
                }
            }
        },
        diceText() {
            const diceLimit = 5
            const r = powerUps.reroll.rerolls
            const fullDice = Math.min(Math.floor(r / 6), diceLimit)
            const lastDice = r % 6
            let out = ''
            if (Math.floor(r / 6) > diceLimit) out += "+"
            for (let i = 0; i < fullDice; i++) {
                out += '⚅'
            }
            if (lastDice === 1) {
                out += '⚀'
            } else if (lastDice === 2) {
                out += '⚁'
            } else if (lastDice === 3) {
                out += '⚂'
            } else if (lastDice === 4) {
                out += '⚃'
            } else if (lastDice === 5) {
                out += '⚄'
            }
            return out
        },
        use(type) { //runs when you actually reroll a list of selections, type can be field, gun, or mod
            powerUps.reroll.changeRerolls(-1)

            if (mod.isBanish && type === 'mod') { // banish rerolled mods
                const banishLength = mod.isDeterminism ? 1 : 3 + mod.isExtraChoice * 2
                if (powerUps.mod.choiceLog.length > banishLength || powerUps.mod.choiceLog.length === banishLength) { //I'm not sure this check is needed
                    for (let i = 0; i < banishLength; i++) {
                        powerUps.mod.banishLog.push(powerUps.mod.choiceLog[powerUps.mod.choiceLog.length - 1 - i])
                    }
                }
                game.makeTextLog(`about ${Math.max(0,powerUps.mod.lastTotalChoices - powerUps.mod.banishLog.length)} estimated <strong class='color-m'>mods</strong> left`, 300)
            }
            powerUps[type].effect();
        },
    },
    heal: {
        name: "heal",
        color: "#0eb",
        size() {
            return 40 * (game.healScale ** 0.25) * Math.sqrt(mod.largerHeals) * Math.sqrt(0.1 + Math.random() * 0.5); //(game.healScale ** 0.25)  gives a smaller radius as heal scale goes down
        },
        effect() {
            if (!mod.isEnergyHealth && mech.alive) {
                const heal = mod.largerHeals * (this.size / 40 / Math.sqrt(mod.largerHeals) / (game.healScale ** 0.25)) ** 2 //heal scale is undone here because heal scale is properly affected on mech.addHealth()
                if (heal > 0) {
                    game.makeTextLog("<div class='circle heal'></div> &nbsp; <span style='font-size:115%;'> <strong style = 'letter-spacing: 2px;'>heal</strong>  " + (Math.min(mech.maxHealth - mech.health, heal) * game.healScale * 100).toFixed(0) + "%</span>", 300)
                    mech.addHealth(heal);
                }
            }
            if (mod.healGiveMaxEnergy) {
                mod.healMaxEnergyBonus += 0.04
                mech.setMaxEnergy();
            }
        },
        spawn() { //used to spawn a heal with a specific size / heal amount, not normally used

        }
    },
    ammo: {
        name: "ammo",
        color: "#467",
        size() {
            return 17;
        },
        effect() {
            //give ammo to all guns in inventory
            if (mod.isAmmoForGun && b.inventory.length > 0) {
                const target = b.guns[b.activeGun]
                const ammoAdded = Math.ceil(Math.random() * target.ammoPack) + Math.ceil(Math.random() * target.ammoPack)
                target.ammo += ammoAdded
                // game.makeTextLog(`<div class='circle gun'></div> &nbsp; ${ammoAdded} ammo added`, 300)
            } else {
                for (let i = 0, len = b.inventory.length; i < len; i++) {
                    const target = b.guns[b.inventory[i]]
                    if (target.ammo !== Infinity) {
                        target.ammo += Math.ceil(Math.random() * target.ammoPack)
                    }
                }
            }
            game.updateGunHUD();
        }
    },
    field: {
        name: "field",
        color: "#0cf",
        size() {
            return 45;
        },
        choiceLog: [], //records all previous choice options
        effect() {
            function pick(who, skip1 = -1, skip2 = -1, skip3 = -1, skip4 = -1) {
                let options = [];
                for (let i = 1; i < who.length; i++) {
                    if (i !== mech.fieldMode && i !== skip1 && i !== skip2 && i !== skip3 && i !== skip4) options.push(i);
                }
                //remove repeats from last selection
                const totalChoices = mod.isDeterminism ? 1 : 3 + mod.isExtraChoice * 2
                if (powerUps.field.choiceLog.length > totalChoices || powerUps.field.choiceLog.length === totalChoices) { //make sure this isn't the first time getting a power up and there are previous choices to remove
                    for (let i = 0; i < totalChoices; i++) { //repeat for each choice from the last selection
                        if (options.length > totalChoices) {
                            for (let j = 0, len = options.length; j < len; j++) {
                                if (powerUps.field.choiceLog[powerUps.field.choiceLog.length - 1 - i] === options[j]) {
                                    options.splice(j, 1) //remove previous choice from option pool
                                    break
                                }
                            }
                        }
                    }
                }
                if (options.length > 0) {
                    return options[Math.floor(Math.random() * options.length)]
                }
            }

            let choice1 = pick(mech.fieldUpgrades)
            let choice2 = -1
            let choice3 = -1
            if (choice1 > -1) {
                let text = ""
                if (!mod.isDeterminism) text += `<div class='cancel' onclick='powerUps.endDraft("field",true)'>✕</div>`
                text += `<h3 style = 'color:#fff; text-align:left; margin: 0px;'>choose a field</h3>`
                text += `<div class="choose-grid-module" onclick="powerUps.choose('field',${choice1})"><div class="grid-title"><div class="circle-grid field"></div> &nbsp; ${mech.fieldUpgrades[choice1].name}</div> ${mech.fieldUpgrades[choice1].description}</div>`
                if (!mod.isDeterminism) {
                    choice2 = pick(mech.fieldUpgrades, choice1)
                    if (choice2 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('field',${choice2})"><div class="grid-title"><div class="circle-grid field"></div> &nbsp; ${mech.fieldUpgrades[choice2].name}</div> ${mech.fieldUpgrades[choice2].description}</div>`
                    choice3 = pick(mech.fieldUpgrades, choice1, choice2)
                    if (choice3 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('field',${choice3})"><div class="grid-title"><div class="circle-grid field"></div> &nbsp; ${mech.fieldUpgrades[choice3].name}</div> ${mech.fieldUpgrades[choice3].description}</div>`
                }
                if (mod.isExtraChoice) {
                    let choice4 = pick(mech.fieldUpgrades, choice1, choice2, choice3)
                    if (choice4 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('field',${choice4})"><div class="grid-title"><div class="circle-grid field"></div> &nbsp; ${mech.fieldUpgrades[choice4].name}</div> ${mech.fieldUpgrades[choice4].description}</div>`
                    let choice5 = pick(mech.fieldUpgrades, choice1, choice2, choice3, choice4)
                    if (choice5 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('field',${choice5})"><div class="grid-title"><div class="circle-grid field"></div> &nbsp; ${mech.fieldUpgrades[choice5].name}</div> ${mech.fieldUpgrades[choice5].description}</div>`
                    powerUps.field.choiceLog.push(choice4)
                    powerUps.field.choiceLog.push(choice5)
                }
                powerUps.field.choiceLog.push(choice1)
                powerUps.field.choiceLog.push(choice2)
                powerUps.field.choiceLog.push(choice3)

                if (powerUps.reroll.rerolls) text += `<div class="choose-grid-module" onclick="powerUps.reroll.use('field')"><div class="grid-title"><div class="circle-grid reroll"></div> &nbsp; reroll <span class='dice'>${powerUps.reroll.diceText()}</span></div></div>`

                // text += `<div style = 'color:#fff'>${game.SVGrightMouse} activate the shield with the right mouse<br>fields shield you from damage <br>and let you pick up and throw blocks</div>`
                document.getElementById("choose-grid").innerHTML = text
                powerUps.showDraft();
            } else {
                powerUps.giveRandomAmmo()
            }
        }
    },
    mod: {
        name: "mod",
        color: "hsl(246,100%,77%)", //"#a8f",
        size() {
            return 42;
        },
        choiceLog: [], //records all previous choice options
        lastTotalChoices: 0, //tracks how many mods were available for random selection last time a mod was picked up
        banishLog: [], //records all mods permanently removed from the selection pool
        effect() {
            if (mech.alive) {
                function pick(skip1 = -1, skip2 = -1, skip3 = -1, skip4 = -1) {
                    let options = [];
                    for (let i = 0; i < mod.mods.length; i++) {
                        if (mod.mods[i].count < mod.mods[i].maxCount && i !== skip1 && i !== skip2 && i !== skip3 && i !== skip4 && mod.mods[i].allowed()) {
                            options.push(i);
                        }
                    }
                    powerUps.mod.lastTotalChoices = options.length //this is recorded so that banish can know how many mods were available

                    if (mod.isBanish) { //remove banished mods from last selection
                        for (let i = 0; i < powerUps.mod.banishLog.length; i++) {
                            for (let j = 0; j < options.length; j++) {
                                if (powerUps.mod.banishLog[i] === options[j]) {
                                    options.splice(j, 1)
                                    break
                                }
                            }
                        }
                    } else { //remove repeats from last selection
                        const totalChoices = mod.isDeterminism ? 1 : 3 + mod.isExtraChoice * 2
                        if (powerUps.mod.choiceLog.length > totalChoices || powerUps.mod.choiceLog.length === totalChoices) { //make sure this isn't the first time getting a power up and there are previous choices to remove
                            for (let i = 0; i < totalChoices; i++) { //repeat for each choice from the last selection
                                if (options.length > totalChoices) {
                                    for (let j = 0, len = options.length; j < len; j++) {
                                        if (powerUps.mod.choiceLog[powerUps.mod.choiceLog.length - 1 - i] === options[j]) {
                                            options.splice(j, 1) //remove previous choice from option pool
                                            break
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (options.length > 0) {
                        const choose = options[Math.floor(Math.random() * options.length)]
                        text += `<div class="choose-grid-module" onclick="powerUps.choose('mod',${choose})"><div class="grid-title"><div class="circle-grid mod"></div> &nbsp; ${mod.mods[choose].name}</div> ${mod.mods[choose].description}</div>`
                        return choose
                    }

                }
                let text = ""
                if (!mod.isDeterminism) text += `<div class='cancel' onclick='powerUps.endDraft("mod",true)'>✕</div>`
                text += `<h3 style = 'color:#fff; text-align:left; margin: 0px;'>choose a mod</h3>`
                let choice1 = pick()
                let choice2 = -1
                let choice3 = -1
                if (choice1 > -1) {
                    if (!mod.isDeterminism) {
                        choice2 = pick(choice1)
                        // if (choice2 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('mod',${choice2})"><div class="grid-title"><div class="circle-grid mod"></div> &nbsp; ${mod.mods[choice2].name}</div> ${mod.mods[choice2].description}</div>`
                        choice3 = pick(choice1, choice2)
                        // if (choice3 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('mod',${choice3})"><div class="grid-title"><div class="circle-grid mod"></div> &nbsp; ${mod.mods[choice3].name}</div> ${mod.mods[choice3].description}</div>`
                    }
                    if (mod.isExtraChoice) {
                        let choice4 = pick(choice1, choice2, choice3)
                        // if (choice4 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('mod',${choice4})"><div class="grid-title"><div class="circle-grid mod"></div> &nbsp; ${mod.mods[choice4].name}</div> ${mod.mods[choice4].description}</div>`
                        let choice5 = pick(choice1, choice2, choice3, choice4)
                        // if (choice5 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('mod',${choice5})"><div class="grid-title"><div class="circle-grid mod"></div> &nbsp; ${mod.mods[choice5].name}</div> ${mod.mods[choice5].description}</div>`
                        powerUps.mod.choiceLog.push(choice4)
                        powerUps.mod.choiceLog.push(choice5)
                    }
                    powerUps.mod.choiceLog.push(choice1)
                    powerUps.mod.choiceLog.push(choice2)
                    powerUps.mod.choiceLog.push(choice3)
                    if (powerUps.reroll.rerolls) text += `<div class="choose-grid-module" onclick="powerUps.reroll.use('mod')"><div class="grid-title"><div class="circle-grid reroll"></div> &nbsp; reroll <span class='dice'>${powerUps.reroll.diceText()}</span></div></div>`

                    document.getElementById("choose-grid").innerHTML = text
                    powerUps.showDraft();
                } else {
                    if (mod.isBanish) {
                        for (let i = 0, len = mod.mods.length; i < len; i++) {
                            if (mod.mods[i].name === "erase") powerUps.ejectMod(i)
                        }
                        game.makeTextLog(`No <strong class='color-m'>mods</strong> left<br>erased <strong class='color-m'>mods</strong> have been recovered`, 300)
                        powerUps.spawn(mech.pos.x, mech.pos.y, "mod");
                        powerUps.endDraft("mod");
                    } else {
                        powerUps.giveRandomAmmo()
                    }
                }
            }
        }
    },
    gun: {
        name: "gun",
        color: "#26a",
        size() {
            return 35;
        },
        choiceLog: [], //records all previous choice options
        effect() {
            function pick(who, skip1 = -1, skip2 = -1, skip3 = -1, skip4 = -1) {
                let options = [];
                for (let i = 0; i < who.length; i++) {
                    if (!who[i].have && i !== skip1 && i !== skip2 && i !== skip3 && i !== skip4) {
                        options.push(i);
                    }
                }

                //remove repeats from last selection
                const totalChoices = mod.isDeterminism ? 1 : 3 + mod.isExtraChoice * 2
                if (powerUps.gun.choiceLog.length > totalChoices || powerUps.gun.choiceLog.length === totalChoices) { //make sure this isn't the first time getting a power up and there are previous choices to remove
                    for (let i = 0; i < totalChoices; i++) { //repeat for each choice from the last selection
                        if (options.length > totalChoices) {
                            for (let j = 0, len = options.length; j < len; j++) {
                                if (powerUps.gun.choiceLog[powerUps.gun.choiceLog.length - 1 - i] === options[j]) {
                                    options.splice(j, 1) //remove previous choice from option pool
                                    break
                                }
                            }
                        }
                    }
                }
                if (options.length > 0) {
                    return options[Math.floor(Math.random() * options.length)]
                }
            }

            let choice1 = pick(b.guns)
            let choice2 = -1
            let choice3 = -1
            if (choice1 > -1) {
                let text = ""
                if (!mod.isDeterminism) text += `<div class='cancel' onclick='powerUps.endDraft("gun",true)'>✕</div>`
                text += `<h3 style = 'color:#fff; text-align:left; margin: 0px;'>choose a gun</h3>`
                text += `<div class="choose-grid-module" onclick="powerUps.choose('gun',${choice1})"><div class="grid-title"><div class="circle-grid gun"></div> &nbsp; ${b.guns[choice1].name}</div> ${b.guns[choice1].description}</div>`
                if (!mod.isDeterminism) {
                    choice2 = pick(b.guns, choice1)
                    if (choice2 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('gun',${choice2})"><div class="grid-title"><div class="circle-grid gun"></div> &nbsp; ${b.guns[choice2].name}</div> ${b.guns[choice2].description}</div>`
                    choice3 = pick(b.guns, choice1, choice2)
                    if (choice3 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('gun',${choice3})"><div class="grid-title"><div class="circle-grid gun"></div> &nbsp; ${b.guns[choice3].name}</div> ${b.guns[choice3].description}</div>`
                }
                if (mod.isExtraChoice) {
                    let choice4 = pick(b.guns, choice1, choice2, choice3)
                    if (choice4 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('gun',${choice4})"><div class="grid-title"><div class="circle-grid gun"></div> &nbsp; ${b.guns[choice4].name}</div> ${b.guns[choice4].description}</div>`
                    let choice5 = pick(b.guns, choice1, choice2, choice3, choice4)
                    if (choice5 > -1) text += `<div class="choose-grid-module" onclick="powerUps.choose('gun',${choice5})">
          <div class="grid-title"><div class="circle-grid gun"></div> &nbsp; ${b.guns[choice5].name}</div> ${b.guns[choice5].description}</div>`
                    powerUps.gun.choiceLog.push(choice4)
                    powerUps.gun.choiceLog.push(choice5)
                }
                powerUps.gun.choiceLog.push(choice1)
                powerUps.gun.choiceLog.push(choice2)
                powerUps.gun.choiceLog.push(choice3)
                if (powerUps.reroll.rerolls) text += `<div class="choose-grid-module" onclick="powerUps.reroll.use('gun')"><div class="grid-title"><div class="circle-grid reroll"></div> &nbsp; reroll <span class='dice'>${powerUps.reroll.diceText()}</span></div></div>`

                // console.log(powerUps.gun.choiceLog)
                // console.log(choice1, choice2, choice3)
                if (mod.isOneGun) text += `<div style = "color: #f24">replaces your current gun</div>`
                document.getElementById("choose-grid").innerHTML = text
                powerUps.showDraft();
            } else {
                powerUps.giveRandomAmmo()
            }
        }
    },
    onPickUp(where) {
        if (mod.isMassEnergy && mech.energy < mech.maxEnergy * 2.5) mech.energy = mech.maxEnergy * 2.5;
        if (mod.isMineDrop) b.mine({
            x: where.x,
            y: where.y
        }, {
            x: 0,
            y: 0
        }, 0, mod.isMineAmmoBack)
    },
    giveRandomAmmo() {
        const ammoTarget = Math.floor(Math.random() * (b.guns.length));
        const ammo = Math.ceil(b.guns[ammoTarget].ammoPack * 6);
        if (ammo === Infinity) {
            b.guns[ammoTarget].ammo += ammo;
            game.makeTextLog("<span style='font-size:115%;'><span class='color-f'>+energy</span></span>", 300);
        } else {
            b.guns[ammoTarget].ammo += ammo;
            game.updateGunHUD();
            game.makeTextLog("<span style='font-size:110%;'>+" + ammo + " ammo for " + b.guns[ammoTarget].name + "</span>", 300);
        }
    },
    spawnRandomPowerUp(x, y) { //mostly used after mob dies,  doesn't always return a power up
        if ((Math.random() * Math.random() - 0.3 > Math.sqrt(mech.health) && !mod.isEnergyHealth) || Math.random() < 0.04) { //spawn heal chance is higher at low health
            powerUps.spawn(x, y, "heal");
            return;
        }
        if (Math.random() < 0.15 && b.inventory.length > 0) {
            powerUps.spawn(x, y, "ammo");
            return;
        }
        if (Math.random() < 0.0015 * (3 - b.inventory.length)) { //a new gun has a low chance for each not acquired gun up to 3
            powerUps.spawn(x, y, "gun");
            return;
        }
        if (Math.random() < 0.0027 * (25 - mod.totalCount)) { //a new mod has a low chance for each not acquired mod up to 15
            powerUps.spawn(x, y, "mod");
            return;
        }
        if (Math.random() < 0.006) {
            powerUps.spawn(x, y, "field");
            return;
        }
        // if (Math.random() < 0.01) {
        //   powerUps.spawn(x, y, "reroll");
        //   return;
        // }
    },
    randomPowerUpCounter: 0,
    spawnBossPowerUp(x, y) { //boss spawns field and gun mod upgrades
        level.bossKilled = true;

        if (mech.fieldMode === 0) {
            powerUps.spawn(x, y, "field")
        } else {
            powerUps.randomPowerUpCounter++;
            powerUpChance(Math.max(level.levelsCleared, 10) * 0.1)
        }
        powerUps.randomPowerUpCounter += 0.6;
        powerUpChance(Math.max(level.levelsCleared, 6) * 0.1)

        function powerUpChance(chanceToFail) {
            if (Math.random() * chanceToFail < powerUps.randomPowerUpCounter) {
                powerUps.randomPowerUpCounter = 0;
                if (Math.random() < 0.95) {
                    powerUps.spawn(x, y, "mod")
                } else {
                    powerUps.spawn(x, y, "gun")
                }
            } else {
                if (mech.health < 0.65 && !mod.isEnergyHealth) {
                    powerUps.spawn(x, y, "heal");
                    powerUps.spawn(x, y, "heal");
                } else {
                    powerUps.spawn(x, y, "ammo");
                    powerUps.spawn(x, y, "ammo");
                }
            }
        }
    },
    chooseRandomPowerUp(x, y) { //100% chance to drop a random power up    //used in spawn.debris
        if (Math.random() < 0.5) {
            powerUps.spawn(x, y, "heal", false);
        } else {
            powerUps.spawn(x, y, "ammo", false);
        }
    },
    addRerollToLevel() { //add a random power up to a location that has a mob,  mostly used to give each level one randomly placed reroll
        if (mob.length && Math.random() < 0.8) { // 80% chance
            const index = Math.floor(Math.random() * mob.length)
            powerUps.spawn(mob[index].position.x, mob[index].position.y, "reroll");
        }
    },
    spawnStartingPowerUps(x, y) { //used for map specific power ups, mostly to give player a starting gun
        if (level.levelsCleared < 4) { //runs 4 times on all difficulty levels
            if (level.levelsCleared > 1) powerUps.spawn(x, y, "mod")

            //bonus power ups for clearing runs in the last game
            if (level.levelsCleared === 0 && !game.isCheating) {
                for (let i = 0; i < localSettings.levelsClearedLastGame / 4 - 1; i++) {
                    powerUps.spawn(mech.pos.x, mech.pos.y, "mod", false); //spawn a mod for levels cleared in last game
                }
                localSettings.levelsClearedLastGame = 0 //after getting bonus power ups reset run history
                localStorage.setItem("localSettings", JSON.stringify(localSettings)); //update local storage
            }
            if (b.inventory.length === 0) {
                powerUps.spawn(x, y, "gun", false); //first gun
            } else if (mod.totalCount === 0) { //first mod
                powerUps.spawn(x, y, "mod", false);
            } else if (b.inventory.length < 2) { //second gun or extra ammo
                if (Math.random() < 0.5) {
                    powerUps.spawn(x, y, "gun", false);
                } else {
                    powerUps.spawn(x, y, "ammo", false);
                    powerUps.spawn(x, y, "ammo", false);
                    powerUps.spawn(x, y, "ammo", false);
                    powerUps.spawn(x, y, "ammo", false);
                }
            } else {
                powerUps.spawnRandomPowerUp(x, y);
                powerUps.spawnRandomPowerUp(x, y);
                powerUps.spawnRandomPowerUp(x, y);
                powerUps.spawnRandomPowerUp(x, y);
            }
        } else {
            powerUps.spawnRandomPowerUp(x, y);
            powerUps.spawnRandomPowerUp(x, y);
            powerUps.spawnRandomPowerUp(x, y);
        }
    },
    ejectMod(choose = 'random') {
        //find which mods you have
        if (choose === 'random') {
            const have = []
            for (let i = 0; i < mod.mods.length; i++) {
                if (mod.mods[i].count > 0) have.push(i)
            }
            if (have.length) {
                choose = have[Math.floor(Math.random() * have.length)]
                game.makeTextLog(`<div class='circle mod'></div> &nbsp; <strong>${mod.mods[choose].name}</strong> was ejected`, 600) //message about what mod was lost
                for (let i = 0; i < mod.mods[choose].count; i++) {
                    powerUps.directSpawn(mech.pos.x, mech.pos.y, "mod");
                    powerUp[powerUp.length - 1].isBonus = true
                }
                // remove a random mod from the list of mods you have
                mod.mods[choose].remove();
                mod.mods[choose].count = 0;
                mod.mods[choose].isLost = true;
                game.updateModHUD();
                mech.fieldCDcycle = mech.cycle + 30; //disable field so you can't pick up the ejected mod
            }
        } else {
            game.makeTextLog(`<div class='circle mod'></div> &nbsp; <strong>${mod.mods[choose].name}</strong> was ejected`, 600) //message about what mod was lost
            for (let i = 0; i < mod.mods[choose].count; i++) {
                powerUps.directSpawn(mech.pos.x, mech.pos.y, "mod");
                powerUp[powerUp.length - 1].isBonus = true
            }
            // remove a random mod from the list of mods you have
            mod.mods[choose].remove();
            mod.mods[choose].count = 0;
            mod.mods[choose].isLost = true;
            game.updateModHUD();
            mech.fieldCDcycle = mech.cycle + 30; //disable field so you can't pick up the ejected mod
        }
    },
    directSpawn(x, y, target, moving = true, mode = null, size = powerUps[target].size()) {
        let index = powerUp.length;
        target = powerUps[target];
        powerUp[index] = Matter.Bodies.polygon(x, y, 0, size, {
            density: 0.001,
            frictionAir: 0.03,
            restitution: 0.85,
            inertia: Infinity, //prevents rotation
            collisionFilter: {
                group: 0,
                category: cat.powerUp,
                mask: cat.map | cat.powerUp
            },
            color: target.color,
            effect: target.effect,
            name: target.name,
            size: size
        });
        if (mode) {
            powerUp[index].mode = mode
        }
        if (moving) {
            Matter.Body.setVelocity(powerUp[index], {
                x: (Math.random() - 0.5) * 15,
                y: Math.random() * -9 - 3
            });
        }
        World.add(engine.world, powerUp[index]); //add to world
    },
    spawn(x, y, target, moving = true, mode = null, size = powerUps[target].size()) {
        if (
            (!mod.isSuperDeterminism || (target === 'mod' || target === 'heal' || target === 'ammo')) &&
            !(mod.isEnergyNoAmmo && target === 'ammo') &&
            (!game.isNoPowerUps || (target === 'reroll' || target === 'heal' || target === 'ammo'))
        ) {
            powerUps.directSpawn(x, y, target, moving, mode, size)
            if (Math.random() < mod.duplicationChance()) {
                powerUps.directSpawn(x, y, target, moving, mode)
                powerUp[powerUp.length - 1].isBonus = true
            }
        }
    },
};