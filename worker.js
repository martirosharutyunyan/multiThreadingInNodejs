const calculate = x => x**2 + 2*x + 15;


process.on('message', message => {
    const results = message.task.map(calculate)
    process.send({ results })
})
