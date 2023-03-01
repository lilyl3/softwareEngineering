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

function addZero2Date(num){
  if (num < 10){
    return '0' + num;
  }
  return num;
}

//CONSTANTs
const maximumLevel = 10;
const nullDate = "2023/01/01";
//get current date
var nowDate = new Date();
nowDate = nowDate.getFullYear()+'/'+addZero2Date((nowDate.getMonth()+1))+'/'+ addZero2Date(nowDate.getDate());
console.log(nowDate);

//Document Elements
const form = document.getElementById('loginpage');
const username = document.getElementById('username');
const password = document.getElementById('password');
const reviewSession = document.getElementById('reviewSession');
const reviewAnswerSession = document.getElementById('reviewAnswerSession');
const answerHeading = document.getElementById('answerHeading');
const correctButtons = document.getElementById('correctButtons');
var correctlyAnswered; //boolean; true if user correctly answered question; else, false

function shuffle(arr){
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));    //idea of permutation: first (i+1) items to choose from since floored
    console.log(j);
    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }
  return arr;
}

function reorderByLowHigh(arrLevel, arrID, maxLevel){
  var tempReviewID = [];
  for (let level = 0; level <= maxLevel; level++){
    console.log("Level:", level);
    var maskLevel = arrLevel.map(item => item == level);
    var indicesLevel = arrID.filter((item, i) => maskLevel[i]);   //indices of flashcards with a particular level
    console.log("Indices: ", indicesLevel);
    indicesLevel = shuffle(indicesLevel);  
    tempReviewID = tempReviewID.concat(indicesLevel);
  }

  return tempReviewID;
}

//waits for user to indicate that they want to see answer to flashcard question
function waitForRevealAnswer() {
  return new Promise((resolve) => {
    var revealButton = document.createElement("button");
    revealButton.id = "revealButton";
    revealButton.innerHTML = "Reveal Answer";
    revealButton.style.color = "white";
    revealButton.style.backgroundColor = "#0041CA";
    revealButton.style.padding = "8px";
    revealButton.style.selfAlign = "center";
    revealButton.style.border = "white";
    reviewSession.appendChild(revealButton);
    revealButton.addEventListener("click", resolve);
  })
}

//waits for user to indicate whether they correctly or incorrectly answered flashcard
function waitForCorrectIncorrectResponse() {
  return new Promise((resolve) => {
    //create correct & incorrect buttons
    const correct = document.createElement('button');
    correct.innerHTML = "Correct";
    correct.id = "correct";
    correct.style.backgroundColor = "#0eaf29";
    correct.style.padding = "15px";
    correct.style.width = "37.5%";
    correct.style.fontSize = "18px";
    correct.style.color = "white";
    correct.style.border = "none";
    correctButtons.appendChild(correct);

    const incorrect = document.createElement('button');
    incorrect.innerHTML = "Incorrect";
    incorrect.id = "incorrect";
    incorrect.style.backgroundColor = "#f44336";
    incorrect.style.padding = "15px";
    incorrect.style.width = "37.5%";
    incorrect.style.fontSize = "18px";
    incorrect.style.color = "white";
    incorrect.style.border = "none";
    correctButtons.appendChild(incorrect);

    reviewAnswerSession.style.margin = "0 auto";
    reviewAnswerSession.style.backgroundColor = "#0041CA";
    reviewAnswerSession.style.color = "white";
    reviewAnswerSession.style.width = "75%";
    reviewAnswerSession.style.padding = "100px 0";
    reviewAnswerSession.style.fontSize = "26px";     

    
    correct.addEventListener("click", handler => {
      console.log('correct click');
      correctlyAnswered = true;
      resolve(handler);
    }, { once: true });
    incorrect.addEventListener("click", handler => {
      console.log('incorrect click');
      correctlyAnswered = false;
      resolve(handler);
    }, { once: true });
})}

// RESUME not yet implemented
//reviewOrder = flashcardIDs in order of how they will be reviewed
// IF Pause button pressed
// 	 		Add key-value: Resume = True to the Deck
// ENDIF 
async function reviewingFlashcards(reviewOrder, reviewType){
  for (let index = 0; index < reviewOrder.length; index++){
    console.log("Flashcard ID in Review: ", reviewOrder[index]);
    const flashcard = doc(db, "Flashcard", reviewOrder[index]);
    const flashcardDoc = await getDoc(flashcard);

    //display Question
    var question = document.getElementById('question');
    question.innerText = flashcardDoc.data().Question;    
    //to add style in dynamically: https://www.w3.org/wiki/Dynamic_style_-_manipulating_CSS_with_JavaScript

    //wait for user to press reveal answer button
    await waitForRevealAnswer();
    //remove the reveal button once the user has pressed it
    reviewSession.removeChild(document.getElementById('revealButton'));

    //***** Reveal answer to question *************
    //display Answer heading
    const answer = document.createElement('h2');
    answer.innerHTML = "Answer";
    answerHeading.appendChild(answer);
    //display Answer
    const flashcardAnswer = document.createElement('p');
    flashcardAnswer.innerHTML = flashcardDoc.data().Answer;
    reviewAnswerSession.appendChild(flashcardAnswer);

    //wait for user to select whether they correct answered question or not
    await waitForCorrectIncorrectResponse();
    console.log("CorrectlyAnswered: ", correctlyAnswered);
  
    //update nextDateAppearance = now/current date => flashcard already reviewed
    //update flashcard level based on whether correctly answered the flashcard question
    var updateLevel = flashcardDoc.data().Level;        //get the flashcard's current level
    console.log("Flashcard current level", updateLevel);
    
    if (updateLevel < maximumLevel && correctlyAnswered){
      ++updateLevel;
    }
    else if(updateLevel > 0 && !correctlyAnswered){
      --updateLevel;
    }
    else{
      console.log("No update to the flashcard level")
    }
    console.log("Flashcard NEW level", updateLevel);

    var updateNextDateAppr = nowDate;
    if (reviewType === "Continuous"){
      var date = new Date();                              //get current date
      date.setDate(date.getDate() + (2*updateLevel));     //next date to be reviewed is 2*updateLevel days later
      updateNextDateAppr = date.getFullYear()+'/'+ addZero2Date((date.getMonth()+1))+'/'+ addZero2Date(date.getDate());
    }

    await updateDoc(flashcard, {
      Level:updateLevel,
      nextDateAppearance: nowDate
    });

    if (updateLevel === maximumLevel){
      //user has MASTERED the flashcard
      //Notify user whether they want to burn the card = no longer appears in review sessions
      //NOT yet implemented
      console.log("Maximum level reached!")
    }

    //remove the answer heading & flashcard answer once user has selected correct/incorrect
    reviewAnswerSession.removeChild(answerHeading);
    reviewAnswerSession.removeChild(flashcardAnswer);
    reviewAnswerSession.removeChild(document.getElementById('correct'));
    reviewAnswerSession.removeChild(document.getElementById('incorrect'));
  }
  return;
}

//ASSUMPTION: all nextDateAppearance = {nullDate, nowDate}
//BUT maybe better just to have a resume field associated a deck
async function dailyReview(DeckID, orderType){
  //Retrieve the orderType = determines the order that flashcards will be reviewed

  //query all flashcards in deck DeckID
  const flashcards = query(collection(db, "Flashcard"), where("DeckID", "==", DeckID));
  var flashcardSnapshot = await getDocs(flashcards);

  if (flashcardSnapshot.empty){
    console.log("Empty snapshot!!")
  }

  //************Is USER RESUMing or STARTing a new review session*****************/
  var resumeSession = false;
  /* IF non-NUll nextDateAppearance exists AND non-NULL nextDateAppearance != currentDate
    # new review, not resuming session
    Set all nextDateAppearance equal to NULL
  ENDIF */
  var flashcardID = [];       //holds ID of flashcards never reviewed
  //Note: Flashcard level should carry over
  var flashcardLevel = [];    //holds Level of flashcard nevery reviewed
  var counter = 0;            //total flashcards to reviewed in this session
  var index = 0;
  var allIDs = [];            //holds ID of ALL flashcards
  
  flashcardSnapshot.forEach((flashcardDoc) => {
      var flashcardDate = flashcardDoc.data().nextDateAppearance;
      allIDs[index] = flashcardDoc.id;
      index = index + 1;
      //If we store Date as a timestamp, it is actually stored as:
      // ir {seconds: 1676361600, nanoseconds: 685000000}
      // nanoseconds:685000000
      // seconds:1676361600
      // flashcardDate = flashcardDate.getFullYear()+'/'+(flashcardDate.getMonth()+1)+'/'+flashcardDate.getDate();

      console.log(flashcardDate);
      if (flashcardDate === nowDate){
          resumeSession = true;
      }
      else{
        //flashcard was NOT viewed in CURRENT date
        flashcardID[counter] = flashcardDoc.id;
        flashcardLevel[counter] = flashcardDoc.data().Level;
        counter = counter + 1;
      }
      // doc.data() is never undefined for query doc snapshots
  });
 
  console.log(flashcardID);
  console.log(flashcardLevel);

  if (!resumeSession){
      console.log("New Review!");
      //reset all nextDateAppearance = nullDate
      for (let i = 0; i < flashcardID.length; i++) {
        const flashcard = doc(db, "Flashcard", flashcardID[i]);
        await updateDoc(flashcard, {
          nextDateAppearance:nullDate
        });
      }
  }
  else{
    console.log("Resume session!");
  }
  //*************** END: Determined whether RESUME or NEW ********************************* */

  //********** START: Determine the order in which flashcards will be reviewd ***************/

  console.log("Before Shuffle: ", flashcardID);  
  var orderReview = [];                       //flashcard ID in order of which flashcards will be reviewed first
  if (orderType === "Random"){
    orderReview = shuffle(flashcardID);
  }
  else if (orderType === "LowHigh"){
    console.log("LowHigh");
    const maxLevel = Math.max.apply(null, flashcardLevel);    //maximum level of any flashcard from DeckID
    console.log("Max Level:", maxLevel);

    orderReview = reorderByLowHigh(flashcardLevel, flashcardID, maxLevel);
  }
  else{
    console.log("ERROR: only 2 possible review types");
  }
  console.log("After Shuffle: ", orderReview);                 //after shuffled

  //Start reviewing flashcards
  await reviewingFlashcards(orderReview, "Daily");

  // Finished reviewing all flashcards
  // Set NextAppearanceDate = Null for all flashcards in DeckName
  for (let i = 0; i < allIDs.length; i++) {
    const flashcard = doc(db, "Flashcard", allIDs[i]);
    await updateDoc(flashcard, {
      nextDateAppearance:nullDate
    });
  }

  return;
}

//Decks with reviewType = "Continuous" MUST have a resume field!!!
async function continuousReview(DeckID, orderType, numberNewCards, resume){
  //new cards nextDateAppearance = nullDate
  //cards reviewed at least once have nextDateAppearance > nullDate && < currentDate
  var newCardID = [];             //IDs of all cards not yet reveiwed; newCard Level = 0
  var reviewCardID = [];          //IDs of all cards to be reviewed
  var reviewCardLevel = [];       //level of all cards that have been reviewed
  var counter = 0;

  //query all flashcards in deck DeckID
  const flashcards = query(collection(db, "Flashcard"), where("DeckID", "==", DeckID));
  var flashcardSnapshot = await getDocs(flashcards);

  flashcardSnapshot.forEach((flashcardDoc) => {
    var nextDateAppearance = flashcardDoc.data().nextDateAppearance;
    if (nextDateAppearance === nullDate){
      //new card
      newCardID[counter] = flashcardDoc.id;
    }
    else if (nextDateAppearance <= nowDate){
      // 	IF nextDateAppearance < currentDate
      // 		Set nextDateAppearance = currentDate
      reviewCardID[counter] = flashcardDoc.id;
      reviewCardLevel[counter] = flashcardDoc.data().Level;
    }
    else{
      //nextDateAppearance > now Date
      //card will not be reviewed today BUt will be in the future
    }
    counter = counter + 1;
  });

  if (!resume && newCardID.length > 0){
    console.log("New session + new cards still to review")
    //user is not resuming a session
    //if there are still new cards to review, randomly select numNewCards to be reviewed
    newCardID = shuffle(newCardID);
    reviewCardID = concat(reviewCardID, newCardID.slice(0, numberNewCards));
    //append level = 0 of new cards
    reviewCardLevel = concat(reviewCardLevel, new Array(numberNewCards).fill(0));
  }

  //set nextDateAppearance for all cards to be reviewed today = nowDate
  //sets newCards from null -> nowDate
  //sets reviewedCards < nowDate to nowDate
  for (var i = 0; i < reviewCardID.length; i++){
    var flashcard = doc(db, "Flashcard", reviewCardID[i]);
    flashcard = await getDoc(flashcard);
    const nextDateAppearance = flashcard.data().nextDateAppearance;
    if(nextDateAppearance !== nowDate){
      await updateDoc(flashcard, {
        nextDateAppearance:nowDate
      });
    }
  }

  console.log("Before reorder LowHigh: ", reviewCardID);
  if (orderType === "Random"){
    reviewCardID = shuffle(reviewCardID);
  }
  else if (orderType === "LowHigh"){
    const maxReviewLevel = Math.max.apply(null, reviewCardLevel);    //maximum level of to be reviewed flashcard from DeckID
    console.log("Max Level:", maxReviewLevel);

    reviewCardID = reorderByLowHigh(reviewCardLevel, reviewCardID, maxReviewLevel);
  }
  else{
    console.log("ERROR: Not a valid orderType")
  }
  console.log("After reorder LowHigh: ", reviewCardID);

  //Start reviewing Flashcards
  await reviewingFlashcards(reviewCardID, "Continuous");

  return;
}

async function main() {  
    // Listen to the form submission
    form.addEventListener('submit', async e => {
      // Prevent the default form redirect
      e.preventDefault();
      // Write a new message to the database collection "guestbook"
      addDoc(collection(db, 'users'), {
        username: username.value,
        password: password.value
      });
      // clear message input fields
      username.value = '';
      password.value = '';
      // Return false to avoid redirect
      return false;
    });

    const DeckID = "math"; //this will vary depending on which deck the user selected
    var deck = doc(db, "decks", DeckID);
    deck = await getDoc(deck);
    const reviewType = deck.data().reviewType;

    if (reviewType == "Daily"){
      console.log("Daily")
      const orderType = deck.data().orderType;
      console.log("OrderType: ", orderType)
      await dailyReview(DeckID, orderType);
    }
    else if (reviewType == "Continuous"){
      console.log("Continuous")
      //yet to be implemented
      //await continuousReview(DeckID);
    }
    else{
      console.log("ERROR: not a valid review type")
    }
    console.log("return to the main!")
    //   #Users can either 1) Return to Home or 2) Start new Review Session


}

main();