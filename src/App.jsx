import { useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

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

let path = [];
// in javascript to get rid of the first element its shift
// and then just push, i miss my pops and push backs but i was basically just using c++
// like any other language, i never got into its intracacies with memory allocation or weird syntax just enough to use it in general
// like just using new when making an object and pointers for those objects or for dynamic references

let row = Math.round(Math.random()*8) * 2;
let col = Math.round(Math.random()*8) * 2;


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
    // i really dont need a size variable, but im not changing it right now
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

let debounce = false;

let pause = false;
let ongoing = false;
let skip = false;
let setting = "";

let start = -1;
let end = -1;

let running = false;

let displayNum = false;

function App() {

  const [grid, setState] = useState(emptyGrid);

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

  function delay(time){

    return new Promise((resolve)=>{

      if (skip){

        resolve();
        return;
      }

      setTimeout(resolve, time);
    })

  }
  
  function dfs(looping){

    // usually row and col would be in the parameters but because
    // i want to implement manual control of when to continue and going back through iterations
    // so i need global variables

    // for some reason goes in random directions and goes through tiles???

    // console.log("start");

    // let running = false;

    running = false;

    let lastRow = -1;
    let lastCol = -1;

    // const newGrid = grid;
    // weirdly const just means it cant be reassigned to a new array and i guess you cant alter size
    // you can still alter the elements within it

    return new Promise((done)=>{

    const mainInterval = setInterval(async ()=>{

      if (running || pause){

        // console.log("still running");
        return;
        // end iteration if still processing last iteration
      }

      running = true;

      // using a while loop causes the entire website to freeze, i probably just need to use setinterval
      // so the website has some time to itself i guess, i was wondering why it didnt work, it was just because
      // of the loop in general
  
      const newGrid = grid;
      // weirdly const just means it cant be reassigned to a new array and i guess you cant alter size
      // you can still alter the elements within it
  
      let directionRow = 0;
      let directionCol = 0;

      // console.log(`row ${row} col ${col}`);

      newGrid[row][col] = 1;
      setState(newGrid.slice());

      // await new Promise ((resolve)=>{

      //   setTimeout(() => {resolve()}, 50);
      // })

      await delay(50);
  
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

        const backtrack = setInterval(async ()=>{

          newGrid[row][col] = 2;
          setState(newGrid.slice());

          if (!(((row-2) < 0 || newGrid[row-2][col] >= 1) && ((row+2) >= newGrid.length || newGrid[row+2][col] >= 1) && ((col-2) < 0 || newGrid[row][col-2] >= 1) && ((col+2) >= newGrid.length || newGrid[row][col+2] >= 1))){

            clearInterval(backtrack);

            running = false;
            // next iteration will use the value it ended off at, no promise needed

            newGrid[lastRow + (row - lastRow)/2][lastCol + (col - lastCol)/2] = 2;
            newGrid[row][col] = 2;
            setState(newGrid.slice());

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

          // await new Promise ((resolve)=>{

          //   setTimeout(() => {resolve()}, 3000);
          // })

          lastRow = row;
          lastCol = col;
  
          row = path[path.length-1][0];
          col = path[path.length-1][1];

          newGrid[lastRow + (row - lastRow)/2][lastCol + (col - lastCol)/2] = 2;
          newGrid[row][col] = 2;
          setState(newGrid.slice());

          // console.log(`backtrack, ${grid[row][col]}`);
  
          path.pop();

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
          
          // console.log(`bounds check position ${row}, ${col} to ${row + directionRow}, ${col + directionCol}`);

          // await new Promise ((resolve)=>{

          //   setTimeout(() => {resolve()}, 3000);
          // })

          const boundsCheck = setInterval(async ()=>{

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

      await delay(50);

      path.push([row, col]);

      row += directionRow;
      col += directionCol;

      // for some reason not causing a rerender?????
      // look here later im on break https://stackoverflow.com/questions/25937369/react-component-not-re-rendering-on-state-change
      // looks like its because it doesnt work when setting by reference, it has to be to a value i guess?
      // assigning it to a new array copies by reference so it needs to be sliced for a "shallow copy" which is just the value

      if (!looping){

        clearInterval(mainInterval);
        done();
      }

      running = false;

    }, 0);


    // last things to do
    // fix up bugs and anything that isnt working properly
    // add gaps, fill in gaps

    })

  }

  function AldousBroder(looping){

    // usually row and col would be in the parameters but because
    // i want to implement manual control of when to continue and going back through iterations
    // so i need global variables

    // for some reason goes in random directions and goes through tiles???

    // console.log("start");

    let available = [];

    for (let row = 0; row < 17; row+=2){

      for (let col = 0; col < 17; col+=2){

        available.push(row*17 + col);
      }

    }

    let lastRow = -1;
    let lastCol = -1;

    // let running = false;
    running = false;

    // const newGrid = grid;
    // weirdly const just means it cant be reassigned to a new array and i guess you cant alter size
    // you can still alter the elements within it

    return new Promise((done)=>{

    const mainInterval = setInterval(async ()=>{

      if (running == true){

        return;
        // end iteration if still processing last iteration
      }

      running = true;
  
      const newGrid = grid;
  
      let directionRow = 0;
      let directionCol = 0;


      newGrid[row][col] = 2;
      setState(newGrid.slice());

      if (lastRow != -1){

        newGrid[lastRow][lastCol] = 1;
        setState(newGrid.slice());


        console.log(lastRow, lastCol);
      }


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

      await delay(50);
  
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

          const boundsCheck = setInterval(async ()=>{

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

      await delay(50);

      lastRow = row;
      lastCol = col;

      row += directionRow;
      col += directionCol;

      // for some reason not causing a rerender?????
      // look here later im on break https://stackoverflow.com/questions/25937369/react-component-not-re-rendering-on-state-change
      // looks like its because it doesnt work when setting by reference, it has to be to a value i guess?
      // assigning it to a new array copies by reference so it needs to be sliced for a "shallow copy" which is just the value

      if (!looping){

        clearInterval(mainInterval);
        done();
      }

      running = false;

    }, 0);


    // last things to do
    // fix up bugs and anything that isnt working properly
    // add gaps, fill in gaps

    })

  }



  function prims(){

    // implemented heap, probably, hopefully it works, its pretty basic
    // to implement a heap just create an array, for any index that index doubled + 1 or 2 is its child
    // accounting for the other half of the tree

    // finished prims really easily, i havent tested it and i wont so ill save that for tomorrow or something
    // lots of time left in the day but this will probably be it

    // let running = false;
    running = false;

    const newGrid = grid;
    const minHeap = new heap();

    return new Promise((done)=>{

    const mainInterval = setInterval(async ()=>{

      if (running || pause){

        return;
      }

      running = true;

      newGrid[row][col] = 1;
      setState(newGrid.slice());

      await delay(50);

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

        const validCheck = setInterval(async () => {
          
          const minimum = minHeap.top();

          // console.log(minimum);

          const origin = minimum[1][0];
          const destination = minimum[1][1];

          if (newGrid[destination[0]][destination[1]] == 0){

            clearInterval(validCheck);

            // oops i have to contain 2 arrays, one for the orign second for destination

            newGrid[origin[0] + (destination[0] - origin[0])/2][origin[1] + (destination[1] - origin[1])/2] = 1;
            setState(newGrid.slice());

            await delay(50);

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

        });

        // running = false;

      },60);

      await boundsCheck;

      running = false;

    }, 0);

    })
  }

  function kruskals(looping){

    // basically just copy and paste prims but contain an array of all possible cells like wilson and alder

    let walls = [];

    let trees = new Map;

    for (let row = 0; row < 17; row+=2){

      for (let col = 0; col < 17; col+=2){

        walls.push([row, col], [row+2, col]);
        walls.push([row, col], [row, col+2]);
      }
    }

    const newGrid = grid;

    // const directions = [-2,2];

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

      if (row-2 >= 0 && newGrid[row-1][col] < 0){

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

      await delay(50);

      // available.splice(available.indexOf(row*17 + col), 1);

      // let index = Math.round(Math.random() * (available.length-1));

      // let destinationRow = Math.floor(available[index] / 17);
      // let destinationCol = available[index] % 17;

      // let directionRow = 0;
      // let directionCol = 0;

      // if (Math.round(Math.random()) == 1){

      //   directionRow = directions[Math.round(Math.random())];
      // }
      // else{

      //   directionCol = directions[Math.round(Math.random())];
      // }

      // if (((row - 2) < 0 || newGrid[row - 2][col] == newGrid[row][col]) && ((row + 2) >= newGrid.length || newGrid[row + 2][col] == newGrid[row][col]) && ((col - 2) < 0 || newGrid[row][col-2] == newGrid[row][col]) && ((col + 2) >= newGrid.length || newGrid[row][col+2] == newGrid[row][col])){

      //   // check if there is no where to go, if there is swap one of the edges and check for an available space there in order for the
      //   // maze to be connected

      //   let promise = new Promise(async (resolve)=>{

      //     console.log("stuck at ", row, col);

      //     const boundsCheck = setInterval(()=>{

      //       // choose random direction, check for validity 


      //       // replace this with recursion, that or something thats iterative but does the same thing of searching 
      //       // absolutely everywhere, like dfs except not randomized, im not doing that now

      //       // if ((row + directionRow) >= 0 &&  (row + directionRow) < newGrid.length && (col + directionCol) >= 0 && (col + directionCol) < newGrid.length && (((row + directionRow - 2) >= 0 && newGrid[row + directionRow - 2][col + directionCol] != newGrid[row][col]) || ((row + directionRow + 2) < newGrid.length && newGrid[row + directionRow + 2][col + directionCol] != newGrid[row][col]) || ((col + directionCol - 2) >= 0 && newGrid[row + directionRow][col + directionCol - 2] != newGrid[row][col]) || ((col + directionCol + 2) < newGrid.length && newGrid[row + directionRow][col + directionCol + 2] != newGrid[row][col]))){

      //       //   // check whether from this direction there is a valid direction (if it isnt the same maze or doesnt go out of bounds)
      //       //   // (also if this direction is valid in the first place)

      //       //   console.log("got direction");

      //       //   // clearInterval(boundsCheck);

      //       //   row += directionRow;
      //       //   col += directionCol;

      //       //   // now just choose random directions until it works out

      //       //   // you could combine this entire statement with the else if below, however that looks terrible, its more organized this way
      //       //   // even if it does repeat code

      //       // }

      //       // if ((row + directionRow) >= 0 && (row + directionRow) < newGrid.length && (col + directionCol) >= 0 && (col + directionCol) < newGrid.length && newGrid[row + directionRow][col + directionCol] != newGrid[row][col]){

      //       //   console.log("unstuck");

      //       //   clearInterval(boundsCheck);
      //       //   resolve();
      //       //   return;
      //       // }


      //       // if (Math.round(Math.random()) < 1){
    
      //       //   directionRow = direction[Math.round(Math.random())];
      //       //   directionCol = 0;
      //       // }
      //       // else{
        
      //       //   directionCol = direction[Math.round(Math.random())];
      //       //   directionRow = 0;
      //       // }

      //     },100);

      //   })

      //   await promise;
      // }

      // if ((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length || newGrid[row + directionRow][col + directionCol] == newGrid[row][col]){

      //   console.log(row, col, directionRow, directionCol);

      //   console.log("bounds check");

      //   // theres an issue where it basically closes in on a tile when
      //   // 2 trees combine and that tile now has no where to go because everything surrounding it just turned into
      //   // the same tree, which is good since it wont form a loop, but in this situation it literally cant go anywhere
      //   // and so the function is stuck at a bounds check, here my only solution is just 
      //   // setting row to one of its neighbors and trying to expand outwards as if it were connected to instead, in other words
      //   // reversing the connection or edge to prevent being stuck like this, not doing this now though

      //   let promise = new Promise(async (resolve)=>{
          
      //     // console.log(`bounds check position ${row}, ${col} to ${row + directionRow}, ${col + directionCol}`);

      //     // await new Promise ((resolve)=>{

      //     //   setTimeout(() => {resolve()}, 3000);
      //     // })

      //     const boundsCheck = setInterval(async ()=>{

      //       if (!((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length || newGrid[row + directionRow][col + directionCol] == newGrid[row][col])){

      //         console.log("finish bounds check");

      //         clearInterval(boundsCheck);
      //         resolve();

      //         return;
      //       }
  
      //       if (Math.round(Math.random()) < 1){
    
      //         directionRow = direction[Math.round(Math.random())];
      //         directionCol = 0;
      //       }
      //       else{
        
      //         directionCol = direction[Math.round(Math.random())];
      //         directionRow = 0;
      //       }
  
      //     },0);

      //   })

      //   await promise;
      // }

      // if (newGrid[row + directionRow][col + directionCol] != 0){

      if (newGrid[row][col] == newGrid[destinationRow][col]){
        // choose a new wall
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

        let copy = trees.get(newGrid[row + directionRow][col+directionCol]);

        for (const position of tree){

          const row_ = Math.floor(position / 17);
          const col_ = position % 17;

          console.log(position, row_, col_, row, col);

          newGrid[row_][col_] = newGrid[destinationRow][destinationCol];

          copy.push(position);
        }

        trees.set(newGrid[destinationRow][destinationCol], copy);
        trees.delete(id);

        setState(newGrid.slice());

        await delay(100); 
      }
      else{

        newGrid[row + directionRow/2][col + directionCol/2] = newGrid[row][col];
        setState(newGrid.slice());

        await delay(50);

        newGrid[row + directionRow][col + directionCol] = newGrid[row][col];
        setState(newGrid.slice());

        await delay(50);
      }

      index = Math.round(Math.random() * (available.length-1));

      row = Math.floor(available[index] / 17);
      col = available[index] % 17;
      // select new valid starting point

      running = false;

    },500)

    })

  }

  let cells = [];

  for (let row = 0; row < 17; row+=2){

    for (let col = 0; col < 17; col+=2){

      cells.push(row * 17 + col);
    }
  }

  function wilsons(){

    // basically dfs but start randomly and go until you hit another cell already in the maze, this makes it unbiased

    let count = 3;

    let path = [];

    const newGrid = grid;

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

    // hopefully the above works but ill see

    // next to do is merging and loop detection, which is really just incrementing a number
    // but im lazy so

    // pop cells already travelled to too

    // maybe finished, im not testing though

    // let running = false;
    running = false;

    return new Promise((done)=>{

    const mainInterval = setInterval(async ()=>{

      if (running || pause){

        return;
      }

      if (cells.length == 0){

        console.log("finish");

        clearInterval(mainInterval);
        done();
        return;
      }

      console.log("start interval");

      running = true;

      let directionRow = 0;
      let directionCol = 0;

      // console.log(`row ${row} col ${col}`);

      newGrid[row][col] = count;
      setState(newGrid.slice());

      cells.splice(cells.indexOf(row * 17 + col), 1);

      path.push(row * 17 + col);

      console.log(newGrid[row][col]);

      await delay(50);
  
      if (Math.round(Math.random()) < 1){
  
        directionRow = direction[Math.round(Math.random())];
      }
      else{
  
        directionCol = direction[Math.round(Math.random())];
      }

      if ((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length || newGrid[row + directionRow][col + directionCol] >= 1){

        let promise = new Promise(async (resolve)=>{
          
          console.log(`bounds check position ${row}, ${col} to ${row + directionRow}, ${col + directionCol}`);

          // await new Promise ((resolve)=>{

          //   setTimeout(() => {resolve()}, 3000);
          // })

          let debounce = false;

          const boundsCheck = setInterval(async ()=>{

            // 3 checks here, check if this path starts a loop, check if it intersects another tile, and
            // generally check if where the path is going is in bounds

            console.log("bounds check");

            if (debounce == true){

              return;
            }


            if (!((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length ||newGrid[row + directionRow][col + directionCol] == 0 || newGrid[row + directionRow][col + directionCol] != count) && newGrid[row + directionRow/2][col + directionCol/2] == 0){

              // this is the case where a loop is formed (when the value at this position is count)
              // this gets rid of the loop by starting where the loop was formed

              // to implement just make a stack that backtracks until it reaches it
              // maybe works now, im not testing

              debounce = true;

              // const index = Math.round(Math.random() * (cells.length-1)/2) * 2;

              // console.log(index);

              // row = cells[Math.round(index / 34) * 2];
              // col = cells[(index % 17)];

              // let row_ = Math.floor(path[path.length-1] / 34) * 2;
              // let col_ = path[path.length-1] % 17;

              console.log("erasing loop");

              // console.log(row_, col_);
              // console.log(path[path.length-1]);

              let lastRow = Math.floor(path[path.length-1] / 17);
              let lastCol = path[path.length-1] % 17;

              let row_;
              let col_;

              const promise = new Promise(async (resolve)=>{

                // i could instead repurpose row instead of making a new variable but given
                // their different uses i think its easier to see doing this, besides i wouldnt have to
                // then make 2 variables for the intersection or just one array

                let debounce = false;

                const eraseLoop = setInterval(async () => {

                  if (debounce){

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

                    // cells.push((row_ + (lastRow - row_)/2) * 17 + col_ + (lastCol - col_)/2);

                    await delay(50);

                    newGrid[row_][col_] = 0;
                    setState(newGrid.slice());

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

                }, 50);

              })

              await promise;

              row = row_;
              col = col_;

              debounce = false;

              return;
            }

            // now just add a starting node and hope it works

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


              // i mustve forgotten to add a cell back, fix that later
              
              console.log(cells.length, index, cells[index], row, col, count);

              newGrid[row][col] = count;
              setState(newGrid.slice());

              // await new Promise((resolve)=>{
              //   setTimeout(resolve);
              // }, 50);

              // running = false;
              // wilsons(); 

              // hope this works
              // recursion is a hassle, change it later

              // resolve();

              // return;
            }

            console.log(row + directionRow, col + directionCol);

            if (!((row + directionRow) < 0 || (row + directionRow) >= newGrid.length || (col + directionCol) < 0 || (col + directionCol) >= newGrid.length || newGrid[row + directionRow][col + directionCol] != 0)){

              clearInterval(boundsCheck);
              resolve();

              console.log("continue");

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

          },50);
        })

        await promise;
      }

      console.log("connect?");

      newGrid[row + directionRow/2][col + directionCol/2] = count;

      // cells.splice((row + directionRow/2) * 17 + col + directionCol / 2);

      row += directionRow;
      col += directionCol;

      setState(newGrid.slice());

      running = false;

    },100);

    });

  }

  function aStar(){

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
        
        if (newGrid[row][col] != 0){
          // unitize
          newGrid[row][col] = -1;
        }
      }

      // costs.push(row_.slice());
      origins.push(row_.slice());
    }

    setState(newGrid.slice());

    // dude i dont think i even need cost, newgrid stores all the costs
    // the only reason i had costs were due to conflicts with grid, but if i just got through grid
    // and set all the values > or < 0 to 1 its all fine

    // let running = false;
    running = false;

    const mainInterval = setInterval(async () => {

      if (running || pause){

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
        // costs[row-2][col] = cost;

        // console.log(row-2, col, cost);

        minHeap.insert([cost, [row-2, col], current[2]+10]);
        origins[row-2][col] = row * grid.length + col;

        newGrid[row - 1][col] = current[2] + 5 + Math.abs(end[0] - (row - 1)) * 5 + Math.abs(end[1] - col) * 5;
        setState(newGrid.slice());
        await delay(100);

        // console.log(current[2] + 1 + Math.abs(end[0] - (row - 1)) + Math.abs(end[1] - col));

        if (row-2 == end[0] && col == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          const highlightPath = setInterval(async () => {
            
            if (position == -1){

              clearInterval(highlightPath);
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
            await delay(100);

            newGrid[Math.floor(position / newGrid.length)][position % newGrid.length] = 2;
            setState(newGrid.slice());

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]

            await delay(100);

          }, 100);

          return;
        }

        newGrid[row-2][col] = cost;
        setState(newGrid.slice());
        await delay(100);

      }

      if ((row + 2) < newGrid.length && grid[row+1][col] != 0 && ((row+2) != start[0] || col != start[1]) &&  (newGrid[row+2][col] == -1 || newGrid[row+2][col] > (current[2] + 10 + Math.abs(end[0] - (row + 2)) * 5 + Math.abs(end[1] - col) * 5))){

        // let cost = Math.abs(start[0] - (row + 2)) + Math.abs(start[1] - col) + Math.abs(end[0] - (row + 2)) + Math.abs(end[1] - col);

        let cost = current[2] + 10 + Math.abs(end[0] - (row + 2)) * 5 + Math.abs(end[1] - col) * 5;
        // costs[row+2][col] = cost;

        minHeap.insert([cost, [row+2, col], current[2]+10]);
        origins[row+2][col] = row * grid.length + col;

        newGrid[row+1][col] = current[2] + 5 + Math.abs(end[0] - (row + 1)) * 5 + Math.abs(end[1] - col) * 5;
        setState(newGrid.slice());
        await delay(100);

        if (row+2 == end[0] && col == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          const highlightPath = setInterval(async () => {
            
            if (position == -1){

              clearInterval(highlightPath);
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

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(100);

            newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
            setState(newGrid.slice());

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]
            await delay(100);

          }, 100);

          return;
        }

        newGrid[row+2][col] = cost;
        setState(newGrid.slice());

        // console.log(row+2, col, newGrid[row+2][col]);
        await delay(100);
      }

      if ((col - 2) >= 0 && grid[row][col-1] != 0 && (row != start[0] || (col-2) != start[1]) &&  (newGrid[row][col-2] == -1 || newGrid[row][col-2] > (current[2] + 10 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] - (col - 2)) * 5))){

        // let cost = Math.abs(start[0] - row) + Math.abs(start[1] - (col - 2)) + Math.abs(end[0] - row) + Math.abs(end[1] - (col - 2));

        let cost = current[2] + 10 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] - (col - 2)) * 5;
        // costs[row][col-2] = cost;

        minHeap.insert([cost, [row, col-2], current[2]+10]);
        origins[row][col-2] = row * grid.length + col;

        newGrid[row][col-1] =  current[2] + 5 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] - (col - 1)) * 5;
        setState(newGrid.slice());
        await delay(100);

        if (row == end[0] && col-2 == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          const highlightPath = setInterval(async () => {
            
            if (position == -1){

              clearInterval(highlightPath);
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

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(100);

            newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
            setState(newGrid.slice());

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]
            await delay(100);

            await delay(100);

          }, 100);

          return;
        }
     
        newGrid[row][col-2] = cost;
        setState(newGrid.slice());
        await delay(100);
      }

      if ((col + 2) < newGrid.length && grid[row][col+1] != 0 && (row != start[0] || (col+2) != start[1]) &&  (newGrid[row][col+2] == -1 || newGrid[row][col+2] > (current[2] + 10 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] -(col + 2)) * 5))){

        // let cost = Math.abs(start[0] - row) + Math.abs(start[1] - (col + 2)) + Math.abs(end[0] - row) + Math.abs(end[1] - (col + 2));
        let cost = current[2] + 10 + Math.abs(end[0] - row) * 5 + Math.abs(end[1] - (col + 2)) * 5;
        // costs[row][col+2] = cost;

        minHeap.insert([cost, [row, col+2], current[2]+10]);
        origins[row][col+2] = row * grid.length + col;

        newGrid[row][col+1] = current[2] + 5 + Math.abs(end[0] - row) * 5+ Math.abs(end[1] - (col + 1)) * 5;
        setState(newGrid.slice());
        await delay(100);

        if (row == end[0] && col+2 == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          const highlightPath = setInterval(async () => {
            
            if (position == -1){

              clearInterval(highlightPath);
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

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(100);

            newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
            setState(newGrid.slice());

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]
            await delay(100);

            await delay(100);

          }, 100);

          return;
        }

        newGrid[row][col+2] = cost;
        setState(newGrid.slice());
        await delay(100);
      }

      running = false;

    }, 100);
  }

  function dijkstras(){

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
    // let costs = [];
    let origins = [];

    for (let row = 0; row < 17; row++){

      let row_ = [];

      for (let col = 0; col < 17; col++){

        row_.push(-1);
        
        if (newGrid[row][col] != 0){
          // unitize
          newGrid[row][col] = -1;
        }

      }

      // costs.push(row_.slice());
      origins.push(row_.slice());
    }

    setState(newGrid.slice());

    // let running = false;
    running = false;

    // NOTE 
    // theres no need to store g cost, just use costs since the cost is just the distance from the start now
    // tweak that later 

    const mainInterval = setInterval(async () => {

      console.log("this??");

      if (running || pause){

        console.log("running");

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
        await delay(100);

        // console.log(current[2] + 1 + Math.abs(end[0] - (row - 1)) + Math.abs(end[1] - col));

        if (row-2 == end[0] && col == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          const highlightPath = setInterval(async () => {
            
            if (position == -1){

              clearInterval(highlightPath);
              return;
            }

            let difference;

            if (lastPosition - position > 0){

              difference = Math.floor((lastPosition - position) / 17);
            }
            else{

              difference = Math.ceil((lastPosition - position) / 17)
            }

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(100);

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length];

            newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
            setState(newGrid.slice());

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]
            await delay(100);

          }, 100);

          return;
        }

        newGrid[row-2][col] = cost;
        setState(newGrid.slice());
        await delay(100);

      }

      if ((row + 2) < newGrid.length && grid[row+1][col] != 0 && (row+2 != start[0] || col != start[1]) &&  (newGrid[row+2][col] == -1 || newGrid[row+2][col] > (current[0] + 10))){

        let cost = current[0] + 10;
        // costs[row+2][col] = cost;

        minHeap.insert([cost, [row+2, col]]);
        origins[row+2][col] = row * grid.length + col;

        newGrid[row+1][col] = current[0] + 5;
        setState(newGrid.slice());
        await delay(100);

        if (row+2 == end[0] && col == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          const highlightPath = setInterval(async () => {
            
            if (position == -1){

              clearInterval(highlightPath);
              return;
            }

            let difference;

            if (lastPosition - position > 0){

              difference = Math.floor((lastPosition - position) / 17);
            }
            else{

              difference = Math.ceil((lastPosition - position) / 17)
            }

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(100);

            newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
            setState(newGrid.slice());

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]
            await delay(100);

          }, 100);

          return;
        }

        newGrid[row+2][col] = cost;
        setState(newGrid.slice());
        await delay(100);
      }

      if ((col - 2) >= 0 && grid[row][col-1] != 0 && (row != start[0] || col-2 != start[1]) &&  (newGrid[row][col-2] == -1 || newGrid[row][col-2] > (current[0] + 10))){

        let cost = current[0] + 10;
        // costs[row][col-2] = cost;

        minHeap.insert([cost, [row, col-2]]);
        origins[row][col-2] = row * grid.length + col;

        newGrid[row][col-1] =  current[0] + 5;
        setState(newGrid.slice());
        await delay(100);

        if (row == end[0] && col-2 == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          const highlightPath = setInterval(async () => {
            
            if (position == -1){

              clearInterval(highlightPath);
              return;
            }

            let difference;

            if (lastPosition - position > 0){

              difference = Math.floor((lastPosition - position) / 17);
            }
            else{

              difference = Math.ceil((lastPosition - position) / 17)
            }

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(100);

            newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
            setState(newGrid.slice());

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]
            await delay(100);

            await delay(100);

          }, 100);

          return;
        }
     
        newGrid[row][col-2] = cost;
        setState(newGrid.slice());
        await delay(100);
      }

      if ((col + 2) < newGrid.length && grid[row][col+1] != 0 &&(row != start[0] || col+2 != start[1]) &&  (newGrid[row][col+2] == -1 || newGrid[row][col+2] > (current[0] + 10))){

        let cost = current[0] + 10;
        // costs[row][col+2] = cost;

        minHeap.insert([cost, [row, col+2]]);
        origins[row][col+2] = row * grid.length + col;

        newGrid[row][col+1] = current[0] + 5;
        setState(newGrid.slice());
        await delay(100);

        if (row == end[0] && col+2 == end[1]){

          console.log("path finished");

          clearInterval(mainInterval);

          let position = origins[end[0]][end[1]];
          let lastPosition = end[0] * newGrid.length + end[1];

          const highlightPath = setInterval(async () => {
            
            if (position == -1){

              clearInterval(highlightPath);
              return;
            }

            let difference;

            if (lastPosition - position > 0){

              difference = Math.floor((lastPosition - position) / 17);
            }
            else{

              difference = Math.ceil((lastPosition - position) / 17)
            }

            newGrid[Math.floor(position / newGrid.length) + difference / 2][position % 17 + ((lastPosition - position) % 17) / 2] = 2;
            setState(newGrid.slice());
            await delay(100);

            lastPosition = position;
            position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]

            if (position != -1){
              // meaning its not the last vertex or node, meaning its not the start
              newGrid[Math.floor(lastPosition / newGrid.length)][lastPosition % newGrid.length] = 2;
              setState(newGrid.slice());
            }

            await delay(100);

          }, 100);

          return;
        }

        newGrid[row][col+2] = cost;
        setState(newGrid.slice());
        await delay(100);
      }

      running = false;

    }, 100);

  }

  function bellman(){

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

    // let running = false;
    running = false;

    let previous = -1;

    const mainInterval = setInterval(async () => {

      if (running || pause){

        return;
      }

      running = true;

      console.log("new iteration");

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
            await delay(100);

            newGrid[row-2][col] = newGrid[row][col] + 10;
            // setState(newGrid.slice());
            newGrid = newGrid.slice();
            // }

            origins[row-2][col] = row * newGrid.length + col;
            setState(newGrid.slice());

            await delay(100);
          }

          if (row+2 < newGrid.length && newGrid[row+1][col] != 0 && (newGrid[row+2][col] == -1 || newGrid[row+2][col] > newGrid[row][col] + 10)){

            // if ((row+2 != start[0] || col != start[1]) && (row+2 != end[0] || col != end[1])){

            newGrid[row+1][col] = newGrid[row][col] + 5;
            setState(newGrid.slice());
            await delay(100);

            newGrid[row+2][col] = newGrid[row][col] + 10;
            // setState(newGrid.slice());
            newGrid = newGrid.slice();
            // }

            origins[row+2][col] = row * newGrid.length + col;
            setState(newGrid.slice());

            await delay(100);
          }

          if (col-2 >= 0 && newGrid[row][col-1] != 0 && (newGrid[row][col-2] == -1 || newGrid[row][col-2] > newGrid[row][col] + 10)){

            // if ((row != start[0] || col-2 != start[1]) && (row != end[0] || col-2 != end[1])){

            newGrid[row][col-1] = newGrid[row][col] + 5;
            setState(newGrid.slice());
            await delay(100);

            newGrid[row][col-2] = newGrid[row][col] + 10;
            // setState(newGrid.slice());
            newGrid = newGrid.slice();
            // }

            origins[row][col-2] = row * newGrid.length + col;
            setState(newGrid.slice());

            await delay(100);
          }

          if (col+2 < newGrid.length && newGrid[row][col+1] != 0  && (newGrid[row][col+2] == -1 || newGrid[row][col+2] > newGrid[row][col] + 10)){

            // if ((row != start[0] || col+2 != start[1]) && (row != end[0] || col+2 != end[1])){

            newGrid[row][col+1] = newGrid[row][col] + 5;
            setState(newGrid.slice());
            await delay(100);

            newGrid[row][col+2] = newGrid[row][col] + 10;
            // setState(newGrid.slice());
            newGrid = newGrid.slice();
            // }

            origins[row][col+2] = row * newGrid.length + col;
            setState(newGrid.slice());

            await delay(100);
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

        const highlightPath = setInterval(async () => {
          
          if (position == -1){

            console.log("highlighted path");

            newGrid[start[0]][start[1]] = -1;
            setState(newGrid.slice());

            clearInterval(highlightPath);
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
          await delay(100);

          // if (position != start[0] * newGrid.length + start[1]){
          //   // 

          //   console.log(Math.floor(position / newGrid.length), position % newGrid.length, start[0], start[1]);
          //   console.log(newGrid[start[0]][start[1]]);
            
          //   newGrid[Math.floor(position / newGrid.length)][position % newGrid.length] = 2;
          //   setState(newGrid.slice());

          //   console.log(newGrid[start[0]][start[1]]);
          // }

          newGrid[Math.floor(position / newGrid.length)][position % newGrid.length] = 2;

          lastPosition = position;
          position = origins[Math.floor(position / newGrid.length)][position % newGrid.length]

          await delay(100);

        }, 100);


        clearInterval(mainInterval);
        return;
      }

      previous = newGrid;

      running = false;

    }, 100);

  }

  // debounce weird
  // i lied im the smartest person ever, not really i just figured that
  // the problem was because of the set state which rerenders the page, that means this function runs again
  // and debounce must be redeclared resetting the timer

  document.addEventListener("keydown", async (event)=>{

    if (event.key == "ArrowRight" && !debounce){

      debounce = true

      await dfs(false);

      // this is sort of screwed up but whatever it works

      console.log(debounce);

      setTimeout(()=>{
        debounce = false;
      },250);
    }

  })
  
  return (
    <>
      
      <div className="panel"> 

        {/* make scrollbox later */}

        <p>mazevis<br/><br/>description</p>

        <hr/>

        <div className="interface">

          <p>maze generation</p>

          <div className="algorithm">

            <p>algorithm</p>

            <select id="mazeGeneration">

              <option className="option" value="dfs">depth first search</option>
              <option className="option" value="prims">prims</option>
              <option className="option" value="kruskals" >kruskals</option>
              <option className="option" value="wilsons">wilsons</option>
              <option className="option" value="alder">aldour-broder</option>

            </select>

            <p>controls</p>

            <div className="controls">

              <button onClick={async ()=>{

                if (ongoing){

                  pause = !pause;
                  return;
                }

                ongoing = true;

                const selection = document.getElementById("mazeGeneration").value;

                  row = Math.round(Math.random()*8) * 2;
                  col = Math.round(Math.random()*8) * 2;

                if (selection == "dfs"){
                  
                  // row = Math.round(Math.random()*8) * 2;
                  // col = Math.round(Math.random()*8) * 2;

                  await dfs(true);

                  // dfs(Math.round(Math.random()*16), Math.round(Math.random()*16));
                }

                else if (selection == "prims"){

                  await prims(true);

                }

                else if (selection == "wilsons"){

                  await wilsons(true);
                }

                else if (selection == "alder"){

                  await AldousBroder(true);
                }

                else if (selection == "kruskals"){

                  displayNum = true;

                  await kruskals(true);
                }

                ongoing = false;
              }}>
                start & stop
              </button>

              <button onClick={()=>{

                skip = true;
              }}>
                skip
              </button>

              <button>
                reset
              </button>

            </div>

            <p>delay</p>

            <input type="range"/>

          </div>

          <p>pathfinding</p>

          <div className="algorithm">

            <p>algorithm</p>

            <select id="pathGeneration">

              <option className="option" value="a" >a*</option>
              <option className="option" value="dijkstras">dijkstras</option>
              <option className="option" value="bellman">bellman-ford</option>

            </select>

            <p>controls</p>

            <div className="controls">

              <button onClick={()=>{

                console.log("test");

                if (start == -1 || end == -1){

                  console.log("invalid");

                  return;
                }

                if (ongoing){

                  console.log("going");

                  pause = !pause;
                  return;
                }

                console.log("pass");

                ongoing = true;

                const selection = document.getElementById("pathGeneration").value;

                row = Math.floor(start / grid.length);
                col = start % grid.length;

                displayNum = true;

                if (selection == "a"){

                  aStar();
                }

                else if (selection == "dijkstras"){

                  dijkstras();
                }

                else if (selection == "bellman"){

                  bellman();
                }

                ongoing = false;

              }}>
                start & stop
              </button>

              <button>
                skip
              </button>

              <button>
                reset
              </button>

              <button onClick={()=>{

                setting = "start";
              }}>
                set
              </button>

            </div>

            <p>delay</p>

            <input type="range"/>

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
                  setting = "";
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

    </>
  )
}

export default App
