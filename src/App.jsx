import { useState } from 'react'
import './index.css'

function App() {
  const [numBlocks, setNumBlocks] = useState('')
  const [numProcesses, setNumProcesses] = useState('')
  const [blocks, setBlocks] = useState([])
  const [processes, setProcesses] = useState([])
  const [results, setResults] = useState(null)
  const [manualBlocksInput, setManualBlocksInput] = useState('');
  const [manualProcessesInput, setManualProcessesInput] = useState('');
  const [blockMin, setBlockMin] = useState();
  const [blockMax, setBlockMax] = useState();
  const [processMin, setProcessMin] = useState();
  const [processMax, setProcessMax] = useState();

  const generateRandomData = () => {
    if (!numBlocks || !numProcesses) {
      alert('Please enter the number of blocks and processes!');
      return;
    }

    if (blockMin >= blockMax || processMin >= processMax) {
      alert('Invalid range: minimum must be less than maximum!');
      return;
    }

    const randBlocks = Array.from({ length: parseInt(numBlocks) }, () => {
      const expMin = Math.log2(blockMin);
      const expMax = Math.log2(blockMax);
      const randomExp = Math.floor(Math.random() * (expMax - expMin + 1)) + expMin;
      return Math.pow(2, randomExp);
    });

    const randProcesses = Array.from({ length: parseInt(numProcesses) }, () =>
      Math.floor(Math.random() * (processMax - processMin + 1)) + processMin
    );

    setBlocks(randBlocks);
    setProcesses(randProcesses);
    setResults(null);
  };

  const runSimulation = () => {
    if (blocks.length === 0 || processes.length === 0) {
      alert('Please generate memory and process data first!')
      return
    }

    const algorithms = ['First Fit', 'Best Fit', 'Worst Fit',]
    const simResults = {}

    algorithms.forEach((type) => {
      const start = performance.now()

      let allocation = Array(processes.length).fill(-1)
      let usedBlocks = Array(blocks.length).fill(false)

      if (type === 'First Fit') {
        processes.forEach((p, i) => {
          for (let j = 0; j < blocks.length; j++) {
            if (!usedBlocks[j] && blocks[j] >= p) {
              allocation[i] = j
              usedBlocks[j] = true
              break
            }
          }
        })
      } else if (type === 'Worst Fit') {
        processes.forEach((p, i) => {
          let worstIdx = -1
          for (let j = 0; j < blocks.length; j++) {
            if (!usedBlocks[j] && blocks[j] >= p) {
              if (worstIdx === -1 || blocks[j] > blocks[worstIdx]) {
                worstIdx = j
              }
            }
          }
          if (worstIdx !== -1) {
            allocation[i] = worstIdx
            usedBlocks[worstIdx] = true
          }
        })
      } else if (type === 'Best Fit') {
          processes.forEach((p, i) => {
            let bestIdx = -1
            for (let j = 0; j < blocks.length; j++) {
              if (!usedBlocks[j] && blocks[j] >= p) {
                if (bestIdx === -1 || blocks[j] < blocks[bestIdx]) {
                  bestIdx = j
                }
              }
            }
            if (bestIdx !== -1) {
              allocation[i] = bestIdx
              usedBlocks[bestIdx] = true
            }
          })
        }

      const end = performance.now()

      let internalFragmentation = 0
      allocation.forEach((blockIdx, i) => {
        if (blockIdx !== -1) {
          internalFragmentation += (blocks[blockIdx] - processes[i])
        }
      })
      const unusedBlocks = blocks
        .map((b, i) => (allocation.includes(i) ? 0 : b))
        .reduce((a, b) => a + b, 0)

      const allocatedBlocks = allocation.filter((a) => a !== -1)
      const allocatedProcesses = allocatedBlocks.length
      const totalAllocated = processes
        .map((p, i) => (allocation[i] !== -1 ? p : 0))
        .reduce((a, b) => a + b, 0)
      const totalMemory = blocks.reduce((a, b) => a + b, 0)
      
      const fragmentation = ((internalFragmentation + unusedBlocks) / totalMemory) * 100
      const utilization = (totalAllocated / totalMemory) * 100
      const allocationTime = end - start
      const externalFragmentation = unusedBlocks
      const totalWasted = internalFragmentation + externalFragmentation;

      simResults[type] = {
        allocation,
        internalFragmentation,
        externalFragmentation,
        fragmentation,
        utilization,
        allocationTime,
        allocatedProcesses,
        notAllocated: processes.length - allocatedProcesses,
        totalWasted,
      }
    })

    setResults(simResults)
  }

  return (
    <div className="w-screen min-h-screen bg-gray-100 flex flex-col items-center p-8 thin-scrollbar">
      <h1 className="flex text-3xl font-bold text-gray-600 mb-6 justify-center">
        Memory Management Simulation
      </h1>

      <div className="flex flex-col items-start md:flex-row gap-6 w-full max-w-6xl mb-6">
        {/* Random Data */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
            Random Input
          </h2>

          <div className="flex flex-col md:flex-row items-start gap-6 mb-4">
            {/* Number of blocks */}
            <div className="flex-1">
              <label className="block text-gray-700 font-semibold mb-2">
                Number of Memory Blocks
              </label>
              <input
                type="number"
                value={numBlocks}
                onChange={(e) => setNumBlocks(e.target.value)}
                placeholder="e.g. 4"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {/* Block range */}
            <div className="flex-1 rounded-lg">
              <label className="block text-gray-700 font-semibold mb-2">
                Memory Block Size Range (KB)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={blockMin}
                  onChange={(e) => setBlockMin(parseInt(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Min KB"
                />
                <input
                  type="number"
                  value={blockMax}
                  onChange={(e) => setBlockMax(parseInt(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Max KB"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-start gap-6 mb-4">
            {/* Number of processes */}
            <div className="flex-1">
              <label className="block text-gray-700 font-semibold mb-2">
                Number of Processes
              </label>
              <input
                type="number"
                value={numProcesses}
                onChange={(e) => setNumProcesses(e.target.value)}
                placeholder="e.g. 6"
                className="w-full border rounded px-3 py-2"
              />
            </div>

            {/* Process range */}
            <div className="flex-1 rounded-lg">
              <label className="block text-gray-700 font-semibold mb-2">
                Process Size Range (KB)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={processMin}
                  onChange={(e) => setProcessMin(parseInt(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Min KB"
                />
                <input
                  type="number"
                  value={processMax}
                  onChange={(e) => setProcessMax(parseInt(e.target.value))}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Max KB"
                />
              </div>
            </div>
          </div>

          <button
            onClick={generateRandomData}
            className="bg-gray-300 px-4 py-2 shadow-md rounded cursor-pointer hover:bg-gray-400 font-semibold"
          >
            Generate Random Data
          </button>
        </div>

        {/* Manual Data */}
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl mb-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">
            Manual Input
          </h2>

          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-gray-700 font-semibold mb-2">
                Memory Block Sizes
              </label>
              <input
                type="text"
                placeholder="e.g. 8, 64, 1024"
                value={manualBlocksInput}
                onChange={(e) => setManualBlocksInput(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="flex-1">
              <label className="block text-gray-700 font-semibold mb-2">
                Process Sizes
              </label>
              <input
                type="text"
                placeholder="e.g. 120, 220, 350"
                value={manualProcessesInput}
                onChange={(e) => setManualProcessesInput(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
          <button
            onClick={() => {
              const parsedBlocks = manualBlocksInput
                .split(',')
                .map((v) => parseInt(v.trim()))
                .filter((v) => !isNaN(v));

              const parsedProcesses = manualProcessesInput
                .split(',')
                .map((v) => parseInt(v.trim()))
                .filter((v) => !isNaN(v));

              if (parsedBlocks.length === 0 || parsedProcesses.length === 0) {
                alert('Please enter both memory blocks and processes!');
                return;
              }

              setBlocks(parsedBlocks);
              setProcesses(parsedProcesses);
              setResults(null);
            }}
            className="bg-gray-300 px-4 py-2 shadow-md rounded cursor-pointer hover:bg-gray-400 font-semibold"
          >
            Generate Manual Data
          </button>
        </div>
      </div>

      {/* Data Generated */}
      {blocks.length > 0 && (
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl mb-6">
          <h2 className="flex text-xl font-semibold text-gray-700 mb-4 justify-center">Input Data</h2>
          <div className="max-h-62 overflow-y-auto border border-gray-300 rounded-lg thin-scrollbar">
            <table className="w-full border-collapse">
              <thead className="bg-gray-300">
                <tr>
                  <th className="py-2 px-4 border border-gray-200">Block #</th>
                  <th className="py-2 px-4 border border-gray-200">Block Size (KB)</th>
                  <th className="py-2 px-4 border border-gray-200">Process #</th>
                  <th className="py-2 px-4 border border-gray-200">Process Size (KB)</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.max(blocks.length, processes.length) }).map(
                  (_, i) => (
                    <tr key={i} className="hover:bg-gray-50 text-center">
                      <td className="py-2 px-4 border border-gray-200">{i < blocks.length ? i + 1 : '-'}</td>
                      <td className="py-2 px-4 border border-gray-200">
                        {i < blocks.length ? `${blocks[i]} KB` : '-'}
                      </td>
                      <td className="py-2 px-4 border border-gray-200">{i < processes.length ? i + 1 : '-'}</td>
                      <td className="py-2 px-4 border border-gray-200">
                        {i < processes.length ? `${processes[i]} KB` : '-'}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          
          {/* Memory Visualization */}
          <h3 className="flex justify-center text-xl font-semibold text-gray-700 mt-4">Memory Visualization</h3>
          <div className="w-full bg-gray-200 rounded-xl overflow-hidden my-4 flex">
            {blocks.map((b, i) => {
              const totalMemory = blocks.reduce((a, c) => a + c, 0);
              const widthPercent = (b / totalMemory) * 100;

              return (
                <div
                  key={i}
                  title={`Block ${i + 1} - ${b} KB`}
                  style={{
                    width: `${widthPercent}%`,
                    height: '3rem',
                    borderRight:
                      i !== blocks.length - 1 ? '1px solid rgba(255,255,255,0.7)' : 'none',
                  }}
                  className="bg-gray-400 transition-all duration-300"
                ></div>
              );
            })}
          </div>

          <div className="mt-4">
            <button
              onClick={runSimulation}
              className="bg-gray-300 px-4 py-2 shadow-md rounded cursor-pointer hover:bg-gray-400 font-semibold"
            >
              Run Simulation
            </button>
          </div>
        </div>
      )}

      {/* Result Tables */}
      {results && (
        <div className="grid md:grid-cols-3 gap-6 w-full">
          {Object.entries(results).map(([algo, data]) => (
            <div key={algo} className="bg-white shadow-lg rounded-lg p-6">
              <h2 className="flex justify-center text-xl font-semibold text-gray-700 mb-4">
                {algo} Results
              </h2>

              <div className="max-h-62 overflow-y-auto border border-gray-200 rounded-lg mb-4 thin-scrollbar">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-300">
                    <tr>
                      <th className="py-2 px-4 border border-gray-200">Block</th>
                      <th className="py-2 px-4 border border-gray-200">Size (KB)</th>
                      <th className="py-2 px-4 border border-gray-200">Allocated</th>
                      <th className="py-2 px-4 border border-gray-200">Process</th>
                      <th className="py-2 px-4 border border-gray-200">Process (KB)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blocks.map((b, i) => {
                      const procIndex = data.allocation.findIndex(
                        (blockIdx) => blockIdx === i
                      )
                      return (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border border-gray-200 text-center">{i + 1}</td>
                          <td className="py-2 px-4 border border-gray-200 text-center">{b}</td>
                          <td className="py-2 px-4 border border-gray-200 text-center">
                            {procIndex !== -1 ? 'Yes' : 'No'}
                          </td>
                          <td className="py-2 px-4 border border-gray-200 text-center">
                            {procIndex !== -1 ? `${procIndex + 1}` : '-'}
                          </td>
                          <td className="py-2 px-4 border border-gray-200 text-center">
                            {procIndex !== -1 ? processes[procIndex] + ' KB' : '-'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              
              {/* Memory Visualization */}
              <h3 className="flex justify-center text-xl font-semibold text-gray-700 mt-4">Memory Visualization</h3>
              <div className="w-full bg-gray-200 rounded-xl overflow-hidden my-4 flex">
                {blocks.map((b, i) => {
                  const totalMemory = blocks.reduce((a, c) => a + c, 0);
                  const widthPercent = (b / totalMemory) * 100;

                  return (
                    <div
                      key={i}
                      title={`Block ${i + 1} - ${b} KB`}
                      style={{
                        width: `${widthPercent}%`,
                        height: '3rem',
                        marginRight: i !== blocks.length - 1 ? '1px' : '0',
                      }}
                      className={`transition-all duration-300 ${
                        data.allocation.includes(i)
                          ? 'bg-green-500'
                          : 'bg-gray-400'
                      }`}
                    ></div>
                  );
                })}
              </div>

              {/* Metrics */}
              <div className="text-gray-700 space-y-1">                
                <p><strong>Allocation Time:</strong> {data.allocationTime.toFixed(2)} ms</p>
                <p><strong>Total Processes:</strong> {processes.length}</p>
                <p><strong>Allocated:</strong> {data.allocatedProcesses}</p>
                <p><strong>Not Allocated:</strong> {data.notAllocated}</p>
                <p><strong>Memory Utilization:</strong> {data.utilization.toFixed(2)}%</p>
                <p><strong>Internal Fragmentation:</strong> {data.internalFragmentation} KB</p>
                <p><strong>External Fragmentation:</strong> {data.externalFragmentation} KB</p>
                <p><strong>Total Fragmentation:</strong> {data.totalWasted} KB ({data.fragmentation.toFixed(2)}%)</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
