let command = "       1111        2222          "
let [g,o] = command.split(" ").filter(s=>s !== "");
console.log(g,o)