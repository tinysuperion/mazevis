import { useState, useRef } from 'react'

//blah

let emptyGrid = [];

let tiles = new Array(17*17);

// oh i remember now
// the references were so i could change the border to make it connect to other tiles and look seemless
// ill do that later if i remember

// i miss my type declarations, tiles contains references, lots of them, its all the tiles

for (let row = 0; row < 17; row++){

  let row = [];

  for (let col = 0; col < 17; col++){

    row.push(0);
  }

  emptyGrid.push(row);
}

const direction = [-2, 2];

// i have to implement my own heap datastructure so wahtever

// class node{

//   constructor(left, right){

//     this.left = left;
//     this.right = right;
//   }
// }

// nodes are a lot of effort, arrays have o(1) indexing, easier to use

class heap{

  constructor(){

    this.nodes = [];
    this.size = 0;
  }

  // to get a child at some index its just
  // nodes[2 * parentIndex + {1 or 2 for left or right child}] 

  top(){

    if (this.size < 1){

      return -1;
    }

    return this.nodes[0];
  }

  insert(value){

    // function for bubble sort basically

    // change it later so that value is an array
    // with the weight and another array containing a position

    // console.log("insert", value);

    return new Promise(async (resolve)=>{

      // await this.scale();

      this.nodes[this.size] = value; // add it to the very end then bubble it to where it belongs
      this.size++;

      let index = this.size-1;
      let parent = Math.floor((index-1)/2);

      // console.log(this.nodes, parent);

      // console.log("parent", this.nodes[parent], "top", this.top());

      if (parent < 0){

        resolve();
        return;
      }

      while(parent >= 0 && this.nodes[parent][0] > value[0]){

        // keep swapping or as long as the parent is greater

        // console.log(`swap ${this.nodes[parent][0]} and ${value[0]}`);

        const storage = this.nodes[parent];

        this.nodes[parent] = value;
        this.nodes[index] = storage;

        index = parent;
        parent = Math.floor((index-1)/2);
      }

      resolve();
    })

  }

  pop(){

    if (this.size == 0){

      return -1;
    }

    else if (this.size == 1){
      
      this.nodes[0] = null;
    }

    let index = 0;

    this.nodes[0] = this.nodes[this.size-1]; 
    // doesnt necessarily have to be the last node, it just has to be a leaf node to make rearrangements a lot easier
    this.size--;

    while (index*2+1 < this.size){
      // index*2+1 represents the left child

      let minChild;

      // get the smaller child to compare the current value against

      if (index*2+2 >= this.size || this.nodes[index*2+1][0] < this.nodes[index*2+2][0]){

        minChild = index*2+1;
      }
      else{

        minChild = index*2+2;
      }

      if (this.nodes[index][0] < this.nodes[minChild][0]){

        break;
      }

      else{

        const storage = this.nodes[index];
        
        this.nodes[index] = this.nodes[minChild];
        this.nodes[minChild] = storage;
      }

      index = minChild;

    }

    return 1;

  }
}

function changeIndent(text, ratio){

  const lines = text.split('\n');

  const reformattedLines = lines.map((line) =>{

    let index = 0;
    let spaces = 0;

    while (line[index] == ' ' || line[index] == '\t'){

      if (line[index] == '\t'){

        spaces += 4;
      }
      else{

        spaces++;
      }

      index++;
    }

    const trimmed = line.trimStart();
    const newIndent = ' '.repeat(spaces / ratio);

    return newIndent + trimmed;
  })

  return reformattedLines.join("\n");
}

let debounce = false;

let pause = false;
let ongoing = false;
let skip = false;
let reset = false;
let setting = "start";

let start = -1;
let end = -1;

let displayNum = false;

let delayTime = 50;
let selection = "";

let implementationRef;

function delay(time){

  return new Promise((resolve)=>{

    if ((skip || time == 0) && !reset){

      resolve();
      return;
    }

    setTimeout(resolve, time);
  })

}

function App() {

  const [grid, setState] = useState(emptyGrid);
  const [position, setPosition] = useState(40);
  const [text, setText] = useState();
  const [code, setCode] = useState();
  const [visibility, setVisibility] = useState();

  const implementationRef = useRef(null);

  const tileRef = useRef(new Array(17*17));

  // const reference = useRef(null);

  // the plan is to make a grid put it in a state variable thing
  // then map that to create the actual grid and use setstate

  // console.log(grid);

  // window.addEventListener("resize", function(){

    

  // });

  // deal with problems with the grid when height of window is > than width
  // since it just collides with the interface

  // pathfinding algorithms
  
  // console.log("run");
  
  function dfs(row, col){

    let running = false;

    let lastRow = -1;
    let lastCol = -1;

    let path = [];

    const newGrid = grid;
    // weirdly const just means it cant be reassigned to a new array (or mess with memory in general) and i guess you cant alter size
    // you can still alter the elements within it

    return new Promise((done)=>{

    const mainInterval = setInterval(async ()=>{

      if (running || pause){

        // console.log("still running");
        return;
        // end iteration if still processing last iteration
      }

      if (reset){

        clearInterval(mainInterval);
        done();
        reset = false;
        return;
      }

      running = true;

      // using a while loop causes the entire website to freeze, i probably just need to use setinterval
      // so the website has some time to itself i guess, i was wondering why it didnt work, it was just because
      // of the loop in general
  
      let directionRow = 0;
      let directionCol = 0;

      // console.log(`row ${row} col ${col}`);

      newGrid[row][col] = 1;
      setState(newGrid.slice());

      // await new Promise ((resolve)=>{

      //   setTimeout(() => {resolve()}, 50);
      // })

      await delay(delayTime);
  
      if (Math.round(Math.random()) < 1){
  
        directionRow = direction[Math.round(Math.random())];
      }
      else{
  
        directionCol = direction[Math.round(Math.random())];
      }
  
      // backtracking

       if (((row-2) < 0 || newGrid[row-2][col] >= 1) && ((row+2) >= newGrid.length || newGrid[row+2][col] >= 1) && (col-2 < 0 || newGrid[row][col-2] >= 1) && ((col+2) >= newGrid.length || newGrid[row][col+2] >= 1)){

        // dead end, backtrack, or more like go back through a queue, not using recursion even though it could do all this
        // simply due to how expensive it is which is why its one of the leading causes of a stack overflow

        let debounce = false;

        const backtrack = setInterval(async ()=>{

          if (debounce){

            return;
          }

          debounce = true;

          newGrid[row][col] = 2;
          setState(newGrid.slice());

          if (!(((row-2) < 0 || newGrid[row-2][col] >= 1) && ((row+2) >= newGrid.length || newGrid[row+2][col] >= 1) && ((col-2) < 0 || newGrid[row][col-2] >= 1) && ((col+2) >= newGrid.length || newGrid[row][col+2] >= 1))){

            clearInterval(backtrack);

            running = false;
            // next iteration will use the value it ended off at, no promise needed

            newGrid[lastRow + (row - lastRow)/2][lastCol + (col - lastCol)/2] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            newGrid[row][col] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            // console.log(`finished backtrack at ${row}, ${col}`);

            return;
          }


          if (path.length == 0){

            console.log("finish");

            clearInterval(mainInterval);
            clearInterval(backtrack);

            done();

            return;
          }

          lastRow = row;
          lastCol = col;
  
          row = path[path.length-1][0];
          col = path[path.length-1][1];

          newGrid[lastRow + (row - lastRow)/2][lastCol + (col - lastCol)/2] = 2;
          setState(newGrid.slice());
          await delay(delayTime)

          newGrid[row][col] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          // console.log(`backtrack, ${grid[row][col]}`);
  
          path.pop();

          debounce = false;

        }, 0);

        return;
        // dont want to continue because it goes out of bounds and these intervals arent synchronized in the slightest
        // oh yeah i should use promises

        // ok promises sort of suck, not really but they arent working and im not sure why
        // ill probably just use async await which seems more reliable
        // turns out i dont know what any of that really is

        // anyway i guess i got it working by just awaiting the promise
      }
      
      // boundschecking

      if ((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length || newGrid[row + directionRow][col + directionCol] >= 1){

        let promise = new Promise(async (resolve)=>{
          
          let debounce = false;

          const boundsCheck = setInterval(async ()=>{

            if (debounce){

              return;
            }

            debounce = true;

            if (!((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length || newGrid[row + directionRow][col + directionCol] >= 1)){

              clearInterval(boundsCheck);

              resolve();

              return;
            }
  
            if (Math.round(Math.random()) < 1){
    
              directionRow = direction[Math.round(Math.random())];
              directionCol = 0;
            }
            else{
        
              directionCol = direction[Math.round(Math.random())];
              directionRow = 0;
            }

            debounce = false;
  
          },0);

        })

        await promise;
      }

      // console.log([row,col]);
      // console.log(newGrid[row][col]);
      // console.log(grid[row][col]);
      // console.log(tiles[row*17 + col]);

      // console.log(`direction is ${row + directionRow}, ${col + directionCol}`)

      newGrid[row + directionRow/2][col + directionCol/2] = 1;
      setState(newGrid.slice());

      await delay(delayTime);

      path.push([row, col]);

      row += directionRow;
      col += directionCol;

      // for some reason not causing a rerender?????
      // look here later im on break https://stackoverflow.com/questions/25937369/react-component-not-re-rendering-on-state-change
      // looks like its because it doesnt work when setting by reference, it has to be to a value i guess?
      // assigning it to a new array copies by reference so it needs to be sliced for a "shallow copy" which is just the value

      running = false;

    }, 0);


    // last things to do
    // fix up bugs and anything that isnt working properly
    // add gaps, fill in gaps

    })

  }

  function AldousBroder(row, col){

    let available = [];

    for (let row = 0; row < 17; row+=2){

      for (let col = 0; col < 17; col+=2){

        available.push(row*17 + col);
      }
    }

    const newGrid = grid;

    let lastRow = -1;
    let lastCol = -1;

    let running = false;

    // const newGrid = grid;
    // weirdly const just means it cant be reassigned to a new array and i guess you cant alter size
    // you can still alter the elements within it

    return new Promise((done)=>{

    const mainInterval = setInterval(async ()=>{

      if (running == true){

        return;
        // end iteration if still processing last iteration
      }

      if (reset){

        clearInterval(mainInterval);
        done();
        reset = false;
        return;
      }

      running = true;
  
      let directionRow = 0;
      let directionCol = 0;


      newGrid[row][col] = 2;
      setState(newGrid.slice());

      if (lastRow != -1){

        newGrid[lastRow][lastCol] = 1;
        setState(newGrid.slice());
      }

      await delay(delayTime);

      if (available.indexOf(row*17 + col) != -1){

        available.splice(available.indexOf(row*17 + col),1);
      }

      if (available.length == 0){

        newGrid[row][col] = 1;
        setState(newGrid.slice());

        clearInterval(mainInterval);
        done();
        return;
      }
  
      if (Math.round(Math.random()) < 1){
  
        directionRow = direction[Math.round(Math.random())];
      }
      else{
  
        directionCol = direction[Math.round(Math.random())];
      }


      // finish some time, to ccheck when donedfjgjn you get it
      // do the thing you did in wilson 

      // boundschecking

      if ((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length){

        let promise = new Promise(async (resolve)=>{
          
          // console.log(`bounds check position ${row}, ${col} to ${row + directionRow}, ${col + directionCol}`);

          // await new Promise ((resolve)=>{

          //   setTimeout(() => {resolve()}, 3000);
          // })

          let debounce = false;

          const boundsCheck = setInterval(async ()=>{

            if (debounce == true){

              return;
            }

            debounce = true;

            if (!((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length)){

              clearInterval(boundsCheck);

              resolve();

              return;
            }
  
            if (Math.round(Math.random()) < 1){
    
              directionRow = direction[Math.round(Math.random())];
              directionCol = 0;
            }
            else{
        
              directionCol = direction[Math.round(Math.random())];
              directionRow = 0;
            }

            debounce = false;
  
          },0);

        })

        await promise;
      }

      // console.log([row,col]);
      // console.log(newGrid[row][col]);
      // console.log(grid[row][col]);
      // console.log(tiles[row*17 + col]);

      // console.log(`direction is ${row + directionRow}, ${col + directionCol}`)

      if (!(newGrid[row + directionRow][col + directionCol] == 1 && newGrid[row + (directionRow/2)][col + (directionCol/2)] != 1)){

        newGrid[row + directionRow/2][col + directionCol/2] = 1;
        setState(newGrid.slice());
      }

      await delay(delayTime);

      lastRow = row;
      lastCol = col;

      row += directionRow;
      col += directionCol;

      running = false;

    }, 0);

    })

  }



  function prims(row, col){

    // implemented heap, probably, hopefully it works, its pretty basic
    // to implement a heap just create an array, for any index that index doubled + 1 or 2 is its child
    // accounting for the other half of the tree

    // finished prims really easily, i havent tested it and i wont so ill save that for tomorrow or something
    // lots of time left in the day but this will probably be it

    let running = false;

    const newGrid = grid;
    const minHeap = new heap();

    return new Promise((done)=>{

    const mainInterval = setInterval(async ()=>{

      if (running || pause){

        return;
      }

      if (reset){

        clearInterval(mainInterval);
        done();
        reset = false;
        return;
      }

      running = true;

      newGrid[row][col] = 1;
      setState(newGrid.slice());
      await delay(delayTime);

      if (row-2 >= 0 && newGrid[row-2][col] == 0){

        await minHeap.insert([Math.round(Math.random()*1000), [[row, col],[row-2, col]]]);
      }

      if (row+2 < grid.length && newGrid[row+2][col] == 0){

        await minHeap.insert([Math.round(Math.random()*1000), [[row, col],[row+2, col]]]);
      }

      if (col-2 >= 0 && newGrid[row][col-2] == 0){

        await minHeap.insert([Math.round(Math.random()*1000), [[row, col],[row, col-2]]]);
      }

      if (col+2 < grid.length && newGrid[row][col+2] == 0){

        await minHeap.insert([Math.round(Math.random()*1000), [[row, col],[row, col+2]]]);
      }

      // more awaits for popping wahtever awthever

      // const minimum = minHeap.top();
      // console.log(minimum);

      const boundsCheck = new Promise((resolve)=>{

        let debounce = false;

        const validCheck = setInterval(async () => {

          if (debounce){

            return;
          }

          debounce = true;
          
          const minimum = minHeap.top();

          // console.log(minimum);

          const origin = minimum[1][0];
          const destination = minimum[1][1];

          if (newGrid[destination[0]][destination[1]] == 0){

            clearInterval(validCheck);

            // oops i have to contain 2 arrays, one for the orign second for destination

            newGrid[origin[0] + (destination[0] - origin[0])/2][origin[1] + (destination[1] - origin[1])/2] = 1;
            setState(newGrid.slice());
            await delay(delayTime);

            row = destination[0];
            col = destination[1];

            resolve();
          }

          minHeap.pop();

          if (minHeap.size == 0){

            done();

            clearInterval(mainInterval);
            clearInterval(validCheck);

            resolve();
            return;
          }

          debounce = false;

        }, 0);

      },0);

      await boundsCheck;

      running = false;

    }, 0);

    })
  }

  function kruskals(row, col){

    // basically just copy and paste prims but contain an array of all possible cells like wilson and alder

    const newGrid = grid;

    let walls = [];
    let trees = new Map;

    for (let row = 0; row < 17; row+=2){

      for (let col = 0; col < 17; col+=2){

        if (row != 16){

          walls.push([[row, col], [row+2, col]]);
        }

        if (col != 16){

          walls.push([[row, col], [row, col+2]]);
        }

      }
    }

    setState(newGrid.slice());

    let running = false;

    let treeID = -1;
    // basically is an id for what tree something is in, this value is saved in the grid

    return new Promise((done)=>{

    const mainInterval = setInterval(async ()=>{

      if (walls.length == 0){

        console.log("finish");

        clearInterval(mainInterval);
        done();
        return;
      }

      if (running || pause){

        console.log("running...");
        
        return;
      }

      if (reset){

        clearInterval(mainInterval);
        done();
        reset = false;
        return;
      }

      running = true;

      let index = Math.floor(Math.random() * (walls.length-1))

      let wall = walls[index];
      row = wall[0][0];
      col = wall[0][1];

      walls.splice(index, 1);

      let destinationRow = wall[1][0];
      let destinationCol = wall[1][1];

      // check for connection

      console.log(row, col);

      if (newGrid[row][col] < 0){
        // if a wall/tree already exists at this position nothing needs to be done sincee its already apart of it
        // im not sure if this is best practice but it works and its not hard to look at
      }

      else if (row-2 >= 0 && newGrid[row-1][col] < 0){

        newGrid[row][col] = newGrid[row-2][col];

        let copy = trees.get(newGrid[row-2][col]);

        copy.push(row * 17 + col);

        trees.set(newGrid[row][col], copy);

        // trees.set(newGrid[row][col], trees.get(newGrid[row][col]).push(row * 17 + col));
        // worst hashmaps ive ever seen, just look at that syntax
      }

      else if (row+2 < 17 && newGrid[row+1][col] < 0){

        newGrid[row][col] = newGrid[row+2][col];

        let copy = trees.get(newGrid[row+2][col]);

        copy.push(row * 17 + col);

        trees.set(newGrid[row][col], copy);

        // trees.set(newGrid[row][col], trees.get(newGrid[row][col]).push(row * 17 + col));
      }

      else if (col-2 >= 0 && newGrid[row][col-1] < 0){

        newGrid[row][col] = newGrid[row][col-2];

        let copy = trees.get(newGrid[row][col-2]);

        copy.push(row * 17 + col);

        trees.set(newGrid[row][col], copy);
        
        // trees.set(newGrid[row][col], trees.get(newGrid[row][col]).push(row * 17 + col));
      }

      else if (col+2 >= 0 && newGrid[row][col+1] < 0){

        newGrid[row][col] = newGrid[row][col+2];

        let copy = trees.get(newGrid[row][col+2]);

        copy.push(row * 17 + col);

        trees.set(newGrid[row][col], copy);

        // trees.set(newGrid[row][col], trees.get(newGrid[row][col]).push(row * 17 + col));
      }

      else{

        console.log("new tree");

        newGrid[row][col] = treeID;
        trees.set(treeID, [row * 17 + col]);

        console.log(trees.get(treeID), treeID);

        treeID--;
      }

      // newGrid[row][col] = 1;
      setState(newGrid.slice());

      await delay(delayTime);

      if (newGrid[row][col] == newGrid[destinationRow][destinationCol]){
        // choose a new wall
        console.log("new wall");
        running = false;
        return;
      }

      if (newGrid[destinationRow][destinationCol] != 0){

        // newGrid[row][col] = newGrid[row + directionRow][col + directionCol];
        // newGrid[row + directionRow/2][col + directionCol/2] = newGrid[row][col];

        // need to get a hashmap, store the entire tree there, then go through the entire tree
        // and change its values to what its going to, or the other tree, doesnt matter

        // available.splice(available.indexOf(row * newGrid.length + col), 1);
        // walls.splice(index, 1);

        console.log("combine", newGrid[row][col]);

        let tree = trees.get(newGrid[row][col]);
        const id = newGrid[row][col];

        console.log(tree);

        // newGrid[row + directionRow/2][col + directionCol/2] = newGrid[row + directionRow][col + directionCol];
        newGrid[row + (destinationRow - row)/2][col + (destinationCol - col)/2] = newGrid[destinationRow][destinationCol];

        let copy = trees.get(newGrid[destinationRow][destinationCol]);
        console.log(destinationRow, destinationCol, copy);

        for (const position of tree){

          const row_ = Math.floor(position / 17);
          const col_ = position % 17;

          console.log(position, row_, col_, row, col);

          newGrid[row_][col_] = newGrid[destinationRow][destinationCol];
          // doesnt connect to eachother, just the vertex/node/tile/whatever

          copy.push(position);
        }

        trees.set(newGrid[destinationRow][destinationCol], copy);
        trees.delete(id);

        setState(newGrid.slice());

        await delay(delayTime); 
      }
      else{

        console.log("empty");

        let copy = trees.get(newGrid[row][col]);
        copy.push(destinationRow * 17 + destinationCol);
        trees.set(newGrid[row][col], copy);

        newGrid[row + (destinationRow - row)/2][col + (destinationCol - col)/2] = newGrid[row][col];
        setState(newGrid.slice());

        await delay(delayTime);

        newGrid[destinationRow][destinationCol] = newGrid[row][col];
        setState(newGrid.slice());

        await delay(delayTime);
      }

      // index = Math.round(Math.random() * (available.length-1));

      // row = Math.floor(available[index] / 17);
      // col = available[index] % 17;
      // select new valid starting point

      running = false;

    },0)

    })

  }


  function wilsons(row, col){

    // basically dfs but start randomly and go until you hit another cell already in the maze, this makes it unbiased

    const newGrid = grid;

    let cells = [];

    for (let row = 0; row < 17; row+=2){

      for (let col = 0; col < 17; col+=2){

        cells.push(row * 17 + col);
      }
    }

    let count = 3;

    let index = Math.round(Math.random() * (cells.length-1));

    console.log(index);

    row = Math.floor(cells[index] / 17);
    col = cells[index] % 17; 

    console.log(row, col);

    newGrid[row][col] = 1;
    setState(newGrid.slice());

    cells.splice(cells.indexOf(row * 17 + col), 1);

    index = Math.round(Math.random() * (cells.length-1));

    row = Math.floor(cells[index] / 17);
    col = cells[index] % 17; 

    let path = [];

    let running = false;

    return new Promise((done)=>{

    const mainInterval = setInterval(async ()=>{

      if (running || pause){

        return;
      }

      if (reset){

        clearInterval(mainInterval);
        done()
        reset = false;
        return;
      }

      if (cells.length == 0){

        console.log("finish");

        clearInterval(mainInterval);
        done();
        return;
      }

      // console.log("start interval");

      running = true;

      let directionRow = 0;
      let directionCol = 0;

      // console.log(`row ${row} col ${col}`);

      newGrid[row][col] = count;
      setState(newGrid.slice());
      await delay(delayTime);


      cells.splice(cells.indexOf(row * 17 + col), 1);

      path.push(row * 17 + col);

      // console.log(newGrid[row][col]);
  
      if (Math.round(Math.random()) < 1){
  
        directionRow = direction[Math.round(Math.random())];
      }
      else{
  
        directionCol = direction[Math.round(Math.random())];
      }

      if ((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length || newGrid[row + directionRow][col + directionCol] >= 1){

        let promise = new Promise(async (resolve)=>{
          
          // console.log(`bounds check position ${row}, ${col} to ${row + directionRow}, ${col + directionCol}`);

          // await new Promise ((resolve)=>{

          //   setTimeout(() => {resolve()}, 3000);
          // })

          let debounce = false;

          const boundsCheck = setInterval(async ()=>{

            // 3 checks here, check if this path starts a loop, check if it intersects another tile, and
            // generally check if where the path is going is in bounds

            // console.log("bounds check");

            if (debounce == true){

              return;
            }


            if (!((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length ||newGrid[row + directionRow][col + directionCol] == 0 || newGrid[row + directionRow][col + directionCol] != count) && newGrid[row + directionRow/2][col + directionCol/2] == 0){

              // this is the case where a loop is formed (when the value at this position is count)
              // this gets rid of the loop by starting where the loop was formed

              // to implement just make a stack that backtracks until it reaches it
              // maybe works now, im not testing

              debounce = true;

              console.log("erasing loop");

              let lastRow = Math.floor(path[path.length-1] / 17);
              let lastCol = path[path.length-1] % 17;

              let row_;
              let col_;

              const promise_ = new Promise(async (resolve)=>{

                // i could instead repurpose row instead of making a new variable but given
                // their different uses i think its easier to see doing this, besides i wouldnt have to
                // then make 2 variables for the intersection or just one array

                let debounce = false;

                const eraseLoop = setInterval(async () => {

                  if (debounce){

                    return;
                  }

                  if (reset){

                    clearInterval(mainInterval);
                    clearInterval(wilsons);
                    done()
                    reset = false;
                    return;
                  }

                  debounce = true;

                  row_ = Math.floor(path[path.length-1] / 17);
                  col_ = path[path.length-1] % 17;

                  if (row_ != row + directionRow || col_ != col + directionCol){
                    
                    console.log(row_, col_);

                    console.log(newGrid[row_][col_]);

                    newGrid[row_ + (lastRow - row_)/2][col_ + (lastCol - col_)/2] = 0;
                    setState(newGrid.slice());
                    await delay(delayTime);

                    newGrid[row_][col_] = 0;
                    setState(newGrid.slice());
                    await delay(delayTime);

                    cells.push(row_ * 17 + col_);

                    lastRow = row_;
                    lastCol = col_;

                    path.pop();

                    debounce = false;

                    return;
                  }

                  newGrid[row_ + (lastRow - row_)/2][col_ + (lastCol - col_)/2] = 0;
                  setState(newGrid.slice());

                  // TODO
                  // make cells not garbage, make the values within the only values youre actually supposed to access
                  // rather than just everything, im lazy so not now, but redo the cell stuff

                  console.log("erased loop");
                  clearInterval(eraseLoop);
                  resolve();

                }, 0);

              })

              await promise_;

              row = row_;
              col = col_;

              debounce = false;

              return;
            }

            if (!((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length ||newGrid[row + directionRow][col + directionCol] == 0 || newGrid[row + directionRow][col + directionCol] == count)){

              // if (cells.length == 0){

              //   clearInterval(mainInterval);
              //   clearInterval(boundsCheck);

              //   console.log("finish");

              //   return;
              // }

              path = [];

              newGrid[row + directionRow/2][col + directionCol/2] = 1; // 1 is just an arbitrary value, doesnt matter
              setState(newGrid.slice());

              // clearInterval(boundsCheck);

              if (cells.length == 0){

                clearInterval(mainInterval);
                clearInterval(boundsCheck);

                done();

                console.log("finish");

                return;
              }

              console.log("new path");

              const index = Math.round(Math.random() * (cells.length-1));

              row = Math.floor(cells[index] / 17);
              col = cells[index] % 17;

              cells.splice(index, 1);
              path.push(row * 17 + col);

              count++;
              
              // console.log(cells.length, index, cells[index], row, col, count);

              newGrid[row][col] = count;
              setState(newGrid.slice());
            }

            if (!((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length || newGrid[row + directionRow][col + directionCol] != 0)){

              clearInterval(boundsCheck);
              resolve();

              // console.log("continue");

              return;
            }
  
            if (Math.round(Math.random()) < 1){
    
              directionRow = direction[Math.round(Math.random())];
              directionCol = 0;
            }

            else{
        
              directionCol = direction[Math.round(Math.random())];
              directionRow = 0;
            }

          },0);
        })

        await promise;
      }

      // console.log("connect?");

      newGrid[row + directionRow/2][col + directionCol/2] = count;
      setState(newGrid.slice());
      await delay(delayTime);

      // cells.splice((row + directionRow/2) * 17 + col + directionCol / 2);

      row += directionRow;
      col += directionCol;

      running = false;

    },0);

    });

  }

  function aStar(row, col){

    // a star is basically
    // get the values of all the nodes surrounding some node
    // this value is made up of the g and h cost, g is distance from start, h is
    // distance from end, together they represent the distance travelled and distance left to go
    // then select the node with the smallest value and continue until you make it to the end
    // im gonna laze though since ive got all week all to myself since clovers on vacation so
    // im sort of crazy

    // calculating weight of neighbors

    let minHeap = new heap();
    // reminder, in this heap it expects an array, first index is the weight, anything afterwards
    // can be whatever, but the entire array is returned with top

    row = start[0];
    col = start[1];

    let current = [0, [row, col], 0]; // weight, [position, last position], g cost (its like this
    // so i dont have to change the current heap implementation that prims uses, h cost is just calculated easily by difference)
    minHeap.insert(current);

    const newGrid = grid;
    // let costs = [];
    let origins = [];

    for (let row = 0; row < 17; row++){

      let row_ = [];

      for (let col = 0; col < 17; col++){

        row_.push(-1);
        
        // if (newGrid[row][col] != 0){
        //   // unitize
        //   newGrid[row][col] = -1;
        // }

      }

      // costs.push(row_.slice());
      origins.push(row_.slice());
    }

    setState(newGrid.slice());

    // dude i dont think i even need cost, newgrid stores all the costs
    // the only reason i had costs were due to conflicts with grid, but if i just got through grid
    // and set all the values > or < 0 to 1 its all fine

    let running = false;

    return new Promise((done)=>{

    const mainInterval = setInterval(async () => {

      if (running || pause){

        return;
      }

      if (reset){

        clearInterval(mainInterval);
        done()
        reset = false;
        return;
      }

      running = true;

      let current = minHeap.top();
      minHeap.pop();

      if (current == -1){

        clearInterval(mainInterval);
        return -1;
      }

      let destination = current[1];
      // let origin = current[1][1];

      row = destination[0];
      col = destination[1];

      if ((row - 2) >= 0 && grid[row-1][col] != 0 && ((row-2) != start[0] || col != start[1]) && (newGrid[row-2][col] == -1 || newGrid[row-2][col] > (current[2] + 10 + Math.abs(end[0] - (row - 2)) * 5 + Math.abs(end[1] - col) * 5))){

        // the above checks if its in bounds and not the start, then if the value currently in this tile should be overwritten
        // which is if its currently empty or a more efficient path to it is available

        // let cost = Math.abs(start[0] - (row - 2)) + Math.abs(start[1] - col) + Math.abs(end[0] - (row - 2)) + Math.abs(end[1] - col);
        let cost = current[2] + 10 + Math.abs(end[0] - (row - 2)) * 5 + Math.abs(end[1] - col) * 5;

        minHeap.insert([cost, [row-2, col], current[2]+10]);
        origins[row-2][col] = row * grid.length + col;

        newGrid[row - 1][col] = current[2] + 5 + Math.abs(end[0] - (row - 1)) * 5 + Math.abs(end[1] - col) * 5;
        setState(newGrid.slice());
        await delay(delayTime);

        // console.log(current[2] + 1 + Math.abs(end[0] - (row - 1)) + Math.abs(end[1] - col));

        if (row-2 == end[0] && col == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          let debounce = false;

          const highlightPath = setInterval(async () => {

            if (debounce){
              
              return;
            }

            if (reset){

              clearInterval(highlightPath);
              done()
              reset = false;
              return;
            }

            debounce = true;
            
            if (position == -1){

              clearInterval(highlightPath);
              done();
              return;
            }

            let difference;

            if (lastPosition - position > 0){

              difference = Math.floor((lastPosition - position) / 17);
            }
            else{

              difference = Math.ceil((lastPosition - position) / 17)
            }

            // console.log(Math.floor(position / newGrid.length), difference);
            // console.log(position % 17, ((lastPosition - position) % 17) / 2);

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            newGrid[Math.floor(position / newGrid.length)][position % newGrid.length] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length];

            debounce = false;

          }, 0);

          return;
        }

        newGrid[row-2][col] = cost;
        setState(newGrid.slice());
        await delay(delayTime);

      }

      if ((row + 2) < newGrid.length && grid[row+1][col] != 0 && ((row+2) != start[0] || col != start[1]) &&  (newGrid[row+2][col] == -1 || newGrid[row+2][col] > (current[2] + 10 + Math.abs(end[0] - (row + 2)) * 5 + Math.abs(end[1] - col) * 5))){

        // let cost = Math.abs(start[0] - (row + 2)) + Math.abs(start[1] - col) + Math.abs(end[0] - (row + 2)) + Math.abs(end[1] - col);

        let cost = current[2] + 10 + Math.abs(end[0] - (row + 2)) * 5 + Math.abs(end[1] - col) * 5;
        // costs[row+2][col] = cost;

        minHeap.insert([cost, [row+2, col], current[2]+10]);
        origins[row+2][col] = row * grid.length + col;

        newGrid[row+1][col] = current[2] + 5 + Math.abs(end[0] - (row + 1)) * 5 + Math.abs(end[1] - col) * 5;
        setState(newGrid.slice());
        await delay(delayTime);

        if (row+2 == end[0] && col == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          let debounce = false;

          const highlightPath = setInterval(async () => {

            if (debounce){

              return;
            }

            if (reset){

              clearInterval(highlightPath);
              done()
              reset = false;
              return;
            }

            debounce = true;
            
            if (position == -1){

              clearInterval(highlightPath);
              done();
              return;
            }

            let difference;

            if (lastPosition - position > 0){

              difference = Math.floor((lastPosition - position) / 17);
            }
            else{

              difference = Math.ceil((lastPosition - position) / 17)
            }

            console.log(Math.floor(position / newGrid.length), difference);
            console.log(position % 17, ((lastPosition - position) % 17) / 2);

            newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]

            debounce = false;

          }, 0);

          return;
        }

        newGrid[row+2][col] = cost;
        setState(newGrid.slice());
        await delay(delayTime);
      }

      if ((col - 2) >= 0 && grid[row][col-1] != 0 && (row != start[0] || (col-2) != start[1]) &&  (newGrid[row][col-2] == -1 || newGrid[row][col-2] > (current[2] + 10 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] - (col - 2)) * 5))){

        // let cost = Math.abs(start[0] - row) + Math.abs(start[1] - (col - 2)) + Math.abs(end[0] - row) + Math.abs(end[1] - (col - 2));

        let cost = current[2] + 10 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] - (col - 2)) * 5;
        // costs[row][col-2] = cost;

        minHeap.insert([cost, [row, col-2], current[2]+10]);
        origins[row][col-2] = row * grid.length + col;

        newGrid[row][col-1] =  current[2] + 5 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] - (col - 1)) * 5;
        setState(newGrid.slice());
        await delay(delayTime);

        if (row == end[0] && col-2 == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          let debounce = false;

          const highlightPath = setInterval(async () => {

            if (debounce){

              return;
            }

            if (reset){

              clearInterval(highlightPath);
              done()
              reset = false;
              return;
            }

            debounce = true;
            
            if (position == -1){

              clearInterval(highlightPath);
              done();
              return;
            }

            let difference;

            if (lastPosition - position > 0){

              difference = Math.floor((lastPosition - position) / 17);
            }
            else{

              difference = Math.ceil((lastPosition - position) / 17)
            }

            // console.log(Math.floor(position / newGrid.length), difference);
            // console.log(position % 17, ((lastPosition - position) % 17) / 2);

            newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length];

            debounce = false;

          }, 0);

          return;
        }
     
        newGrid[row][col-2] = cost;
        setState(newGrid.slice());
        await delay(delayTime);
      }

      if ((col + 2) < newGrid.length && grid[row][col+1] != 0 && (row != start[0] || (col+2) != start[1]) &&  (newGrid[row][col+2] == -1 || newGrid[row][col+2] > (current[2] + 10 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] -(col + 2)) * 5))){

        // let cost = Math.abs(start[0] - row) + Math.abs(start[1] - (col + 2)) + Math.abs(end[0] - row) + Math.abs(end[1] - (col + 2));
        let cost = current[2] + 10 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] - (col + 2)) * 5;
        // costs[row][col+2] = cost;

        minHeap.insert([cost, [row, col+2], current[2]+10]);
        origins[row][col+2] = row * grid.length + col;

        newGrid[row][col+1] = current[2] + 5 + Math.abs(end[0] - row) * 5+ Math.abs(end[1] - (col + 1)) * 5;
        setState(newGrid.slice());
        await delay(delayTime);

        if (row == end[0] && col+2 == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          let debounce = false;

          const highlightPath = setInterval(async () => {

            if (debounce){

              return;
            }

            if (reset){

              clearInterval(highlightPath);
              done()
              reset = false;
              return;
            }

            debounce = true;
            
            if (position == -1){

              clearInterval(highlightPath);
              done();
              return;
            }

            let difference;

            if (lastPosition - position > 0){

              difference = Math.floor((lastPosition - position) / 17);
            }
            else{

              difference = Math.ceil((lastPosition - position) / 17)
            }

            // console.log(Math.floor(position / newGrid.length), difference);
            // console.log(position % 17, ((lastPosition - position) % 17) / 2);

            newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length];

            debounce = false;

          }, 0);

          return;
        }

        newGrid[row][col+2] = cost;
        setState(newGrid.slice());
        await delay(delayTime);
      }

      running = false;

    }, 0);   

    });
  }

  function dijkstras(row, col){

    // basically a star except worse since theres no heuristic pruning
    // for some short path thats like a miles away

    // in fact i bet i can copy and paste the code and just delete a couple characters
    // and itd be dijkstras, cool

    let minHeap = new heap();
    // reminder, in this heap it expects an array, first index is the weight, anything afterwards
    // can be whatever, but the entire array is returned with top

    row = start[0];
    col = start[1];

    let current = [0, [row, col]]; // weight, [position, last position]
    minHeap.insert(current);

    const newGrid = grid;
    let origins = [];

    for (let row = 0; row < 17; row++){

      let row_ = [];

      for (let col = 0; col < 17; col++){

        row_.push(-1);
        
        // if (newGrid[row][col] != 0){
        //   // unitize
        //   newGrid[row][col] = -1;
        // }

      }
      origins.push(row_.slice());
    }

    setState(newGrid.slice());

    let running = false;

    return new Promise((done)=>{

    const mainInterval = setInterval(async () => {

      if (running || pause){

        return;
      }

      if (reset){

        clearInterval(mainInterval);
        done()
        reset = false;
        return;
      }

      running = true;

      if (row == end[0] && col == end[1]){

        console.log("path finished");

        clearInterval(mainInterval);
        return;
      }

      let current = minHeap.top();
      minHeap.pop();

      if (current == -1){

        console.log("no path");

        clearInterval(mainInterval);
        return -1;
      }

      let destination = current[1];

      row = destination[0];
      col = destination[1];

      if ((row - 2) >= 0 && newGrid[row-1][col] != 0 && (row-2 != start[0] || col != start[1]) && (newGrid[row-2][col] == -1 || newGrid[row-2][col] > (current[0] + 10))){

        // the above checks if its in bounds and not the start, then if the value currently in this tile should be overwritten
        // which is if its currently empty or a more efficient path to it is available

        let cost = current[0] + 10;
        // costs[row-2][col] = cost;

        minHeap.insert([cost, [row-2, col]]);
        origins[row-2][col] = row * grid.length + col;

        newGrid[row - 1][col] = current[0] + 5;
        setState(newGrid.slice());
        await delay(delayTime);

        // console.log(current[2] + 1 + Math.abs(end[0] - (row - 1)) + Math.abs(end[1] - col));

        if (row-2 == end[0] && col == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          let debounce = false;

          const highlightPath = setInterval(async () => {

            if (debounce){

              return;
            }

            if (reset){

              clearInterval(highlightPath);
              done()
              reset = false;
              return;
            }

            debounce = true;
            
            if (position == -1){

              clearInterval(highlightPath);
              done();
              return;
            }

            let difference;

            if (lastPosition - position > 0){

              difference = Math.floor((lastPosition - position) / 17);
            }
            else{

              difference = Math.ceil((lastPosition - position) / 17)
            }

            newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]
            // await delay(delayTime);

            debounce = false;

          }, 0);

          return;
        }

        newGrid[row-2][col] = cost;
        setState(newGrid.slice());
        await delay(delayTime);

      }

      if ((row + 2) < newGrid.length && grid[row+1][col] != 0 && (row+2 != start[0] || col != start[1]) &&  (newGrid[row+2][col] == -1 || newGrid[row+2][col] > (current[0] + 10))){

        let cost = current[0] + 10;
        // costs[row+2][col] = cost;

        minHeap.insert([cost, [row+2, col]]);
        origins[row+2][col] = row * grid.length + col;

        newGrid[row+1][col] = current[0] + 5;
        setState(newGrid.slice());
        await delay(delayTime);

        if (row+2 == end[0] && col == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          let debounce = false;

          const highlightPath = setInterval(async () => {

            if (debounce){

              return;
            }

            if (reset){

              clearInterval(highlightPath);
              done()
              reset = false;
              return;
            }

            debounce = true;
            
            if (position == -1){

              clearInterval(highlightPath);
              done();
              return;
            }

            let difference;

            if (lastPosition - position > 0){

              difference = Math.floor((lastPosition - position) / 17);
            }
            else{

              difference = Math.ceil((lastPosition - position) / 17)
            }

            newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
            setState(newGrid.slice());

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]
            // await delay(delayTime);

            debounce = false;

          }, 0);

          return;
        }

        newGrid[row+2][col] = cost;
        setState(newGrid.slice());
        await delay(delayTime);
      }

      if ((col - 2) >= 0 && grid[row][col-1] != 0 && (row != start[0] || col-2 != start[1]) &&  (newGrid[row][col-2] == -1 || newGrid[row][col-2] > (current[0] + 10))){

        let cost = current[0] + 10;
        // costs[row][col-2] = cost;

        minHeap.insert([cost, [row, col-2]]);
        origins[row][col-2] = row * grid.length + col;

        newGrid[row][col-1] =  current[0] + 5;
        setState(newGrid.slice());
        await delay(delayTime);

        if (row == end[0] && col-2 == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          let debounce = false;

          const highlightPath = setInterval(async () => {

            if (debounce){

              return;
            }

            if (reset){

              clearInterval(highlightPath);
              done()
              reset = false;
              return;
            }

            debounce = true;
            
            if (position == -1){

              clearInterval(highlightPath);
              done();
              return;
            }

            let difference;

            if (lastPosition - position > 0){

              difference = Math.floor((lastPosition - position) / 17);
            }
            else{

              difference = Math.ceil((lastPosition - position) / 17)
            }

            newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
            setState(newGrid.slice());

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]
            // await delay(delayTime);

            debounce = false;

          }, 0);

          return;
        }
     
        newGrid[row][col-2] = cost;
        setState(newGrid.slice());
        await delay(delayTime);
      }

      if ((col + 2) < newGrid.length && grid[row][col+1] != 0 &&(row != start[0] || col+2 != start[1]) &&  (newGrid[row][col+2] == -1 || newGrid[row][col+2] > (current[0] + 10))){

        let cost = current[0] + 10;
        // costs[row][col+2] = cost;

        minHeap.insert([cost, [row, col+2]]);
        origins[row][col+2] = row * grid.length + col;

        newGrid[row][col+1] = current[0] + 5;
        setState(newGrid.slice());
        await delay(delayTime);

        if (row == end[0] && col+2 == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          let debounce = false;

          const highlightPath = setInterval(async () => {

            if (debounce){

              return;
            }

            if (reset){

              clearInterval(highlightPath);
              done()
              reset = false;
              return;
            }

            debounce = true;
            
            if (position == -1){

              clearInterval(highlightPath);
              done();
              return;
            }

            let difference;

            if (lastPosition - position > 0){

              difference = Math.floor((lastPosition - position) / 17);
            }
            else{

              difference = Math.ceil((lastPosition - position) / 17)
            }

            newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]

            debounce = false;

          }, 0);

          return;
        }

        newGrid[row][col+2] = cost;
        setState(newGrid.slice());
        await delay(delayTime);
      }

      running = false;

    }, 0);

    });

  }

  function bellman(row, col){

    // works with negatives

    // basically update vertices go through all vertices and keep doing that 

    // row = start[0];
    // col = start[1];

    let newGrid = grid;
    let origins = [];
    // stores where the shortest path of some vertex comes from

    for (let row = 0; row < 17; row++){

      let row_ = [];

      for (let col = 0; col < 17; col++){

        row_.push(-1);

        if (newGrid[row][col] != 0){

          newGrid[row][col] = -1;
        }

      }

      origins.push(row_);
    }

    setState(newGrid.slice());

    newGrid[start[0]][start[1]] = 0;

    let running = false;

    let previous = -1;

    return new Promise((done)=>{

    const mainInterval = setInterval(async () => {

      if (running || pause){

        return;
      }

      if (reset){

        clearInterval(mainInterval);
        done()
        reset = false;
        return;
      }

      running = true;

      for (let row = 0; row < grid.length; row+=2){

        for (let col = 0; col < grid.length; col+=2){

          if (newGrid[row][col] == -1){
            // empty
            continue;
          }

          if (row-2 >= 0 && newGrid[row-1][col] != 0 && (newGrid[row-2][col] == -1 || newGrid[row-2][col] > newGrid[row][col] + 10)){

            // if ((row-2 != start[0] || col != start[1]) && (row-2 != end[0] || col != end[1])){

            newGrid[row-1][col] = newGrid[row][col] + 5;
            setState(newGrid.slice());
            await delay(delayTime);

            newGrid[row-2][col] = newGrid[row][col] + 10;
            // setState(newGrid.slice());
            newGrid = newGrid.slice();
            // }

            origins[row-2][col] = row * newGrid.length + col;
            setState(newGrid.slice());
            await delay(delayTime);
          }

          if (row+2 < newGrid.length && newGrid[row+1][col] != 0 && (newGrid[row+2][col] == -1 || newGrid[row+2][col] > newGrid[row][col] + 10)){

            // if ((row+2 != start[0] || col != start[1]) && (row+2 != end[0] || col != end[1])){

            newGrid[row+1][col] = newGrid[row][col] + 5;
            setState(newGrid.slice());
            await delay(delayTime);

            newGrid[row+2][col] = newGrid[row][col] + 10;
            // setState(newGrid.slice());
            newGrid = newGrid.slice();
            // }

            origins[row+2][col] = row * newGrid.length + col;
            setState(newGrid.slice());

            await delay(delayTime);
          }

          if (col-2 >= 0 && newGrid[row][col-1] != 0 && (newGrid[row][col-2] == -1 || newGrid[row][col-2] > newGrid[row][col] + 10)){

            // if ((row != start[0] || col-2 != start[1]) && (row != end[0] || col-2 != end[1])){

            newGrid[row][col-1] = newGrid[row][col] + 5;
            setState(newGrid.slice());
            await delay(delayTime);

            newGrid[row][col-2] = newGrid[row][col] + 10;
            // setState(newGrid.slice());
            newGrid = newGrid.slice();
            // }

            origins[row][col-2] = row * newGrid.length + col;
            setState(newGrid.slice());

            await delay(delayTime);
          }

          if (col+2 < newGrid.length && newGrid[row][col+1] != 0  && (newGrid[row][col+2] == -1 || newGrid[row][col+2] > newGrid[row][col] + 10)){

            // if ((row != start[0] || col+2 != start[1]) && (row != end[0] || col+2 != end[1])){

            newGrid[row][col+1] = newGrid[row][col] + 5;
            setState(newGrid.slice());
            await delay(delayTime);

            newGrid[row][col+2] = newGrid[row][col] + 10;
            // setState(newGrid.slice());
            newGrid = newGrid.slice();
            // }

            origins[row][col+2] = row * newGrid.length + col;
            setState(newGrid.slice());
            await delay(delayTime);
          }
        }
      }

      if (previous == newGrid){

        console.log(previous);
        console.log(newGrid);

        console.log("finish");

        let position = origins[end[0]][end[1]];
        let lastPosition = end[0] * newGrid.length + end[1];

        console.log(position);

        let debounce = false;

        const highlightPath = setInterval(async () => {

          if (debounce){

            return;
          }

          if (reset){

            clearInterval(highlightPath);
            done()
            reset = false;
            return;
          }

          debounce = true;
          
          if (position == -1){

            console.log("highlighted path");

            newGrid[start[0]][start[1]] = -1;
            setState(newGrid.slice());

            clearInterval(highlightPath);
            done();
            return;
          }

          let difference;

          if (lastPosition - position > 0){

            difference = Math.floor((lastPosition - position) / 17);
          }
          else{

            difference = Math.ceil((lastPosition - position) / 17)
          }

          // console.log(Math.floor(position / newGrid.length), difference);
          // console.log(position % 17, ((lastPosition - position) % 17) / 2);

          newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
          setState(newGrid.slice());
          await delay(delayTime);

          newGrid[Math.floor(position / newGrid.length)][position % newGrid.length] = 2;
          setState(newGrid.slice());
          await delay(delayTime);


          lastPosition = position;
          position = origins[Math.floor(position / newGrid.length)][position % newGrid.length];

          debounce = false;

        }, 0);


        clearInterval(mainInterval);
        return;
      }

      previous = newGrid;

      running = false;

    }, 0);

    });

  }

  function bfs(row, col){

    let origins = [];

    const newGrid = grid;

    for (let row = 0; row < 17; row++){

      let row_ = [];

      for (let col = 0; col < 17; col++){

        row_.push(-1);

      }
      origins.push(row_.slice());
    }

    newGrid[row][col] = -2;
    setState(newGrid.slice());

    let queue = [];
    queue.push(row * newGrid.length + col);

    let running = false;

    return new Promise((done)=>{

      const mainInterval = setInterval(async () => {
        
        if (running || pause){

          return;
        }

        if (reset){

          clearInterval(mainInterval);
          done()
          reset = false;
          return;
        }

        running = true;

        let position = queue[0];
        row = Math.floor(position / newGrid.length);
        col = position % newGrid.length;
        queue.shift();

        if (row == end[0] && col == end[1]){

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          let debounce = false;

          const highlightPath = setInterval(async () => {

            if (debounce){

              return;
            }

            if (reset){

              clearInterval(highlightPath);
              done()
              reset = false;
              return;
            }

            debounce = true;
            
            if (position == -1){

              console.log("highlighted path");

              newGrid[start[0]][start[1]] = -1;
              setState(newGrid.slice());

              clearInterval(highlightPath);
              done();
              return;
            }

            let difference;

            if (lastPosition - position > 0){

              difference = Math.floor((lastPosition - position) / 17);
            }
            else{

              difference = Math.ceil((lastPosition - position) / 17)
            }

            // console.log(Math.floor(position / newGrid.length), difference);
            // console.log(position % 17, ((lastPosition - position) % 17) / 2);

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            newGrid[Math.floor(position / newGrid.length)][position % newGrid.length] = 2;
            setState(newGrid.slice());
            await delay(delayTime);


            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length];

            debounce = false;

          }, 0);

        }

        if (row-2 >= 0 && newGrid[row-1][col] != 0 && newGrid[row-2][col] != -2){

          newGrid[row-1][col] = -2;
          setState(newGrid.slice());
          await delay(delayTime);

          newGrid[row-2][col] = -2; // this difference in value just shows this tile has been since to cut off loops or redos
          origins[row-2][col] = position;
          queue.push(position - newGrid.length*2);
          setState(newGrid.slice());
          await delay(delayTime);
        }

        if (row+2 < newGrid.length && newGrid[row+1][col] != 0 && newGrid[row+2][col] != -2){

          newGrid[row+1][col] = -2;
          setState(newGrid.slice());
          await delay(delayTime);

          newGrid[row+2][col] = -2;
          origins[row+2][col] = position;
          queue.push(position + newGrid.length*2);
          setState(newGrid.slice());
          await delay(delayTime);
        }

        if (col-2 >= 0 && newGrid[row][col-1] != 0 && newGrid[row][col-2] != -2){

          newGrid[row][col-1] = -2;
          setState(newGrid.slice());
          await delay(delayTime);

          newGrid[row][col-2] = -2; 
          origins[row][col-2] = position;
          queue.push(position-2);
          setState(newGrid.slice());

          await delay(delayTime);
        }

        if (col+2 < newGrid.length && newGrid[row][col+1] != 0 && newGrid[row][col+2] != -2){

          newGrid[row][col+1] = -2;
          setState(newGrid.slice());
          await delay(delayTime);

          newGrid[row][col+2] = -2;
          origins[row][col+2] = position;
          queue.push(position+2);
          setState(newGrid.slice());

          await delay(delayTime);
        }

        running = false;

      }, 0);


    })

  }

  function deadEnd(row, col){

    let running = false;

    const newGrid = grid;

    let deadEnds = [];

    return new Promise(async (done)=>{

    await delay(delayTime); 
    // it ends up going fast enough that this occurs before the unitization occurs
    // so they end up being these blue tiles with no number in them, so theres a delay here

    for (let row = 0; row < newGrid.length; row+=2){

      for (let col = 0; col < newGrid.length; col+=2){

        let connections = 0;

        if (row-2 >= 0 && newGrid[row-1][col] == -1){

          connections++;
        }
          
        if (row+2 < newGrid.length && newGrid[row+1][col] == -1){


          connections++;
        }
        
        if(col-2 >= 0 && newGrid[row][col-1] == -1){

          connections++;
        }
        
        if(col+2 < newGrid.length && newGrid[row][col+1] == -1){

          connections++;
        }

        if (connections == 1){

          // dead-end, the only connection is the one leading into the dead-end

          if ((row != start[0] || col != start[1]) && (row != end[0] || col != end[1])){

            newGrid[row][col] = 2;
            setState(newGrid.slice());
            await delay(delayTime);

            deadEnds.push(row * newGrid.length + col);

          }
        }

      }

    }

    // i cant use a while loop or it freezes the site, and i cant set an interval as they could overlap
    // and cause unexpected behavior, which isnt exactly so unexpected the information they have just probably wont be accurate
    // instead ill just store the locations of dead-ends and go through them in the interval below

    row = Math.floor(deadEnds[0] / newGrid.length);
    col = deadEnds[0] % newGrid.length;

    const fill = setInterval(async ()=>{

      if (reset){

        clearInterval(fill);
        done()
        reset = false;
        return;
      }

      if (running || pause){

        return;
      }

      if (reset){

        clearInterval(mainInterval);
        done();
        reset = false;
        return;
      }

      running = true;

      let connections = 0;

      let directionRow = 0;
      let directionCol = 0;

      if ((row-2) >= 0 && newGrid[row-1][col] == -1){

        connections++;
        directionRow = -2;
      }
        
      if ((row+2) < newGrid.length && newGrid[row+1][col] == -1){

        connections++;
        directionRow = 2;
      }
      
      if(col-2 >= 0 && newGrid[row][col-1] == -1){

        connections++;
        directionCol = -2;
      }
      
      if((col+2) < newGrid.length && newGrid[row][col+1] == -1){

        connections++;
        directionCol = 2;
      }

      if (connections >= 2 || (row == start[0] && col == start[1] ) || (row == end[0] && col == end[1])){
        // reached a junction (excluding the connection youve gone through)
        // or if it reaches the start or end, if this occurs it obscures, takes over, or overrides the path
        // to the end so it stops at that scenario aswell

        // move onto the next deadend to fill

        console.log("found junction");

        deadEnds.shift();

        if (deadEnds.length == 0){

          clearInterval(fill);
          done();
          return;
        }

        row = Math.floor(deadEnds[0] / newGrid.length);
        col = deadEnds[0] % newGrid.length;

        running = false;

        return;
      }

      newGrid[row][col] = 2;
      setState(newGrid.slice());
      await delay(delayTime);

      newGrid[row + directionRow/2][col + directionCol/2] = 2;
      setState(newGrid.slice());
      await delay(delayTime)

      row += directionRow;
      col += directionCol;

      running = false;

    }, 0);

    });

  }

  function tremaux(row, col){



  }

  // debounce weird
  // i lied im the smartest person ever, not really i just figured that
  // the problem was because of the set state which rerenders the page, that means this function runs again
  // and debounce must be redeclared resetting the timer

  // manual progression below but ive decided to make it defunct, i dont think its needed just complicates
  // the site with more controls

  // document.addEventListener("keydown", async (event)=>{

  //   if (!pause){

  //     return;
  //   }

  //   if (event.key == "ArrowLeft" && !debounce){



  //   }

  //   else if (event.key == "ArrowRight" && !debounce){

  //     debounce = true

  //     if (selection == "dfs"){

  //       await dfs(false);
  //     }
  //     else if (selection == "prims"){

  //       await prims(false);
  //     }
  //     else if (selection == "kruskals"){

  //       await kruskals(false);
  //     }
  //     else if (selection == "wilsons"){

  //       await wilsons(false);
  //     }
  //     else if (selection == "alder"){

  //       await AldousBroder(false);
  //     }

  //     else if (selection == "a"){

  //       await aStar(false);
  //     }
  //     else if (selection == "dijkstras"){

  //       await dijkstras(false);
  //     }
  //     else if (selection == "bellman"){

  //       await bellman(false);
  //     }

  //     setTimeout(()=>{
  //       debounce = false;
  //     },0);
  //   }

  // })
  
  return (
    <>
      
      <div className="panel"> 

        {/* make scrollbox later */}

        <h1 id="title">MAZEVIS<br/></h1>

        <p id="description">visualize maze generation and pathfinding algorithms <span style={{fontSize : 9}}>(try clicking tiles to mark targets for pathfinding)</span></p>

        <hr/>

        <div className="interface">

          <p>maze generation</p>

          <div className="algorithm">

            <p>algorithm</p>

            <div className="selection">

              <select className="algorithmSelection" id="mazeGeneration">

                <option className="option" value="dfs">depth-first search</option>
                <option className="option" value="prims">prims</option>
                <option className="option" value="kruskals" >kruskals</option>
                <option className="option" value="wilsons">wilsons</option>
                <option className="option" value="alder">aldour-broder</option>

              </select>

              <button className="infoButton" onClick={async ()=>{

                const selection = document.getElementById("mazeGeneration").value;

                if (selection == "dfs"){
                 
                  setText(

                    <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>depth-first search</span> <br/> from a randomly selected starting point a random neighboring tile is chosen, this step continues while saving each step in a stack until a dead-end is reached when the algorithm backtracks until an available path is open at one of the previous steps. <br/> <span style={{"fontWeight" : 500, 'fontSize' : 17}}>result</span> <br/> depth-first search results in mazes with straight long halls and few branches </p>
                  )

                  const file = await fetch("dfs.jsx");
                  const fileContent = await file.text();

                  const formattedContent = changeIndent(fileContent, 2);

                  setCode(

                    // <p id="code" style={{"opacity" : visibility}}><span style={{"fontWeight" : 500, 'fontSize' : 18}}>depth-first search implementation</span> <br/> copy and paste code</p>
                    // isnt updated when done like this for some reason

                  <div>
                    <p style={{"fontSize": 14}}><span style={{"fontWeight" : 500, 'fontSize' : 18}}>depth-first search implementation<br/>
                      <a href="https://github.com/tinysuperion/mazevis/blob/main/src/assets/dfs.jsx" target="_blank">implementation</a>
                      </span><br/><br/>

                      {formattedContent}

                    </p>
                  </div>
                  )
                }

                else if (selection == "prims"){

                  setText(

                    <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>prims algorithm</span> <br/> prims selects a random tile to start. from the start all neighboring tiles are saved in an array and a random tile is chosen from all of the tiles available.<br/> <span style={{"fontWeight" : 500, 'fontSize' : 17}}>result</span> <br/> prims results in a minimal spanning tree, an edge-weighted tree that has no loops and has the minimum sum of edges (of course you dont have to assign all of the edges a weight, a random one can be selected for the same result for maze generation)</p>
                  )

                  const file = await fetch("prims.jsx");
                  const fileContent = await file.text();

                  const formattedContent = changeIndent(fileContent, 2);

                  setCode(

                    <div>
                      <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>prims implementation<br/>
                        <a href="https://github.com/tinysuperion/mazevis/blob/main/src/assets/prims.jsx" target="_blank">implementation</a>
                        </span> <br/><br/>
                      
                        {formattedContent}

                      </p>
                    </div>
                  )

                }

                else if (selection == "wilsons"){

                  setText(

                    <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>wilsons algorithm</span> <br/> wilsons algorithm makes use of a random walk starting from a random tile and starts with a randomly selected tile to be the initial maze. in the random walk it functions similarly to depth-first search until it forms a loop where it backtracks until it reaches the intersection ensuring it reaches the maze instead of blocking itself out. upon reaching a tile already in the maze it is added to the maze and a random walk begins at another randomly selected tile<br/> <span style={{"fontWeight" : 500, 'fontSize' : 17}}>result</span> <br/> wilsons algorithm results in a uniform distribution in mazes that isnt biased toward short dead ends or long corridors </p>
                  )

                  const file = await fetch("wilsons.jsx");
                  const fileContent = await file.text();

                  const formattedContent = changeIndent(fileContent, 2);

                  setCode(

                    <div>
                      <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>wilsons implementation<br/>
                      <a href="https://github.com/tinysuperion/mazevis/blob/main/src/assets/wilsons.jsx" target="_blank">implementation</a>
                      </span><br/><br/>

                        {formattedContent}

                      </p>
                    </div>
                  )

                }

                else if (selection == "alder"){

                  setText(

                    <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>aldous-broder algorithm</span> <br/> pick a random tile, then while there are unvisited tiles go to a random neighbor and if it hasn't yet been visited connect the two and continue at that neighbor. <br/> <span style={{"fontWeight" : 500, 'fontSize' : 17}}>result</span> <br/> aldous-broder results in one of the least efficient algorithms, however similarly to wilsons it also forms mazes that have a uniform distribution </p>
                  )

                  const file = await fetch("aldousBroder.jsx");
                  const fileContent = await file.text();

                  const formattedContent = changeIndent(fileContent, 2);

                  setCode(

                    <div>
                      <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>aldous-broder implementation<br/>
                        <a href="https://github.com/tinysuperion/mazevis/blob/main/src/assets/aldousBroder.jsx" target="_blank">implementation</a>
                        </span> <br/><br/>

                        {formattedContent}
                      </p>
                    </div>
                  )

                }

                else if (selection == "kruskals"){

                  setText(

                    <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>kruskals algorithm</span> <br/> kruskals algorithm contains a list of all of the walls in the maze (these walls are the connections between tiles). then the walls are selected in a random order, if the tiles the wall connect belong to separate trees they are connected, otherwise they form a loop and the wall is skipped<br/> <span style={{"fontWeight" : 500, 'fontSize' : 17}}>result</span> <br/> kruskals algorithm produces a minimal spanning tree and a maze almost identical to prims with frequent branches and short dead-ends along with unique generation</p>
                  )

                  const file = await fetch("kruskals.jsx");
                  const fileContent = await file.text();

                  const formattedContent = changeIndent(fileContent, 2);

                  setCode(

                  <div>
                    <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>kruskals implementation<br/>
                     <a href="https://github.com/tinysuperion/mazevis/blob/main/src/assets/kruskals.jsx" target="_blank">implementation</a>
                     </span> <br/><br/>
                    
                      {formattedContent}

                    </p>
                  </div>
                  )

                } 

              }}>?</button>

            </div>

            <p>controls</p>

            <div className="controls">

              <button className="control" id="mazeRun" onClick={async ()=>{

                const run = document.getElementById("mazeRun");
                run.textContent = "pause";

                if (ongoing){

                  pause = !pause;

                  if (pause){

                    run.textContent = "start";
                  }
                  else{

                    run.textContent = "pause";
                  }

                  return;
                }

                ongoing = true;

                selection = document.getElementById("mazeGeneration").value;

                let row = Math.round(Math.random()*8) * 2;
                let col = Math.round(Math.random()*8) * 2;

                displayNum = false;

                // clear grid

                const newGrid = grid;

                for (let row = 0; row < newGrid.length; row++){

                  for (let col = 0; col < newGrid.length; col++){

                    if ((row != start[0] || col != start[1]) && (row != end[0] || col != end[1])){

                      tiles[row * newGrid.length + col].current.textContent = "";
                    }

                    newGrid[row][col] = 0;
                  }
                }

                setState(newGrid.slice());
                

                if (selection == "dfs"){

                  await dfs(row, col);
                }

                else if (selection == "prims"){

                  await prims(row, col);

                }

                else if (selection == "wilsons"){

                  await wilsons(row, col);
                }

                else if (selection == "alder"){

                  await AldousBroder(row, col);
                }

                else if (selection == "kruskals"){

                  displayNum = true;

                  await kruskals(row, col);
                }

                ongoing = false;
                skip = false;

                run.textContent = "start";
              }}>
                start
              </button>

              <button className="control" onClick={()=>{

                skip = true;
              }}>
                skip
              </button>

              <button className="control" onClick={async ()=>{

                let newGrid = grid;

                if (ongoing){

                  reset = true;
                }

                await delay(Math.max(delayTime*2, 50));

                for (let row = 0; row < newGrid.length; row++){

                  for (let col = 0; col < newGrid.length; col++){

                    if ((row != start[0] || col != start[1]) && (row != end[0] || col != end[1])){

                      tiles[row * newGrid.length + col].current.textContent = "";
                    }

                    newGrid[row][col] = 0;
                  }
                }

                setState(newGrid.slice());
              }}>
                reset
              </button>

            </div>

          </div>

          <p>pathfinding</p>

          <div className="algorithm">

            <p>algorithm</p>

            <div className="selection">

              <select className="algorithmSelection" id="pathGeneration">

                <option className="option" value="a" >a*</option>
                <option className="option" value="dijkstras">dijkstras</option>
                <option className="option" value="bellman">bellman-ford</option>
                <option className="option" value="bfs">breadth-first search</option>
                <option className="option" value="deadEnd">dead-end filling</option>

              </select>

              <button className="infoButton" onClick={async ()=>{

                const selection = document.getElementById("pathGeneration").value;

                if (selection == "a"){

                  setText(

                      <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>a*</span> <br/> a* uses a h cost representing the heuristic to guide and shear off routes by including an estimation of the distance to the end along with a g cost representing the distance traveled from the start. from the start the cost of all the neighboring tiles are calculated and the lowest cost is chosen to evaluate its neighbors, this continues until the end is found with the shortest path and it backtracks to the start <br/> <span style={{"fontWeight" : 500, 'fontSize' : 17}}>result</span> <br/> a* results in a quick algorithm to find the shortest path between some start and end goal by using a heuristic to cull unnecessary paths </p>
                    )

                  const file = await fetch("aStar.jsx");
                  const fileContent = await file.text();

                  const formattedContent = changeIndent(fileContent, 2);

                  setCode(

                    <div>
                      <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>a* implementation<br/>
                      <a href="https://github.com/tinysuperion/mazevis/blob/main/src/assets/aStar.jsx" target="_blank">implementation</a>
                      </span> <br/><br/>
                      
                        {formattedContent}
                      </p>
                    </div>
                  )

                }

                else if (selection == "dijkstras"){

                  setText(

                      <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>dijkstras</span> <br/> dijkstras algorithm similarly to a* uses a g cost representing the distance travelled, however dijkstras lacks any heuristic, the process followed is the same; evaluating the cost of neighboring tiles and choosing the lowest cost to evaluate more neighbors until the end is found and it backtracks through the lowest cost path to the start <br/> <span style={{"fontWeight" : 500, 'fontSize' : 17}}>result</span> <br/>dijkstras provides a streamlined process to find the shortest path between the start and the end, however is slower than a* due to the lack of a heuristic to weed out unnecessary paths</p>
                    )
                    
                  const file = await fetch("dijkstras.jsx");
                  const fileContent = await file.text();

                  const formattedContent = changeIndent(fileContent, 2);

                  setCode(

                    <div>
                      <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>dijkstras implementation<br/>
                      <a href="https://github.com/tinysuperion/mazevis/blob/main/src/assets/dijkstras.jsx" target="_blank">implementation</a>
                      </span> <br/><br/>
                      
                        {formattedContent}
                      </p>
                    </div>
                  )

                }

                else if (selection == "bellman"){

                  setText(

                      <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>bellman-ford</span> <br/>the bellman-ford algorithm goes through the entire maze and lists the cost of each tile by its distance from the start, after this it goes to the end and goes back to the start through the lowest cost path it took to get there<br/> <span style={{"fontWeight" : 500, 'fontSize' : 17}}>result</span> <br/> bellman-ford is the only algorithm listed that is able to find the shortest path of a graph that includes negative weights on account of exploring the lowest cost path to every tile </p>
                    )


                  const file = await fetch("bellmanFord.jsx");
                  const fileContent = await file.text();

                  const formattedContent = changeIndent(fileContent, 2);

                  setCode(

                    <div>
                      <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>bellman-ford implementation<br/>
                      <a href="https://github.com/tinysuperion/mazevis/blob/main/src/assets/bellmanFord.jsx" target="_blank">implementation</a>
                      </span> <br/><br/>
                      
                        {formattedContent}
                      </p>
                    </div>
                  )

                }

                else if (selection == "bfs"){

                  setText(

                      <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>breadth-first search</span> <br/>breadth-first search explores all paths equally starting from the origin by storing all of the neighbors in a queue and doing the same for all of the tiles in the queue</p>
                    )


                  const file = await fetch("bfs.jsx");
                  const fileContent = await file.text();

                  const formattedContent = changeIndent(fileContent, 2);

                  setCode(

                    <div>
                      <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>breadth-first search implementation<br/>
                      <a href="https://github.com/tinysuperion/mazevis/blob/main/src/assets/bellmanFord.jsx" target="_blank">implementation</a>
                      </span> <br/><br/>
                      
                        {formattedContent}
                      </p>
                    </div>
                  )                  

                }

                else if (selection == "deadEnd"){

                  setText(

                      <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>dead-end filling</span> <br/>dead-end filling works as its name implies, the algorithm fills in all of the dead-ends in the maze until a junction which leaves only the path to the end left. this strategy meant to be used with a maze on paper</p>
                    )


                  const file = await fetch("deadEnd.jsx");
                  const fileContent = await file.text();

                  const formattedContent = changeIndent(fileContent, 2);

                  setCode(

                    <div>
                      <p><span style={{"fontWeight" : 500, 'fontSize' : 18}}>dead-endimplementation<br/>
                      <a href="https://github.com/tinysuperion/mazevis/blob/main/src/assets/bellmanFord.jsx" target="_blank">implementation</a>
                      </span> <br/><br/>
                      
                        {formattedContent}
                      </p>
                    </div>
                  )                  

                }

              }}>?</button>

            </div>

            <p>controls</p>

            <div className="controls">

              <button className="control" id="pathRun" onClick={async ()=>{

                if (start == -1 || end == -1){

                  console.log("invalid");

                  return;
                }

                const run = document.getElementById("pathRun");
                run.textContent = "pause";

                if (ongoing){

                  console.log("going");

                  pause = !pause;

                  if (pause){

                    run.textContent = "start";
                  }
                  else{

                    run.textContent = "pause";
                  }

                  return;
                }

                ongoing = true;

                // clear grid

                const newGrid = grid;

                for (let row = 0; row < newGrid.length; row++){

                  for (let col = 0; col < newGrid.length; col++){

                    if (newGrid[row][col] != 0){

                      newGrid[row][col] = -1;
                    }

                    if ((row == start[0] && col == start[1]) || (row == end[0] && col == end[1])){

                      continue;
                    }

                    tiles[row * newGrid.length + col].current.textContent = "";
                  }
                }

                setState(newGrid.slice());

                selection = document.getElementById("pathGeneration").value;

                let row = start[0];
                let col = start[1];

                displayNum = true;

                if (selection == "a"){

                  await aStar(row, col);
                }

                else if (selection == "dijkstras"){

                  await dijkstras(row, col);
                }

                else if (selection == "bellman"){

                  await bellman(row, col);
                }

                else if (selection == "bfs"){

                  await bfs(row, col);
                }

                else if (selection == "deadEnd"){

                  await deadEnd(row, col);
                }

                ongoing = false;
                skip = false;

                run.textContent = "start";
              }}>
                start
              </button>

              <button className="control" id="pathSkip" onClick={()=>{

                skip = true;
              }}>
                skip
              </button>

              <button className="control" id="pathReset" onClick={async ()=>{

                const newGrid = grid;

                reset = true;

                await delay(Math.max(delayTime*2, 50));

                for (let row = 0; row < newGrid.length; row++){

                  for (let col = 0; col < newGrid.length; col++){

                    if (newGrid[row][col] != 0){

                      newGrid[row][col] = -1;
                    }

                    if ((row != start[0] || col != start[1]) && (row != end[0] || col != end[1])){

                      tiles[row * newGrid.length + col].current.textContent = "";
                    }

                  }

                }

                setState(newGrid.slice());

                displayNum = false;

              }}>
                reset
              </button>

            </div>

          </div>

          <p id="delayHeading">delay</p>

          <div id="sliderContainer">

            <input className="slider" id="delaySlider" type="range" min="0" max="500" step="10" defaultValue="50" onInput={async ()=>{

              const slider = document.getElementById("delaySlider");
              delayTime = slider.value;

              const size = slider.offsetWidth;

              const value = document.getElementById("value");
              value.textContent = delayTime
              // value.style.opacity = 1;
              // value.style.left = `${size * (value / 500)}px`;
              setPosition(25 + size * (delayTime / 550));

              console.log("size", size);

            }}/>

            <p id="value" style={{"position" : "absolute", "height" : `${15}px`,"fontSize" : `${14}px`, "left" :  position}}>50</p>

          </div>
 
        </div>

      </div>

      <div className="graphic" id="height">

        {grid.map((actualRow, row) => {

          let newRow = [];

          for (let col = 0; col < actualRow.length; col++){

            // let tile = document.getElementById(index*10 + ind);

            // if (tile != null && grid[index][ind] == 1){

            //   tile.classList.add("tileON");

            //   console.log(`switched row ${index} col ${ind}`)
            // }

            // using referencse instead, above doesnt work

            const reference = useRef(null);

            newRow.push(

              // <button key = {ind} className="tile" ref={tileRef.current[index * grid.size + ind - 1]}></button>
              <button key = {col} className="tile" ref={reference} tabIndex={-1} onClick={()=>{
                // weirdly enough col works but row doesnt, im not sure how these elements are separated from
                // anything else, theres at least 17 elements with the same column for all columns

                if (ongoing){

                  return;
                }

                if (setting == "start" && row % 2 == 0 && col % 2 == 0){

                  if (start != -1){

                    console.log(start[0] * grid.length + start[1]);

                    const previous = tiles[start[0] * grid.length + start[1]];
                    previous.current.textContent = "";
                    previous.current.classList.remove("marker");
                  }

                  start = [row, col];

                  reference.current.textContent = setting;
                  reference.current.classList.add("marker");
                  setting = "end";

                }
                else if (setting == "end" && reference.current.textContent != "start" && row % 2 == 0 && col % 2 == 0){

                  // end = row * grid.length + col;

                  if (end != -1){

                    const previous = tiles[end[0] * grid.length + end[1]];
                    previous.current.textContent = "";
                    previous.current.classList.remove("marker");
                  }

                  end = [row, col];

                  reference.current.textContent = setting;
                  reference.current.classList.add("marker");
                  setting = "start";
                }

              }}></button>

            )

            // console.log(grid[index][ind]);

            tiles[row * grid.length + col] = reference; 

            // console.log(tiles[row * grid.length + col])

            if (grid[row][col] == 1 || grid[row][col] > 2 || grid[row][col] < 0){


              // console.log(tileRef.current[index * grid.size + ind - 1]);
              // tileRef.current[index * grid.size + ind - 1].classList.add("tileON");

              // console.log(reference.current);
              reference.current.classList.remove("tileALT");
              reference.current.classList.add("tileON");

              // this isnt a good fix, need to actually put it in an array
              // so i can pull it out and mess with it

              // tiles[index * grid.size + ind - 1].current.classList.add("tileON"); works!

              // console.log("ran");

              if (displayNum && ((row != start[0] || col != start[1]) && (row != end[0] || col != end[1]))){

                reference.current.textContent = grid[row][col];
              }

            }

            else if(grid[row][col] == 2){

              reference.current.classList.remove("tileON");
              reference.current.classList.add("tileALT");
            }

            else if(reference.current != null){

              // if its 0 basically, the check above is since the element created here isnt immediately
              // added to the dom

              reference.current.classList.remove("tileON");
              reference.current.classList.remove("tileALT");
            }

            setTimeout(()=>{

              // this is a lazy fix, but the only other alternative i see is 
              // creating a promise with an interval to check if its still null and awaitting that
              // which means i would have to make this entire function async just for that,
              // this works perfectly fine so whatever, this is again just so when the element isnt added to the dom
              // it doesnt error

              if (row % 2 == 0 && col % 2 == 0){

                reference.current.classList.add("hoverable");
              }

            }, 100);
          }

          return newRow;

        })}        

      </div>

      <div id="info">

          {text}
          <br/>

          {/* <p className="code">implementation can be seen in github (theres no space), maybe linked here some other time</p> */}
          <button id="implementation" onClick={()=>{

            if (code == null){

              return;
            }

            setVisibility(1);
            implementationRef.current.style.pointerEvents = "all";
            console.log("set", visibility);
          }}>implementation</button>
      </div>

      <pre id="codeContainer" style={{"opacity" : visibility}} ref={implementationRef}>
        
        <code>

          <button id="close" onClick={()=>{
            setVisibility(0);
            implementationRef.current.style.pointerEvents = "none";
            
            }}>x</button>

          {code}

        </code>

      </pre>
    </>
  )
}

export default App
