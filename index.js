const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const generateBtn = document.querySelector(".generate-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");


const examplePrompts = [
  "A magic forest with glowing plants and fairy homes among giant mushrooms",
  "An old steampunk airship floating through golden clouds at sunset",
  "A future Mars colony with glass domes and gardens against red mountains",
  "A cyberpunk city at night with neon lights and flying cars",
  "A cozy cabin in the snowy woods with smoke rising from the chimney",
  "A futuristic underwater city with glowing jellyfish and transparent tunnels",
  "A medieval castle floating in the sky surrounded by dragons",
  "A surreal desert landscape with melting clocks and giant eyes",
  "A robot painter creating a masterpiece in a Paris art studio",
  "A magical library with floating books and glowing runes",
  "A retro diner on the moon with astronauts eating burgers",
  "A giant whale flying through a cloudy sky above a quiet village",
  "A fantasy warrior riding a phoenix through a stormy battlefield",
  "A peaceful zen garden with bonsai trees and koi ponds at sunset",
  "A haunted Victorian mansion with flickering lanterns and fog",
  "A futuristic train speeding through a neon-lit tunnel in space",
  "A dreamlike forest with bioluminescent animals and crystal trees",
  "A steampunk inventor's workshop filled with gears and glowing gadgets"
];

(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    const isDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    document.body.classList.toggle("dark-theme", isDarkTheme);
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
})();

const toggleTheme = () =>{
    const isDarkTheme = document.body.classList.toggle("dark-theme");
    localStorage.setItem("theme", isDarkTheme ? "dark" : "light");
    themeToggle.querySelector("i").className = isDarkTheme ? "fa-solid fa-sun" : "fa-solid fa-moon";
}

// const getImageDimesions = (aspectRatio, baseSize = 512) =>{
//     const [width, height] = aspectRatio.split("/").map(Number);
//     const scaleFactor = baseSize / Math.sqrt(width * height);

//     let calculateWidth = Math.round(width * scaleFactor);
//     let calculateHeight = Math.round(height * scaleFactor);

//     calculateWidth = Math.floor(calculateHeight / 16) * 16;
//     calculateHeight = Math.floor(calculateHeight / 16) * 16;

//     return {width: calculateWidth, height: calculateHeight};
// }

const updateImageCard = (imgIndex, imgUrl) =>{
    const imgCard = document.getElementById(`img-card-${imgIndex}`);
    if(!imgCard) return;

    imgCard.classList.remove("loading");
    imgCard.innerHTML = `<img src="${imgUrl}" class="result-img">
                        <div class="img-overlay">
                            <a href="${imgUrl}" class="img-download-btn" download="${Date.now()}.png">
                                <i class="fa-solid fa-download"></i>
                            </a>
                        </div>`;
}

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) =>{
    // const MODE_URL = `https://router.huggingface.co/hf-inference/models/${selectedModel}`;
    // const {width, height} = getImageDimesions(aspectRatio);
    generateBtn.setAttribute("disabled", "true");

    const imagePromises = Array.from({length: imageCount}, async(_, i) =>{
        try {
            const res = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ selectedModel, imageCount: 1, aspectRatio, promptText }),
            });

            if (!res.ok) throw new Error((await res.json())?.error);

            const result = await res.blob();
            updateImageCard(i, URL.createObjectURL(result));
        } catch (error) {
            console.log(error);
            const imgCard = document.getElementById(`img-card-${i}`);
            imgCard.classList.replace("loading", "error");
            imgCard.querySelector(".status-text").textContent = "Generation failed! check console for more details.";
        }
    });

    await Promise.allSettled(imagePromises);
    generateBtn.removeAttribute("disabled");
}

const createImageCards = (selectedModel, imageCount, aspectRatio, promptText) =>{
    gridGallery.innerHTML = "";
    for(let i =0; i< imageCount; i++){
        gridGallery.innerHTML += `<div class="img-card loading" id="img-card-${i}" style="aspect-ratio:${aspectRatio}">
                        <div class="status-container">
                            <div class="spinner"></div>
                            <i class="fa-solid fa-triangle-exclamation"></i>
                            <p class="status-text">Generating...</p>
                        </div>
                    </div>`
    }

    generateImages(selectedModel, imageCount, aspectRatio, promptText);
}

const handleSubmit = (e) =>{
    e.preventDefault();
    const selectedModel = modelSelect.value;
    const imageCount = parseInt(countSelect.value) || 1;
    const aspectRatio = ratioSelect.value || "1/1";

    const promptText = promptInput.value.trim();
    createImageCards(selectedModel, imageCount, aspectRatio, promptText);
}

promptBtn.addEventListener("click", () =>{
    const prompt = examplePrompts[Math.floor(Math.random() * examplePrompts.length)];
    promptInput.value = prompt;
    promptInput.focus();
});

promptForm.addEventListener("submit", handleSubmit);
themeToggle.addEventListener("click", toggleTheme);