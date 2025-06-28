
// let selectedDateStr=sessionStorage.getItem('selectedDate');
// let selectedDate = selectedDateStr ? new Date(selectedDateStr) : new Date();
import {API_BASE_URL} from "./config.js";
import { showSpinner, hideSpinner,getHTMLForSpinner } from './spinner.js';


export let formattedDate;
let foodDiary;
let dayLog;
let listenersAttached = false;
// let isDiary=isDiary;
// const hiddenDateInput=document.getElementById('#date-picker');<button id="prev-date">←</button><button id="next-date">→</button>


 export function renderFood(content) {
  const selectedDateStr = sessionStorage.getItem('selectedDate');
  let selectedDate = selectedDateStr ? new Date(selectedDateStr) : new Date();
  content.innerHTML = `<div class="date-controls">
     <h3>Your Food Diary</h3>
      <div id="selected-date"></div>
    </div>
    <div id="foodLog"></div>
`

  // if(!selectedDate)selectedDate=new Date();
  updateSelectedDate(selectedDate);
  attachEventListeners();
  fetchFoodList();
  console.log(content)
}


function attachEventListeners() {
  // if (listenersAttached) return; // prevent attaching multiple times
  listenersAttached = true;

const prevBtn = document.getElementById('prev-date');
  const nextBtn = document.getElementById('next-date');
  const calendarIcon = document.getElementById('calendar-icon');
  const hiddenDateInput = document.getElementById('date-picker');

    const foodLogContainer = document.getElementById('foodLog');

  // Remove old event listener (in case it's duplicated)
  const newContainer = foodLogContainer.cloneNode(true);
  foodLogContainer.parentNode.replaceChild(newContainer, foodLogContainer);

  newContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove')) {
      const logId = e.target.getAttribute('log-id');
      removeLog(logId);
    }
  });
}
export function updateSelectedDate(selectedDate) {
  console.log("adding selected Date", selectedDate)
  sessionStorage.setItem('selectedDate', selectedDate.toISOString());
  const dateSpan = document.querySelector('#selected-date');
  formattedDate = selectedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    weekday: 'long'
  });
  if(dateSpan)dateSpan.innerHTML = formattedDate;
}

 async function  fetchFoodList(){
  showSpinner();
  await fetch(`${API_BASE_URL}/api/food-log`)
  .then(res=>{if(!res.ok) throw new Error("Failed to fetch Data");return res.json()})
  .then(data=>{
     foodDiary=data;
     getSelectedDayLog();
     displayDayLog();
  })
  .catch(err=>{console.log("Error fetching Data:", err)})
  .finally (()=>hideSpinner())
}
export function getSelectedDayLog(){
  dayLog='';
  let truncatedDate=formattedDate.split("y,")[1].slice(1);
  if (!foodDiary || !foodDiary.foodList || foodDiary.foodList.length === 0) return;
  else {
  foodDiary.foodList.forEach(element => {
    if(element.Date===truncatedDate){
      console.log("date matched")
      dayLog=element.foodLog;
      return;
    }
  });
}
}

export function displayDayLog(){
   const foodLogContainer=document.getElementById('foodLog');
   foodLogContainer.innerHTML='';
   let insertText='';
  //  console.log(dayLog)
   if(dayLog.length!==0) {for( let log in dayLog){
       foodLogContainer.innerHTML+=`<div class='log-cont'>
                      <div class='top-row'>
                        <p>${dayLog[log].name}</p>
                        <span>P:${dayLog[log].protein} gms</span>
                        <span>C:${dayLog[log].carbs} gms</span>
                        <span>F:${dayLog[log].fats} gms</span>
                        <p>${dayLog[log].calories} kcal</p>
                        <span class='remove material-icons' log-id="${dayLog[log].id}">delete</span>
                      </div>
       </div>`
   }
  }
  else foodLogContainer.innerHTML=`<p>No Food Logged for the day!</p>`
}
async function removeLog(logIndex){
//  dayLog.splice(logIndex, 1);
const url=`${API_BASE_URL}/api/food-log`;
let truncatedDate=formattedDate.split("y,")[1].slice(1);
  console.log(logIndex);
 const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({date:truncatedDate,id:logIndex})
    });
     if (response.ok) {
    console.log('Deleted successfully');

    await fetchFoodList(); // updates `foodDiary`
    getSelectedDayLog();   // updates `dayLog` based on current date
    displayDayLog(); 
  } else {
    const error = await response.json();
    console.error('Delete failed:', error);
  }

}
