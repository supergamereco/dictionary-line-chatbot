const axios = require('axios').default;

//fetch definitions from the dictionary api
async function fetchDefinitions(word) {
    try{
        const { data } = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);

        //map definition with partOfSpeech for more efficiently result.
        let definition = new Map();
        let definitionMessage = '';
        for (const meaning of data[0].meanings) {
            if(meaning.partOfSpeech === 'noun')
                definition.set(meaning.partOfSpeech, meaning.definitions[0].definition);
            else if(meaning.partOfSpeech === 'verb')
                definition.set(meaning.partOfSpeech, meaning.definitions[0].definition);
        }
    
        /*find another definition in case that data[0] dosen't have noun or verb.
        The example case is /duck. When we put duck as a query parameter data[0].meanings.partOfSpeech contain only 'verb'
        which is weird, because duck should also define to a type of aquatic bird. 
        So I decided to fetch additional data to make this dictionary ChatBot more accurated and usable.*/
        if(definition.size < 2 && data.length > 1){
            for (const meaning of data[1].meanings) {
                if(meaning.partOfSpeech === 'noun' && !definition.get('noun'))
                    definition.set(meaning.partOfSpeech, meaning.definitions[0].definition);
                else if(meaning.partOfSpeech === 'verb' && !definition.get('verb'))
                    definition.set(meaning.partOfSpeech, meaning.definitions[0].definition);
            }
        }
    
        //add definitions of the word to reply message.
        /*it can be shorter if we just add string and use regex to adjust message text,
        but in this case we use if statement for better understanding*/
        if(definition.get('noun') && !definition.get('verb'))
            definitionMessage += `• Noun: ${definition.get('noun')}`;
        else if (definition.get('noun') && definition.get('verb'))
            definitionMessage += `• Noun: ${definition.get('noun')}\n`;
    
        if(definition.get('verb'))
            definitionMessage += `• Verb: ${definition.get('verb')}`;
    
        if(!definition.get('noun') && !definition.get('verb'))
            definitionMessage = `This word isn't noun or verb.`;
    
        console.log(definitionMessage);
        return definitionMessage;
    } catch (error) {
        console.log(error.message);
        definitionMessage = `Sorry, We couldn't find definitions for the word you were looking for.`;
        return definitionMessage;
    }
}

module.exports = fetchDefinitions;
