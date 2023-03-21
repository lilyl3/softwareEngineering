// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjmx_8Xdr9-kqDsjs_zlhdupZJD0keO4M",
  authDomain: "weblogindemo-2640e.firebaseapp.com",
  projectId: "weblogindemo-2640e",
  storageBucket: "weblogindemo-2640e.appspot.com",
  messagingSenderId: "61954503747",
  appId: "1:61954503747:web:f1aaa27126f738a1c410f6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Add the Firebase products and methods that you want to use
// addDoc: adds new "row"
// collection: "table" of users, decks, flashcards, etc.
import {
    getFirestore,
    addDoc,
    setDoc,
    collection,
    query,
    where,
    doc,
    updateDoc,
    getDoc, 
    deleteDoc,
    writeBatch,
    getDocs
  } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';

let db = getFirestore(app);

//CONSTANTs
const nullDate = "2023/01/01";
const defaultOrderType = "Random";
const user = sessionStorage.getItem('userID');

//Document Elements
const logoutButton = document.getElementById('logoutButton');
const afterdeck = document.getElementById('afterDeck');
const selectAllDecks = document.getElementById('selectAll');
const deleteButton = document.getElementById('deleteDeck');
const deckList = document.getElementById('DeckList');

var numCheckboxesClicked = 0;

async function listen2SelectAll(){
  selectAllDecks.addEventListener("click", async e=>{
    const deckNames = await getDeckNames();
    if (selectAllDecks.checked){
      //check all boxes
      for (let index = 0; index < deckNames.length; index++){
        document.getElementById("check" + deckNames[index]).checked = true;
        document.getElementById("check" + deckNames[index]).style.visibility = "visible";
        document.getElementById("line" + deckNames[index]).style.backgroundColor = "#0041CA";
        numCheckboxesClicked = deckNames.length;
      }
    }else{
      //UNcheck all boxes
      for (let index = 0; index < deckNames.length; index++){
        document.getElementById("check" + deckNames[index]).checked = false;
        document.getElementById("check" + deckNames[index]).style.visibility = "hidden";
        document.getElementById("line" + deckNames[index]).style.backgroundColor = "#12a5da";
        deleteButton.style.visibility = "hidden";
        numCheckboxesClicked = 0;
      }
    }
    if(numCheckboxesClicked > 0){
      deleteButton.style.visibility = "visible";    //@Justin Do NOT remove the following line. Not for styling purposes
    }
    else{
      deleteButton.style.visibility = "hidden";     //@Justin Do not delete this line
    }
  })
}

//DeleteDeck to be fixed...
async function DeleteDeck(DeckID) //it is expected that the id of the deck being deleted will be provided to this function
{
  return new Promise(async (resolve) => {
    const DeckRef = doc(db, "decks", DeckID);
    const deckSearch = query(collection(db, 'Flashcard'), where('DeckID', '==', DeckID));
    const batch = writeBatch(db);//create batch

    const deckSearchQuerySnapshot = await getDocs(deckSearch);//get documents related to the query
    deckSearchQuerySnapshot.forEach(doc => batch.delete(doc.ref));//delete all the documents related to the query

    batch.commit();

    deleteDoc(DeckRef).then(() => {
      resolve("Completed Delete. Should return to main.");
      }).catch(error => {
        console.log(error);
      });
  });
}

async function listen2DeleteButton(){
  deleteButton.addEventListener("click", async e =>{
    const deckNames = await getDeckNames();
    for (let index = 0; index < deckNames.length; index++){
      const deckName = deckNames[index];
      if (document.getElementById("check" + deckName).checked){
        console.log("Deck being deleted: " + deckName)
        await DeleteDeck(deckName);
        deckList.removeChild(document.getElementById("line" + deckName));
      }
    }
    deleteButton.style.visibility = "hidden";
    //window.location.href = "./homeScreen.html";   //reload the webpage after delete
  });
}

//retrieve the total number of decks a user has
async function getNumDecks(){
  const decks = query(collection(db, "decks"), where("userID", "==", user));
  const decksSnapshot = await getDocs(decks);
  var numDecks = 0;
  decksSnapshot.forEach((deck) => {
    ++numDecks;
  });
  return numDecks;
}

//retrieve the total number of decks a user has
async function getDeckNames(){
  const decks = query(collection(db, "decks"), where("userID", "==", user));
  const decksSnapshot = await getDocs(decks);
  var deckNames = [];
  var counter = 0;

  //get existing deck names
  decksSnapshot.forEach((deck) => {
    deckNames[counter] = deck.data().DeckName;
    ++counter;
  });
  return deckNames;
}

//displays add deck button for less than 5 decks
async function displayAddDecksButton()
{
  const numDecks = await getNumDecks();
  console.log(numDecks)
  if (numDecks < 5)
  {
    var addDecks = document.createElement("button")
    addDecks.innerHTML = "+";
    addDecks.className = "add-decks";
    afterdeck.appendChild(addDecks);
    addDecks.addEventListener("click", async e =>{
      //if user presses add deck button, go to createDeck.html
      window.location.href = "./createDeck.html";
    })
  }
  else
  {
    console.log("ERROR: More than 5 decks created")
  }
}

// displays the user's decks on the home screen
async function displayDecks()
{
  const decks = query(collection(db, "decks"), where("userID", "==", user));
  const decksSnapshot = await getDocs(decks);
  decksSnapshot.forEach((deck) => {

    // overall deck line
    var deckLine = document.createElement('div');
    deckLine.setAttribute('id', "line" + deck.data().DeckName);
    deckLine.className = "deck-line";
    
    // checkbox
    var checkbox4Delete = document.createElement("input");
    checkbox4Delete.type = "checkbox";
    checkbox4Delete.id = "check" + deck.data().DeckName;
    checkbox4Delete.style.visibility = "hidden"; //@Justin Do NOT remove the following line. Not for styling purposes
    checkbox4Delete.className = "checkbox-4-delete";

    // button to open deck
    var deckButton = document.createElement('button');
    deckButton.className = "deck-button";
    deckButton.innerHTML = deck.data().DeckName;

    // start review button
    var startReviewButton = document.createElement("button");
    startReviewButton.innerHTML = "&#8594";
    startReviewButton.className = "start-review-button";

    // append elements to deckline
    deckLine.appendChild(checkbox4Delete);
    deckLine.appendChild(deckButton)
    deckLine.appendChild(startReviewButton);

    // append deckline to decklist
    deckList.appendChild(deckLine);

    //listen to see if user clicks on checkbox4Delete
    //if true, then unselect SelectAll checkbox if currently checked
    checkbox4Delete.addEventListener("click", e =>{
      if (selectAllDecks.checked){
        selectAllDecks.checked = false;
      }
    
      if (checkbox4Delete.checked){
        numCheckboxesClicked++;
        checkbox4Delete.style.visibility = "visible";
        deckLine.style.backgroundColor = "#0041CA";
      }else{
        numCheckboxesClicked--;
        deckLine.style.backgroundColor = "#12a5da";
      }
    
      if(numCheckboxesClicked > 0){
        deleteButton.style.visibility = "visible";   //@Justin Do NOT remove the following line. Not for styling purposes
      }
      else{
        deleteButton.style.visibility = "hidden";;     //@Justin Do not delete this line
      }
    });

    console.log(deckLine.innerText.substring(0, deckLine.innerText.length - 2));
    console.log(deckLine.innerText.length);
    console.log(deckLine.innerText.substring(0, deckLine.innerText.length - 2).length)

    //listen to see if user clicks on a deck
    //If so, start a review session
    deckButton.addEventListener("click", async e =>{
      //save cookie of deck clicked by user
      sessionStorage.setItem("DeckID", deckLine.innerText.substring(0, deckLine.innerText.length - 2));
      sessionStorage.setItem("PrevHTMLPg", "homeScreen");
      window.location.href = "./deckDetails.html";
      deckLine.style.transform = "translate(-5px, 5px)";
      deckLine.style.boxShadow = "none";
    });

    startReviewButton.addEventListener("click", async e =>{
      //save cookie of deck clicked by user
      sessionStorage.setItem("DeckID", deckLine.innerText.substring(0, deckLine.innerText.length - 2));
      sessionStorage.setItem("PrevHTMLPg", "homeScreen");
      window.location.href = "./reviewSession.html";
    });

    deckLine.addEventListener("mouseover", e =>{
      if (!selectAllDecks.checked){
        checkbox4Delete.style.visibility = "visible";   //@Justin Do NOT delete this line
        if (!checkbox4Delete.checked) {
          deckLine.style.opacity = "0.8";
        }
      }
    })

    deckLine.addEventListener("mouseout", e =>{
      if (!checkbox4Delete.checked){
        checkbox4Delete.style.visibility = "hidden";     //@Justin Do NOT delete this line\
        if (!checkbox4Delete.checked) {
          deckLine.style.opacity = "1";
        }
      }
    })
  });

  listen2SelectAll();
  listen2DeleteButton();
}

//listen to see if user clicks on the logout button
//If so, return to login page
async function listen4Logout(){
  logoutButton.addEventListener('click', async e => {
    e.preventDefault();         // Prevent the default form redirect
    console.log("Logging out")
    sessionStorage.clear();     // Clear all saved "cookies"
    window.location.href = "./login.html";
  });
}

//listen4DeleteDeck();
listen4Logout();
displayDecks();
displayAddDecksButton();