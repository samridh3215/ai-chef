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


var newMessages= [{"role": "system", "content": `You're a professional Chef, give recipes for the provided dish:
return the output as html elements within only a div element
###
dish:Chocolate Milkshake

recipe:
<div>
  <h1>Chocolate Milkshake</h1>
  <h2>Ingredients:</h2>
  <ul>
    <li>2 cups vanilla ice cream</li>
    <li>1 cup milk</li>
    <li>3 tablespoons chocolate syrup</li>
    <li>Whipped cream (for garnish)</li>
    <li>Chocolate shavings (for garnish)</li>
  </ul>

  <h2>Instructions:</h2>
  <ol>
    <li>Add the vanilla ice cream, milk, and chocolate syrup to a blender.</li>
    <li>Blend on high speed until the mixture is smooth and creamy.</li>
    <li>Pour the milkshake into a glass.</li>
    <li>Garnish with whipped cream and chocolate shavings.</li>
    <li>Optional: Drizzle some additional chocolate syrup on top for extra indulgence.</li>
    <li>Serve immediately and enjoy!</li>
  </ol>
</div>

###
dish:Ramen with Egg

recipe:
<div>
  <h1>Ramen with Egg</h1>
  <h2>Ingredients:</h2>
  <ul>
    <li>2 packs of instant ramen noodles</li>
    <li>4 cups water</li>
    <li>2 large eggs</li>
    <li>2 tablespoons soy sauce</li>
    <li>2 tablespoons sesame oil</li>
    <li>2 green onions, sliced</li>
    <li>1 tablespoon sesame seeds (optional)</li>
    <li>Chili oil or hot sauce (optional, for extra spice)</li>
  </ul>

  <h2>Instructions:</h2>
  <ol>
    <li>Boil the water in a large pot and cook the ramen noodles according to the package instructions. Drain the noodles and set them aside.</li>
    <li>While the noodles are cooking, prepare the eggs. In a separate saucepan, bring water to a boil and carefully add the eggs. Boil for 7 minutes for a slightly soft yolk or adjust the cooking time to your preference.</li>
    <li>Once the eggs are done, transfer them to a bowl of ice-cold water to stop the cooking process. Peel the eggs and set them aside.</li>
    <li>In a small bowl, mix soy sauce and sesame oil to create the seasoning sauce.</li>
    <li>Heat the sesame oil in a pan over medium heat. Add the cooked ramen noodles and the seasoning sauce. Toss everything together until the noodles are well coated with the sauce.</li>
    <li>Divide the seasoned ramen noodles into serving bowls.</li>
    <li>Cut the boiled eggs in half and place one or two halves on top of each bowl of ramen.</li>
    <li>Garnish the ramen with sliced green onions and sesame seeds (if using).</li>
    <li>For an extra kick, drizzle some chili oil or hot sauce on top.</li>
    <li>Serve hot and enjoy your delicious Ramen with Egg!</li>
  </ol>
</div>
###
Dish:
recipe:
    `}];
var suggestMessages = [{"role": "system", "content": `You're a professional Chef, give recipes when ingredients are provided to you, do not give extra ingredients if possible:
return the output as html elements within only a div element
###
ingredients:milk,maida,cocoa powder,sugar
recipe:
<div>
  <h2>Chocolate Pancakes</h2>
  <h3>Ingredients:</h3>
  <ul>
    <li>milk</li>
    <li>maida (all-purpose flour)</li>
    <li>cocoa powder</li>
    <li>sugar</li>
  </ul>
  <h3>Instructions:</h3>
  <ol>
    <li>In a mixing bowl, combine 1 cup of maida, 2 tablespoons of cocoa powder, and 2 tablespoons of sugar.</li>
    <li>Gradually add 1 cup of milk while stirring to form a smooth batter.</li>
    <li>Heat a non-stick pan over medium heat and lightly grease it.</li>
    <li>Pour a ladleful of the pancake batter onto the pan and spread it slightly to form a circle.</li>
    <li>Cook until bubbles start to appear on the surface, then flip the pancake and cook the other side until it's cooked through.</li>
    <li>Repeat the process with the remaining batter.</li>
    <li>Serve the chocolate pancakes warm with your favorite toppings like maple syrup, fresh berries, or whipped cream.</li>
  </ol>
</div>
###
ingredients:Pork chops
Eggplant
Chickpeas
Red bell peppers
Cherry tomatoes

recipe:
<div>
  <h2>Pork Chops with Roasted Vegetables</h2>
  <h3>Ingredients:</h3>
  <ul>
    <li>Pork chops</li>
    <li>Eggplant</li>
    <li>Chickpeas</li>
    <li>Red bell peppers</li>
    <li>Cherry tomatoes</li>
  </ul>
  <h3>Instructions:</h3>
  <ol>
    <li>Preheat your oven to 200°C (400°F).</li>
    <li>Season the pork chops with salt and pepper on both sides.</li>
    <li>Cut the eggplant and red bell peppers into bite-sized pieces.</li>
    <li>Drain and rinse the chickpeas.</li>
    <li>In a large mixing bowl, toss the eggplant, red bell peppers, chickpeas, and cherry tomatoes with a drizzle of olive oil, salt, and pepper.</li>
    <li>Spread the vegetables evenly on a baking sheet.</li>
    <li>In a separate pan, heat some oil over medium-high heat.</li>
    <li>Add the seasoned pork chops to the pan and sear them for about 3-4 minutes on each side until they get a golden brown crust.</li>
    <li>Transfer the seared pork chops on top of the vegetables on the baking sheet.</li>
    <li>Place the baking sheet in the preheated oven and roast for 15-20 minutes or until the pork chops are fully cooked and the vegetables are tender.</li>
    <li>Remove from the oven and let the pork chops rest for a couple of minutes before serving.</li>
    <li>Plate the roasted vegetables alongside the pork chops and serve hot.</li>
  </ol>
</div>

###
ingredients:
recipe:

`}]

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
    var prompt = req.body.content

    console.log("prompt", prompt)
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
      const img = await openai.createImage({
        prompt: `${prompt}`,
        n: 1,
        size: "256x256",
      });
    //   res.send(completion.data.choices[0].message)
    console.log(img)
      res.send(JSON.stringify({'text':formatted, 'img':img.data.data[0].url}))
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
app.post('/test', async (req, res)=>{
    console.log(req.body)
    var object = {'role':'user', 'content':'hello'}
    const img = await openai.createImage({
      prompt: "jalebi",
      n: 1,
      size: "256x256",
    });
    console.log(img.data.data[0].url)
})


app.listen(3001, () => {
try{
  console.log(`App listening....`)
}catch{
    console.log("something went wrong")
}
})
