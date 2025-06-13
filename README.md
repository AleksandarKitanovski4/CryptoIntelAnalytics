# Crypto Intel Analytics

An intelligent crypto analysis application that helps users make informed decisions on whether to buy, sell, or wait based on technical indicators, sentiment data, on-chain metrics, and global market context.

## Features

- Real-time market analysis using multiple data sources
- Technical indicator analysis (RSI, MACD, EMAs, etc.)
- On-chain metrics integration
- Sentiment analysis
- Prediction accuracy tracking
- Interactive dashboard with performance metrics
- Historical accuracy analysis

## Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Charts**: Recharts
- **API Integration**: Axios
- **Task Scheduling**: node-cron

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- API keys for:
  - CoinGecko
  - Technical Analysis API
  - On-chain Metrics API

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/crypto-intel-analytics.git
   cd crypto-intel-analytics
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client && npm install
   cd ../server && npm install
   ```

3. Set up environment variables:
   Create `.env` files in both client and server directories:

   Server `.env`:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/crypto_intel
   TECHNICAL_API_KEY=your_technical_api_key
   ONCHAIN_API_KEY=your_onchain_api_key
   MARKET_API_KEY=your_market_api_key
   ```

   Client `.env`:
   ```
   VITE_API_URL=http://localhost:3000
   ```

4. Set up the database:
   ```bash
   npm run db:push
   ```

5. Start the development servers:
   ```bash
   npm run dev
   ```

## Project Structure

```
crypto-intel-analytics/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   └── types/        # TypeScript type definitions
│   └── public/           # Static assets
├── server/                # Backend Node.js application
│   ├── src/
│   │   ├── db/          # Database configuration and schema
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   └── scripts/     # Utility scripts
│   └── tests/           # Backend tests
└── shared/               # Shared types and utilities
```

## API Endpoints

### Analysis
- `GET /api/analyze/:coinSymbol/:timeframe` - Get market analysis
- `GET /api/accuracy` - Get prediction accuracy statistics

## Scheduled Tasks

The application includes a scheduled task to verify predictions:

```bash
npm run verify-predictions
```

This script runs daily to:
1. Check unverified predictions
2. Compare predicted outcomes with actual price movements
3. Update accuracy statistics

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [CoinGecko API](https://www.coingecko.com/en/api)
- [Technical Analysis API](https://taapi.io/)
- [On-chain Metrics API](https://glassnode.com/) 