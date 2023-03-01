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
    collection,
    query,
    where,
    doc,
    updateDoc,
    getDoc, 
    orderBy,
    onSnapshot,
    getDocs
  } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';

let db = getFirestore(app);

//CONSTANTs
const nullDate = "2023/01/01";
const defaultOrderType = "Random";

//Document Elements
const deckArea = document.getElementById('deckArea');
const afterdeck = document.getElementById('afterdeck');

const decks = query(collection(db, "Decks"));
var flashcardSnapshot = await getDocs(flashcards);

//Level initialized to 0
//nextDateAppearance initialize to nullDate
function CardCreate(AnswerD, DeckIDD, QuestionD)//I am using place holder names so that you know what goes where, change these variables as you see fit.
{
  //the 'D' was added to the variables to distinguish them as the data
  //document ID for these will end up being randomized
  db.collection("Flashcard").add({
    Answer: AnswerD,
    Level: 0,
    DeckID: DeckIDD,
    Question: QuestionD,
    nextDateAppearance: nullDate
  });
}

//OrderType by default = "Random"
function DeckCreate(DeckNameD, reviewTypeD, userIDD)//same situation for CardCreate function in terms of variables
{
  //this variation allows us to specify the document ID rather than letting it randomize
  db.collection("decks").doc(DeckNameD).set({
    DeckName: DeckNameD,
    reviewType: reviewTypeD,
    userID: userIDD,
    orderType: defaultOrderType
  });
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

function DeleteDeck(DocID) //it is expected that the id of the deck being deleted will be provided to this function
{
  //*NOTE* secondary functionallity needed: if deck is empty, then delete the deck
  //                                        if deck is not empty, then confirm that the user wants to delete the deck
  const DeckRef = doc(db, "decks", DocID);
  deleteDoc(CardRef).then(() => {
    console.log("Entire Document has been deleted successfully.")
    }).catch(error => {
    console.log(error);
    });
}

//displays add deck button for less than 5 decks
async function displayAddDecksButton()
{
  console.log(decks[0]);
  if (decks.length < 5)
  {
    var addDecks = document.createElement("button")
    addDecks.style.height = "25px";
    addDecks.style.width = "25px";
    addDecks.style.borderRadius = "15%";
    addDecks.style.color = "black";
    addDecks.style.backgroundColor = "white";
    afterdeck.appendChild(addDecks);
  }
}

// displays the user's decks on the home screen
async function displayDecks()
{
  const decks = doc(db, "Decks");
  for (let index = 0; index < decks.length; index++)
  {
    var deck_i = document.createElement("button");
    deck_i.id = "deck" + index.toString();
    deck_i.innerHTML = decks[index].DeckID;
    deckArea.appendChild(deck_i);
    deckArea.addEventListener("click", resolve);
  }
  await waitForDeckSelection;
}

displayAddDecksButton();