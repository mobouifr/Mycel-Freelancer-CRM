const getLevelFromXp = (totalXp) => {
    const xpForLevel = (level) => 100 * level * level;

    let level = 1;
    while (totalXp >= xpForLevel(level)) {
      level++;
    }

    return level;
}

console.log('0xp -> level', getLevelFromXp(0));
console.log('100xp -> level', getLevelFromXp(100));
console.log('1000xp -> level', getLevelFromXp(1000));
console.log('10000xp -> level', getLevelFromXp(10000));
console.log('12000xp -> level', getLevelFromXp(12000));
