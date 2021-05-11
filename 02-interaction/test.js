(async () => {
  await setTimeout(() => {
    console.log("First!");
  }, 1000); 
})();

(async () => {
  await console.log("Second!");
})();

console.log("Third!");