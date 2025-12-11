# Emergency Line

A high-stakes conversation simulator for training 911 dispatchers. Built for the ElevenLabs Hackathon.

## Overview

Emergency Line puts you in the seat of a 911 dispatcher. You'll receive realistic voice calls from distressed callers powered by ElevenLabs Conversational AI, and must extract critical information to dispatch the appropriate emergency response units.

**Listen. Stay calm. Save lives.**

## Features

- **Realistic Voice Calls**: AI-powered callers with unique scenarios and personalities
- **Real-time Voice Interaction**: Two-way voice communication using ElevenLabs Conversational AI
- **Dispatch Report Form**: Document caller name, address, severity, situation, and response units
- **AI Evaluation**: Get scored on accuracy and response quality using GPT-4
- **Multiple Scenarios**: 4 unique caller scenarios with varying emergencies
- **Professional UI**: Dark dispatch console aesthetic inspired by real CAD systems

## Tech Stack

- **Frontend**: React + Vite
- **Voice AI**: ElevenLabs Conversational AI SDK
- **Evaluation**: OpenAI GPT-4o-mini
- **Backend**: Netlify Functions (serverless)
- **Styling**: CSS with custom properties

## Getting Started

### Prerequisites

- Node.js 18+
- ElevenLabs API key
- OpenAI API key

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/emergency-line.git
cd emergency-line

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
OPENAI_API_KEY=your_openai_api_key
```

Note: ElevenLabs agent IDs are configured in the frontend code.

### Development

```bash
# Start the development server
npm run dev

# Run with Netlify Functions locally
netlify dev
```

### Deployment

The app is configured for Netlify deployment:

```bash
netlify deploy --prod
```

## How to Play

1. **Answer the Call**: Click "Answer Incoming Call" to connect with a distressed caller
2. **Listen Carefully**: The caller will describe their emergency situation
3. **Ask Questions**: Use your voice to gather critical information
4. **Fill the Report**: Document the caller's name, location, situation severity, and details
5. **Dispatch Units**: Select appropriate response units (Ambulance, Police, Fire, Animal Control)
6. **End Call & Submit**: End the call and submit your dispatch report for evaluation
7. **Get Scored**: Receive AI-powered feedback on your performance

## Project Structure

```
emergency-line/
├── src/
│   ├── components/
│   │   ├── CallPanel.jsx      # Main call interface and dispatch form
│   │   ├── HeaderPanel.jsx    # App header with stats
│   │   └── ResultPanel.jsx    # Evaluation results display
│   ├── App.jsx                # Main app with landing page
│   ├── App.css                # App and landing page styles
│   └── index.css              # Global styles and CSS variables
├── netlify/
│   └── functions/
│       └── evaluate.js        # Serverless evaluation endpoint
└── public/
```

## License

MIT

## Acknowledgments

- Built with [ElevenLabs Conversational AI](https://elevenlabs.io/)
- Evaluation powered by [OpenAI](https://openai.com/)
- Created for the ElevenLabs Hackathon 2024
