const express = require('express');
const cors = require('cors')

const app = express();
app.use(cors())
app.use(express.json());

const port = 8080;

const groups = [];
const tossResults = [];

app.post('/group', (req, res) => {
    const {name, description} = req.body;
    if(!name) {
        return res.status(400).json({ error: 'Name is required' });
    }
    const group = {
        id: groups.length + 1,
        name,
        description,
        participants: []
    }
    groups.push(group)
    return res.json(group.id)
})

app.get('/groups', (req, res) => {
    const groupsList = groups.map(({ id, name, description }) => ({ id, name, description }))
    res.json(groupsList)
})

app.get('/group/:id',(req,res) => {
    const groupId = parseInt(req.params.id)
    const group = groups.find(group => group.id === groupId)
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    } 
    return res.json(group)
})

app.put('/group/:id',(req,res) => {
    const groupId = parseInt(req.params.id)
    const group = groups.find(group => group.id === groupId)
    if (!group) {
        return res.status(404).json({ error: 'Group not found' });
    } 
    const {name, description} = req.body
    if (!name){
        return res.status(404).json({ error: 'Name is required' });
    }
    group.name = name;
    group.description = description || undefined;
    return res.json({ message: 'Group updated successfully' });
})

app.delete('/group/:id', (req,res) => {
    const groupId = parseInt(req.params.id);
    console.log(groupId)
    const groupIndex = groups.findIndex(group => group.id === groupId);
    if (groupIndex === -1) {
      return res.status(404).json({ error: 'Group not found' });
    } 

    groups.splice(groupIndex, 1);
    return res.json({ message: 'Group deleted successfully' });
})

app.post('/group/:id/participant', (req,res) => {
    const groupId = parseInt(req.params.id)
    const group = groups.find(group => group.id === groupId)
    if(!group) {
        return res.status(404).json({ error: 'Group is found' })
    }
    const {name, wish} = req.body
    if (!name) {
        return res.status(404).json({ error: 'Name is required' })
    }
    const participant = {
        id: group.participants.length + 1,
        name,
        wish
    }
    group.participants.push(participant)
    return res.json(participant.id);
})

app.delete('/group/:groupId/participant/:participantId', (req,res) => {
    const groupId = parseInt(req.params.groupId)
    const group = groups.find(group => group.id === groupId)
    if(!group) {
        return res.status(404).json({ error: 'Group not found' })
    }
    const participantId = parseInt(req.params.participantId)
    const participantIndex = group.participants.findIndex(participant => participant.id === participantId)
    if(participantIndex === -1) {
        return res.status(404).json({ error: 'Participant not found' })
    }
    group.participants.splice(participantIndex, 1);
    return res.json({ message: 'Participant deleted successfully' });
})

app.post('/group/:id/toss', (req,res) => {
    const groupId = parseInt(req.params.id)
    const group = groups.find(group => group.id === groupId)
    if(!group) {
        return res.status(404).json({ error: 'Group not found' })
    }
    if(group.participants.length < 3) {
        return res.status(409).json({ error: 'Conflict for toss' })
    }
    shuffleArray(group.participants);
    const tossResult = [];
    for (let i = 0; i < group.participants.length; i++) {
        const participant = group.participants[i];
        const recipientIndex = (i + 1) % group.participants.length;
        const recipient = group.participants[recipientIndex];
        tossResult.push({
            id: participant.id,
            name: participant.name,
            wish: participant.wish,
            recipient: {
                id: recipient.id,
                name: recipient.name,
                wish: recipient.wish
            }
        });
    }
    const toss = {
        id: groupId,
        tossResult
    }
    tossResults.push(toss)
    return res.json(tossResult);
})

function shuffleArray(array) {
    const shuffledArray = [...array];
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }
    return shuffledArray;
}

app.get('/group/:groupId/participant/:participantId/recipient', (req,res) => {
    const groupId = parseInt(req.params.id)
    const tossResult = tossResults.find(toss => toss.id === groupId)
    if(!tossResult) {
        return res.status(404).json({ error: 'tossResult not found' })
    }
    const participantId = parseInt(req.params.id)
    const participant = tossResult.find(participant => participant.id === participantId)
    if(!participant) {
        return res.status(404).json({ error: 'Participant not found' })
    }
    res.json(participant.recipient); 
    
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})