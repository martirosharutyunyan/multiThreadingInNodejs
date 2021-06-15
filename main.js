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
const tasks = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const separateTasksToArray = tasks => {
    const countOfSeparateTasks = Math.ceil(tasks.length / cpuCount)
    let $ = 0
    const task = []
    for (let i = 0; i < cpuCount; i++) {
        let oneTask = []
        for (let j = 0; j < countOfSeparateTasks; j++) {
            oneTask.push(tasks[j + $])
        };
        $+= countOfSeparateTasks
        task.push(oneTask)
    };
    return task;
}
const task = separateTasksToArray(tasks)


// get, filter null values and sort results
const clearResults = results => {
    const clearedResults = []
    results.forEach(e => e.forEach(i => i ? clearedResults.push(i) : null))
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
