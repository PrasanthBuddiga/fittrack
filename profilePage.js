import { API_BASE_URL } from "./config.js";
export async function renderProfilePage(params) {
  const userName=localStorage.getItem("userName");
  const existinInfo=JSON.parse(localStorage.getItem('user'));
  const profilePageHTML=`
  <div id="edit_header">
  <h4>Edit your profile</h4>
  <div class="btn-group">
      <button class="edit-btn">EDIT</button>
      <button class="save-btn hide">&#10004;</button>
      <button class="cancel-btn hide">&#10006;</button>
    </div>
  </div>
  <div class="profile-container">
  <p id="error_msg" class="hide">Amount of Protien, Carbs and Fats should sum up to 100!!</p>
  <div class="profile-field" data-key="name">
    <label>User Name</label>
    <span class="value">${existinInfo.userName}</span>
    <input class="edit-input hide" value='${existinInfo.userName}' type="text" />
  </div>
  <div class="profile-field" data-key="password">
    <label>Password</label>
    <span class="value">********</span>
    <input class="edit-input hide" type="password" />
  </div>
  <div class="profile-field" data-key="height">
    <label>Height (cm)</label>
    <span class="value">${existinInfo.height || '0'}</span>
    <input class="edit-input hide" value=${existinInfo.height} type="number" />
  </div>
  <div class="profile-field" data-key="weight">
    <label>Current Weight (kg)</label>
    <span class="value">${existinInfo.weight|| '0'}</span>
    <input class="edit-input hide" value=${existinInfo.weight} type="number" />
  </div>
  <div class="profile-field" data-key="targetWeight">
    <label>Target Weight (kg)</label>
    <span class="value">${existinInfo.targetWeight|| '0'}</span>
    <input class="edit-input hide" value=${existinInfo.targetWeight} type="number" />
  </div>
  <div class="profile-field" data-key="targetCalories">
    <label>Target Calories</label>
    <span class="value">${existinInfo.targetCalories|| '0'}</span>
    <input class="edit-input hide" id="calorie_inpt" value=${existinInfo.targetCalories} type="number" />
  </div>
  <div class="profile-field" data-key="targetProtein">
    <label>Target Protein (%)</label>
    <span class="value">${existinInfo.targetProtein|| '0'} </span>
    <input id="protein_inpt" value=${existinInfo.targetProtein}  class="edit-input hide" type="number" />
  </div>
  <div class="profile-field" data-key="targetCarbs">
    <label>Target Carbs (%)</label>
    <span class="value">${existinInfo.targetCarbs || '0'}</span>
    <input id="carbs_inpt" value=${existinInfo.targetCarbs} class="edit-input hide" type="number" />
  </div>
  <div class="profile-field" data-key="targetFat">
    <label>Target Fats (%)</label>
    <span class="value">${existinInfo.targetFat || '0'}</span>
    <input id="fats_inpt" value=${existinInfo.targetFat} class="edit-input hide" type="number" />
    
  </div>
</div>
  `
  document.getElementById('content').innerHTML=profilePageHTML;
  document.getElementById('log-fd').classList.add('hide');
  attachEventListeners();
}
export async function renderProfilePage1(params) {
  const userName=localStorage.getItem("userName");
  const existinInfo=JSON.parse(localStorage.getItem('user'));
  const profilePageHTML=`
  <div id='profile-cont'>
    <div id='prfl-img'></div>
    <div id='profile-info'>
      <h3>${userName}</h3>
      <p>32 years old</p>
      <p>Gender</p>
      <button id='editprfl_btn'>EDIT PROFILE</button>
    </div>
  </div>
  `
  document.getElementById('content').innerHTML=profilePageHTML;
  document.getElementById('log-fd').classList.add('hide');
  document.getElementById('editprfl_btn').addEventListener('click',()=>{
    renderProfilePage();
  })
}
function attachEventListeners() {
  console.log("attaching listeners");

  const profileFields = document.querySelectorAll(".profile-field");

  const proteinInpt = document.getElementById("protein_inpt");
  const carbsInpt = document.getElementById("carbs_inpt");
  const fatInpt = document.getElementById("fats_inpt");
  const targetCaloriesInpt = document.querySelector('[data-key="targetCalories"] input');

  const proteinSpan = document.querySelector('[data-key="targetProtein"] .value');
  const carbSpan = document.querySelector('[data-key="targetCarbs"] .value');
  const fatSpan = document.querySelector('[data-key="targetFat"] .value');

  const editBtn = document.querySelector('#edit_header .edit-btn');
  const saveBtn = document.querySelector('#edit_header .save-btn');
  const cancelBtn = document.querySelector('#edit_header .cancel-btn');
  const errorMsg = document.getElementById("error_msg");

  // Store initial values for cancel
  const initialValues = {};
  profileFields.forEach(field => {
    const key = field.dataset.key;
    const span = field.querySelector(".value");
    initialValues[key] = span.textContent.trim();
  });

  // EDIT
  editBtn.addEventListener("click", () => {
    profileFields.forEach(field => {
      const valueSpan = field.querySelector(".value");
      const input = field.querySelector(".edit-input");

      if (input && valueSpan) {
        input.classList.remove("hide");
        valueSpan.classList.add("hide");
        input.value = valueSpan.textContent.trim();
      }
    });
    saveBtn.classList.remove("hide");
    cancelBtn.classList.remove("hide");
    editBtn.classList.add("hide");
  });

  // SAVE
  saveBtn.addEventListener("click", () => {
    const p = Number(proteinInpt.value || 0);
    const c = Number(carbsInpt.value || 0);
    const f = Number(fatInpt.value || 0);

    if ((p + c + f) !== 100) {
      errorMsg.innerText='Protein, Carbohydrates, Fat percentage should sum to 100'
      errorMsg.classList.remove("hide");
      return;
    } else {
      errorMsg.classList.add("hide");
    }

    // Update spans and values
    profileFields.forEach(field => {
      const valueSpan = field.querySelector(".value");
      const input = field.querySelector(".edit-input");

      if (input && valueSpan) {
        const newValue = input.value.trim();
        valueSpan.textContent = newValue;
        valueSpan.classList.remove("hide");
        input.classList.add("hide");
      }
    });

    // Save to backend/local update
    const userInfo = {
      userName: document.querySelector('[data-key="name"] input').value,
      password: document.querySelector('[data-key="password"] input').value,
      height: document.querySelector('[data-key="height"] input').value,
      weight: document.querySelector('[data-key="weight"] input').value,
      targetWeight: document.querySelector('[data-key="targetWeight"] input').value,
      targetCalories: targetCaloriesInpt.value,
      targetProtein: proteinInpt.value,
      targetCarbs: carbsInpt.value,
      targetFat: fatInpt.value
    };

    updateUserInfo(userInfo);

    saveBtn.classList.add("hide");
    cancelBtn.classList.add("hide");
    editBtn.classList.remove("hide");
  });

  // CANCEL
  cancelBtn.addEventListener("click", () => {
    profileFields.forEach(field => {
      const key = field.dataset.key;
      const valueSpan = field.querySelector(".value");
      const input = field.querySelector(".edit-input");

      if (input && valueSpan) {
        input.classList.add("hide");
        valueSpan.classList.remove("hide");
        input.value = initialValues[key];
        valueSpan.textContent = initialValues[key];
      }
    });

    errorMsg.classList.add("hide");

    saveBtn.classList.add("hide");
    cancelBtn.classList.add("hide");
    editBtn.classList.remove("hide");
  });
}

async function updateUserInfo(userInfo) {
  const token=localStorage.getItem('authToken');
  const url=`${API_BASE_URL}/api/updateUserInfo`;
  const response=await fetch(url, {
    method:'POST',
    body:JSON.stringify(userInfo),
    headers:{
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  });
  if (!response.ok){
    console.log("error in updating",response.json().message);
    document.getElementById('error_msg').innerText='No changes are made!!';
    document.getElementById('error_msg').classList.remove('hide');
  }
  else {
    const data=await response.json();
    localStorage.setItem('user',JSON.stringify(data.user));
  }
}
function validateMacroValues(){
  const tartgetCaloriesValue=Number(document.getElementById("calorie_inpt").value);
  const targetCarbsValue=Number(document.getElementById("carbs_inpt").value);
const targetProteinValue=Number(document.getElementById("protein_inpt").value);
const targetFatsValue=Number(document.getElementById("fats_inpt").value);
if(tartgetCaloriesValue===0){return true}
else {
  if(targetProteinValue+targetFatsValue+targetCarbsValue===100) return true;
  else return false;
}
}