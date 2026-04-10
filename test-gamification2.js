const getLevelFromXp = (totalXp) => {
    const xpForLevel = (level) => 500 * (level * level);

    let level = 1;
    while (totalXp >= xpForLevel(level)) {
      level++;
    }

    return level;
}

const awardProjectCompletionXp = (budget, priority) => {
    const baseXP = 250;

    let multiplier = 1.0;
    switch (priority) {
      case 'low': multiplier = 0.8; break;
      case 'medium': multiplier = 1.0; break;
      case 'high': multiplier = 1.5; break;
      case 'urgent': multiplier = 2.0; break;
    }

    // New balanced budget bonus using square root so billionaires don't jump 100 levels
    // Multiplied by 5 to give a decent boost. $10,000 budget = 100 * 5 = 500 extra XP
    const budgetBonus = Math.floor(Math.sqrt(Math.max(0, budget)) * 5);
    const xpAwarded = Math.floor(baseXP * multiplier + budgetBonus);
    
    return xpAwarded;
}

const simulate = (budget, priority) => {
    let xp = awardProjectCompletionXp(budget, priority);
    let level = getLevelFromXp(xp);
    console.log(`Budget: $${budget}, Priority: ${priority} -> Earned ${xp} XP, reached Level ${level}`);
}

simulate(100, 'low');
simulate(1000, 'medium');
simulate(10000, 'high');
simulate(1000000, 'urgent');

// Let's simulate finishing 10 normal $1000 projects
let totalXp = 0;
for(let i=1; i<=10; i++) {
   totalXp += awardProjectCompletionXp(1000, 'medium');
   let level = getLevelFromXp(totalXp);
   console.log(`Finished project ${i}, total XP: ${totalXp}, level: ${level}`);
}
