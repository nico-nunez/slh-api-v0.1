const SecretSanta = require('../models/secretSanta');

function filterPool(picker, allMembers) {
    const pool = []
    for (const member of allMembers) {
        if (picker.profileName === member.profileName) continue;
        if (picker.exceptions.indexOf(member.profileName) !== -1) continue
        pool.push(member);
    }
    return pool;
}

function randomRecipient(selector, participantPool ) {
    const filteredPool = filterPool(selector, participantPool)
    if (!filteredPool.length) return null;
    const randNum = Math.floor(Math.random() * filteredPool.length);
    const randomRecipient = filteredPool[randNum];
    return randomRecipient;
}

function updatePool(selector, recipient, allMembers) {
    const updatedPool = []
    for (const person of mainPool) {
        if (person.name === recipient.name) {
            person.isAvailable = false;
        } else if (person.name === selector.name) {
            person.recipient = recipient;
        }
        updatedPool.push(person);
    }
    return updatedPool;
}

function secretSantaSelector(allMembers, partyID) {
    let availableMembers = [...allMembers]
    let results = [];
    for (const member of allMembers) {
        const recipient = randomRecipient(member, availableMembers)
        if(!recipient) {
            secretSantaSelector(allMembers, partyID)
        } else {
            const selection = new SecretSanta({
                gifter: member,
                giftee: recipient,
                party: partyID
            })
            results.push(selection);
            availableMembers = availableMembers.filter(member => member.username !== recipient.username);
        }
    }
    return results;
}


module.exports = secretSantaSelector;