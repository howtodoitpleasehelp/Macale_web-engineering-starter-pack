// Core State
let gridWidth = 30;
let gridHeight = 15;
let grid = [];
let startNode = null;
let endNode = null;
let isMouseDown = false;
let mode = 'wall';
let animationSpeed = 70;
let currentImage = null;

const IMAGES = [
  'cb1.jpg', 'cb2.jpg', 'cb3.jpg', 'cb4.jpg', 'cb5.jpg', 
  'cb6.jpg', 'cb7.jpg', 'cb8.jpg', 'cb9.jpg', 'cb10.jpg',
  'cb11.jpg', 'cb12.jpg', 'cb13.jpg'
];

// Load random image
function loadRandomImage() {
  const img = new Image();
  const randomImage = IMAGES[Math.floor(Math.random() * IMAGES.length)];
  img.src = `images/pictures/${randomImage}`;
  img.onload = () => {
    currentImage = img;
    // Reset reveal state when loading new image
    document.getElementById('grid').classList.remove('reveal-image');
    updateGridBackground();
  };
}

// Update grid background positions
function updateGridBackground() {
  if (!currentImage) return;

  const gridElement = document.getElementById("grid");
  const gridRect = gridElement.getBoundingClientRect();
  
  // Calculate scaling to fit image
  const scaleX = currentImage.width / gridRect.width;
  const scaleY = currentImage.height / gridRect.height;
  const scale = Math.max(scaleX, scaleY);
  
  const scaledWidth = currentImage.width / scale;
  const scaledHeight = currentImage.height / scale;
  
  // Center the image
  const offsetX = (gridRect.width - scaledWidth) / 2;
  const offsetY = (gridRect.height - scaledHeight) / 2;

  grid.forEach((row, rowIndex) => {
    row.forEach((node, colIndex) => {
      const cell = document.getElementById(`cell-${rowIndex}-${colIndex}`);
      if (!cell) return;

      // Calculate position relative to image
      const x = (colIndex * gridRect.width / gridWidth - offsetX) / scaledWidth * 100;
      const y = (rowIndex * gridRect.height / gridHeight - offsetY) / scaledHeight * 100;
      
      cell.style.backgroundImage = `url(${currentImage.src})`;
      cell.style.backgroundPosition = `${x}% ${y}%`;
      cell.style.backgroundSize = `${gridWidth * 100}% ${gridHeight * 100}%`;
    });
  });
}

// Grid Creation
function createGrid() {
  const gridElement = document.getElementById("grid");
  gridElement.innerHTML = "";
  grid = [];

  // Calculate cell size based on container width
  const containerWidth = document.querySelector('.grid-container').clientWidth - 32;
  const cellSize = Math.floor(Math.min(25, (containerWidth - gridWidth) / gridWidth));
  document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
  
  gridElement.style.gridTemplateColumns = `repeat(${gridWidth}, var(--cell-size))`;

  for (let row = 0; row < gridHeight; row++) {
    const rowArr = [];
    for (let col = 0; col < gridWidth; col++) {
      const node = {
        row, col,
        isStart: false,
        isEnd: false,
        isWall: false,
        isVisited: false,
        distance: Infinity,
        previousNode: null
      };
      rowArr.push(node);

      const cell = document.createElement("div");
      cell.className = "node";
      cell.id = `cell-${row}-${col}`;
      
      cell.addEventListener("mousedown", () => handleNodeClick(node));
      cell.addEventListener("mouseover", () => handleNodeMouseOver(node));

      gridElement.appendChild(cell);
    }
    grid.push(rowArr);
  }
  
  placeDefaultStartEnd();
  loadRandomImage();
  renderGrid();
}

// Interaction
function setMode(newMode) {
  mode = newMode;
  document.querySelectorAll(".btn").forEach(btn => btn.classList.remove("selected"));
  document.getElementById(`${newMode}-btn`)?.classList.add("selected");
}

function applyGridSize() {
  const width = parseInt(document.getElementById('grid-width').value);
  const height = parseInt(document.getElementById('grid-height').value);
  
  // Validate input
  if (width < 5 || width > 50 || height < 5 || height > 30) {
    alert('Please enter valid grid dimensions:\nWidth: 5-50\nHeight: 5-30');
    return;
  }
  
  gridWidth = width;
  gridHeight = height;
  createGrid();
}

function setSpeed() {
  animationSpeed = parseInt(document.getElementById("speed").value);
}

function handleNodeClick(node) {
  // Reset reveal state on any interaction
  document.getElementById('grid').classList.remove('reveal-image');
  
  if (mode === 'start') {
    if (startNode) startNode.isStart = false;
    node.isStart = true;
    startNode = node;
  } else if (mode === 'end') {
    if (endNode) endNode.isEnd = false;
    node.isEnd = true;
    endNode = node;
  } else if (mode === 'wall') {
    if (!node.isStart && !node.isEnd) {
      node.isWall = !node.isWall;
    }
  }
  renderGrid();
}

// Add mouseover handler for wall drawing
function handleNodeMouseOver(node) {
  if (isMouseDown && mode === 'wall' && !node.isStart && !node.isEnd) {
    // Reset reveal state when drawing walls
    document.getElementById('grid').classList.remove('reveal-image');
    node.isWall = true;
    renderGrid();
  }
}

function placeDefaultStartEnd() {
  const midRow = Math.floor(gridHeight / 2);
  startNode = grid[midRow][1];
  endNode = grid[midRow][gridWidth - 2];
  startNode.isStart = true;
  endNode.isEnd = true;
}

function renderGrid() {
  for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      const node = grid[row][col];
      const cell = document.getElementById(`cell-${row}-${col}`);
      cell.className = "node";
      if (node.isStart) cell.classList.add("start");
      else if (node.isEnd) cell.classList.add("end");
      else if (node.isWall) cell.classList.add("wall");
      else if (node.isVisited) cell.classList.add("visited");
    }
  }
}

function resetGrid() {
  // Reset reveal state first
  document.getElementById('grid').classList.remove('reveal-image');
  
  // Clear all nodes and reset the grid
  grid.forEach(row => row.forEach(node => {
    node.isWall = false;
    node.isVisited = false;
    node.isStart = false;
    node.isEnd = false;
    node.distance = Infinity;
    node.previousNode = null;
  }));
  
  // Hide path info
  document.getElementById('path-info').hidden = true;
  
  // Create fresh grid
  createGrid();
}

// A* Algorithm Implementation
function getManhattanDistance(a, b) {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function getNeighbors(node) {
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
  return dirs.map(([dr, dc]) => grid[node.row + dr]?.[node.col + dc])
             .filter(n => n && !n.isWall && !n.isVisited);
}

function sleep(ms) { 
  return new Promise(res => setTimeout(res, ms)); 
}

async function animatePath(node) {
  const path = [];
  while (node.previousNode) {
    path.unshift(node);
    node = node.previousNode;
  }

  for (const n of path) {
    document.getElementById(`cell-${n.row}-${n.col}`).classList.add("path");
    await sleep(animationSpeed);
  }

  // Remove walls and reveal the entire image after path is complete
  grid.forEach(row => row.forEach(node => {
    if (node.isWall) {
      node.isWall = false;
      document.getElementById(`cell-${node.row}-${node.col}`).classList.remove("wall");
    }
  }));
  
  // Add slight delay before revealing the full image
  await sleep(100);
  document.getElementById('grid').classList.add('reveal-image');
  
  // Update path length
  document.getElementById('path-length').textContent = path.length;
}

async function visualizeAstar() {
  if (!startNode || !endNode) {
    alert("Please set both start and end points first!");
    return;
  }

  // Reset previous path and remove reveal effect
  grid.forEach(row => row.forEach(node => {
    node.isVisited = false;
    node.distance = Infinity;
    node.previousNode = null;
  }));
  document.getElementById('grid').classList.remove('reveal-image');
  renderGrid();
  
  document.getElementById('path-info').hidden = false;

  const openSet = [startNode];
  const closedSet = new Set();
  startNode.distance = 0;
  let visitedCount = 0;

  while (openSet.length) {
    openSet.sort((a, b) => (a.distance + getManhattanDistance(a, endNode)) - 
                          (b.distance + getManhattanDistance(b, endNode)));
    const current = openSet.shift();
    
    if (current === endNode) {
      return animatePath(current);
    }

    closedSet.add(current);
    current.isVisited = true;
    visitedCount++;
    
    if (!current.isStart && !current.isEnd) {
      document.getElementById(`cell-${current.row}-${current.col}`).classList.add("visited");
      document.getElementById("nodes-visited").textContent = visitedCount;
      await sleep(animationSpeed);
    }

    getNeighbors(current).forEach(neighbor => {
      if (closedSet.has(neighbor)) return;
      
      const tentativeDistance = current.distance + 1;
      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      } else if (tentativeDistance >= neighbor.distance) {
        return;
      }

      neighbor.previousNode = current;
      neighbor.distance = tentativeDistance;
    });
  }

  alert("No path found! Try removing some walls.");
}

// Event Listeners
window.addEventListener("mousedown", () => isMouseDown = true);
window.addEventListener("mouseup", () => isMouseDown = false);
window.addEventListener("dragstart", e => e.preventDefault());

// Add window resize handler
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    const containerWidth = document.querySelector('.grid-container').clientWidth - 32;
    const cellSize = Math.floor(Math.min(25, (containerWidth - gridWidth) / gridWidth));
    document.documentElement.style.setProperty('--cell-size', `${cellSize}px`);
    updateGridBackground();
  }, 250);
});

// Initialize
createGrid();
