import { renderFood,updateSelectedDate,getSelectedDayLog,displayDayLog } from "./foodJS.js";
import { renderAddFoodPage } from "./addFoodPage.js";
import { renderDashboard,loadWeightTracker,loadNutrientProgress,loadCalorieTracker,renderMacroChart } from "./dashboard.js";

export let isDiary=true;
const form = document.getElementById('food-form');
const foodList = document.getElementById('food-list');
const totalCaloriesEl = document.getElementById('total-calories');
const yesBtn=document.getElementById('yes_btn');
const noBtn=document.getElementById('no_btn');
const logoutDiv=document.getElementById('logout');
document.getElementById('logout')
document.getElementById('logout')
document.getElementById('logout')
export const contentDiv = document.getElementById('content');
const navLinks = document.querySelectorAll('.list-elem a');
const logFdBtn=document.getElementById("log-fd");
let lastHash = null;
setLogFoodButton()

function setLogFoodButton(){
  if(window.location.hash==='#dashboard') logFdBtn.style.display = 'none';
 else {
  logFdBtn.style.display = 'block';
logFdBtn.innerHTML=isDiary?'Log Food':'Show Diary';

 } 
}
// renderFood(contentDiv);

// console.log(contentDiv);

let foodLog = [];


function handleRoute() {
  const hash = window.location.hash;
  
   console.log("Handling route for:", hash);

  if (hash === lastHash) {
    console.log("Same hash as last time, skipping...");
    return;
  }
  lastHash = hash;

  switch (hash) {
    case "#dashboard":
    case "":
      renderDashboard(contentDiv);
      
      hideCalendar();
      break;
    case "#food/diary":
    isDiary = true;
    setLogFoodButton();
    renderFood(contentDiv);
    initiateCalendar()
    showCalendar();
    break;
    case "#food/add":
    isDiary = false;
    setLogFoodButton();
    renderAddFoodPage(contentDiv);
    showCalendar();
    break;
    case "#exercise":
      renderExercise();
      hideCalendar();
      break;
    case "#logout":
      renderLogout();
      hideCalendar();
      break;
    default:
      renderNotFound();
  }
}
yesBtn.addEventListener('click',()=>{
  logoutDiv.classList.add('hide');
  window.location.hash="#dashboard";
  document.body.style.overflowY = 'auto';
});
noBtn.addEventListener('click',()=>{
  logoutDiv.classList.add('hide');
  window.location.hash="#food/diary";
  document.body.style.overflowY = 'auto';
})
window.addEventListener("hashchange", ()=>{
  console.log("Hash changed to:", window.location.hash);
  setLogFoodButton()
  handleRoute();
updateActiveLink();
});
window.addEventListener("DOMContentLoaded",()=>{
  if (!window.location.hash) {
      window.location.hash = '#dashboard';
    }
initiateCalendar();
handleRoute();
updateActiveLink();
// document.getElementById('macro-calc').innerHTML=getMacroHTML();
} );

logFdBtn.addEventListener('click',()=>{
  window.location.hash = isDiary ? "#food/add" : "#food/diary";
  isDiary=!isDiary;

})
// logoutbtn.addEventListener('click',(e)=>{
//   // e.preventDefault();
// logoutDiv.classList.remove('hide');
// })

function initiateCalendar(){
  const selectedDateStr = sessionStorage.getItem('selectedDate');
  const selectedDate = selectedDateStr ? new Date(selectedDateStr) : new Date();

  const pad = (n) => n.toString().padStart(2, '0');
  const formattedDate = `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth() + 1)}-${pad(selectedDate.getDate())}`;


  const calendar = new VanillaCalendar('#calendar', {
      settings: {
        selected: {
        dates: [formattedDate],
        month: selectedDate.getMonth(), // JS is 0-based, calendar is 1-based
        year: selectedDate.getFullYear()
 
      },
        visibility: {
          theme: 'light', // or 'dark'
        },
        styles: {
          dateBtn: 'vc-date__btn'
        },
      },
      actions: {
      clickDay: (event) => {
      const [year, month, day] = event.target.dataset.calendarDay.split('-').map(Number);
        const dateSelected = new Date(year, month - 1, day);
       updateSelectedDate(dateSelected);
       
       if (window.location.hash === "#food/diary"){getSelectedDayLog();displayDayLog();}
      }
    }
    });
    calendar.init();
}

function renderHome() {
  contentDiv.innerHTML = `This page is under construction.Please proceed to log food or track the workout progress`
}

function renderExercise() {
  contentDiv.innerHTML = `This Exercise page is under construction.Please proceed to log food or track the workout progress`
}

//   e.preventDefault();

//   const foodName = document.getElementById('food-name').value.trim();
//   const calories = parseInt(document.getElementById('calories').value);

//   if (foodName && !isNaN(calories)) {
//     const entry = { food: foodName, calories };
//     foodLog.push(entry);

//     updateUI();
//     form.reset();
//   }
// });

function updateUI() {
  // Clear list
  foodList.innerHTML = '';

  // Re-render
  let total = 0;
  foodLog.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = `${item.food}: ${item.calories} kcal`;
    foodList.appendChild(li);
    total += item.calories;
  });

  totalCaloriesEl.textContent = total;
}
export function showModal(message) {
  console.log("inside modal")
  const modal = document.getElementById('customModal');
  const modalMsg = document.getElementById('modalMessage');
  modalMsg.textContent = message;
  modal.classList.remove('hidden');

  document.getElementById('modalOk').onclick = () => {
    modal.classList.add('hidden');
  };

  document.getElementById('closeModal').onclick = () => {
    modal.classList.add('hidden');
  };
}
function updateActiveLink(){
  const currentHash=window.location.hash;

  document.querySelectorAll('nav a').forEach(link=>{
  
    if(currentHash=='#food/add' && link.getAttribute('href').toLowerCase()==='#food/diary') {link.classList.add('active-link');}
    else if(link.getAttribute('href').toLowerCase()===currentHash){
      link.classList.add('active-link');
    } else link.classList.remove('active-link');
  });
}
function getMacroHTML(){
  const macroHtml=`
   <div class='macro-dash1'>
        <h3>TDEE Calculator</h3>
  <!-- Unit selection -->
  <div class="unit-toggle">
    <label>
      <input type="radio" name="unit" value="metric" checked>
      Metric (kg, cm)
    </label>
    <label>
      <input type="radio" name="unit" value="us">
      US (lbs, inches)
    </label>
  </div>

  <!-- Gender -->
  
  <div class="form-group">
    <label><input type="radio" name="gender" value="male" checked> Male</label>
    <label><input type="radio" name="gender" value="female"> Female</label>
  </div>

  <!-- Age -->
  <div class="form-group age-group">
    <label for="age">Age:</label>
    <input type="number" id="age" name="age" min="10" max="100" required>
  </div>

  <!-- Height -->
  <div class="form-group height-group" data-unit="metric">
    <label for="height">Height (cm):</label>
    <input type="number" id="height" name="height" required>
  </div>
  <div class="form-group height-group" data-unit="us" style="display:none;">
    <label>Height:</label>
    <input type="number" id="height-ft" name="height-ft" placeholder="Feet">
    <input type="number" id="height-in" name="height-in" placeholder="Inches">
  </div>

  <!-- Weight -->
  <div class="form-group weight-group" data-unit="metric">
    <label for="weight">Weight (kg):</label>
    <input type="number" id="weight" name="weight" required>
  </div>
  <div class="form-group weight-group" data-unit="us" style="display:none;">
    <label for="weight-lbs">Weight (lbs):</label>
    <input type="number" id="weight-lbs" name="weight-lbs">
  </div>

  <!-- Activity Level -->
  <div class="form-group">
    <label for="activity">Activity Level:</label>
    <select id="activity" name="activity">
      <option value="1.2">Sedentary (little to no exercise)</option>
      <option value="1.375">Lightly active (light exercise/sports 1-3 days/week)</option>
      <option value="1.55">Moderately active (moderate exercise/sports 3-5 days/week)</option>
      <option value="1.725">Very active (hard exercise/sports 6-7 days/week)</option>
      <option value="1.9">Extra active (very hard exercise or physical job)</option>
    </select>
  </div>

  <button id="calculateBtn">Calculate TDEE</button>

  <!-- Output -->
  <div id="tdeeResult" class="result">
  Target intake is 2400 Cal
  </div>
  </div>
  `
  return macroHtml;
}
function hideCalendar(){
  document.getElementById('calendar').classList.add('hide');
  document.getElementById('macro-calc').classList.remove('hide');
}
function showCalendar(){
  document.getElementById('calendar').classList.remove('hide');
  document.getElementById('macro-calc').classList.add('hide');
}
function renderLogout(){
  logoutDiv.classList.remove('hide');
  document.body.style.overflowY = 'hidden';
}
