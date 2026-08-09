let recentMessages = [];

crosspostMessageStore = {
    channelEnabled(channel) {
        // If anything is empty or undefined then return false
        if (!process.env.DISCORD_CROSSPOST_CHECK_CHANNELS || !channel) return false;
        return process.env.DISCORD_CROSSPOST_CHECK_CHANNELS.split(",").includes(channel.id);
    },

    addMessage(message) {
        recentMessages.push(message);
        // Ensure we have the right amount of messages still in the cache
        module.exports.cleanup();
    },

    cleanup() {
        recentMessages = recentMessages.slice(0 - parseInt(process.env.DISCORD_CROSSPOST_HISTORY_MESSAGES ?? 10));
    },

    removeMessage(message) {
        recentMessages = recentMessages.filter(m => !m.equals(message));
    },

    findMatch(message) {
        for (const possibleMatch of recentMessages) {
            // Ensure match has the same author
            if (!possibleMatch.author || !possibleMatch.author.equals(message.author)) continue;
            // Ensure both messages have a non-empty content
            if (!possibleMatch.content || !message.content || possibleMatch.content === "" || message.content === "") continue;
            // Ensure they are in different channels
            if (!possibleMatch.channel || !message.channel || message.channel.equals(possibleMatch.channel)) continue;
            // If the content is the same, then this is a match - return it
            if (possibleMatch.content.trim() === message.content.trim()) return possibleMatch;
        }
    }
};

module.exports = crosspostMessageStore;
