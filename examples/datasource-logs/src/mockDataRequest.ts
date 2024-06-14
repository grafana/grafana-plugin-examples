export type Log = {
  body: string,
  severity: string,
  timestamp: number,
  id: string,
  stringField: string,
  numberField: number,
  objectField: object,
  commonAttribute: string,
}

// Mock function that fetches logs from the server
export async function fetchLogs(count: number, from: number, to: number, queryText: string): Promise<Log[]> {  
  return new Promise((resolve) => {
  setTimeout(() => {
    resolve(createLogs(count, from, to, queryText));
  }, 300);
  })
}

function createLogs(count: number, from: number, to: number, queryText: string) {
  const logs: Log[] = []
  for (let i = 0; i < count; i++) {
    const timestamp = Math.floor(Math.random() * (to - from + 1) + from) 
    const id = `id ${from}${to}${i}`
    const severity = i % 5 === 1 ? 'error' : 'info'
    const number = i+ 1000
    const string = `string ${i}`
    const commonAttribute = 'common'
    logs.push({
      body: `timestamp=${timestamp} line=${i} id=${id} number=${number} string=${string}${queryText ? ` queryText=${queryText}` : ''}`,
      severity,
      timestamp,
      id,
      stringField: string,
      numberField: number,
      objectField: {
        key: `value ${i}`,
      },
      commonAttribute,
    })
  }

  return logs.sort((a, b) => a.timestamp - b.timestamp)
}
