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
const deck = "math";//sessionStorage.getItem('DeckID');

//Document Elements
const deckTitle = document.getElementById('deckTitle');
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

//OrderType by default = "Random"
async function DeckCreate(DeckNameD, reviewTypeD, userIDD)//same situation for CardCreate function in terms of variables
{
  //this variation allows us to specify the document ID rather than letting it randomize
  setDoc(doc(db, "decks", DeckNameD),
  {
    userID: userIDD,
    DeckName: DeckNameD,
    reviewType: reviewTypeD,
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
async function getNumFlashcards(){
  const flashcards = query(collection(db, "Flashcard"), where("DeckID", "==", deck));
  const flashcardsSnapshot = await getDocs(flashcards);
  var numFlash = 0;
  flashcardsSnapshot.forEach((FC) => {
    ++numFlash;
  });
  return numFlash;
}

//displays add deck button for less than 5 decks
async function displayAddFlashcardsButton()
{
  const numFlash = await getNumFlashcards();
  console.log(numFlash)
  if (numFlash < 15)
  {
    var addDecks = document.createElement("button")
    addDecks.innerHTML = "+";
    addDecks.style.height = "25px";
    addDecks.style.width = "25px";
    addDecks.style.borderRadius = "15%";
    addDecks.style.color = "black";
    addDecks.style.backgroundColor = "white";
    afterdeck.appendChild(addDecks);
  }
  else
  {
    console.log("ERROR: More than 5 decks created")
  }
}

async function displayDeleteFlashcardsButton()
{
    var addDecks = document.createElement("button")
    addDecks.innerHTML = "Delete";
    addDecks.style.height = "30px";
    addDecks.style.width = "70px";
    addDecks.style.borderRadius = "15%";
    addDecks.style.color = "black";
    addDecks.style.backgroundColor = "red";
    afterdeck.appendChild(addDecks);

}

// displays the user's flashcards on the home screen
async function displayFlashcards()
{
  const flashcards = query(collection(db, "Flashcard"), where("DeckID", "==", deck));
  const flashcardsSnapshot = await getDocs(flashcards);
  var index = 0;
  flashcardsSnapshot.forEach((flashcard) => {
    var FC_i = document.createElement("form");
    FC_i.id = "deck" + index.toString();
    FC_i.innerHTML = flashcard.data().Question;
    var check = document.createElement("input");
    check.type = "checkbox";
    deckArea.appendChild(FC_i);
    deckArea.appendChild(check);
    deckArea.appendChild(document.createElement("br"));
    deckArea.appendChild(document.createElement("br"));
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
displayFlashcards();
displayAddFlashcardsButton();
displayDeleteFlashcardsButton();