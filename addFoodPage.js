// import { match } from "assert";
import { formattedDate } from "./foodJS.js";
import { contentDiv } from "./mainJS.js";
import {API_BASE_URL} from "./config.js";
import { hideSpinner, showSpinner } from "./spinner.js";

let matchedResults='';
export function renderAddFoodPage(contentDiv){
 contentDiv.innerHTML=
 `<div id="add-food">
    <h2 class='heading'>Add to the food Log</h2>
    <form>
    <input id="srch_inpt" type="text" placeholder="Search for a food"/>
    <button type="submit" id="srch-fd">Search</button>
    </form>
    <div id="search-section" style="display: none;">
    <h4 class='heading'>Matching Foods:</h4>
    <div id="results-wrapper">
    <div id="matched_rslt">
    <ul id='search-rslts'></ul>
    </div>
    <div id='add_qty'></div>
    </div>
    </div>
    </div>`

    attachEventListeners();
}

function attachEventListeners(){
  const search_btn=document.querySelector("#srch-fd");
  const search_inpt=document.querySelector("#srch_inpt");
  
  search_btn.addEventListener('click',(e)=>
  {e.preventDefault();
    
    // searchFoodNTRX(search_inpt.value);
    searchFood(search_inpt.value)
  });
}

async function  searchFood(foodName){
  const searchSection = document.getElementById('search-section');
   const url = `${API_BASE_URL}/api/usda/search?q=${encodeURIComponent(foodName)}`;
   showSpinner();
   try{
    const res=await fetch(url); 
    const data=await res.json();
    matchedResults=data.results;
    searchSection.style.display = 'block';
    renderSearchResults();
   } catch(err) {console.log(err)}
   hideSpinner();

   

}
async function searchFoodNTRX(foodName) {
  const searchSection = document.getElementById('search-section');
  const url=`${API_BASE_URL}/api/ntrx/search?food=${encodeURIComponent(foodName)}`;
  try{
    const res=await fetch(url);
    const data=await res.json();
    matchedResults=data.results;
    searchSection.style.display='block';
    renderSearchResultsNTRX();
   }catch(err){console.log("error from fs:"+err)}
}

function renderSearchResults(){
  const selectQtyDiv=document.getElementById('add_qty')
  document.getElementById('matched_rslt').innerHTML='';
   selectQtyDiv.innerHTML='';
  matchedResults.forEach(item => {
    let nutrientInfo='';
     if (item.nutrients.energy != null)
    nutrientInfo += `<p>${item.nutrients.energy} Cal</p>`;

  if (item.servingSize != null)
    nutrientInfo += `<p>Serving: ${item.servingSize}${item.servingSizeUnit}</p>`;

  if (item.nutrients.protein != null)
    nutrientInfo += `<p>Protein: ${item.nutrients.protein}g</p>`;

  if (item.nutrients.carbs != null)
    nutrientInfo += `<p>Carbs: ${item.nutrients.carbs}g</p>`;

  if (item.nutrients.fat != null)
    nutrientInfo += `<p>Fats: ${item.nutrients.fat}g</p>`;
    const insertText=`<li class='matched-item' tabindex=${item.fdcId}>
                      <p class='item-desc'>${item.brandName ? `${item.brandName} ${item.description}` : item.description}</p>
                      <div class='bottomRow'>
                      ${nutrientInfo}
                      </div>
                      </li>
                    `
document.getElementById('matched_rslt').innerHTML+=insertText;
});
document.getElementById('matched_rslt').addEventListener('click', (e) => {
  const item = e.target.closest('.matched-item');
  if (!item) return;

  const id = item.getAttribute('tabindex');
  const itemData = matchedResults.find(i => i.fdcId == id);

  renderQuantitySelector(itemData);
});


  }
function renderQuantitySelector(item) {
  const container = document.getElementById('add_qty');
  const hasServingSize = !!item.servingSize;
  const options = hasServingSize
    ? `
        <option value="100 gm">100gm</option>
        <option value="10 gm">10 gm</option>
        <option value="1 gm">1 gm</option>
        <option value="1 Serving">1 Serving</option>
      `
    : `<option value="1 Serving">1 Serving</option>`;
  container.innerHTML = `
    <h4>${item.description.split(",")[0] || "Food Name"}</h4>
    <div class='inputWrapper'>
      <input id="servingInput" type='text' value='1.0' /> 
      <span>servings of</span> 
      <select name="quantity" id="quantity">
        ${options}
      </select>
    </div>
    <button type="button" id="addToDiaryBtn">Add Food to Diary</button>
  `;

document.getElementById('addToDiaryBtn').addEventListener('click', async () => {
const servingQty = parseFloat(document.getElementById('servingInput').value);
const quantityText = document.getElementById('quantity').value;
let quantity=1;
    quantity = parseFloat(quantityText);
const totalConsumed = servingQty * quantity;

// Ensure item.servingSize is a number and not null
const multiFactor = totalConsumed / (item.servingSize || 1); // fallback to avoid division by 0

const output = {
  name: item.description,
  Qty: totalConsumed,
  protein: ((item.nutrients.protein || 0) * multiFactor).toFixed(1),
  carbs: ((item.nutrients.carbs || 0) * multiFactor).toFixed(1),
  fats: ((item.nutrients.fat || 0) * multiFactor).toFixed(1),
  calories: ((item.nutrients.energy || 0) * multiFactor).toFixed(1)
};
    console.log('Adding food to diary:', output);
    const response = await postFoodToDayLog(output);
    if (response?.message==='Food log inserted successfully') {
      showSpinner();
    setTimeout(()=>{hideSpinner()},2000);
    window.location.hash="#food/diary";
}
  });
}

  function renderSearchResultsNTRX(){
  document.getElementById('matched_rslt').innerHTML='';
  matchedResults.forEach(item=>{
    const insertText=`<li class='matched-item' tabindex=${item.brandedItemId||item.tagId}>
                      <p class='item-desc'>${item.brandName ? `${item.brandName} ${item.foodName}` : item.foodName}</p>
                      <div class='bottomRow'>
                      <p>${item.servingQty} ${item.servingUnit}</p>
                      <p>${item.calories} Cal</p>
                      </div>
                      </li>
                    `
document.getElementById('matched_rslt').innerHTML+=insertText;
const selectQtyDiv=document.getElementById('add_qty')
document.querySelectorAll('.matched-item').forEach(item=>{
  item.addEventListener('click',()=>{
   let id= item.getAttribute('tabindex');
   let isBranded=item.brandName?true:false;
     selectQtyDiv.innerHTML=
     `<h3>Food Name<h3>
      <div class='inputWrapper'>
<input type='text' value='1.0' /> <span>servings of</span> <select name="quantity" id="quantity">
  <option value="100 gm">100gm</option>
  <option value="10 gm">10 gm</option>
  <option value="1 gm">1 gm</option>
  <option value="1 Serving">1 Serving</option>
</select>
      </div>
   <button>Add Food to Diary</button>
     `
  })
})
  })
// contentDiv.innerHTML+=insertText;
}

async function postFoodToDayLog(output){
  const url=`${API_BASE_URL}/api/food-log`;
  const token=localStorage.getItem('authToken');

  try{
    console.log('sending the date ', formattedDate);
    let truncatedDate=formattedDate.split("y,")[1].slice(1);
  const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({date:truncatedDate,entry:output})
    });
    
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error('Failed to save food log:', error.message);
    }
  }