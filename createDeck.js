// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";

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
import {
    getFirestore,
    setDoc,
    collection,
    query,
    where,
    doc, 
    getDocs
  } from 'https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js';

let db = getFirestore(app);

const createDeckSection = document.getElementById('createDeckSection');
const newDeckName = document.getElementById('DeckName');
const warningMessage = document.getElementById('warningMessage');
const user = sessionStorage.getItem('userID');
const cancelButton = document.getElementById('Cancel');

const defaultOrderType = "Random";
const defaultReviewType = "Daily";

async function DeckCreate(DeckNameD, userIDD)//same situation for CardCreate function in terms of variables
{
  //this variation allows us to specify the document ID rather than letting it randomize
  setDoc(doc(db, "decks", DeckNameD),
  {
    userID: userIDD,
    DeckName: DeckNameD,
    reviewType: defaultReviewType,
    orderType: defaultOrderType
  });
}

async function listen2CreateDeck(){

    createDeckSection.addEventListener("submit", async e =>{
        e.preventDefault();
        //check that inputted deck name is not empty
        if (newDeckName.value.length === 0){
            warningMessage.innerHTML = "Deck name can not be empty.";
            warningMessage.style.color = "red";
        }
        else{
            console.log("Inputted Deck Name: " + newDeckName.value)
            console.log("user: " + user)
            //check that inputted deck name is unique
            const decks = query(collection(db, "decks"), where("userID", "==", user));
            const decksSnapshot = await getDocs(decks);
            var existingDeckNames = [];
            var counter = 0;

            //get existing deck names
            decksSnapshot.forEach((deck) => {
                existingDeckNames[counter] = deck.data().DeckName;
                ++counter;
            });

            if (existingDeckNames.includes(newDeckName.value)){
                //inputted deck name already exists
                warningMessage.innerHTML = "Deck Name already exists. Please try another."
                warningMessage.style.color = "red";
                newDeckName.value = "";                 //reset value
            }
            else{
                //inputted deck name is unique
                //add deck
                await DeckCreate(newDeckName.value, user);
            }
        }
    })

    cancelButton.addEventListener("click", async e =>{
        //return to home screen
        window.location.href = "./homeScreen.html";
    })
}

listen2CreateDeck();