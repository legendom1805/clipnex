const HUGGING_FACE_API_URL = "https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B";
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const generateVideoDescription = async (title) => {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log('Fetching from:', HUGGING_FACE_API_URL, 'Attempt:', retryCount + 1);
      
      const response = await fetch(HUGGING_FACE_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_HUGGING_FACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Generate a YouTube video description for the title: "${title}". Make it engaging, informative, and SEO-friendly. Keep it under 200 words.`,
          parameters: { max_new_tokens: 200, temperature: 0.7, top_p: 0.9, do_sample: true, return_full_text: false }
        }),
      });

      console.log('Response status:', response.status);

      if (response.status === 503) {
        const result = await response.json();
        if (result.error?.includes('Model is currently loading')) {
          console.log('Model loading, retrying in 20s...');
          await wait(20000);
          retryCount++;
          continue;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        if (response.status === 404) {
          throw new Error('Model not found. Verify the endpoint or model access.');
        }
        throw new Error(`API failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('Raw API response:', result);

      const description = Array.isArray(result) ? result[0]?.generated_text : result.generated_text;
      if (!description) throw new Error('No description generated');

      const cleanDescription = description
        .replace(/^(description:|video description:)/i, '')
        .replace(new RegExp(`^.*?"${title}"\.?\s*`, 'i'), '')
        .trim();

      return { data: { description: cleanDescription } };
    } catch (error) {
      console.error('Error on attempt', retryCount + 1, ':', error.message);
      if (retryCount === maxRetries - 1) {
        throw { message: 'Failed to generate description after retries.' };
      }
      retryCount++;
      await wait(2000);
    }
  }
};