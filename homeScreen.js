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
const defaultReviewType = "Daily";

const user = sessionStorage.getItem('userID');

//Document Elements
const logoutButton = document.getElementById('logoutButton');
const afterdeck = document.getElementById('afterDeck');
const selectAllDecks = document.getElementById('selectAll');
const deleteButton = document.getElementById('deleteDeck');
const deckList = document.getElementById('DeckList');

const createDeckSection = document.getElementById('createDeckSection');
const newDeckName = document.getElementById('DeckName');
const warningMessage = document.getElementById('warningMessage');
const cancelButton = document.getElementById('Cancel');

var numCheckboxesClicked = 0;

async function listen2SelectAll(){
  selectAllDecks.addEventListener("click", async e=>{
    const deckIDs = await getDeckIDs();
    if (selectAllDecks.checked){
      //check all boxes
      for (let index = 0; index < deckIDs.length; index++){
        document.getElementById("check" + deckIDs[index]).checked = true;
        document.getElementById("check" + deckIDs[index]).style.visibility = "visible";
        document.getElementById("line" + deckIDs[index]).style.backgroundColor = "#def1fd";
        document.getElementById("line" + deckIDs[index]).style.color = "black";
        numCheckboxesClicked = deckIDs.length;
      }
    }else{
      //UNcheck all boxes
      for (let index = 0; index < deckIDs.length; index++){
        document.getElementById("check" + deckIDs[index]).checked = false;
        document.getElementById("check" + deckIDs[index]).style.visibility = "hidden";
        document.getElementById("line" + deckIDs[index]).style.backgroundColor = "#12a5da";
        document.getElementById("line" + deckIDs[index]).style.color = "white";
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
    const deckIDs = await getDeckIDs();
    if (confirm("Are you sure you want to delete the deck(s)?\nIt will also delete all the flashcards inside") == true)
    {
      for (let index = 0; index < deckIDs.length; index++){
        const deckID = deckIDs[index];
        if (document.getElementById("check" + deckID).checked){
          console.log("Deck being deleted: " + deckID)
          await DeleteDeck(deckID);
          deckList.removeChild(document.getElementById("line" + deckID));
        }
      }
      deleteButton.style.visibility = "hidden";
      //window.location.href = "./homeScreen.html";   //reload the webpage after delete
    }
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

//retrieve the deckIDs of user
async function getDeckIDs(){
  const decks = query(collection(db, "decks"), where("userID", "==", user));
  const decksSnapshot = await getDocs(decks);
  var deckIDs = [];
  var counter = 0;

  //get existing deck ids
  decksSnapshot.forEach((deck) => {
    deckIDs[counter] = deck.id;
    ++counter;
  });
  return deckIDs;
}

//displays add deck button for less than 5 decks
async function displayAddDecksButton()
{
  const numDecks = await getNumDecks();
  console.log(numDecks)
  if (numDecks < 20)
  {
    var addDecks = document.createElement("button")
    addDecks.innerHTML = "+";
    addDecks.id = "addDecks";
    addDecks.className = "add-decks";
    afterdeck.appendChild(addDecks);
    addDecks.addEventListener("click", async e =>{
      //if user presses add deck button, go to createDeck.html
      //window.location.href = "./createDeck.html";
      createDeckSection.style.display = "flex";
      addDecks.style.visibility = "hidden";
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
    deckLine.setAttribute('id', "line" + deck.id);
    deckLine.className = "deck-line";
    
    // checkbox
    var checkbox4Delete = document.createElement("input");
    checkbox4Delete.type = "checkbox";
    checkbox4Delete.id = "check" + deck.id;
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
      sessionStorage.setItem("DeckID", deck.id);
      sessionStorage.setItem("PrevHTMLPg", "homeScreen");
      window.location.href = "./deckDetails.html";
      deckLine.style.transform = "translate(-5px, 5px)";
      deckLine.style.boxShadow = "none";
    });

    startReviewButton.addEventListener("click", async e =>{
      //save cookie of deck clicked by user
      sessionStorage.setItem("DeckID", deck.id);
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

async function DeckCreate(DeckNameD, userIDD)//same situation for CardCreate function in terms of variables
{
    return new Promise((resolve) =>{
        //this variation allows us to specify the document ID rather than letting it randomize
        console.log("Adding deck... in DeckCreate")
        addDoc(collection(db, "decks"),
        {
            userID: userIDD,
            DeckName: DeckNameD,
            reviewType: defaultReviewType,
            orderType: defaultOrderType,
            numNewCards: 0,
            resume: null
        }).then((docRef) => {
                console.log("Entire Document has been deleted successfully.")
                console.log("docRef.id: " + docRef.id)
                sessionStorage.setItem("DeckID", docRef.id);
                resolve();
            }).catch(error => {
                console.log("ERROR here!")
                console.log(error);
            });
    })
}

async function listen2CreateDeck(){
    
  createDeckSection.addEventListener("submit", async e =>{
      e.preventDefault();
      var numDecks = await getNumDecks();
      //check that the number of decks is < 5
      if (numDecks >= 20){
          warningMessage.innerHTML = "Maximum of 20 decks already created. Returning to home in 5 seconds."
          warningMessage.style.color = "red";
          await delay(5000);
          window.location.href = "./homeScreen.html";
      }
      //check that inputted deck name is not empty
      else if (newDeckName.value.length === 0){
          warningMessage.innerHTML = "Deck name can not be empty.";
          warningMessage.style.color = "red";
      }
      else{
          console.log("Inputted Deck Name: " + newDeckName.value)
          console.log("user: " + user)
          //check that inputted deck name is unique (APPLIES TO ALL REGARDLESS OF USER)
          const decks = query(collection(db, "decks"), where('userID', '==', user));
          const decksSnapshot = await getDocs(decks);
          var existingDeckNames = [];
          var counter = 0;
          console.log("Successfully queried")

          //get existing deck names
          decksSnapshot.forEach((deck) => {
              existingDeckNames[counter] = deck.data().DeckName;
              ++counter;
          });

          if (existingDeckNames.includes(newDeckName.value)){
              //inputted deck name already exists
              warningMessage.innerHTML = "Deck name already exists. Please try another."
              warningMessage.style.color = "red";
              newDeckName.value = "";                 //reset value
          }
          else{
              //inputted deck name is unique
              //add deck
              console.log("Creating deck...")
              await DeckCreate(newDeckName.value, user);
              console.log("Successfully created!");
              window.location.href = "./deckDetails.html";
          }
      }
  })

  cancelButton.addEventListener("click", async e =>{
      //return to home screen
      //window.location.href = "./homeScreen.html";
      var addDecks = document.getElementById("addDecks");
      createDeckSection.style.display = "none";
      addDecks.style.visibility = "visible";
  })
}

//listen4DeleteDeck();
listen4Logout();
displayDecks();
displayAddDecksButton();
listen2CreateDeck();