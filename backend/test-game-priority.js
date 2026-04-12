const xpForLevel = (level) => 500 * level * level;

const getLevelFromXp = (totalXp) => {
    let level = 1;
    while (totalXp >= xpForLevel(level)) {
      level++;
    }
    return level;
}

const awardXP = (priority) => {
    const baseXP = 500;
    let multiplier = 1.0;
    switch (priority) {
      case 'low': multiplier = 0.5; break; // 250 XP
      case 'medium': multiplier = 1.0; break; // 500 XP
      case 'high': multiplier = 2.0; break; // 1000 XP
      case 'urgent': multiplier = 3.0; break; // 1500 XP
    }
    return Math.floor(baseXP * multiplier);
}

console.log('Low Priority Project XP:', awardXP('low'));
console.log('Medium Priority Project XP:', awardXP('medium'));
console.log('High Priority Project XP:', awardXP('high'));
console.log('Urgent Priority Project XP:', awardXP('urgent'));

// Simulated user progress
let totalXp = 0;
for(let i=1; i<=10; i++) {
   let p = (i%3===0)? 'high': 'medium';
   let earned = awardXP(p);
   totalXp += earned;
   console.log(`Finished project ${i} ${p}, Earned: ${earned}, Total: ${totalXp}, Level: ${getLevelFromXp(totalXp)}`);
}
