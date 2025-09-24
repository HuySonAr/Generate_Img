export default async function handeler(req, res) {
    const apiKey = process.env.HUGGINGFACE_API_KEY;

    if(req.method != "POST"){
        return res.status(405).json({error: "Method not allowed"});
    }

    const { selectedModel, imageCount, aspectRatio, promptText } = req.body;

    const MODE_URL = `https://router.huggingface.co/hf-inference/models/${selectedModel}`;
    const [width, height] = aspectRatio.split("/").map(Number);
    const baseSize = 512;
    const scaleFactor = baseSize / Math.sqrt(width * height);
    const calculatedWidth = Math.floor(Math.round(width * scaleFactor) / 16) * 16;
    const calculatedHeight = Math.floor(Math.round(height * scaleFactor) / 16) * 16;

    try {
        const response = await fetch(MODE_URL, {
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "x-user-cache": "false",
            },
            method: "POST",
            body: JSON.stringify({
                inputs: promptText,
                parameters: { width: calculatedWidth, height: calculatedHeight },
                options: { wait_for_model: true, user_cache: false },
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(500).json({ error: errorData?.error || "Unknown error" });
        }

        const buffer = await response.arrayBuffer();
        res.setHeader("Content-Type", "image/png");
        res.send(Buffer.from(buffer));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}