import React from 'react';
import type { Command, LocalJSXCommandCall } from '../../types/command.js';

const call: LocalJSXCommandCall = async (onDone, _context, args) => {
    // Use dynamic imports to match the project's pattern
    const { getGlobalConfig, saveGlobalConfig } = await import('../../utils/config.js');
    const { companionUserId, roll } = await import('../../buddy/companion.js');

    const config = getGlobalConfig();

    if (args.trim() === 'pet') {
        onDone('You pet your buddy! (Hearts float in your heart)');
        return null;
    }

    if (!config.companion) {
        const { bones } = roll(companionUserId());
        const newBuddy = {
            name: `Claude ${bones.species.charAt(0).toUpperCase()}${bones.species.slice(1)}`,
            personality: `A ${bones.rarity} ${bones.species} who loves to code.`,
            hatchedAt: Date.now()
        };
        saveGlobalConfig(c => ({ ...c, companion: newBuddy }));
        onDone(`🎉 Mazel Tov! You hatched a ${bones.rarity} ${bones.species} named ${newBuddy.name}!`);
    } else {
        onDone(`Your buddy ${config.companion.name} is happy to see you! Type /buddy pet to show some love.`);
    }
    return null;
};

const buddy: Command = {
    name: 'buddy',
    description: 'Claude Buddy Easter Egg',
    type: 'local-jsx',
    load: async () => ({ call })
};

export default buddy;
