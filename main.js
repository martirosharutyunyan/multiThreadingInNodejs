const os = require('os');
const cp = require('child_process');
const quicksort = require('./quicksort')


// count of cpu threads
const cpuCount = os.cpus().length


// create workers for every thread
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
console.log(task)


// get values and sort results
const sortResults = results => {
    const sortedResults = []
    results.forEach(e => e.forEach(i => sortedResults.push(i)))
    return quicksort(sortedResults);
}


const calculations = task => {
    return new Promise((res, rej) => {
        let allResults = []
        workers.forEach((worker, i) => {
            worker.send({ task:task[i] })
            worker.on('exit', console.log)
            worker.on('message', message => {
                allResults.push(message.results)
                if (allResults.length === cpuCount) {
                    res(sortResults(allResults))
                };
            })
        })
    })
}

calculations(task).then(res => {
    console.log(res)
    process.exit(0)
})