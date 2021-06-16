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


// generate tasks
const tasks = []
for (let i = 0; i < 43; i++) {
    tasks.push(i)
}; 

// separate array to matrix with sizes (Math.ceil(tasks.length / cpuCount)) x cpuCount  
const separateTasksToMatrix = tasks => {
    let $ = 0
    const task = []
    for (let i = 0; i < tasks.length; i++) {
        if (cpuCount <= i) {
            if($ === cpuCount){
                $ = 0
            }
            task[$].push(tasks[i])
            $++
            continue;
        };
        task.push([tasks[i]])
    };
    return task;
}
const task = separateTasksToMatrix(tasks)

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

// get and log the results and exit from process
calculations(task).then(res => {
    console.log(res)
    process.exit(0)
})