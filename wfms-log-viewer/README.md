# Simple Log Viewer

A centralized logging interface that aggregates and displays logs from multiple microservices through Elasticsearch MCP integration.

## What is Simple Log Viewer?

Simple Log Viewer is a specialized tool designed to:
- Aggregate logs from multiple microservices (WFMS, Pricing, Consigner, Tesseract, Odin, Raven)
- Provide real-time log searching and filtering capabilities
- Display logs in a user-friendly, chronological format
- Track errors and system states across services
- Enable quick debugging and issue resolution

### Key Features
- Unified search across multiple service logs using Demand ID
- Configurable time duration for log retrieval
- Real-time log aggregation and display
- Error tracking and highlighting
- Merged view of chronological events across services
- Clean, modern UI with service-specific color coding

## Why Simple Log Viewer?

### Problem Statement
1. **Distributed Logging Challenges**
   - Multiple microservices generating logs independently
   - Difficulty in correlating events across services
   - Time-consuming process to track issues across systems

2. **Operational Inefficiencies**
   - Manual log checking in multiple places
   - Delayed issue detection and resolution
   - Complex debugging process

3. **User Experience**
   - Need for technical knowledge to access logs
   - Multiple tools and interfaces for different services
   - Lack of unified view for system state

### Solution Benefits
1. **Centralized Log Management**
   - Single interface for all service logs
   - Quick access to relevant information
   - Reduced time in log analysis

2. **Enhanced Debugging**
   - Real-time error detection
   - Cross-service event correlation
   - Faster issue resolution

3. **Improved Efficiency**
   - Intuitive user interface
   - Quick search and filter capabilities
   - Comprehensive system visibility

## How it Works

### Architecture Overview
1. **Frontend Layer (React)**
   - Modern, responsive UI
   - Real-time log display
   - Service-specific formatting
   - Error highlighting

2. **Backend Layer (Node.js + Express)**
   - Secure API proxy
   - Log aggregation logic
   - Error handling
   - Rate limiting

3. **Data Layer (Elasticsearch MCP)**
   - Distributed log storage
   - Fast search capabilities
   - Data retention management

### Data Flow
1. **Log Collection**
   - Services write logs to Elasticsearch
   - MCP indexes and stores log data
   - Real-time log ingestion

2. **Log Retrieval**
   ```
   User Request → Frontend → Backend Proxy → MCP → Elasticsearch → Aggregated Response
   ```

3. **Data Processing**
   - Log filtering by Demand ID
   - Time-based aggregation
   - Error detection and categorization
   - Cross-service event correlation

### Integration Points
1. **Elasticsearch MCP**
   - Secure API communication
   - Query optimization
   - Response formatting

2. **Microservices**
   - WFMS logs
   - Pricing service logs
   - Consigner aggregator logs
   - Tesseract logs
   - Odin logs
   - Raven logs

## Setup Instructions

### 1. Clone the repository
```sh
git clone <repo-url>
cd wfms-log-viewer
```

### 2. Backend Setup
```sh
cd server
npm install
# Configure your Elasticsearch MCP credentials in server.js
node server.js
```

### 3. Frontend Setup
```sh
cd ../client
npm install
npm start
```

### 4. Usage
- Open [http://localhost:3000](http://localhost:3000) in your browser
- Enter a Demand ID and duration (hours/minutes)
- Click "Fetch Logs" for service-specific logs
- Use "Show All Logs" for merged chronological view
- View error summaries and detailed logs as needed

## Security Considerations
- Backend proxy architecture to protect Elasticsearch credentials
- Rate limiting to prevent abuse
- Secure API communication
- Input validation and sanitization
- Error handling and logging

## Best Practices
1. **Log Searching**
   - Use specific Demand IDs for focused results
   - Start with shorter time durations
   - Utilize merged view for event correlation

2. **Error Analysis**
   - Check error summaries first
   - Use service-specific views for detailed analysis
   - Correlate timestamps across services

3. **Performance**
   - Optimize time range selection
   - Use filters effectively
   - Clear results when done

---

## Contributing
Contributions are welcome! Please read our contributing guidelines and submit pull requests for any enhancements.

## License
This project is proprietary and confidential. 