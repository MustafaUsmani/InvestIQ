# InvestIQ   
*AI-Powered Investment Analysis & Strategy Platform*

InvestIQ is a real-time, AI-driven investment analysis platform that helps users understand markets, generate transparent investment strategies, and explore sector-level insights across equities and commodities.

InvestIQ combines deterministic financial models with *Gemini 3 Flash* for fast, explainable reasoning.

---

## What InvestIQ Does

- Displays *real-time market data* for:
  - S&P 500 index
  - S&P 500 sector performance
  - Gold & Silver spot prices
- Provides *sentiment analysis* using AI-driven interpretation
- Generates *investment strategies* based on:
  - Budget
  - Risk tolerance
  - Time horizon
- Outputs *explicit portfolio allocations*, including:
  - Asset-level allocation (Equities, Gold, Silver)
  - Sector-level allocation within the S&P 500
- Enables deep *asset analysis* with:
  - Fair value estimation
  - Financial ratios and technical indicators
- Ranks assets using *risk-adjusted performance metrics*
- Stress-tests portfolios under macroeconomic scenarios
- Includes AI-only insights and user discussion forums

All recommendations are accompanied by clear, human-readable explanations.

---

## AI Reasoning with Gemini 3 Flash

Gemini 3 Flash is used as the *reasoning layer*.

It is responsible for:
- Interpreting market conditions and sentiment
- Explaining allocation and strategy decisions
- Translating numerical outputs into natural language insights
- Reasoning through risk and stress scenarios

---

## Getting Started

### Prerequisites
- Node.js (>= 18)
- Gemini API key

### Setup

bash
git clone https://github.com/your-org/investiq.git
cd investiq
npm install
`

Create a .env file:

env
GEMINI_API_KEY=your_gemini_api_key


Run the app:

bash
npm run dev


The app will be available at:


http://localhost:5173


---

## Limitations

* No persistent user accounts
* No historical backtesting
* API rate limits may affect live data refresh

---

## Disclaimer

InvestIQ is for *educational and demonstration purposes only* and does *not* provide financial advice.

```
