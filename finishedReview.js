//get document elements
const deckID = document.getElementById('deckID');
const totalReviewed = document.getElementById('totalReviewed');
const numCorrect = document.getElementById('numCorrect');
const numMissed = document.getElementById('numMissed');
const score = document.getElementById('score');

//display results from review session
deckID.innerHTML = sessionStorage.getItem("DeckID");
const correct = sessionStorage.getItem("numCorrect");
const incorrect = sessionStorage.getItem("numMissed");
const total = parseInt(correct) + parseInt(incorrect);
totalReviewed.innerHTML += total;
numCorrect.innerHTML += correct;
numMissed.innerHTML += incorrect;
score.innerHTML += (Math.round((correct / total) * 100 * 100)) / 100 + "%";

//delete cookie on number of flashcards correct/missed in last review session
sessionStorage.removeItem("numCorrect");
sessionStorage.removeItem("numMissed");

async function main(){
    const startNewReviewButton = document.getElementById('startNewReview')
    const returnHomeButton = document.getElementById('returnHome');
    
    returnHomeButton.addEventListener("click", async e =>{
        e.preventDefault();
        sessionStorage.removeItem('DeckID');                //remove saved cookie of DeckID
        window.location.href = "./homeScreen.html";
        return false;
    })

    startNewReviewButton.addEventListener("click", async e =>{
        e.preventDefault();
        console.log("Starting new review...");
        //Still need to link back to reviewSession.html
        window.location.href = "./reviewSession.html";
        return false;
    })
}

main();