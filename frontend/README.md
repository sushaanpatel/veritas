# Multi-Agent Research Frontend

Modern Next.js frontend for the multi-agent research system with real-time progress tracking and interactive UI.

## Features

- ✅ Real-time research progress via WebSocket
- ✅ Interactive query input with mode selection
- ✅ Live quality metrics visualization
- ✅ Markdown report viewer with syntax highlighting
- ✅ Research history with search and filtering
- ✅ Responsive design (desktop/tablet/mobile)
- ✅ Dark/light theme support

## Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
# Edit .env.local with API URL
```

Required environment variables:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home/Research page
│   ├── history/           # History pages
│   └── settings/          # Settings pages
├── components/            # React components
│   ├── research/          # Research-related components
│   ├── history/           # History components
│   └── layout/            # Layout components
├── lib/                   # Utilities and API client
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript types
└── public/                # Static assets
```

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Key Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **React Query**: Server state management
- **React Markdown**: Markdown rendering
- **Recharts**: Data visualization

## Components to Implement

### Phase 1: Core Components (Week 2)
- [ ] `app/layout.tsx` - Root layout with providers
- [ ] `app/page.tsx` - Main research interface
- [ ] `components/research/QueryInput.tsx` - Query input form
- [ ] `components/research/ModeSelector.tsx` - Basic/Enhanced toggle
- [ ] `lib/api.ts` - API client functions
- [ ] `hooks/useResearch.ts` - Research query hook

### Phase 2: Progress Tracking (Week 2)
- [ ] `components/research/ProgressTracker.tsx` - Progress bar
- [ ] `components/research/AgentStatus.tsx` - Agent cards
- [ ] `hooks/useWebSocket.ts` - WebSocket connection
- [ ] `components/research/QualityMetrics.tsx` - Metrics dashboard

### Phase 3: Report & History (Week 3)
- [ ] `components/research/ReportViewer.tsx` - Report display
- [ ] `app/history/page.tsx` - History list page
- [ ] `components/history/HistoryList.tsx` - History items
- [ ] `components/history/HistoryCard.tsx` - History card

### Phase 4: Settings & Polish (Week 3)
- [ ] `app/settings/page.tsx` - Settings page
- [ ] Theme toggle (light/dark)
- [ ] Loading states and animations
- [ ] Error handling and user feedback

## API Integration

The frontend connects to the FastAPI backend:

```typescript
// lib/api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function startResearch(query: string, mode: string) {
  const response = await fetch(`${API_URL}/api/research/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, mode })
  });
  return response.json();
}
```

## WebSocket Integration

Real-time updates via WebSocket:

```typescript
// hooks/useWebSocket.ts
const ws = new WebSocket(`${WS_URL}/ws/${taskId}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // Handle different message types
  switch (data.type) {
    case 'agent_update':
      // Update progress
      break;
    case 'quality_update':
      // Update metrics
      break;
    case 'research_complete':
      // Show report
      break;
  }
};
```

## Styling Guidelines

### Color Palette
- **Primary**: Blue (#3B82F6) - Actions, links
- **Success**: Green (#10B981) - Completed states
- **Warning**: Yellow (#F59E0B) - In progress
- **Error**: Red (#EF4444) - Errors, failures
- **Neutral**: Gray (#6B7280) - Text, backgrounds

### Component Patterns

```tsx
// Button
<button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
  Start Research
</button>

// Card
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
  {/* Content */}
</div>

// Input
<input className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500" />
```

## Testing

```bash
# Run tests (when implemented)
npm test

# Run E2E tests
npm run test:e2e
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["npm", "start"]
```

## Environment Variables

### Development (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

### Production
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

## Troubleshooting

**Issue**: API connection fails
- Solution: Ensure backend is running on port 8000
- Check CORS settings in backend

**Issue**: WebSocket disconnects
- Solution: Check WebSocket URL format (ws:// or wss://)
- Verify task_id is valid

**Issue**: Styles not loading
- Solution: Run `npm run dev` to rebuild Tailwind

## Next Steps

1. ✅ Backend API complete
2. ✅ Frontend structure created
3. 🔄 Implement core components
4. 🔄 Add WebSocket integration
5. 🔄 Build history dashboard
6. 🔄 Add settings panel
7. 🔄 Deploy to production

See `WEB_UI_PLAN.md` for complete implementation roadmap.

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT License - see LICENSE file for details
