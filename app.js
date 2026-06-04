// app.js
import { getStorage, ref, getDownloadURL } from "firebase/storage";

const storage = getStorage(app);

const videoRef = ref(storage, "videos/movie.mp4");

getDownloadURL(videoRef)
  .then((url) => {
    document.getElementById("myVideo").src = url;
  })
  .catch((error) => {
    console.error(error);
  });
