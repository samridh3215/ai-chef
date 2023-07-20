const express = require('express')
const axios = require('axios')
const qs = require('qs')
var bodyParser = require('body-parser');
const fs = require('fs')
const PDFDocument = require('pdfkit');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config();

const app = express()
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(express.static(__dirname));

const url = "https://api.openai.com/v1/chat/completions"
const configuration = new Configuration({
    apiKey: process.env.APIKEY,
});
const openai = new OpenAIApi(configuration);
let pdfDoc = new PDFDocument;
pdfDoc.pipe(fs.createWriteStream('Recipe.pdf'));


var newMessages= [{"role": "system", "content": `You are a professional Chef, that answers in the following format:
###
    Description: Gulab jamun is a delicious and popular Indian dessert made from fried milk solids soaked in a sugar syrup flavored with rose water or saffron. It has a rich and sweet taste, and it's a perfect way to end a meal.
    Ingredients: - 1 cup of milk powder - 1/4 cup of all-purpose flour - a pinch of baking powder - 2 tablespoons of ghee (clarified butter) - 1/4 cup of milk - 1 tablespoon of chopped almonds or pistachios (optional) - oil for frying For the sugar syrup: - 1 cup of sugar - 1 cup of water - a few drops of rose water or a pinch of saffron strands 
    Instructions: 1. In a mixing bowl, combine the milk powder, all-purpose flour, and baking powder. Mix well, ensuring there are no lumps. 2. Add the ghee to the dry mixture and rub it in with your fingertips until the mixture resembles breadcrumbs. 3. Gradually add milk to the mixture, kneading gently to form a soft and smooth dough. Be careful not to overwork the dough. 4. Divide the dough into small portions and shape them into round balls. You can make them about the size of a small marble. 5. In a deep pan, heat oil over medium heat for frying. Once the oil is hot, reduce the heat to low and carefully add the gulab jamun balls. Fry them until they turn golden brown, stirring occasionally for even cooking. Make sure to fry them in small batches to avoid overcrowding the pan. 6. While the gulab jamun is frying, prepare the sugar syrup. In a separate saucepan, combine the sugar and water. Bring the mixture to a boil and cook until the sugar is dissolved. Add rose water or saffron strands to the syrup, stirring well. 7. Once the gulab jamun balls are properly fried, remove them from the oil and drain excess oil on a paper towel. 8. Immediately transfer the fried balls into the warm sugar syrup. Allow them to soak in the syrup for at least 30 minutes so that they absorb the flavors and soften. 9. After soaking, garnish the gulab jamun with chopped almonds or pistachios if desired, and serve them warm or at room temperature.
    Conclusion: Gulab jamun can be enjoyed on its own or with a scoop of vanilla ice cream. It is a delightful sweet treat that's sure to impress your guests or satisfy your own cravings.
    ###
    Description:
    Ingredients:
    Instructions:
    Conclusion:
    `}];
var suggestMessages = [{"role": "system", "content": `you are a professional chef who suggests a recipe based on the items that the user lists and do not add new ingredients unless necessary
###
Based on the ingredients you listed, I recommend making a simple but delicious Banana Pudding. Here's the recipe:

Ingredients:
- 2 cups milk
- 1/4 cup sugar
- 2 ripe bananas

Instructions:
1. In a medium saucepan, combine the milk and sugar. Heat over low heat, stirring constantly, until the sugar has dissolved. Remove from heat and let it cool slightly.
2. Meanwhile, slice the bananas into thin rounds.
3. In individual serving bowls or a large glass dish, layer some banana slices at the bottom.
4. Pour half of the cooled milk mixture over the bananas.
5. Repeat the layering process with the remaining banana slices and milk mixture.
6. Cover the dish and refrigerate for at least 2 hours, or until the pudding has thickened.
7. Serve chilled and enjoy!

Note: You can also add a sprinkle of cinnamon or a dollop of whipped cream on top for extra flavor and presentation.
###
Ingredients:
Instructions:
 `}]

async function fetchImagePrompt(description) {
    try {
      const response = await fetchAPI(url, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + APIKEY
        },
        body: JSON.stringify({
          'model': 'text-davinci-003',
          'prompt': `Give a short description of an image that could be used to advertise a recipe based the dish's name. The description should be rich in visual detail but contain no names.
          ###
      Description: Gulab jamun is a delicious and popular Indian dessert made from fried milk solids soaked in a sugar syrup flavored with rose water or saffron. It has a rich and sweet taste, and it's a perfect way to end a meal.
      Ingridients: - 1 cup of milk powder - 1/4 cup of all-purpose flour - a pinch of baking powder - 2 tablespoons of ghee (clarified butter) - 1/4 cup of milk - 1 tablespoon of chopped almonds or pistachios (optional) - oil for frying For the sugar syrup: - 1 cup of sugar - 1 cup of water - a few drops of rose water or a pinch of saffron strands 
      Instructions: 1. In a mixing bowl, combine the milk powder, all-purpose flour, and baking powder. Mix well, ensuring there are no lumps. 2. Add the ghee to the dry mixture and rub it in with your fingertips until the mixture resembles breadcrumbs. 3. Gradually add milk to the mixture, kneading gently to form a soft and smooth dough. Be careful not to overwork the dough. 4. Divide the dough into small portions and shape them into round balls. You can make them about the size of a small marble. 5. In a deep pan, heat oil over medium heat for frying. Once the oil is hot, reduce the heat to low and carefully add the gulab jamun balls. Fry them until they turn golden brown, stirring occasionally for even cooking. Make sure to fry them in small batches to avoid overcrowding the pan. 6. While the gulab jamun is frying, prepare the sugar syrup. In a separate saucepan, combine the sugar and water. Bring the mixture to a boil and cook until the sugar is dissolved. Add rose water or saffron strands to the syrup, stirring well. 7. Once the gulab jamun balls are properly fried, remove them from the oil and drain excess oil on a paper towel. 8. Immediately transfer the fried balls into the warm sugar syrup. Allow them to soak in the syrup for at least 30 minutes so that they absorb the flavors and soften. 9. After soaking, garnish the gulab jamun with chopped almonds or pistachios if desired, and serve them warm or at room temperature.
      Conclusion: Gulab jamun can be enjoyed on its own or with a scoop of vanilla ice cream. It is a delightful sweet treat that's sure to impress your guests or satisfy your own cravings.
      ###
      Description:${THE_DESCRIPTOION_OF_THE_FOOD}
      image description: 
          `,
          temperature: 0.8,
          max_tokens: 100
        })
      });
    const data = await response.json();
    const imagePrompt = data.choices[0].text.trim();
    }catch{
        console.log("NAH FAM")
    }
}

function formatRecipeParagraph(recipeParagraph) {
    if (typeof recipeParagraph !== 'string') {
      throw new Error('Input must be a string');
    }
    if(!recipeParagraph.includes("Description:")){
        return recipeParagraph
    }
    
    // Split the paragraph into sections using double line breaks as the separator
    const sections = recipeParagraph.split(/\n\s*\n/);
  
    // Create a mapping of section headers to their contents
    const sectionMap = sections.reduce((map, section) => {
      const separatorIndex = section.indexOf(':');
      if (separatorIndex !== -1) {
        const sectionHeader = "<p>"+section.slice(0, separatorIndex).trim()+"</p>"
        const sectionContent = "<p>"+section.slice(separatorIndex + 1).trim()+"</p>"
        if (sectionHeader && sectionContent) {
          map[sectionHeader] = sectionContent;
        }
      }
      return map;
    }, {});
  
    // Build the formatted paragraph by joining section headers and contents
    let formattedParagraph = '';
    for (const [sectionHeader, sectionContent] of Object.entries(sectionMap)) {
      formattedParagraph += `${sectionHeader}:\n${sectionContent}\n\n`;
    }
  
    return formattedParagraph.trim();
  }


  function formatIngredientsParagraph(ingredientsParagraph) {
    if (typeof ingredientsParagraph !== 'string') {
      throw new Error('Input must be a string');
    }
  
    const regex = /Ingredients:(.*?)(?:Instructions:|$)/s;
    const match = ingredientsParagraph.match(regex);
  
    if (!match) {
      throw new Error('Could not find both "Ingredients" and "Instructions" sections');
    }
  
    const ingredientsSection = match[1].trim();
    const formattedIngredients = ingredientsSection.replace(/-\s+/g, '- ');
  
    const instructionsSection = ingredientsParagraph.slice(match.index + match[0].length).trim();
  
    const formattedParagraph = `Based on the ingredients you listed, I recommend making a simple but delicious Banana Pudding. Here's the recipe:\n\nIngredients:\n${formattedIngredients}\n\nInstructions:\n${instructionsSection}\n`;
  
    return formattedParagraph;
  }
app.get('/home', (req, res) => {
  res.sendFile(__dirname+"/index.html")
})

app.get('/download', (req, res)=>{
    pdfDoc.end();
    res.download(__dirname+"/Recipe.pdf", (err)=>console.log(err))
})

app.post('/new', async (req, res)=>{

    newMessages.push(req.body)
    console.log("newMessages", newMessages)
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: newMessages,
        temperature:1.73
      });
      console.log(completion.data);
      var formatted = formatRecipeParagraph(completion.data.choices[0].message.content)
      console.log("formatted", formatted)
      newMessages.push(completion.data.choices[0].message)
    //   res.send(completion.data.choices[0].message)
      res.send(formatted)
})

app.post('/suggest', async (req, res)=>{
    console.log(req.body)
    var messages;
    suggestMessages.push(req.body)
    pdfDoc.fillColor('blue').text(req.body.role+': '+req.body.content)
    console.log("suggestMessages", suggestMessages)
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: suggestMessages,
      });
      console.log(completion.data);
      messages = completion.data.choices[0].message
      var formatted = formatIngredientsParagraph(messages.content)
      console.log("formated", formatted)
      suggestMessages.push(messages)
      res.send(formatted)
})
app.post('/test', (req, res)=>{
    console.log(req.body)
    var object = {'role':'user', 'content':'hello'}
    res.send(JSON.stringify(object))
})



/*app.post('/suggest', (req, res)=>{
    var options = {
        headers:{
            'Authorization' : `Bearer ${key}`,
            'Content-Type': 'application/json' 
        },
        data: JSON.stringify({
            'model': 'gpt-3.5-turbo',
            'messages': [{"role": "system", "content": "You are a helpful assistant."}, {"role": "user", "content": "Hello!"}]
        })
    }
    axios.post(url, options).then(response => {
                        console.log(response);
                        res.send(JSON.stringify(response.data))
                    }).catch(error => {
                        console.log(error);
                    });
    console.log("request at /suggest", req)
})*/
app.listen(3001, () => {
try{
  console.log(`App listening....`)
}catch{
    console.log("something went wrong")
}
})