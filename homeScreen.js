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
async function CardCreate(AnswerD, DeckIDD, QuestionD)//I am using place holder names so that you know what goes where, change these variables as you see fit.
{
  //the 'D' was added to the variables to distinguish them as the data
  //document ID for these will end up being randomized

  const flashcards = query(collection(db, "Flashcard"));
  const flashcardsSnap = await getDocs(flashcards);
  var numFlashcards = 0;        //this will be the ID of the flashcard

  flashcardsSnap.forEach((flashcard) => {
    ++numFlashcards;
  });

  ++numFlashcards;            //add 1 since we are adding a new flashcard in

  await setDoc(doc(db, "Flashcard", numFlashcards.toString()), {
    DeckID: DeckIDD,
    Question: QuestionD,
    Answer: AnswerD,
    Level: 0,
    nextDateAppearance: nullDate
  });
}

//OrderType by default = "Random"
async function DeckCreate(DeckNameD, reviewTypeD, userIDD)//same situation for CardCreate function in terms of variables
{
  //this variation allows us to specify the document ID rather than letting it randomize
  await setDoc(doc(db, "decks", DeckNameD), {
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

async function DeleteDeck(DeckID) //it is expected that the id of the deck being deleted will be provided to this function
{
  //*NOTE* secondary functionallity needed: if deck is empty, then delete the deck
  //                                        if deck is not empty, then confirm that the user wants to delete the deck
  const deckSearch = query(collection(db, "Flashcard"), where('DeckID', '==', DeckID));

  if (!deckSearch.empty)//if cards are found in the deck delete the cards first, then the deck
  {
    const deckSnapshot = await getDocs(deckSearch); //get the flashcards in the deck
    var flashcardIDs = [];
    var index = 0;

    deckSnapshot.forEach((flashcard) =>{
      flashcardIDs[index] = flashcard.id;
      ++index;
    });

    for (let index = 0; index < flashcardIDs.length; index++){
      DeleteCard(flashcardIDs[index]);
    }
  }

  //once flashcards deleted or no flashcards, delete deck
  await deleteDoc(doc(db, "decks", DeckID)).then(() => {
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
  //await waitForDeckSelection;
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

//await CardCreate("5", "division", "45/9");
// await CardCreate("8", "division", "56/7");
// await CardCreate("5", "division", "27/3");      //incorrect card; ID = 11
// await DeckCreate("subtraction", "Daily", user);
// await CardCreate("3", "subtraction", "12-9");
// await CardCreate("-4", "subtraction", "5-9");
//await CardCreate("5", "subtraction", "5-0");    //ID = 14

//UpdateCard ("11", "27/3", "9");
//DeleteCard("14");

//DeleteDeck("subtraction")
//DeleteDeck("division");

listen4Logout();
displayDecks();
displayAddDecksButton();