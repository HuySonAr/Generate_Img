const themeToggle = document.querySelector(".theme-toggle");
const promptForm = document.querySelector(".prompt-form");
const promptInput = document.querySelector(".prompt-input");
const promptBtn = document.querySelector(".prompt-btn");
const modelSelect = document.getElementById("model-select");
const countSelect = document.getElementById("count-select");
const ratioSelect = document.getElementById("ratio-select");
const gridGallery = document.querySelector(".gallery-grid");


const examplePrompts = [
    "A magic forest with glowing plants anf fairy homes among glant mushrooms",
    "An old steampunk airship floating through golden clounds at sun set",
    "A futue Mars colony with glass domes and gardens againist red mountains",
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

const getImageDimesions = (aspectRatio, baseSize = 512) =>{
    const [width, height] = aspectRatio.split("/").map(Number);
    const scaleFactor = baseSize / Math.sqrt(width * height);

    let calculateWidth = Math.round(width * scaleFactor);
    let calculateHeight = Math.round(height * scaleFactor);

    calculateWidth = Math.floor(calculateHeight / 16) * 16;
    calculateHeight = Math.floor(calculateHeight / 16) * 16;

    return {width: calculateWidth, height: calculateHeight};
}

const generateImages = async (selectedModel, imageCount, aspectRatio, promptText) =>{
    const MODE_URL = `https://router.huggingface.co/hf-inference/models/${selectedModel}`;
    const {width, height} = getImageDimesions(aspectRatio);

    const imagePromises = Array.from({length: imageCount}, async(_, i) =>{
        try {
            const res = await fetch(MODE_URL, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "x-user-cache": "false",
                },
                method: "POST",
                body: JSON.stringify({
                    inputs: promptText,
                    parameters: {width, height},
                    options: {wait_for_model: true, user_cache: false},
                }),
            });

            if(!res.ok) throw new Error((await res.json())?.error);
    
            const result = await res.blob();
            console.log(result);
        } catch (error) {
            console.log(error)
        }
    });

    await Promise.allSettled(imagePromises);
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
                        <img src="../1.png" class="result-img">
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