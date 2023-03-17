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
const deleteArea = document.getElementById('deleteArea');
const selectAllDecks = document.getElementById('selectAll');
const checkboxVisibility = document.getElementById('checkboxVisibility');
var pressedDeleteButton = false;

const checkBoxListener = (e) => {
  if (selectAllDecks.checked){
    selectAllDecks.checked = false;
  }
}

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

async function listen4DeleteDeck(){
  const numDecks = await getNumDecks();
  if (numDecks > 0){
    //display delete button
    var deleteButton = document.createElement("button");
    deleteButton.id = "deleteDeck";
    deleteButton.innerHTML = "Delete";
    deleteButton.style.float = "right";
    deleteArea.appendChild(deleteButton);

    var cancelButton = document.createElement('button');
    cancelButton.id = "cancelDeleteButton";
    cancelButton.innerHTML = "Cancel";
    cancelButton.style.visibility = "hidden";
    deleteArea.appendChild(cancelButton);

    deleteButton.addEventListener("click", async e =>{
      if (pressedDeleteButton){
        //second time pressed delete button
        //then delete decks that have been CHECKED
        const checkboxIDS = await getCheckBoxIDs();
        for (let index = 0; index < checkboxIDS.length; index++){
          const checkboxName = checkboxIDS[index];
          if (document.getElementById(checkboxName).checked){
            console.log("Deck being deleted: " + checkboxName.substring(5, checkboxName.length))
            await DeleteDeck(checkboxName.substring(5, checkboxName.length));
          }
        }
        window.location.href = "./homeScreen.html";   //reload the webpage after delete
      }
      else{
        //@Justin Do NOT remove the following line. Not for styling purposes
        pressedDeleteButton = true;
        checkboxVisibility.style.display = "initial";
        cancelButton.style.visibility = "visible";
        const checkboxIDS = await getCheckBoxIDs();
        //set checkboxes to visible
        for (let index = 0; index < checkboxIDS.length; index++){
          //@Justin Do NOT remove the following line. Not for styling purposes
          document.getElementById(checkboxIDS[index]).style.visibility = "visible";
        }

        selectAllDecks.addEventListener("click", async e=>{
          if (selectAllDecks.checked){
            //check all boxes
            for (let index = 0; index < checkboxIDS.length; index++){
              document.getElementById(checkboxIDS[index]).checked = true;
            }
          }else{
            //UNcheck all boxes
            for (let index = 0; index < checkboxIDS.length; index++){
              document.getElementById(checkboxIDS[index]).checked = false;
            }
          }
        })
      }
    })

    cancelButton.addEventListener("click", async e=>{
      //turn visibility of buttons off
      checkboxVisibility.style.display = "none";
      const checkboxIDS = await getCheckBoxIDs();
      selectAllDecks.checked = false;
      //set checkboxes to NONvisible
      for (let index = 0; index < checkboxIDS.length; index++){
        //@Justin Do NOT remove the following line. Not for styling purposes
        const checkBox = document.getElementById(checkboxIDS[index]);
        checkBox.style.visibility = "hidden";
        checkBox.checked = false;
        //checkBox.removeEventListener("click", checkBoxListener);
      }
      cancelButton.style.visibility = "hidden";
      pressedDeleteButton = false;
    })
  }
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
async function getCheckBoxIDs(){
  const decks = query(collection(db, "decks"), where("userID", "==", user));
  const decksSnapshot = await getDocs(decks);
  var checkboxIDs = [];
  var counter = 0;

  //get existing deck names
  decksSnapshot.forEach((deck) => {
    checkboxIDs[counter] = "check" + deck.data().DeckName;
      ++counter;
  });
  return checkboxIDs;
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

    var deckLine = document.createElement("div");
    deckLine.style.display = "inline-block";
    deckLine.style.width = "30%"
    //deckLine.style.backgroundColor = "#0041CA";

    var checkbox4Delete = document.createElement("input");
    checkbox4Delete.type = "checkbox";
    checkbox4Delete.id = "check" + deck.data().DeckName;
    checkbox4Delete.style.float = "left";
    checkbox4Delete.style.visibility = "hidden";

    var deck_i = document.createElement("button");
    deck_i.id = deck.data().DeckName;
    deck_i.innerHTML = deck.data().DeckName;
    //deck_i.style.width = "30%";

    var startReviewButton = document.createElement("button");
    startReviewButton.innerHTML = "&#8594";

    deckLine.appendChild(checkbox4Delete);
    deckLine.appendChild(deck_i);
    deckLine.appendChild(startReviewButton);

    deckArea.appendChild(deckLine);
    deckArea.appendChild(document.createElement("br"));

    //listen to see if user clicks on checkbox4Delete
    //if true, then unselect SelectAll checkbox if currently checked
    checkbox4Delete.addEventListener("click", checkBoxListener);

    //listen to see if user clicks on a deck
    //If so, start a review session
    deck_i.addEventListener("click", async e =>{
      //save cookie of deck clicked by user
      sessionStorage.setItem("DeckID", deck_i.getAttribute("id"));
      window.location.href = "./deckDetails.html";
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

listen4DeleteDeck();
listen4Logout();
displayDecks();
displayAddDecksButton();