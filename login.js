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

    var querySnapshot = await getDocs(collection(db, "users"));
    userbook.innerHTML = '';
    querySnapshot.forEach((doc) => {
        //console.log(`${doc.id} => ${doc.data().username}, ${doc.data().password}`);
        const entry = document.createElement('p');
        entry.textContent = doc.data().username + ': ' + doc.data().password;
        userbook.appendChild(entry);
    });

    const DeckID = "math"; //this will vary depending on which deck the user selected
    const nullDate = "2023/1/1";
    var nowDate = new Date();
    nowDate = nowDate.getFullYear()+'/'+(nowDate.getMonth()+1)+'/'+nowDate.getDate();
    console.log(nowDate);
    //query all flashcards in deck DeckID
    const flashcards = query(collection(db, "Flashcard"), where("DeckID", "==", DeckID));
    var flashcardSnapshot = await getDocs(flashcards);

    if (flashcardSnapshot.empty){
      console.log("Empty snapsot!!")
    }
    var resumeSession = false;
    /* IF non-NUll nextDateAppearance exists AND non-NULL nextDateAppearance != currentDate
	    # new review, not resuming session
	    Set all nextDateAppearance equal to NULL
    ENDIF */
    let flashcardID = [];
    var counter = 0;
    
    flashcardSnapshot.forEach((flashcardDoc) => {
        var flashcardDate = flashcardDoc.data().nextDateAppearance;
        flashcardID[counter] = flashcardDoc.id;
        counter = counter + 1;
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
        // doc.data() is never undefined for query doc snapshots
    });
   
    console.log(flashcardID);

    if (!resumeSession){
        console.log("New Review!");
        for (let i = 0; i < flashcardID.length; i++) {
          const flashcard = doc(db, "Flashcard", flashcardID[i]);
          // Set the "nextDateAppearance" field to nullDate
          await updateDoc(flashcard, {
            nextDateAppearance:nullDate
          });
        }
    }
    else{
      console.log("Resume session!");
    }
}

main();//