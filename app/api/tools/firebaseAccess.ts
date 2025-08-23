// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBm9qW8JokMPQ65sf6YlJCh7AA89MnK-eU",
  authDomain: "montypytorchxpostfinance.firebaseapp.com",
  databaseURL:
    "https://montypytorchxpostfinance-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "montypytorchxpostfinance",
  storageBucket: "montypytorchxpostfinance.firebasestorage.app",
  messagingSenderId: "841032630437",
  appId: "1:841032630437:web:c14d8cc05f0308bb098d4c",
  measurementId: "G-9GGWB051BB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export async function getUserSummary() {
  //use firestore to get the value for the first entry key of userSummaries
  const db = getFirestore(app);
  const userSummariesRef = collection(db, "userSummaries");
  const firstUserSummary = await getDocs(userSummariesRef);
  const firstUserSummaryData = firstUserSummary.docs[0].data();
  return firstUserSummaryData;
}
