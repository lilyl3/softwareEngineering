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

const form = document.getElementById('loginpage');
const username = document.getElementById('username');
const password = document.getElementById('password');
const reviewSession = document.getElementById('reviewSession');
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

function waitForRevealAnswer() {
  return new Promise((resolve) => {
    var revealButton = document.createElement("button");
    revealButton.id = "revealButton";
    revealButton.innerHTML = "Reveal Answer";
    reviewSession.appendChild(revealButton);
    //var theButton = document.getElementById("reveal");
    revealButton.addEventListener("click", resolve);
  })
}

function waitForCorrectIncorrectResponse() {
  return new Promise((resolve) => {
    //create correct & incorrect buttons
    const correct = document.createElement('button');
    correct.innerHTML = "Correct";
    correct.id = "correct";
    reviewSession.appendChild(correct);

    const incorrect = document.createElement('button');
    incorrect.innerHTML = "Incorrect";
    incorrect.id = "incorrect";
    reviewSession.appendChild(incorrect);
    
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

    // var querySnapshot = await getDocs(collection(db, "users"));
    // userbook.innerHTML = '';
    // querySnapshot.forEach((doc) => {
    //     //console.log(`${doc.id} => ${doc.data().username}, ${doc.data().password}`);
    //     const entry = document.createElement('p');
    //     entry.textContent = doc.data().username + ': ' + doc.data().password;
    //     userbook.appendChild(entry);
    // });

    // What if user click QUIT in middle of resume session

    //************************************** FUNCTION dailyReview ************************************** */
    // IF user clicks on DeckID -> start review
    // PARAMETERS for function dailyReview()
    const DeckID = "math"; //this will vary depending on which deck the user selected
    const orderType = "LowHigh";

    //CONSTANTs
    const maximumLevel = 10;
    const nullDate = "2023/1/1";

    //get curret date
    var nowDate = new Date();
    nowDate = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();
    console.log(nowDate);
    //query all flashcards in deck DeckID
    const flashcards = query(collection(db, "Flashcard"), where("DeckID", "==", DeckID));
    var flashcardSnapshot = await getDocs(flashcards);

    if (flashcardSnapshot.empty){
      console.log("Empty snapsot!!")
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
    
    flashcardSnapshot.forEach((flashcardDoc) => {
        var flashcardDate = flashcardDoc.data().nextDateAppearance;
        //If we store Date as a timestamp, it is actually stored as:
        // ir {seconds: 1676361600, nanoseconds: 685000000}
        // nanoseconds:685000000
        // seconds:1676361600
        // flashcardDate = flashcardDate.getFullYear()+'/'+(flashcardDate.getMonth()+1)+'/'+flashcardDate.getDate();

        //Store Date as a string
        console.log(flashcardDate);
        if (flashcardDate === nowDate){
            resumeSession = true;
            //break; -> JavaScript gives me an error! BUT apparently this is not expensive
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

    var orderReview = [];                       //flashcard ID in order of which flashcards will be reviewed first
    if (orderType === "Random"){
      orderReview = Array.from(Array(counter).keys());
      console.log(orderReview);                 //before shuffled
      orderReview = shuffle(orderReview);       //reshuffle the indicies
      console.log(orderReview);                 //after shuffled
      orderReview = orderReview.map(item => flashcardID[item]);
      console.log(orderReview);
    }
    else if (orderType === "LowHigh"){
      console.log("LowHigh");
      const maxLevel = Math.max.apply(null, flashcardLevel);    //maximum level of any flashcard from DeckID
      console.log("Max Level:", maxLevel);

      for (let level = 0; level <= maxLevel; level++){
        console.log("Level:", level);
        var maskLevel = flashcardLevel.map(item => item == level);
        var indicesLevel = flashcardID.filter((item, i) => maskLevel[i]);   //indices of flashcards with a particular level
        indicesLevel = shuffle(indicesLevel);  
        orderReview = orderReview.concat(indicesLevel);
      }
      console.log(orderReview);
    }
    else{
      console.log("ERROR: only 2 possible review types");
    }

    //Start Reviewing Flashcards
    for (let index = 0; index < counter; index++){
      console.log("Flashcard Index in Review: ", index);
      const flashcard = doc(db, "Flashcard", orderReview[index]);
      const flashcardDoc = await getDoc(flashcard);

      //display Question
      document.getElementById('question').innerText = flashcardDoc.data().Question;
      //wait for user to press reveal answer button
      await waitForRevealAnswer();
      //remove the reveal button once the user has pressed it
      reviewSession.removeChild(document.getElementById('revealButton'));
  
      //***** Reveal answer to question *************

      //display Answer heading
      const answerHeading = document.createElement('h2');
      answerHeading.innerHTML = "Answer";
      answerHeading.id = "answerH";
      reviewSession.appendChild(answerHeading);
      //display Answer
      const flashcardAnswer = document.createElement('p');
      flashcardAnswer.innerHTML = flashcardDoc.data().Answer;
      flashcardAnswer.id = "flashcardAnswer";
      reviewSession.appendChild(flashcardAnswer);

      //wait for user to select whether they correct answered question or not
      await waitForCorrectIncorrectResponse();
      console.log("CorrectlyAnswered: ", correctlyAnswered);
    
      //update flashcard level based on whether correctly answered the flashcard question
      var updateLevel = flashcardDoc.data().Level;        //get the flashcard's current level
      console.log("Flashcard current level", updateLevel);
      if (updateLevel < 10 && correctlyAnswered){
        ++updateLevel;
        await updateDoc(flashcard, {
          Level:updateLevel
        });
      }
      else if(updateLevel > 0 && !correctlyAnswered){
        --updateLevel;
        await updateDoc(flashcard, {
          Level:updateLevel
        });
      }
      else{
        console.log("ERROR: Something is wrong with update flashcard level")
      }
      console.log("Flashcard NEW level", updateLevel);

      //remove the answer heading & flashcard answer once user has selected correct/incorrect
      reviewSession.removeChild(answerHeading);
      reviewSession.removeChild(flashcardAnswer);
      reviewSession.removeChild(correct);
      reviewSession.removeChild(incorrect);
    }

    //   flashcard[NextAppearanceDate] = currentDate
    //       IF Pause button pressed
    //           break
    //       ENDIF
    // ENDFOR

    // IF finished reviewing all flashcards
    //   Set NextAppearanceDate = Null for all flashcards in DeckName
    //   #Users can either 1) Return to Home or 2) Start new Review Session
    // ENDIF


    //*******************************END FUNCTION dailyReview ************************************** */

}

main();