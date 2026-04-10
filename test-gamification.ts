const getLevelFromXp = (totalXp: number): number => {
    const xpForLevel = (level: number) => 100 * level * level;

    let level = 1;
    while (totalXp >= xpForLevel(level)) {
      level++;
    }

    return level;
}

console.log(getLevelFromXp(0)); // 1
console.log(getLevelFromXp(100)); // 2
console.log(getLevelFromXp(400)); // 3
console.log(getLevelFromXp(2000)); // 5
console.log(getLevelFromXp(12000)); // 11
