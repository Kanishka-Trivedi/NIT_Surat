// ─── AI Vision Module (GPT-4 Vision with mock fallback) ──────────────
import { AIPhotoAnalysis } from '@/types';

// ─── Analyze product photo with GPT-4 Vision ────────────────────────
export async function analyzeProductPhoto(
    imageBase64: string,
    productName: string,
    category: string = 'general'
): Promise<AIPhotoAnalysis> {
    const apiKey = process.env.OPENAI_API_KEY;

    // If no API key, use enhanced simulation
    if (!apiKey) {
        return simulatePhotoAnalysis(productName, category);
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: `Analyze this product photo for a return request.
Product: ${productName}
Category: ${category}

Return a JSON object with these exact fields:
{
  "authentic": true/false (does this look like a real ${productName}?),
  "condition": "like_new" | "good" | "fair" | "poor",
  "tags_attached": true/false (can you see tags or labels still attached?),
  "damage_detected": true/false,
  "damage_description": "string or null",
  "return_eligible": true/false,
  "confidence": 0.0 to 1.0
}

Return ONLY the JSON, no markdown formatting.`,
                            },
                            {
                                type: 'image_url',
                                image_url: {
                                    url: `data:image/jpeg;base64,${imageBase64}`,
                                    detail: 'low',
                                },
                            },
                        ],
                    },
                ],
                max_tokens: 300,
            }),
        });

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';

        // Parse JSON from response
        const jsonStr = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(jsonStr);

        return {
            authentic: parsed.authentic ?? true,
            condition: parsed.condition ?? 'good',
            tags_attached: parsed.tags_attached ?? false,
            damage_detected: parsed.damage_detected ?? false,
            damage_description: parsed.damage_description ?? null,
            return_eligible: parsed.return_eligible ?? true,
            confidence: parsed.confidence ?? 0.8,
        };
    } catch (error) {
        console.error('GPT-4V analysis failed, using simulation:', error);
        return simulatePhotoAnalysis(productName, category);
    }
}

// ─── Enhanced simulation (used when no API key) ─────────────────────
function simulatePhotoAnalysis(productName: string, category: string): AIPhotoAnalysis {
    const conditions = ['like_new', 'good', 'fair', 'poor'] as const;
    const rand = Math.random();

    // Weighted: 35% like_new, 40% good, 20% fair, 5% poor
    let condition: AIPhotoAnalysis['condition'];
    if (rand < 0.35) condition = 'like_new';
    else if (rand < 0.75) condition = 'good';
    else if (rand < 0.95) condition = 'fair';
    else condition = 'poor';

    const damage_detected = condition === 'poor' || (condition === 'fair' && Math.random() > 0.6);
    const tags_attached = condition === 'like_new' || (condition === 'good' && Math.random() > 0.4);

    const damageDescriptions: Record<string, string[]> = {
        clothing: ['Minor fabric pilling observed', 'Small stain on left side', 'Loose stitching near collar', 'Color fading on sleeve'],
        footwear: ['Scuff marks on toe', 'Sole wear pattern indicates use', 'Minor heel damage', 'Crease on upper'],
        general: ['Surface scratches visible', 'Minor wear and tear', 'Small dent on corner', 'Discolouration detected'],
    };

    const catDescriptions = damageDescriptions[category] || damageDescriptions.general;

    return {
        authentic: Math.random() > 0.05, // 95% authentic
        condition,
        tags_attached,
        damage_detected,
        damage_description: damage_detected ? catDescriptions[Math.floor(Math.random() * catDescriptions.length)] : null,
        return_eligible: condition !== 'poor' || !damage_detected,
        confidence: 0.78 + Math.random() * 0.17, // 0.78-0.95
    };
}
