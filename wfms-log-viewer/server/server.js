const express = require('express');
const { Client } = require('@elastic/elasticsearch');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 4000;

app.use(cors());

// TODO: Replace with your actual Elasticsearch MCP endpoint and API key
const client = new Client({
  node: 'http://logging-es.prod-we.com',
  auth: { apiKey: 'M2FET1E1Y0JDSHVsZldxNmJXQ1E6Smd2Qy1nTDhUZlNIR09NalZETG9UUQ==' }
});

const indexMap = {
  wfms: 'app-wfms-*',
  pricing: 'app-mp-pricing-*',
  consigner: 'app-consigner-agg-2*',
  tesseract: 'app-tesseract-2*',
  odin: 'app-odin-2*',
  raven: 'app-raven-2*'
};

const ERROR_PATTERNS = [
  /ERROR/i,
  /500\s+INTERNAL_SERVER_ERROR/i,
  /Exception/i,
  /Internal Server Error/i,
  /e-500\s+Internal Server Error/i,
  /status":500/i,
  /error":"Internal Server Error"/i,
];

function extractLogLevelErrors(logs) {
  return logs.filter(log =>
    ERROR_PATTERNS.some(pattern => pattern.test(log.log || log.message || ''))
  );
}

function saveErrorLog(request, errors) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    request,
    errors
  };
  fs.appendFileSync(
    path.join(__dirname, 'error-log.json'),
    JSON.stringify(logEntry) + '\n'
  );
}

app.get('/api/logs', async (req, res) => {
  const { demandId, duration, unit } = req.query;
  const durationValue = parseInt(duration, 10) || 24;
  const durationUnit = unit === 'minutes' ? 'm' : 'h';
  const indices = [
    { key: 'wfmsLogs', index: 'app-wfms-*' },
    { key: 'pricingLogs', index: 'app-mp-pricing-*' },
    { key: 'consignerLogs', index: 'app-consigner-agg-2*' },
    { key: 'tesseractLogs', index: 'app-tesseract-2*' },
    { key: 'odinLogs', index: 'app-odin-2*' },
    { key: 'ravenLogs', index: 'app-raven-2*' }
  ];

  const errors = [];
  const logLevelErrorsArr = [];

  try {
    const results = await Promise.all(indices.map(async ({ key, index }) => {
      const query = {
        index,
        body: {
          size: 10000,
          query: {
            bool: {
              must: [
                { match: { log: demandId } },
                { range: { '@timestamp': { gte: `now-${durationValue}${durationUnit}` } } }
              ]
            }
          },
          sort: [{ '@timestamp': 'desc' }]
        }
      };
      try {
        const result = await client.search(query);
        const hits = result.hits?.hits || result.body?.hits?.hits || [];
        const logs = hits.map(hit => hit._source);
        const logLevelErrors = extractLogLevelErrors(logs);
        if (logLevelErrors.length > 0) {
          logLevelErrorsArr.push({ pod: key, logLevelErrors });
        }
        return { key, logs, logLevelErrors };
      } catch (err) {
        errors.push({ pod: key, message: err.message });
        return { key, logs: [], logLevelErrors: [] };
      }
    }));

    // Save errors if any
    if (errors.length > 0) {
      saveErrorLog({ demandId, duration, unit }, errors);
    }

    // Build response object with segments
    const response = {};
    results.forEach(({ key, logs }) => { response[key] = logs; });
    // Build a new error block that includes both fetch errors and log-level errors
    response.errors = indices.map(({ key }) => {
      const fetchError = errors.find(e => e.pod === key);
      const logLevelErrorObj = logLevelErrorsArr.find(e => e.pod === key);
      return {
        pod: key,
        message: fetchError ? fetchError.message : null,
        logLevelErrors: logLevelErrorObj ? logLevelErrorObj.logLevelErrors : []
      };
    }).filter(e => e.message || (e.logLevelErrors && e.logLevelErrors.length > 0));

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/logs/summary', async (req, res) => {
  const { demandId, duration, unit } = req.query;
  const durationValue = parseInt(duration, 10) || 24;
  const durationUnit = unit === 'minutes' ? 'm' : 'h';
  const indices = [
    { key: 'wfmsLogs', index: 'app-wfms-*' },
    { key: 'pricingLogs', index: 'app-mp-pricing-*' },
    { key: 'consignerLogs', index: 'app-consigner-agg-2*' },
    { key: 'tesseractLogs', index: 'app-tesseract-2*' }
  ];

  try {
    const results = await Promise.all(indices.map(async ({ key, index }) => {
      const query = {
        index,
        body: {
          size: 10000,
          query: {
            bool: {
              must: [
                { match: { log: demandId } },
                { range: { '@timestamp': { gte: `now-${durationValue}${durationUnit}` } } }
              ]
            }
          },
          sort: [{ '@timestamp': 'asc' }]
        }
      };
      const result = await client.search(query);
      const hits = result.hits?.hits || result.body?.hits?.hits || [];
      if (key === 'wfmsLogs') {
        // Group logs by pod_name and format as requested
        const podMap = {};
        hits.forEach(hit => {
          const log = hit._source;
          const pod = log.pod_name || 'unknown';
          if (!podMap[pod]) podMap[pod] = [];
          podMap[pod].push(log);
        });
        // Build pod-wise summary in requested format
        const podSummary = Object.entries(podMap).map(([pod, logs]) => {
          // For each log, extract timestamp, event, and key fields
          const formattedLogs = logs.map(l => {
            // Try to extract event type
            let eventType = '';
            if (l.log && l.log.includes('publishCreateDemandEvent')) eventType = '[DemandPublisherService.publishCreateDemandEvent]';
            else if (l.log && l.log.includes('publishUpdateDemandEvent')) eventType = '[DemandPublisherService.publishUpdateDemandEvent]';
            else eventType = '[Event]';
            // Extract fields
            const fields = [];
            if (l.log) {
              const addField = (label, regex) => {
                const m = l.log.match(regex);
                if (m) fields.push(`${label}: ${m[1]}`);
              };
              addField('consigner_user_code', /consigner_user_code: "([^"]+)"/);
              addField('from_address_id', /from_address_id: (\d+)/);
              addField('to_address_id', /to_address_id: (\d+)/);
              addField('vehicle_type_id', /vehicle_type_id: (\d+)/);
              addField('status', /status: ([A-Z_]+)/);
              addField('type', /type: ([A-Z_]+)/);
              addField('commodity', /commodity: "([^"]+)"/);
              addField('lane', /lane_name: "([^"]+)"/);
              addField('comment', /comment: "([^"]+)"/);
              addField('sub_status', /sub_status: ([A-Z_]+)/);
              addField('expiry_remark', /expiry_remark: "([^"]+)"/);
              addField('remarks', /remarks: "([^"]+)"/);
            }
            return {
              time: l['@timestamp'] || '',
              eventType,
              fields
            };
          });
          // Build summary table rows
          const summaryRows = formattedLogs.map(f => {
            let event = 'Demand Update';
            if (f.eventType.includes('CreateDemand')) event = 'Demand Created';
            return {
              time: f.time ? f.time.replace('T', ' ').slice(0, 19) : '',
              pod,
              event,
              details: f.fields.filter(x => x.startsWith('status:') || x.startsWith('type:') || x.startsWith('commodity:') || x.startsWith('sub_status:')).map(x => x.split(': ')[1]).join(', ')
            };
          });
          return {
            pod,
            formattedLogs,
            summaryRows
          };
        });
        return { key, podSummary };
      } else {
        // Pricing/consigner/tesseract: keep old summary
        const podMap = {};
        hits.forEach(hit => {
          const log = hit._source;
          const pod = log.pod_name || 'unknown';
          if (!podMap[pod]) podMap[pod] = [];
          podMap[pod].push(log);
        });
        const podSummary = Object.entries(podMap).map(([pod, logs]) => {
          const events = logs.map(l => l.log).filter(Boolean);
          const demandCreated = events.find(e => e.includes('consumeKafkaPayload') && e.includes('demandId'));
          const quotes = events.filter(e => e.includes('Quotes for demandId'));
          const statusUpdates = events.filter(e => e.includes('status: DEMAND_STATUS_ENUM'));
          return {
            pod,
            count: logs.length,
            demandCreated: demandCreated || null,
            quotes: quotes.slice(0, 3),
            statusUpdates: statusUpdates.slice(0, 3),
          };
        });
        return { key, podSummary };
      }
    }));

    // Build response object with segments
    const response = {};
    results.forEach(({ key, podSummary }) => { response[key] = podSummary; });

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/logs/merged', async (req, res) => {
  const { demandId, duration, unit } = req.query;
  const durationValue = parseInt(duration, 10) || 24;
  const durationUnit = unit === 'minutes' ? 'm' : 'h';
  const indices = [
    { key: 'wfms', index: 'app-wfms-*' },
    { key: 'pricing', index: 'app-mp-pricing-*' },
    { key: 'consigner', index: 'app-consigner-agg-2*' },
    { key: 'tesseract', index: 'app-tesseract-2*' },
    { key: 'odin', index: 'app-odin-2*' },
    { key: 'raven', index: 'app-raven-2*' }
  ];

  try {
    const results = await Promise.all(indices.map(async ({ key, index }) => {
      const query = {
        index,
        body: {
          size: 10000,
          query: {
            bool: {
              must: [
                { match: { log: demandId } },
                { range: { '@timestamp': { gte: `now-${durationValue}${durationUnit}` } } }
              ]
            }
          },
          sort: [{ '@timestamp': 'desc' }]
        }
      };
      const result = await client.search(query);
      const hits = result.hits?.hits || result.body?.hits?.hits || [];
      // Only keep log, @timestamp, pod_name, and source
      return hits.map(hit => ({
        log: hit._source.log,
        '@timestamp': hit._source['@timestamp'],
        pod_name: hit._source.pod_name,
        source: key
      }));
    }));

    // Merge all logs and sort by @timestamp (desc)
    const mergedLogs = [].concat(...results).sort((a, b) => {
      return new Date(b['@timestamp']).getTime() - new Date(a['@timestamp']).getTime();
    });

    res.json({ mergedLogs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// New endpoint to fetch error logs
app.get('/api/error-logs', (req, res) => {
  try {
    const filePath = path.join(__dirname, 'error-log.json');
    if (!fs.existsSync(filePath)) {
      return res.json([]);
    }
    const logs = fs.readFileSync(filePath, 'utf-8')
      .split('\n')
      .filter(Boolean)
      .map(line => JSON.parse(line));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => console.log(`API server running on port ${port}`)); 