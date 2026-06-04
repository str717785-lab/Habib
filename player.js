// js/player.js
import { db } from "./firebase.js";
import {
    doc, getDoc, collection, getDocs
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const params   = new URLSearchParams(window.location.search);
const id       = params.get("id");
const player   = document.getElementById("videoPlayer");
const titleEl  = document.getElementById("videoTitle");
const relatedEl= document.getElementById("relatedVideos");
const countEl  = document.getElementById("relatedCount");
const dateEl   = document.getElementById("videoDate");

// Update page title dynamically
function setPageTitle(t) {
    document.title = t ? `${t} — DarkTube` : "DarkTube — Player";
}

async function loadVideo() {
    if (!id) {
        titleEl.textContent = "No video selected";
        return;
    }
    try {
        const docRef  = doc(db, "videos", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            player.src     = data.videoUrl || "";
            titleEl.textContent = data.title || "Untitled";
            setPageTitle(data.title);
            if (data.createdAt) {
                const d = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
                dateEl.textContent = d.toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" });
            }
        } else {
            titleEl.textContent = "Video not found";
        }
    } catch (err) {
        console.error("Error loading video:", err);
        titleEl.textContent = "Error loading video";
    }
}

async function loadRelated() {
    if (!id) return;
    try {
        const querySnapshot = await getDocs(collection(db, "videos"));
        let count = 0;
        let delay = 0;

        querySnapshot.forEach((docSnap) => {
            if (docSnap.id === id) return;
            const video = docSnap.data();
            const card = document.createElement("a");
            card.href = `player.html?id=${docSnap.id}`;
            card.className = "related-card";
            card.style.animationDelay = `${delay}ms`;
            card.innerHTML = `
                <div class="related-thumb-wrap">
                    <img class="related-thumb" src="${video.thumbnail || ''}" alt="${video.title || 'Video'}" loading="lazy">
                    <div class="related-play-icon">&#9654;</div>
                </div>
                <div class="related-info">
                    <div class="related-title">${video.title || 'Untitled'}</div>
                    <div class="related-meta">WATCH NOW</div>
                </div>`;
            relatedEl.appendChild(card);
            count++;
            delay += 50;
        });

        if (countEl) countEl.textContent = count;

        if (count === 0) {
            relatedEl.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">&#9654;</div>
                    <div class="empty-text">No related videos</div>
                </div>`;
        }
    } catch (err) {
        console.error("Error loading related videos:", err);
    }
}

loadVideo();
loadRelated();
