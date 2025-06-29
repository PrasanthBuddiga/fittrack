import { API_BASE_URL } from "./config.js";

import {setMainBdyHTML,cacheDOMElements,initiateCalendar,attachEventListeners} from './mainJS.js'

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
export const loginPageHTML=`

  <div id='first-half'>
  </div>
  <div id='second-half'>
  </div>
  <div id="loginFormCont">
      <p>MEMBER LOGIN</p>
      <input id='emailID' type="email" placeholder="Enter email address" />
      <input id='password' type="password" placeholder="Enter password" />
      <a href="">Forgot Password ?</a>
      <div id='login_btn' class="btn">LOGIN</div>
      <div>or</div>
      <div class="google_btn btn"><span><img src='./imgs/google_logo.png' /></span>Continue with Google</div>
      <div class="fb_btn btn"><span><img src='./imgs/facebook_logo.png' /></span>Continue with Facebook</div>
    </div>
`
export async function  login(){

  console.log("clicked login")
 const url=`${API_BASE_URL}/api/login`;
const response=await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email:document.getElementById("emailID").value.trim(),password:document.getElementById("password").value.trim()})
    })
const result = await response.json();
if (response.status === 200) {
    // Now render the full app layout before changing the hash
    localStorage.setItem('authToken',result.token);
    setMainBdyHTML(userContent); // load layout
    setTimeout(() => {
      cacheDOMElements();
      initiateCalendar();
      attachEventListeners();
      window.location.hash = "#dashboard"; // only after everything is ready
    }, 0);
  } else {
    alert(result.error || "Login failed.");
  }
}
