const {parser} = require('stream-json') 
const StreamObject = require('stream-json/streamers/StreamObject'); 
const fs = require('fs');
const path = require('path');
const {pick} = require('stream-json/filters/Pick');

const processedCards = new Map();

const pipeline = fs.createReadStream(path.join(__dirname, '../AllPrintings.json'))
.pipe(parser())
.pipe(pick({filter: 'data'}))
.pipe(StreamObject.make());

// Handle each card object as it is parsed
pipeline.on('data', data => {
  data.value.cards.forEach(card => {
    //check if the card is/has a reprint
    if (!processedCards.has(card.name)){
      
      //find the french version of the card if it exists
      const frenchData = card.foreignData?.find(item => item.language === 'French');
      
      //create a new card object
      const cleanCard = {
        name: card.name,
        manaCost: card.manaCost,
        manaValue: card.manaValue,
        colorIdentity: card.colorIdentity,
        producedMana: card.producedMana,
        type: card.type,
        power: card.power,
        toughness: card.toughness,
        text: card.text,
        frenchText: frenchData ? frenchData.text : null,
        flavorNames: [card.flavorName, card.faceFlavorName, card.printedName, card.facePrintedName].filter(Boolean),
        printings: [{
          artist: card.artist,
          setCode: card.setCode,
          number: card.number,
        }],
    };
      processedCards.set(card.name, cleanCard);
      console.log(card.name);
    } else {
      //if the card already exists, add the new printing to the existing card object
      const existingCard = processedCards.get(card.name);
      existingCard.printings.push({
        artist: card.artist,
        setCode: card.setCode,
        number: card.number,
      });
      if (card.flavorName && !existingCard.flavorNames.includes(card.flavorName)) {
        existingCard.flavorNames.push(card.flavorName)
      }
      if (card.faceFlavorName && !existingCard.flavorNames.includes(card.faceFlavorName)) {
        existingCard.flavorNames.push(card.faceFlavorName)
      }
      if (card.printedName && !existingCard.flavorNames.includes(card.printedName)) {
        existingCard.flavorNames.push(card.printedName)
      }
      if (card.facePrintedName && !existingCard.flavorNames.includes(card.facePrintedName)) {
        existingCard.flavorNames.push(card.facePrintedName)
      }
    }
  });
});

//write the processed cards to a new JSON when the stream ends
pipeline.on('end', () => {
    fs.writeFileSync(
        path.join(__dirname, '../data/cleanCards.json'),
        JSON.stringify(Array.from(processedCards.values()))
    );
    console.log('done!');
});