//Game data
class Character {
    constructor(name, hitPoints, hitPointsMax, attack, attackProf, damage, defense, defenseProf, armor, grope, gropeProf, rape, rapeProf, lust, lustMax, dickSize, dickBonus, isPlayer, traits, gainedLust){
        this.name = name;
        this.hitPoints = hitPoints;
        this.hitPointsMax = hitPointsMax;
        this.attack = attack;
        this.attackProf = attackProf;
        this.damage = damage;
        this.defense = defense;
        this.defenseProf = defenseProf;
        this.armor = armor;
        this.grope = grope;
        this.gropeProf = gropeProf;
        this.rape = rape;
        this.rapeProf = rapeProf;
        this.lustMax = lustMax;
        this.lust = lust;
        this.dickSize = dickSize;
        this.dickBonus = dickBonus;
        this.isPlayer = isPlayer;
        this.traits = traits;
        this.gainedLust = gainedLust;
    }

    getHorny = function(){
        if(this.lust >= this.lustMax){
            return 2;
        } else if(this.lust >= this.lustMax / 2){
            return 1;
        } else {
            return 0;
        }
    }

    attackTarget = function(target){
        let successes = roll(this.attack - this.getHorny(), this.attackProf)
        scriptCombatLog += `${this.name} attacks with ${successes} successes.\n`
        target.defend(successes, this.damage);
        return 0;
    }

    defend = function(successes, damage){
        let defenseSuccesses = roll(this.defense - this.getHorny(), this.defenseProf)
        scriptCombatLog += `${this.name} defends with ${defenseSuccesses} successes.\n`
        if(successes > defenseSuccesses){
            this.hitPoints -= (damage - this.armor) * (successes - defenseSuccesses);
            scriptCombatLog += `${this.name} takes ${(damage - this.armor) * successes} damage.\n`
        } else {
            scriptCombatLog += `${this.name} takes no damage.\n`
        }
    }

    gropeTarget = function(target){
        let successes = roll(this.grope - this.getHorny(), this.gropeProf)
        scriptCombatLog += `${this.name} tries to grope ${target.name} with ${successes} successes.\n`
        target.getGroped(successes);
    }

    rapeTarget = function(target){
        let successes = roll(this.rape - this.getHorny(), this.rapeProf)
        scriptCombatLog += `${this.name} tries to rape ${target.name} with ${successes} successes.\n`
        target.getRaped(successes);
    }
}

let player = new Character('', 0, 0, 0, 0 ,0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, true, [], false);
player.stamina = 0;
player.staminaMax = 0;
player.sanity = 0;
player.sanityMax = 0;
player.beauty = 1;

player.defend = function(successes, damage){
    let defenseSuccesses = roll(this.defense - this.getHorny(), this.defenseProf)
    scriptCombatLog += `${player.name} defends with ${defenseSuccesses} successes.\n`
    if(successes > defenseSuccesses){
        if(this.armor.length > 0){
            this.armor[0].protection -= successes * (damage - this.armor[0].armor);
            scriptCombatLog += `${player.name}'s armor took ${successes * (damage - this.armor[0].armor)} damage.\n`
            if(this.armor[0].protection <= 0){
                this.armor.shift();
                enemyArray.forEach(enemy => {
                    enemy.lust += 1;
                    enemy.gainedLust = true;
                });
                scriptCombatLog += `${player.name}'s armor broke!\n`;
            }
        } else {
            this.hitPoints -= successes * damage;
            scriptCombatLog += `${player.name} took ${damage * successes} damage.\n`;
        }
    } else {
        scriptCombatLog += `${player.name} takes no damage.\n`;
    }
}

player.getGroped = function(successes){
    let defenseSuccesses = roll(this.defense - this.getHorny(), this.defenseProf);
    scriptCombatLog += `${player.name} tries to fend them off with ${defenseSuccesses} successes.\n`
    if(successes > defenseSuccesses){
        scriptCombatLog += `${player.name} got groped for ${successes - defenseSuccesses} lust.\n`
        player.lust += successes - defenseSuccesses;
        enemyArray.forEach(enemy => {
            enemy.lust += successes - defenseSuccesses;
            enemy.gainedLust = true;
        })
    } else {
        scriptCombatLog += `${player.name} avoided being groped.\n`
    }
}

player.getRaped = function(successes){
    let defenseSuccesses = roll(this.defense - this.getHorny(), this.defenseProf);
    scriptCombatLog += `${player.name} tries to escape their clutches with ${defenseSuccesses} successes.\n`
    if(successes > defenseSuccesses){
        scriptCombatLog += `${player.name} fails and is about to get raped!\n`
        enemyArray.sort((a, b) => a.dickSize > b.dickSize);
        let dickBonus = enemyArray[0].dickBonus;
        let dickSize = enemyArray[0].dickSize;
        if(enemyArray.length > 1){
            dickBonus = enemyArray[0].dickBonus * 2;
            dickSize = enemyArray[0].dickSize + enemyArray.length - 1;
        }
        let pleasure = 0;
        for(let i = 0; i < dickSize; i++){
            pleasure += Math.floor(Math.random() * 5 + 1);
        }
        pleasure += dickBonus;
        scriptCombatLog += `${player.name} gains ${pleasure} pleasure from being ravished.\n`;
        if(pleasure > player.lustMax){
            scriptCombatLog += `${player.name} had a powerul orgasm!\n${player.name} lost ${pleasure - player.lustMax} sanity.\n`;
            player.lust = 0;
            player.sanity -= pleasure - player.lustMax;
            player.lustMax++;
            if(player.sanity <= 0){
                scriptCombatLog += `${player.name}'s mind is broken by pleasure! She gains a new fetish!\n`;
                player.sanity = 0;
            }
        } else if(pleasure > player.lustMax / 2){
            player.lust = 0;
            scriptCombatLog += `${player.name} had an orgasm.\n`;
        }
    } else {
        scriptCombatLog += `${player.name} avoided being raped.\n`
    }
}

let enemyArray = [];
let scriptCombatLog = '';
let statsEditable = false;

//Page interaction and on-click event handlers
editStats.addEventListener('click', function(){

    if(!statsEditable){
        statsEditable = true;
        editStats.textContent = 'Save Stats';
        fight.disabled = true;
        addEnemy.disabled = true;

        hitPoints.disabled = false;
        hitPoints.value = player.hitPointsMax;
        stamina.disabled = false;
        stamina.value = player.staminaMax;
        sanity.disabled = false;
        sanity.value = player.sanityMax;
        lust.disabled = false;
        lust.value = player.lustMax;        
        characterName.disabled=false;
        attack.disabled=false;
        attackProf.disabled=false;
        damage.disabled=false;
        defense.disabled=false;
        defenseProf.disabled=false;
        armorSelect.disabled=false;
    } else {
        statsEditable = false;
        editStats.textContent = 'Edit Stats';
        fight.disabled = false;
        addEnemy.disabled = false;

        hitPoints.disabled = true;
        stamina.disabled = true;
        sanity.disabled = true;
        lust.disabled = true;        
        characterName.disabled=true;
        attack.disabled=true;
        attackProf.disabled=true;
        damage.disabled=true;
        defense.disabled=true;
        defenseProf.disabled=true;
        armorSelect.disabled=true;

        saveStats();
        updatePage();
    }
});

fight.addEventListener('click', function(){
    if(enemyArray.length == 0){
        scriptCombatLog += 'Add some enemies first.\n';
    } else if(enemyList.value == ''){
        scriptCombatLog += 'Pick a target.\n'
    } else {
        //The player attacks
        let target=enemyArray.findIndex(enemy => enemy.name == enemyList.value);
        player.attackTarget(enemyArray[target]);
        if(enemyArray[target].hitPoints <= 0){
            scriptCombatLog += `${enemyArray[target].name} was defeated!\n`;
            enemyArray = enemyArray.filter(enemy => enemy.name != enemyArray[target].name);
        }

        //The enemies act
        enemyArray.forEach(enemy => {
            if(enemy.getHorny() >= 2){
                enemy.rapeTarget(player);
            } else if(enemy.gainedLust){
                enemy.gainedLust = false;
                enemy.gropeTarget(player);
            } else {
                enemy.attackTarget(player);
            }
        })
    }

    scriptCombatLog += '\n'

    updatePage();
})

addEnemy.addEventListener('click', function(){
    //Toggle the Save Enemies button text
    !enemySelect.disabled ? addEnemy.textContent = 'Add Enemies' : addEnemy.textContent = 'Save Enemies'

    //Toggle whther other interactables are clickable
    !enemySelect.disabled ? editStats.disabled = false : editStats.disabled = true;
    !enemySelect.disabled ? fight.disabled = false : fight.disabled = true;
    !enemySelect.disabled ? clearEnemies.disabled = true : clearEnemies.disabled = false;

    //Toggle whether enemySelect and its sub elements are disabled
    enemySelect.disabled ? enemySelect.disabled = false : enemySelect.disabled = true;

    updatePage();
});

clearEnemies.addEventListener('click', function(){
    enemyArray = [];

    updatePage();
})

function addEnemyToArray(enemy){
//Reads when an enemy in the Enemy Select has been created and adds that enemy to our array of enemies, then updates the page
    let baseLust = 0;
    let gainedLust = false;
    if(player.beauty > 0){
        baseLust = player.beauty;
        gainedLust = true;
    }

    switch(enemy){
        case 'bandit':
            enemyArray.push(new Character('Bandit ' + enemyArray.length, 20, 20, 6, 4, 6, 6, 4, 1, 6, 4, 5, 4, baseLust, 10, 3, 5, false, [], gainedLust))
            break;
        case 'banditLeader':
            enemyArray.push(new Character('Bandit Leader ' + enemyArray.length, 25, 25, 8, 4, 7, 8, 4, 1, 7, 4, 5, 4, baseLust, 10, 3, 5, false, [], gainedLust))
            break;
        case 'wyvern':
            enemyArray.push(new Character('Wyvern ' + enemyArray.length, 32, 32, 8, 4, 10, 8, 4, 3, 0, 0, 0, 0, 0, 12, 4, 10, false, [], false))
            break;
        case 'goblin':
            enemyArray.push(new Character('Goblin ' + enemyArray.length, 10, 10, 5, 5, 3, 4, 4, 0, 5, 4, 4, 4, 0, 8, 2, 2, false, [], gainedLust))
            break;
    }

    updatePage();
}

//Game functionality
function saveStats(){
    //Save the stats from the game window to the game logic
    player.hitPoints = hitPoints.value;
    player.hitPointsMax = hitPoints.value;
    player.stamina = stamina.value;
    player.staminaMax = stamina.value;
    player.sanity = sanity.value;
    player.sanityMax = sanity.value;
    player.lust = 0;
    player.lustMax = lust.value;
    player.name = characterName.value;
    player.attack = attack.value;
    player.attackProf = attackProf.value;
    player.damage = damage.value;
    player.defense = defense.value;
    player.defenseProf = defenseProf.value;
    player.armor = [];

    switch(armorSelect.value){
        case 'ironPlate':
            player.armor.unshift({"protection": 12, "armor": 2, "rapeProtection": 5});
            player.armor.unshift({"protection": 12, "armor": 2, "rapeProtection": 4});
            player.armor.unshift({"protection": 12, "armor": 2, "rapeProtection": 3});
            break;
        case 'priestRobe':
            player.armor.unshift({"protection": 7, "armor": 0, "rapeProtection": 3});
            player.armor.unshift({"protection": 7, "armor": 0, "rapeProtection": 2});
            player.armor.unshift({"protection": 7, "armor": 0, "rapeProtection": 1});
    }
}

function updatePage(){
    //Update the character's stats from the game logic to the game window
    characterName.value = player.name;
    hitPoints.value = player.hitPoints + '/' + player.hitPointsMax;
    stamina.value = player.stamina + '/' + player.staminaMax;
    sanity.value = player.sanity + '/' + player.sanityMax;
    lust.value = player.lust + '/' + player.lustMax;
    attack.value = player.attack;
    attackProf.value = player.attackProf;
    damage.value = player.damage;
    defense.value = player.defense;
    defenseProf.value = player.defenseProf;
    let tempArmor = '';
    player.armor.forEach(armorLayer => tempArmor = armorLayer.protection + '/' + tempArmor);
    armor.value = tempArmor;

    //Update the enemy list with all enemies in our enemy array
    while(enemyList.options.length > 0){
        enemyList.remove(0);
    }

    enemyArray.forEach(enemy => {
        let newEnemy = new Option(enemy.name + ' HP: ' + enemy.hitPoints + ' Lust: ' + enemy.lust, enemy.name);
        enemyList.add(newEnemy);
    })

    combatLog.textContent = scriptCombatLog;
}

function roll(skill, proficiency) {
    let successes = 0;
    for(let i = 0; i < skill; i++){
        if(Math.floor(Math.random() * 5 + 1) >= proficiency){
            successes++;
        }
    } 
    return successes
}

function combat(attacker, defender){
    let attackerSuccess = roll(attacker.attack - attacker.getHorny(), attacker.attackProf);
    let defenderSuccess = roll(defender.defense - defender.getHorny(), defender.defenseProf);
    scriptCombatLog += `${attacker.name} attacked with ${attackerSuccess} successes. ${defender.name} defended with ${defenderSuccess} successes.\n`;
    if(attackerSuccess > defenderSuccess){
        defender.takeDamage(attackerSuccess - defenderSuccess, attacker.damage)
    } else {
        scriptCombatLog += `${defender.name} took no damage!\n`;
    }
}