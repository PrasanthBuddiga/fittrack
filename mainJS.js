import { renderFood,updateSelectedDate,getSelectedDayLog,displayDayLog } from "./foodJS.js";
import { renderAddFoodPage } from "./addFoodPage.js";
import { renderDashboard,loadWeightTracker,loadNutrientProgress,loadCalorieTracker,renderMacroChart } from "./dashboard.js";
import {loginPageHTML,login,showSignUp} from './loginPage.js';
import { API_BASE_URL } from "./config.js";

export let isDiary=true;
export let contentDiv = null;
let form 
let foodList 
let totalCaloriesEl;
let yesBtn;
let noBtn;
let logoutDiv;
let main_bdy=document.getElementById('main-bdy');
let navLinks;
let logFdBtn;
let lastHash = null;

const userContent=`
 <div class="header-wrap">
    <h1>fittrack.</h1>
    <nav class="main-nav">
    <ul class="nav-list">
      <li class="list-elem"><a href="#dashboard">DASHBOARD</a></li>
      <li class="list-elem"><a href="#food/diary">FOOD</a></li>
      <li class="list-elem"><a href="#">EXERCISE</a></li>
      <li class="list-elem logout"><a href="#logout">LOGOUT</a></li>
    </ul>
  </nav>
   
  </div>

  <div class="container">
    <div id="center_header">
     <h3>Hello, <span>Prasanth!</span></h3>
     <div class="search-wrapper">
     <input class="Search" type="text" placeholder="Search anything" />
     </div>
</div>
    <div id="content"></div>
    <button id="log-fd">Log Food</button>
  </div>
<div class="third-grid">
<div class="profile-wrapper">
  <div class="prfl-pic">
    <img src="./imgs/pp_100x100.png" alt="">
  </div>
  <h4 class="prfl-name">Prasanth Buddiga</h4>
  <img src="./imgs/notification icon.png" alt="">
</div>
<div id="calendar"></div>
<div id="macro-calc" class="macro-dash"></div>
</div>
`;

export function cacheDOMElements(){
   form = document.getElementById('food-form');
 foodList = document.getElementById('food-list');
 totalCaloriesEl = document.getElementById('total-calories');
 yesBtn=document.getElementById('yes_btn');
 noBtn=document.getElementById('no_btn');
 logoutDiv=document.getElementById('logout');
 navLinks = document.querySelectorAll('.list-elem a');
 logFdBtn=document.getElementById("log-fd");
}

function setLogFoodButton(){
  if(window.location.hash==='#dashboard') logFdBtn.style.display = 'none';
 else {
  logFdBtn.style.display = 'block';
logFdBtn.innerHTML=isDiary?'Log Food':'Show Diary';

 } 
}

let foodLog = [];


async function handleRoute() {
  const hash = window.location.hash;
   const token = localStorage.getItem('authToken');
   const publicRoutes = ['#login', '#signup'];
   const protectedRoutes = ['#dashboard', '#food/diary', '#food/add', '#exercise'];
  
   if (!publicRoutes.includes(hash)) {
    if (!token) {
      window.location.hash = '#login';
      return;
    }
  //  const isLoginRoute = hash === "#login";

    const res = await fetch(`${API_BASE_URL}/api/verifyToken`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ token })
    });
    const result = await res.json();
    if (!result.valid) {
      localStorage.removeItem('authToken');
      window.location.hash = '#login';
      return;
    }
  }

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
    case "#login":
      setMainBdyHTML(loginPageHTML);
       document.getElementById('login_btn').addEventListener('click',()=>{
  login();
  
})
      break;  
       case "#signup":
       showSignUp();
      break;
    default:
      renderNotFound();
  }
}

window.addEventListener("hashchange", ()=>{
  console.log("Hash changed to:", window.location.hash);
  // setLogFoodButton()
  handleRoute();
updateActiveLink();
});
window.addEventListener("DOMContentLoaded",()=>{
  setMainBdyHTML(userContent);
  if (!window.location.hash||window.location.hash==="#signup") {
      window.location.hash = '#login';
    }
    setTimeout(()=>{
cacheDOMElements();
initiateCalendar();
handleRoute();
updateActiveLink();
setLogFoodButton();
attachEventListeners();
},0)

} );

export function attachEventListeners(){
  console.log("event listeners attached")
logFdBtn.addEventListener('click',()=>{
  window.location.hash = isDiary ? "#food/add" : "#food/diary";
  isDiary=!isDiary;

});
yesBtn.addEventListener('click',()=>{
  localStorage.removeItem("authToken");
  logoutDiv.classList.add('hide');
  window.location.hash="#login";
  document.body.style.overflowY = 'auto';
});
noBtn.addEventListener('click',()=>{
  logoutDiv.classList.add('hide');
  window.location.hash="#dashboard";
  document.body.style.overflowY = 'auto';
})

}


// logoutbtn.addEventListener('click',(e)=>{
//   // e.preventDefault();
// logoutDiv.classList.remove('hide');
// })

export function initiateCalendar(){
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
export function setMainBdyHTML(text){
main_bdy.innerHTML=text;
contentDiv = document.getElementById('content');
}