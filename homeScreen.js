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
const deckArea = document.getElementById('deckArea');
const afterdeck = document.getElementById('afterDeck');
const logoutButton = document.getElementById('logoutButton');

//Level initialized to 0
//nextDateAppearance initialize to nullDate
function CardCreate(AnswerD, DeckIDD, QuestionD)//I am using place holder names so that you know what goes where, change these variables as you see fit.
{
  //the 'D' was added to the variables to distinguish them as the data
  //document ID for these will end up being randomized
  addDoc(collection(db, "Flashcard"),     
    {
      DeckID: DeckIDD,
      Question: QuestionD,
      Answer: AnswerD,
      Level: 0,
      nextDateAppearance: nullDate
    }
  );
}


function UpdateCard (DocID, Question, Answer)//it is expected that the id of the card being updated will be provided to this function
{
  //create reference variables for the document and the data that will be updated
  const CardRef = doc(db, "Flashcard", DocID);
  const data = {
    Question: Question,
    Answer: Answer
  };
  //function that updates the document; adds info to the console if successful or not
  updateDoc(CardRef, data).then(docRef => {
    console.log("Updates have been made to the card");
  }).catch(error => {
    console.log(error);
    })
}

function DeleteCard(DocID) //it is expected that the id of the card being deleted will be provided to this function
{
  const CardRef = doc(db, "Flashcard", DocID);
  deleteDoc(CardRef).then(() => {
    console.log("Entire Document has been deleted successfully.")
    }).catch(error => {
    console.log(error);
    });
}

//DeleteDeck to be fixed...
async function DeleteDeck(DeckID) //it is expected that the id of the deck being deleted will be provided to this function
{
  
  const DeckRef = doc(db, "decks", DeckID);
  
  const deckSearch = query(collection(db, 'Flashcard'), where('DeckID', '==', DeckID));
  const batch = writeBatch(db);//create batch

  const deckSearchQuerySnapshot = await getDocs(deckSearch);//get documents related to the query

  deckSearchQuerySnapshot.forEach(doc => batch.delete(doc.ref));//delete all the documents related to the query

  batch.commit();

  deleteDoc(DeckRef).then(() => {
    console.log("Entire Document has been deleted successfully.")
    }).catch(error => {
    console.log(error);
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

//displays add deck button for less than 5 decks
async function displayAddDecksButton()
{
  const numDecks = await getNumDecks();
  console.log(numDecks)
  if (numDecks < 5)
  {
    var addDecks = document.createElement("button")
    addDecks.innerHTML = "+";
    addDecks.style.height = "25px";
    addDecks.style.width = "25px";
    addDecks.style.borderRadius = "15%";
    addDecks.style.color = "black";
    addDecks.style.backgroundColor = "white";
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
  var index = 0;
  decksSnapshot.forEach((deck) => {
    var deck_i = document.createElement("button");
    deck_i.id = "deck" + index.toString();
    deck_i.innerHTML = deck.data().DeckName;
    deckArea.appendChild(deck_i);
    deckArea.appendChild(document.createElement("br"));
    deckArea.appendChild(document.createElement("br"));

    //listen to see if user clicks on a deck
    //If so, start a review session
    deck_i.addEventListener("click", async e =>{
      //save cookie of deck clicked by user
      sessionStorage.setItem("DeckID", deck.data().DeckName);
      window.location.href = "./reviewSession.html";
    });
  });
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

listen4Logout();
displayDecks();
displayAddDecksButton();