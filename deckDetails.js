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
const deck = sessionStorage.getItem('DeckID');
const delay = ms => new Promise(res => setTimeout(res, ms));

//Document Elements
const deckTitle = document.getElementById('deckTitle');
deckTitle.innerHTML = deck;

const flashcardList = document.getElementById('FlashcardList');
const afterContent = document.getElementById('afterContent');
const deleteButton = document.getElementById('deleteFlashcard');
const selectAll = document.getElementById('selectAll');
const startReviewButton = document.getElementById('startReview');

//Side bar tabs
const flashcardTab = document.getElementById('FlashcardsTab');
const SummaryTab = document.getElementById('SummaryTab');
const SettingsTab = document.getElementById('SettingsTab');
//Content for each side bar tab
const flashcardContent = document.getElementById('flashcardContent');
const summaryContent = document.getElementById('summaryContent');
const settingsContent = document.getElementById('settingsContent');

var numCheckboxesClicked = 0;

function UpdateCard (DocID, Question, Answer)//it is expected that the id of the card being updated will be provided to this function
{
  return new Promise((resolve) =>{
    //create reference variables for the document and the data that will be updated
    const CardRef = doc(db, "Flashcard", DocID);
    const data = {
      Question: Question,
      Answer: Answer
    };
    //function that updates the document; adds info to the console if successful or not
    updateDoc(CardRef, data).then(() => {
      resolve(console.log("Updates have been made to the card"));
    }).catch(error => {
      console.log(error);
      })
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
async function getFlashcardIDs(){
  const flashcards = query(collection(db, "Flashcard"), where("DeckID", "==", deck));
  const flashcardSnapshot = await getDocs(flashcards);
  var flashcardIDs = [];
  var counter = 0;

  //get existing deck names
  flashcardSnapshot.forEach((flashcard) => {
    flashcardIDs[counter] = flashcard.id;
    ++counter;
  });
  return flashcardIDs;
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

async function displayAddFlashcardsButton()
{
  const numFlash = await getNumFlashcards();
  console.log(numFlash)
  if (numFlash < 15)
  {
    var addFlashcard = document.createElement("button")
    addFlashcard.innerHTML = "+";
    addFlashcard.style.height = "25px";
    addFlashcard.style.width = "25px";
    addFlashcard.style.borderRadius = "15%";
    addFlashcard.style.color = "black";
    addFlashcard.style.backgroundColor = "white";
    afterContent.appendChild(addFlashcard);
    addFlashcard.addEventListener("click", e => {
      //go to newCard.html to add new flashcard
      window.location.href = "./newCard.html";
    })
  }
  else
  {
    console.log("ERROR: More than 5 decks created")
  }
}

//check if user selected all decks
async function listen2SelectAll(){
  selectAll.addEventListener("click", async e=>{
    const flashcardIDs = await getFlashcardIDs();
    if (selectAll.checked){
      //check all boxes
      for (let index = 0; index < flashcardIDs.length; index++){
        document.getElementById("check" + flashcardIDs[index]).checked = true;
        document.getElementById("check" + flashcardIDs[index]).style.visibility = "visible";
        document.getElementById("line" + flashcardIDs[index]).style.backgroundColor = "#def1fd";
        numCheckboxesClicked = flashcardIDs.length;
      }
    }else{
      //UNcheck all boxes
      for (let index = 0; index < flashcardIDs.length; index++){
        document.getElementById("check" + flashcardIDs[index]).checked = false;
        document.getElementById("check" + flashcardIDs[index]).style.visibility = "hidden";
        document.getElementById("line" + flashcardIDs[index]).style.backgroundColor = "#ededed";
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

async function listen2DeleteButton(){
  deleteButton.addEventListener("click", async e =>{
    const flashcardIDs = await getFlashcardIDs();
    for (let index = 0; index < flashcardIDs.length; index++){
      const flashcardID = flashcardIDs[index];
      if (document.getElementById("check" + flashcardID).checked){
        console.log("Flashcard being deleted: " + flashcardID)
        await DeleteCard(flashcardID);
        flashcardList.removeChild(document.getElementById("line" + flashcardID));
      }
    }
    deleteButton.style.visibility = "hidden";
    //window.location.href = "./homeScreen.html";   //reload the webpage after delete
  });
}

// displays the user's flashcards on the home screen
async function displayFlashcards()
{
  const flashcards = query(collection(db, "Flashcard"), where("DeckID", "==", deck));
  const flashcardsSnapshot = await getDocs(flashcards);
  var counter = 0;
  flashcardsSnapshot.forEach((flashcard) => {
    ++counter;
    var flashcardLine = document.createElement('li');
    flashcardLine.setAttribute('id', "line" + flashcard.id);
    flashcardLine.style.backgroundColor = "#ededed";
    flashcardLine.style.color = "#0041CA";
    flashcardLine.style.fontSize = "18px";
    flashcardLine.style.listStyleType = "none";
    flashcardLine.style.borderWidth = "1px";
    
    var checkbox4Delete = document.createElement("input");
    checkbox4Delete.type = "checkbox";
    checkbox4Delete.id = "check" + flashcard.id;
    checkbox4Delete.style.visibility = "hidden"; //@Justin Do NOT remove the following line. Not for styling purposes
    checkbox4Delete.style.float = "left";

    //display flashcard question
    var flashcardQuestion = document.createElement("span");
    flashcardQuestion.id = flashcard.id;
    flashcardQuestion.innerHTML = flashcard.data().Question;
    flashcardQuestion.style.color = "#0041CA";

    //add icon to edit flashcard
    var editFlashcard = document.createElement("span");
    editFlashcard.innerHTML = "Edit";     
    editFlashcard.style.float = "right";
    editFlashcard.style.color = "#0041CA";

    flashcardLine.appendChild(checkbox4Delete);
    flashcardLine.appendChild(flashcardQuestion);
    flashcardLine.appendChild(editFlashcard);

    flashcardList.appendChild(flashcardLine);

    //listen to see if user clicks on checkbox4Delete
    //if true, then unselect SelectAll checkbox if currently checked
    checkbox4Delete.addEventListener("click", e =>{
      if (selectAll.checked){
        selectAll.checked = false;
      }
    
      if (checkbox4Delete.checked){
        numCheckboxesClicked++;
        checkbox4Delete.style.visibility = "visible";
        flashcardLine.style.backgroundColor = "#def1fd";
      }else{
        numCheckboxesClicked--;
        flashcardLine.style.backgroundColor = "#ededed";
      }
    
      if(numCheckboxesClicked > 0){
        deleteButton.style.visibility = "visible";   //@Justin Do NOT remove the following line. Not for styling purposes
      }
      else{
        deleteButton.style.visibility = "hidden";;     //@Justin Do not delete this line
      }
    });

    editFlashcard.addEventListener("click", async e =>{
      const flashcardRef = doc(db, "Flashcard", flashcard.id);
      const flashcardSnap = await getDoc(flashcardRef);

      const edit = document.createElement("ul");
      edit.style.listStyleType = "none";

      //Edit Question field
      const editQuestion = document.createElement("li");
      const inputQuestion = document.createElement('input');
      inputQuestion.type = "text";
      inputQuestion.value = flashcardSnap.data().Question;
      inputQuestion.id = "editQuestion";
      var questionLabel = document.createElement("Label");
      questionLabel.setAttribute("for",inputQuestion);
      questionLabel.innerHTML = "Question";

      //add label & input field for question
      editQuestion.appendChild(questionLabel);
      editQuestion.appendChild(inputQuestion);
      edit.appendChild(editQuestion);

      //Edit Answer field
      const editAnswer = document.createElement("li");
      const inputAnswer = document.createElement('input');
      inputAnswer.type = "text";
      inputAnswer.id = "editAnswer";
      inputAnswer.value = flashcardSnap.data().Answer;
      var answerLabel = document.createElement("Label");
      answerLabel.setAttribute("for",inputAnswer);
      answerLabel.innerHTML = "Answer";

      editAnswer.appendChild(answerLabel);
      editAnswer.appendChild(inputAnswer);
      edit.appendChild(editAnswer);

      //buttons to submit or cancel
      const buttonsLine = document.createElement("li");
      const saveChanges = document.createElement('button');
      saveChanges.innerHTML = "Save";
      saveChanges.id = "saveChanges";

      const cancelChanges = document.createElement('button');
      cancelChanges.innerHTML = "Cancel";
      cancelChanges.id = "cancelChanges";

      buttonsLine.append(saveChanges);
      buttonsLine.append(cancelChanges);

      flashcardLine.appendChild(edit);
      flashcardLine.appendChild(buttonsLine);

      const removeEdit = (e) =>{
        cancelChanges.removeEventListener("click", removeEdit);
        saveChanges.removeEventListener("click", saveChangesListener);
        flashcardLine.removeChild(edit);
        flashcardLine.removeChild(buttonsLine);
      }

      const saveChangesListener = async (e) =>{
        await UpdateCard (flashcard.id, inputQuestion.value, inputAnswer.value);
        flashcardQuestion.innerHTML = inputQuestion.value;
        cancelChanges.removeEventListener("click", removeEdit);
        saveChanges.removeEventListener("click", saveChangesListener);
        flashcardLine.removeChild(edit);
        flashcardLine.removeChild(buttonsLine);
      }

      saveChanges.addEventListener("click", saveChangesListener);

      cancelChanges.addEventListener("click", removeEdit);
    });

    flashcardLine.addEventListener("mouseover", e =>{
      flashcardLine.style.borderStyle = "outset";
      if (!selectAll.checked){
        checkbox4Delete.style.visibility = "visible";   //@Justin Do NOT delete this line
      }
    })

    flashcardLine.addEventListener("mouseout", e =>{
      flashcardLine.style.borderStyle = "none";
      if (!checkbox4Delete.checked){
        checkbox4Delete.style.visibility = "hidden";     //@Justin Do NOT delete this line
      }
    })
  });

  listen2SelectAll();
  listen2DeleteButton();
}

async function listen2StartReview(){
  startReviewButton.addEventListener("click", e =>{
    window.location.href = "./reviewSession.html";
  })
}

//only runs if user has no flashcards in deck
//give a tip to user!
async function listen2RemoveTip(){
  if (await getNumFlashcards() === 0){
    console.log("came here!")
    const tipNoFlashcards = document.getElementById('tipNoFlashcards');
    const closeTip = document.getElementById('closeTipNoFlashcard');
    tipNoFlashcards.style.visibility = "visible";
  
    const removeTip = async (e) =>{
      tipNoFlashcards.style.visibility = "hidden";
      closeTip.removeEventListener("click", removeTip);
    }
  
    closeTip.addEventListener("click", removeTip);
    console.log("ended came here!")
  }
}

async function listen2FlashcardTab(){
  displayFlashcards();
  displayAddFlashcardsButton();
  flashcardTab.addEventListener("click", async (e) =>{
    flashcardContent.style.display = "initial";
    summaryContent.style.display = "none";
    settingsContent.style.display = "none";
  })
}

async function listen2SummaryTab(){
  SummaryTab.addEventListener("click", async (e) =>{
    summaryContent.style.display = "initial";
    flashcardContent.style.display = "none";
    settingsContent.style.display = "none";
  })
}

async function listen2SettingsTab(){
  SettingsTab.addEventListener("click", async (e) =>{
    settingsContent.style.display = "initial";
    summaryContent.style.display = "none";
    flashcardContent.style.display = "none";
  })
}

listen2RemoveTip();
listen2StartReview();
listen2SummaryTab();
listen2FlashcardTab();
listen2SettingsTab();