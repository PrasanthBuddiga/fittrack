import { API_BASE_URL } from "./config.js";

import {setMainBdyHTML,cacheDOMElements,initiateCalendar,attachEventListeners} from './mainJS.js'

export const userContent=`
 <div class="header-wrap">
    <h1>fittrack <span>.</span></h1>
    <nav class="main-nav">
    <ul class="nav-list">
      <li class="list-elem"><a href="#dashboard">DASHBOARD</a></li>
      <li class="list-elem"><a href="#food/diary">FOOD</a></li>
      <li class="list-elem"><a href="#">EXERCISE</a></li>
      <li class="list-elem profile"><a href="#profile">PROFILE</a></li>
      <li class="list-elem logout"><a href="#logout">LOGOUT</a></li>
    </ul>
  </nav>
  </div>
  <div class="container">
    <div id="center_header">
     <h3 id='Welcome_quote'>Good Evening, <span id="userName"></span></h3>
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
  <h4 id="prfl-name"></h4>
  
</div>
<div id="calendar"></div>
<div id="macro-calc" class="macro-dash">
  <img id="chef_img" src="./imgs/Chef_Hat.png">
  <p id="recipe_txt">Delicious healthy recipes coming soon..</p>
</div>
</div>
`;
export const loginPageHTML=`

  <div id='first-half'>
    <h1>fittrack.</h1>
  </div>
  <div id='second-half'>
  </div>
  <div id="loginFormCont" class=".hide">
      <p>MEMBER LOGIN</p>
      <input id='emailID' type="email" placeholder="Enter email address" />
      <input id='password' type="password" placeholder="Enter password" />
      <div id="link_hldr"><a href="">Forgot Password ?</a><a href="#signup">New user? Sign up here!</a></div>
      <div id="place_hldr"></div>
      <div id='login_btn' class="btn">LOGIN</div>
      <div>or</div>
      <div class="google_btn btn"><span><img src='./imgs/google_logo.png' /></span>Continue with Google</div>
      <div class="fb_btn btn"><span><img src='./imgs/facebook_logo.png' /></span>Continue with Facebook</div>
  </div>
  <div id="signUpFormCont" class="hide">
      <p>MEMBER SIGN-IN</p>
      <input id='userName_s' type="text" placeholder="Enter a user name" />
      <input id='emailID_s' type="email" placeholder="Enter email address" />
      <input id='password_s' type="password" placeholder="Enter password" />
      <input id='re-enter_password_s' type="password" placeholder="Re-enter password" />
      <div id="place_hldr_s"></div>
      <div id='signup_btn' class="btn">SIGN IN</div>
  </div>
`
export async function  login(){
const place_hldr= document.getElementById("place_hldr");
const email=document.getElementById("emailID").value.trim();
const password=document.getElementById("password").value.trim();
place_hldr.innerHTML='';
if(!email||!password){
  place_hldr.innerHTML="Enter both email and password to login!";
  return;
}
 const url=`${API_BASE_URL}/api/login`;
const response=await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email:email,password:password})
    })
const result = await response.json();
if (response.status === 200) {
  console.log("logged in User", result);
    // Now render the full app layout before changing the hash
    localStorage.setItem('authToken',result.token);
    localStorage.setItem('userName',result.userName);
    localStorage.setItem('user',JSON.stringify(result))
    setMainBdyHTML(userContent); // load layout
    document.getElementById("userName").innerHTML=result.userName + "!";
    document.getElementById("prfl-name").innerHTML=result.userName ;
    setTimeout(() => {
      cacheDOMElements();
      initiateCalendar();
      attachEventListeners();
      window.location.hash = "#dashboard"; // only after everything is ready
    }, 0);
  } else if (result.error==='User not found'){
    place_hldr.innerHTML="User does not exist!";
  }
  else if(result.error==="Invalid password"){place_hldr.innerHTML="Enter valid password for the user!";}
  else place_hldr.innerHTML="Unable to login at this moment. Please visit back in sometime!!";
}
export function showSignUp(){
  document.getElementById('loginFormCont').classList.add('hide');
  document.getElementById('signUpFormCont').classList.remove('hide');
  document.getElementById('signup_btn').addEventListener('click',()=>{signup();}  )
}
async function signup  ()  {
  const userName=document.getElementById("userName_s").value.trim();
  const email = document.getElementById("emailID_s").value.trim();
  const password = document.getElementById("password_s").value.trim();

  const response = await fetch(`${API_BASE_URL}/api/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password,userName })
  });

  const result = await response.json();
  console.log(result);
  if (response.status === 201) {
    alert("Signup successful! Please login.");
    window.location.hash = "#login";
  } else {
   console.log(result.error || "Signup failed");
  }
  
};
