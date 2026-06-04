import { db } from "./firebase.js";

import {

collection,
getDocs

} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const videoList = document.getElementById("videoList");

async function loadVideos(){

    const querySnapshot = await getDocs(collection(db,"videos"));

    querySnapshot.forEach((doc)=>{

        const video = doc.data();

        videoList.innerHTML += `

        <a href="player.html?id=${doc.id}" style="text-decoration:none;color:white;">

            <div class="card">

                <img class="thumb" src="${video.thumbnail}">

                <div class="card-info">

                    <div class="card-title">

                        ${video.title}

                    </div>

                </div>

            </div>

        </a>

        `;

    });

}

loadVideos();