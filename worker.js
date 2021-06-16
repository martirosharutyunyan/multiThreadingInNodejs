const calculate = x => x**2 + 2*x + 15;


process.on('message', message => {
    const results = message.task.map(calculate)
    process.send({ results })
    console.log(`I am worker: ${process.pid} and i calculate ${JSON.stringify(message.task)} and return result: ${JSON.stringify(results)}`)
})
