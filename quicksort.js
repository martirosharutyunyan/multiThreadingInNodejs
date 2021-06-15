function quicksort(array) {
    if (array.length < 2) {
        return array;
    };
    const pivot = array[0]
    const less = array.filter(e => e < pivot)
    const greater = array.filter(e => e > pivot)
    return [...quicksort(less), pivot, ...quicksort(greater)];
};

module.exports = quicksort