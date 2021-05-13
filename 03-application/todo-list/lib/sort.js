// return copy of array (todo lists or todos)
// sorted by title and status (done/no done)
function sortByTitleAndStatus(array) {
  return array.slice()
              .sort((elementA, elementB) => {
                let titleA = elementA.getTitle().toLowerCase();
                let titleB = elementB.getTitle().toLowerCase();

                if (titleA > titleB) return 1;
                else if (titleA < titleB) return -1;
                else return 0;
              })
              .sort((elementA, elementB) => {
                if (elementA.isDone() && !elementB.isDone()) return 1;
                else if (!elementA.isDone() && elementB.isDone()) return -1;
                else return 0;
              });
}

module.exports = { sortByTitleAndStatus };