const express = require('express')
const axios = require('axios')
const qs = require('qs')
var bodyParser = require('body-parser');
const fs = require('fs')
const PDFDocument = require('pdfkit');
const { Configuration, OpenAIApi } = require("openai");
const { time } = require('console');
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
give me recipes for the given a list of ingredients, do not suggest any extra ingredients.
###
ingredients: milk,maida,cocoa powder,sugar

recipe: With the ingredients milk, maida (all-purpose flour), cocoa powder, and sugar, I can suggest two classic recipes: Chocolate Pudding and Chocolate Pancakes. These recipes use only the ingredients you've provided and nothing extra. Let's get cooking!

1. Chocolate Pudding:

Ingredients:
- 2 cups milk
- 1/4 cup maida (all-purpose flour)
- 1/4 cup cocoa powder
- 1/2 cup sugar

Instructions:
1. In a medium-sized saucepan, whisk together the maida, cocoa powder, and sugar until well combined.
2. Gradually add the milk to the dry ingredients while continuously whisking to avoid lumps.
3. Place the saucepan on medium heat and cook the mixture while stirring constantly until it thickens and reaches a pudding-like consistency. This should take about 5-7 minutes.
4. Once the pudding is thick and smooth, remove it from the heat and let it cool for a few minutes.
5. Transfer the pudding to serving dishes or small bowls and refrigerate until it's chilled and set.
6. Serve the chocolate pudding chilled, and you can optionally top it with some whipped cream or chocolate shavings.

2. Chocolate Pancakes:

Ingredients:
- 1 cup maida (all-purpose flour)
- 2 tablespoons cocoa powder
- 2 tablespoons sugar
- 1 cup milk
- Butter or oil for cooking

Instructions:
1. In a mixing bowl, whisk together the maida, cocoa powder, and sugar until well combined.
2. Gradually add the milk to the dry ingredients while whisking until you have a smooth pancake batter. The consistency should be similar to traditional pancake batter.
3. Heat a non-stick pan or griddle over medium heat. Add a small amount of butter or oil to grease the surface.
4. Pour a small ladleful of the pancake batter onto the pan to form a round pancake. Cook for about 2-3 minutes or until bubbles start to form on the surface.
5. Flip the pancake and cook the other side for another 1-2 minutes until it's cooked through.
6. Repeat the process with the remaining batter.
7. Serve the chocolate pancakes warm, and you can enjoy them as they are or with a drizzle of maple syrup or chocolate sauce.

These recipes should make good use of the ingredients you have without the need for anything extra. Enjoy your chocolatey treats! Let me know if there's anything else I can help you with. Happy cooking!
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
  
    const formattedParagraph1 = `Based on the ingredients you listed, I recommend making a simple but delicious dish. Here's the recipe<br/>:\n\n<br/><p>Ingredients:<br/>\n${formattedIngredients}</p>\n\n<p>Instructions:<br/>\n${instructionsSection}</p>\n`;
    const formattedParagraph2 = `Based on the ingredients you listed, I recommend making a simple but delicious dish. Here's the recipe:\n\n>Ingredients:\n${formattedIngredients}\n\nInstructions:\n${instructionsSection}\n`;
  
    return {formattedParagraph1, formattedParagraph2};
  }
app.get('/home', (req, res) => {
  res.sendFile(__dirname+"/index.html")
})

app.get('/download', (req, res)=>{
    pdfDoc.end();
    
    setTimeout(()=>{res.download(__dirname+"/Recipe.pdf", (err)=>console.log(err))}, 2000)
})

app.post('/new', async (req, res)=>{

    newMessages.push(req.body)
    pdfDoc.fillColor('blue').text(req.body.content+'\n')
    console.log("newMessages", newMessages)
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: newMessages,
        temperature:1.73
      });
      console.log(completion.data);
      pdfDoc.fillColor('red').text(completion.data.choices[0].message.content)
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
    pdfDoc.fillColor('blue').text(req.body.content)
    console.log("suggestMessages", suggestMessages)
    const completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: suggestMessages,
      });
      console.log(completion.data);
      messages = completion.data.choices[0].message
      var formatted= formatIngredientsParagraph(messages.content)
    pdfDoc.fillColor('red').text(messages.content)
      console.log("formated", formatted)
      suggestMessages.push(messages)
      res.send(messages.content)
})
app.post('/test', (req, res)=>{
    console.log(req.body)
    var object = {'role':'user', 'content':'hello'}
    res.send(JSON.stringify(object))
})


app.listen(3000, () => {
try{
  console.log(`App listening....`)
}catch{
    console.log("something went wrong")
}
})