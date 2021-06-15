const os = require('os');
const cp = require('child_process');
const quicksort = require('./quicksort')
const cpuCount = os.cpus().length


// get workers
const getWorkers = (workerFilePath, cpuCount) => {
    const workers = []
    for (let i = 0; i < cpuCount; i++) {
        const worker = cp.fork(workerFilePath)
        workers.push(worker)
    };
    return workers;
}
const workers = getWorkers('./worker.js', cpuCount);


// separate Tasks to array 
const tasks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
const separateTasksToArray = tasks => {
    let $ = 0
    const task = []
    for (let i = 0; i < tasks.length; i++) {
        if (cpuCount <= i) {
            task[$].push(tasks[i])
            $++
            continue;
        };
        task.push([tasks[i]])
    };
    return task;
}
const task = separateTasksToArray(tasks)

// get values and sort results
const clearResults = results => {
    const clearedResults = []
    results.forEach(e => e.forEach(i => clearedResults.push(i)))
    return quicksort(clearedResults);
}

new Promise((res, rej) => {
    let allResults = []
    workers.forEach((worker, i) => {
        worker.send({ task:task[i] })
        worker.on('exit', console.log)
        worker.on('message', message => {
            allResults.push(message.results)
            if (allResults.length === cpuCount) {
                res(clearResults(allResults))
            };
        })
    })
}).then(res => {
    console.log(res)
    process.exit(0)
})
