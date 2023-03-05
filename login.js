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
    deleteDoc, 
    orderBy,
    onSnapshot,
    getDocs
  } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';

let db = getFirestore(app);

const form = document.getElementById('loginpage');
const username = document.getElementById('username');
const password = document.getElementById('password');
const userbook = document.getElementById('userbook');

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

    const querySnapshot = await getDocs(collection(db, "users"));
    userbook.innerHTML = '';
    querySnapshot.forEach((doc) => {
        //console.log(`${doc.id} => ${doc.data().username}, ${doc.data().password}`);
        const entry = document.createElement('p');
        entry.textContent = doc.data().username + ': ' + doc.data().password;
        userbook.appendChild(entry);
    });
}

function CardCreate(AnswerD, DeckIDD, LevelD, QuestionD, nextDateAppearanceD)//I am using place holder names so that you know what goes where, change these variables as you see fit.
{
  //the 'D' was added to the variables to distinguish them as the data
  //document ID for these will end up being randomized
  db.collection("Flashcard").add({
    Answer: AnswerD,
    DeckID: DeckIDD,
    Question: QuestionD,
    nextDateAppearance: nextDateAppearanceD
  });
}

function DeckCreate(DeckNameD, reviewTypeD, userIDD)//same situation for CardCreate function in terms of variables
{
  //this variation allows us to specify the document ID rather than letting it randomize
  db.collection("decks").doc(DeckNameD).set({
    DeckName: DeckNameD,
    reviewType: reviewTypeD,
    userID: userIDD
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
  const DeckRef = doc(db, "decks", DeckID);
  const deckSearch = await db.collection('Flashcard').where('DeckID', '==', DeckID);
  if (deckSearch.exists)//if cards are found in the deck delete the cards first, then the deck
  {
    deckSearch.get()
    .then(function(querySnapshot) {
        // Batch is created
        var batch = db.batch();

        querySnapshot.forEach(function(doc) {
            // For each doc, add a delete operation to the batch
            batch.delete(doc.ref);
        });

        // Commit the batch
        batch.commit();
    });
  } else {//if cards are not found, delete the deck
    deleteDoc(DeckRef).then(() => {
    console.log("Entire Document has been deleted successfully.")
    }).catch(error => {
    console.log(error);
    });
  }
}


main();
