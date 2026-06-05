// app.js
import { db } from "firebase.js";
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const videoList = document.getElementById("videoList");

async function loadVideos() {
    try {
        const querySnapshot = await getDocs(collection(db, "videos"));

        // Clear skeletons
        videoList.innerHTML = "";

        if (querySnapshot.empty) {
            videoList.innerHTML = `
                <div class="empty-state" style="grid-column:1/-1;">
                    <div class="empty-icon">&#9654;</div>
                    <div class="empty-text">No videos found</div>
                </div>`;
            return;
        }

        let delay = 0;
        querySnapshot.forEach((docSnap) => {
            const video = docSnap.data();
            const card = document.createElement("a");
            card.href = `player.html?id=${docSnap.id}`;
            card.style.textDecoration = "none";
            card.style.color = "inherit";
            card.style.animationDelay = `${delay}ms`;
            card.className = "card";
            card.innerHTML = `
                <div class="thumb-wrapper">
                    <img class="thumb" src="${video.thumbnail || ''}" alt="${video.title || 'Video'}" loading="lazy">
                    <div class="thumb-overlay">
                        <div class="play-btn">&#9654;</div>
                    </div>
                </div>
                <div class="card-info">
                    <div class="card-title">${video.title || 'Untitled'}</div>
                    <div class="card-meta">
                        <span class="card-badge">WATCH NOW</span>
                    </div>
                </div>`;
            videoList.appendChild(card);
            delay += 60;
        });
    } catch (error) {
        console.error("Error loading videos:", error);
        videoList.innerHTML = `
            <div class="empty-state" style="grid-column:1/-1;">
                <div class="empty-icon">&#9888;</div>
                <div class="empty-text">Failed to load videos</div>
            </div>`;
    }
}

loadVideos();
