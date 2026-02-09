
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, InvestmentStrategy, ScenarioResult, Asset, GroundingSource, NewsItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function safeGenerateContent(params: {
  model: string;
  contents: any;
  config?: any;
  fallbackModel?: string;
}) {
  try {
    const response = await ai.models.generateContent({
      model: params.model,
      contents: params.contents,
      config: params.config,
    });
    return response;
  } catch (error: any) {
    console.warn(`Model ${params.model} failed. Error: ${error?.message || 'Unknown'}`);
    if (params.fallbackModel && (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED')) {
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: params.fallbackModel,
          contents: params.contents,
          config: params.config,
        });
        return fallbackResponse;
      } catch (fallbackError) {
        throw fallbackError;
      }
    }
    throw error;
  }
}

export const geminiService = {
  async fetchRealTimeMarketData(): Promise<{ prices: Record<string, number>, sources: GroundingSource[], news: NewsItem[] }> {
    const prompt = `
      TASK 1: Extract CURRENT live trading prices for: ^GSPC, GC=F, SI=F, NVDA, AAPL, MSFT, AMZN, TSLA, META, JPM, GOOGL, XOM, LLY, UNH.
      TASK 2: Fetch 5 critical financial headlines from the last 6-12 hours.
      OUTPUT FORMAT:
      PRICES:
      SYMBOL: PRICE
      NEWS:
      [Headline] - [Source] - [Sentiment]
    `;

    const response = await safeGenerateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
      config: { tools: [{ googleSearch: {} }] },
    });

    const sources: GroundingSource[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web) sources.push({ title: chunk.web.title || "Market Intel", uri: chunk.web.uri });
      });
    }

    const text = response.text || "";
    const prices: Record<string, number> = {};
    const symbols = ["GSPC", "GOLD", "SILVER", "NVDA", "AAPL", "MSFT", "AMZN", "JPM", "XOM", "GC=F", "SI=F", "TSLA", "META", "GOOGL", "LLY", "UNH"];
    
    symbols.forEach(symbol => {
      const s = symbol.replace('^', '').replace('=F', '');
      const regex = new RegExp(`${symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}.*?\\$?([\\d,]+\\.?\\d*)`, "i");
      const match = text.match(regex);
      if (match && match[1]) prices[s] = parseFloat(match[1].replace(/,/g, ''));
    });

    const news: NewsItem[] = [];
    const newsLines = text.split('\n').filter(l => l.includes(' - '));
    newsLines.forEach((line, i) => {
      const parts = line.split(' - ');
      if (parts.length >= 2) {
        news.push({
          id: `news-${i}`,
          headline: parts[0].replace(/^[ \d.-]+/, '').trim(),
          source: parts[1].trim(),
          time: 'Live',
          sentiment: (parts[2] || 'Neutral').includes('Positive') ? 'Positive' : parts[2]?.includes('Negative') ? 'Negative' : 'Neutral'
        });
      }
    });

    return { prices, sources, news };
  },

  async generateQuantumForecast(asset: Asset, history: any[], news: NewsItem[]): Promise<{ price: number, fairValue: number, confidence: number, reasoning: string }> {
    const currentPrice = asset.price;
    const ma20 = history.slice(-20).reduce((a, b) => a + b.price, 0) / (history.length || 1);
    
    const prompt = `
      Act as a Lead Quantitative Strategist. 
      Analyze ${asset.name} (${asset.symbol}) at $${currentPrice}.
      Technical Context: MA20=$${ma20.toFixed(2)}. 
      Market News: ${news.map(n => n.headline).join('; ')}.

      REQUIRED:
      1. Calculate an 'Intrinsic Fair Value' based on recent news sentiment and historical support/resistance.
      2. Provide a 7-day target price.
      3. Explain the 'Fair Value Gap' (Price vs Fair Value) and how it drives the forecast.

      RETURN JSON:
      {
        "price": number (7-day target),
        "fairValue": number (calculated intrinsic value),
        "confidence": number (0-100),
        "reasoning": "A paragraph detailing the interaction between the fair value gap and the momentum news cycle."
      }
    `;

    try {
      const response = await safeGenerateContent({
        model: "gemini-3-pro-preview",
        fallbackModel: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 4000 },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              price: { type: Type.NUMBER },
              fairValue: { type: Type.NUMBER },
              confidence: { type: Type.NUMBER },
              reasoning: { type: Type.STRING }
            },
            required: ["price", "fairValue", "confidence", "reasoning"]
          }
        }
      });

      return JSON.parse(response.text || "{}");
    } catch (e) {
      return { price: currentPrice * 1.02, fairValue: currentPrice * 1.01, confidence: 40, reasoning: "Fallback prediction based on basic drift." };
    }
  },

  async generateStrategy(prefs: UserPreferences, marketDataEnriched: any): Promise<InvestmentStrategy> {
    const prompt = `
      Create a $${prefs.budget} portfolio strategy. 
      Risk Profile: ${prefs.riskTolerance}. 
      Market Data with Enriched Metrics: ${JSON.stringify(marketDataEnriched)}.

      CORE REQUIREMENT:
      Your rationale MUST explicitly reference 'Fair Value Gaps' and 'Sharpe Ratios' of the selected assets.
      Explain why you are overweighting assets that are trading below their Intrinsic Fair Value.

      RETURN JSON:
      {
        "allocations": [
          { "asset": "STRING", "percentage": number, "fairValueGap": number (percentage difference) }
        ],
        "rationale": "Deep reasoning including Fair Value and Sharpe analysis.",
        "riskAssessment": "Risk breakdown.",
        "rebalanceFrequency": "STRING"
      }
    `;

    const response = await safeGenerateContent({
      model: "gemini-3-pro-preview",
      fallbackModel: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 8000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            allocations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: { 
                  asset: { type: Type.STRING }, 
                  percentage: { type: Type.NUMBER },
                  fairValueGap: { type: Type.NUMBER }
                },
                required: ["asset", "percentage", "fairValueGap"]
              }
            },
            rationale: { type: Type.STRING },
            riskAssessment: { type: Type.STRING },
            rebalanceFrequency: { type: Type.STRING }
          },
          required: ["allocations", "rationale", "riskAssessment", "rebalanceFrequency"]
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      ...data,
      allocations: data.allocations.map((a: any) => ({
        ...a,
        dollarValue: (prefs.budget * a.percentage) / 100,
        forecastReturn: Math.random() * 15 // Placeholder for more logic
      })),
      formulaUsed: "Intelligent Fair Value Weighting (IFVW)",
      totalForecastedReturn: data.allocations.reduce((sum: number, a: any) => sum + (a.percentage * 0.08), 0)
    };
  },

  async getScenarioImpact(scenario: string, assets: Asset[]): Promise<ScenarioResult> {
    const response = await safeGenerateContent({
      model: "gemini-3-pro-preview",
      fallbackModel: "gemini-3-flash-preview",
      contents: `Predict impact of: "${scenario}" on assets. Consider their calculated risk beta and volatility. Assets: ${JSON.stringify(assets)}.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            scenario: { type: Type.STRING },
            impact: { type: Type.STRING },
            adjustment: { type: Type.STRING },
            riskLevel: { type: Type.STRING, enum: ['Low', 'Moderate', 'Critical'] },
            vulnerabilityScore: { type: Type.NUMBER }
          },
          required: ["scenario", "impact", "adjustment", "riskLevel", "vulnerabilityScore"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  },

  async generateForumPosts(): Promise<any[]> {
    const response = await safeGenerateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 diverse analyst forum posts in JSON format.`,
      config: { 
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              author: { type: Type.STRING },
              content: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["author", "content", "tags"]
          }
        }
      }
    });
    return JSON.parse(response.text || "[]");
  }
};
