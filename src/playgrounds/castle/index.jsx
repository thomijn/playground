import React, { useMemo, useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Box, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

// Base tile types
const BASE_TILES = {
  EMPTY: 'empty',
  WALL_STRAIGHT: 'wall_straight',
  WALL_CORNER: 'wall_corner', 
  WALL_T: 'wall_t',
  WALL_CROSS: 'wall_cross',
  TOWER_ROUND: 'tower_round',
  TOWER_SQUARE: 'tower_square',
  GATE: 'gate',
  COURTYARD: 'courtyard',
  KEEP: 'keep',
  BUILDING: 'building'
};

// Generate rotated versions of tiles
const createRotatedTiles = () => {
  const tiles = {};
  
  Object.entries(BASE_TILES).forEach(([key, value]) => {
    if (value === 'empty' || value === 'courtyard' || value === 'tower_round') {
      // Symmetric tiles don't need rotation variants
      tiles[`${value}_0`] = { type: value, rotation: 0 };
    } else {
      // Create 4 rotations for asymmetric tiles
      for (let i = 0; i < 4; i++) {
        tiles[`${value}_${i}`] = { type: value, rotation: i * 90 };
      }
    }
  });
  
  return tiles;
};

const TILES = createRotatedTiles();

// Connection patterns for each base tile type (before rotation)
const BASE_CONNECTIONS = {
  [BASE_TILES.EMPTY]: {
    north: false, south: false, east: false, west: false
  },
  [BASE_TILES.WALL_STRAIGHT]: {
    north: true, south: true, east: false, west: false
  },
  [BASE_TILES.WALL_CORNER]: {
    north: true, south: false, east: true, west: false
  },
  [BASE_TILES.WALL_T]: {
    north: true, south: true, east: true, west: false
  },
  [BASE_TILES.WALL_CROSS]: {
    north: true, south: true, east: true, west: true
  },
  [BASE_TILES.TOWER_ROUND]: {
    north: true, south: true, east: true, west: true
  },
  [BASE_TILES.TOWER_SQUARE]: {
    north: true, south: true, east: true, west: true
  },
  [BASE_TILES.GATE]: {
    north: false, south: true, east: false, west: false
  },
  [BASE_TILES.COURTYARD]: {
    north: false, south: false, east: false, west: false
  },
  [BASE_TILES.KEEP]: {
    north: false, south: false, east: false, west: false
  },
  [BASE_TILES.BUILDING]: {
    north: false, south: false, east: false, west: false
  }
};

// Rotate connection pattern based on rotation
const rotateConnections = (connections, rotation) => {
  const directions = ['north', 'east', 'south', 'west'];
  const rotated = {};
  
  directions.forEach((dir, index) => {
    const rotatedIndex = (index + rotation) % 4;
    rotated[directions[rotatedIndex]] = connections[dir];
  });
  
  return rotated;
};

// Generate adjacency rules for all rotated tiles
const generateAdjacencyRules = () => {
  const rules = {};
  
  Object.entries(TILES).forEach(([tileKey, tileData]) => {
    const baseConnections = BASE_CONNECTIONS[tileData.type];
    const rotatedConnections = rotateConnections(baseConnections, tileData.rotation / 90);
    
    rules[tileKey] = {
      north: [],
      south: [],
      east: [],
      west: []
    };
    
    // For each direction, find compatible tiles
    Object.entries(TILES).forEach(([otherKey, otherData]) => {
      const otherBaseConnections = BASE_CONNECTIONS[otherData.type];
      const otherRotatedConnections = rotateConnections(otherBaseConnections, otherData.rotation / 90);
      
      // Check if tiles can connect in each direction
      if (rotatedConnections.north === otherRotatedConnections.south) {
        rules[tileKey].north.push(otherKey);
      }
      if (rotatedConnections.south === otherRotatedConnections.north) {
        rules[tileKey].south.push(otherKey);
      }
      if (rotatedConnections.east === otherRotatedConnections.west) {
        rules[tileKey].east.push(otherKey);
      }
      if (rotatedConnections.west === otherRotatedConnections.east) {
        rules[tileKey].west.push(otherKey);
      }
    });
  });
  
  return rules;
};

const ADJACENCY_RULES = generateAdjacencyRules();

// Wave Function Collapse implementation
class WaveFunctionCollapse {
  constructor(width, height, tiles, rules) {
    this.width = width;
    this.height = height;
    this.tiles = tiles;
    this.rules = rules;
    this.grid = this.initializeGrid();
  }

  initializeGrid() {
    const grid = [];
    for (let y = 0; y < this.height; y++) {
      grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        grid[y][x] = {
          collapsed: false,
          options: Object.keys(this.tiles),
          entropy: Object.keys(this.tiles).length
        };
      }
    }
    return grid;
  }

  getNeighbors(x, y) {
    const neighbors = {};
    if (y > 0) neighbors.north = this.grid[y - 1][x];
    if (y < this.height - 1) neighbors.south = this.grid[y + 1][x];
    if (x > 0) neighbors.west = this.grid[y][x - 1];
    if (x < this.width - 1) neighbors.east = this.grid[y][x + 1];
    return neighbors;
  }

  getLowestEntropyCell() {
    let minEntropy = Infinity;
    let candidates = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cell = this.grid[y][x];
        if (!cell.collapsed && cell.entropy < minEntropy && cell.entropy > 0) {
          minEntropy = cell.entropy;
          candidates = [{ x, y }];
        } else if (!cell.collapsed && cell.entropy === minEntropy) {
          candidates.push({ x, y });
        }
      }
    }

    return candidates.length > 0 
      ? candidates[Math.floor(Math.random() * candidates.length)]
      : null;
  }

  collapseCell(x, y) {
    const cell = this.grid[y][x];
    if (cell.collapsed || cell.options.length === 0) return false;

    const biasedOptions = this.applyGenerationBias(cell.options, x, y);
    const chosenTile = biasedOptions[Math.floor(Math.random() * biasedOptions.length)];
    
    cell.collapsed = true;
    cell.options = [chosenTile];
    cell.entropy = 0;

    return true;
  }

  applyGenerationBias(options, x, y) {
    const biased = [...options];
    const isEdge = x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1;
    const isCorner = (x === 0 || x === this.width - 1) && (y === 0 || y === this.height - 1);
    const centerX = Math.floor(this.width / 2);
    const centerY = Math.floor(this.height / 2);
    const distanceFromCenter = Math.abs(x - centerX) + Math.abs(y - centerY);
    
    // Bias for walls on edges
    if (isEdge) {
      const wallOptions = options.filter(opt => 
        this.tiles[opt].type.includes('wall') || this.tiles[opt].type.includes('tower')
      );
      biased.push(...wallOptions, ...wallOptions);
    }
    
    // Bias for towers on corners
    if (isCorner) {
      const towerOptions = options.filter(opt => 
        this.tiles[opt].type.includes('tower')
      );
      biased.push(...towerOptions, ...towerOptions, ...towerOptions);
    }
    
    // Bias for courtyards and buildings in center
    if (distanceFromCenter < 3) {
      const interiorOptions = options.filter(opt => 
        ['courtyard', 'keep', 'building'].includes(this.tiles[opt].type)
      );
      biased.push(...interiorOptions, ...interiorOptions);
    }
    
    // Add gate bias for one edge
    if (y === this.height - 1 && Math.abs(x - centerX) < 2) {
      const gateOptions = options.filter(opt => this.tiles[opt].type === 'gate');
      biased.push(...gateOptions, ...gateOptions);
    }

    return biased;
  }

  propagate(startX, startY) {
    const stack = [{ x: startX, y: startY }];

    while (stack.length > 0) {
      const { x, y } = stack.pop();
      const neighbors = this.getNeighbors(x, y);
      const currentCell = this.grid[y][x];

      Object.entries(neighbors).forEach(([direction, neighbor]) => {
        if (neighbor.collapsed) return;

        const validOptions = neighbor.options.filter(option => {
          return currentCell.options.some(currentOption => {
            return this.rules[currentOption] && 
                   this.rules[currentOption][direction] &&
                   this.rules[currentOption][direction].includes(option);
          });
        });

        if (validOptions.length < neighbor.options.length) {
          neighbor.options = validOptions;
          neighbor.entropy = validOptions.length;

          const neighborPos = this.getNeighborPosition(x, y, direction);
          if (neighborPos && !stack.some(p => p.x === neighborPos.x && p.y === neighborPos.y)) {
            stack.push(neighborPos);
          }
        }
      });
    }
  }

  getNeighborPosition(x, y, direction) {
    switch (direction) {
      case 'north': return y > 0 ? { x, y: y - 1 } : null;
      case 'south': return y < this.height - 1 ? { x, y: y + 1 } : null;
      case 'west': return x > 0 ? { x: x - 1, y } : null;
      case 'east': return x < this.width - 1 ? { x: x + 1, y } : null;
      default: return null;
    }
  }

  generate() {
    let iterations = 0;
    const maxIterations = this.width * this.height * 100;

    while (iterations < maxIterations) {
      const cell = this.getLowestEntropyCell();
      if (!cell) break;

      const collapsed = this.collapseCell(cell.x, cell.y);
      if (collapsed) {
        this.propagate(cell.x, cell.y);
      }

      iterations++;
    }

    return this.grid.map(row => row.map(cell => 
      cell.collapsed ? cell.options[0] : Object.keys(this.tiles)[0]
    ));
  }
}

// 3D Tile Components (all exactly 1x1 units)
const EmptyTile = ({ position, rotation }) => null;

const WallStraightTile = ({ position, rotation }) => (
  <group position={position} rotation={[0, rotation * Math.PI / 180, 0]}>
    <Box args={[0.2, 1.5, 1]} position={[0, 0.75, 0]}>
      <meshStandardMaterial color="#8B7355" />
    </Box>
    {/* Crenellations */}
    {[-0.3, 0, 0.3].map((offset, i) => (
      <Box key={i} args={[0.25, 0.3, 0.15]} position={[0, 1.65, offset]}>
        <meshStandardMaterial color="#8B7355" />
      </Box>
    ))}
  </group>
);

const WallCornerTile = ({ position, rotation }) => (
  <group position={position} rotation={[0, rotation * Math.PI / 180, 0]}>
    {/* North wall */}
    <Box args={[1, 1.5, 0.2]} position={[0, 0.75, -0.4]}>
      <meshStandardMaterial color="#8B7355" />
    </Box>
    {/* East wall */}
    <Box args={[0.2, 1.5, 1]} position={[0.4, 0.75, 0]}>
      <meshStandardMaterial color="#8B7355" />
    </Box>
    {/* Corner tower */}
    <Cylinder args={[0.25, 0.25, 1.8]} position={[0.4, 1.4, -0.4]}>
      <meshStandardMaterial color="#6B5B47" />
    </Cylinder>
  </group>
);

const WallTTile = ({ position, rotation }) => (
  <group position={position} rotation={[0, rotation * Math.PI / 180, 0]}>
    {/* Main wall (north-south) */}
    <Box args={[0.2, 1.5, 1]} position={[0, 0.75, 0]}>
      <meshStandardMaterial color="#8B7355" />
    </Box>
    {/* East wall */}
    <Box args={[0.8, 1.5, 0.2]} position={[0.3, 0.75, 0]}>
      <meshStandardMaterial color="#8B7355" />
    </Box>
  </group>
);

const WallCrossTile = ({ position, rotation }) => (
  <group position={position} rotation={[0, rotation * Math.PI / 180, 0]}>
    {/* North-South wall */}
    <Box args={[0.2, 1.5, 1]} position={[0, 0.75, 0]}>
      <meshStandardMaterial color="#8B7355" />
    </Box>
    {/* East-West wall */}
    <Box args={[1, 1.5, 0.2]} position={[0, 0.75, 0]}>
      <meshStandardMaterial color="#8B7355" />
    </Box>
  </group>
);

const TowerRoundTile = ({ position, rotation }) => (
  <group position={position}>
    <Cylinder args={[0.4, 0.4, 2.2]} position={[0, 1.1, 0]}>
      <meshStandardMaterial color="#6B5B47" />
    </Cylinder>
    {/* Tower roof */}
    <Cylinder args={[0, 0.45, 0.6]} position={[0, 2.5, 0]}>
      <meshStandardMaterial color="#8B4513" />
    </Cylinder>
  </group>
);

const TowerSquareTile = ({ position, rotation }) => (
  <group position={position} rotation={[0, rotation * Math.PI / 180, 0]}>
    <Box args={[0.8, 2.2, 0.8]} position={[0, 1.1, 0]}>
      <meshStandardMaterial color="#6B5B47" />
    </Box>
    {/* Tower roof */}
    <Box args={[0.9, 0.2, 0.9]} position={[0, 2.3, 0]}>
      <meshStandardMaterial color="#8B4513" />
    </Box>
  </group>
);

const GateTile = ({ position, rotation }) => (
  <group position={position} rotation={[0, rotation * Math.PI / 180, 0]}>
    <Box args={[1, 1.8, 0.3]} position={[0, 0.9, 0]}>
      <meshStandardMaterial color="#8B7355" />
    </Box>
    {/* Gate opening */}
    <Box args={[0.6, 1.4, 0.4]} position={[0, 0.7, 0]}>
      <meshStandardMaterial color="#2F1B14" />
    </Box>
    {/* Gate towers */}
    <Cylinder args={[0.2, 0.2, 2]} position={[-0.3, 1.5, 0]}>
      <meshStandardMaterial color="#6B5B47" />
    </Cylinder>
    <Cylinder args={[0.2, 0.2, 2]} position={[0.3, 1.5, 0]}>
      <meshStandardMaterial color="#6B5B47" />
    </Cylinder>
  </group>
);

const CourtyardTile = ({ position, rotation }) => (
  <Box args={[1, 0.1, 1]} position={[position[0], position[1] - 0.05, position[2]]}>
    <meshStandardMaterial color="#3A5F3A" />
  </Box>
);

const KeepTile = ({ position, rotation }) => (
  <group position={position} rotation={[0, rotation * Math.PI / 180, 0]}>
    <Box args={[0.7, 2.8, 0.7]} position={[0, 1.4, 0]}>
      <meshStandardMaterial color="#5D4E37" />
    </Box>
    {/* Keep roof */}
    <Box args={[0.8, 0.3, 0.8]} position={[0, 2.95, 0]}>
      <meshStandardMaterial color="#8B4513" />
    </Box>
  </group>
);

const BuildingTile = ({ position, rotation }) => (
  <group position={position} rotation={[0, rotation * Math.PI / 180, 0]}>
    <Box args={[0.8, 1.2, 0.6]} position={[0, 0.6, 0]}>
      <meshStandardMaterial color="#8B6F47" />
    </Box>
    {/* Roof */}
    <Box args={[0.9, 0.2, 0.7]} position={[0, 1.3, 0]}>
      <meshStandardMaterial color="#8B4513" />
    </Box>
  </group>
);

// Main Castle Component
const Castle = ({ castleData }) => {
  const tileComponents = {
    [BASE_TILES.EMPTY]: EmptyTile,
    [BASE_TILES.WALL_STRAIGHT]: WallStraightTile,
    [BASE_TILES.WALL_CORNER]: WallCornerTile,
    [BASE_TILES.WALL_T]: WallTTile,
    [BASE_TILES.WALL_CROSS]: WallCrossTile,
    [BASE_TILES.TOWER_ROUND]: TowerRoundTile,
    [BASE_TILES.TOWER_SQUARE]: TowerSquareTile,
    [BASE_TILES.GATE]: GateTile,
    [BASE_TILES.COURTYARD]: CourtyardTile,
    [BASE_TILES.KEEP]: KeepTile,
    [BASE_TILES.BUILDING]: BuildingTile
  };

  return (
    <>
      {castleData.map((row, y) =>
        row.map((tileKey, x) => {
          const tileData = TILES[tileKey];
          const Component = tileComponents[tileData.type];
          if (!Component) return null;
          
          return (
            <Component
              key={`${x}-${y}`}
              position={[x - castleData[0].length / 2, 0, y - castleData.length / 2]}
              rotation={tileData.rotation}
            />
          );
        })
      )}
    </>
  );
};

// Main App Component
const CastleGenerator = () => {
  const [castleData, setCastleData] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCastle = useCallback(() => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const wfc = new WaveFunctionCollapse(8, 8, TILES, ADJACENCY_RULES);
      const result = wfc.generate();
      setCastleData(result);
      setIsGenerating(false);
    }, 100);
  }, []);

  useMemo(() => {
    generateCastle();
  }, [generateCastle]);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <div style={{ 
        position: 'absolute', 
        top: 20, 
        left: 20, 
        zIndex: 100,
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '15px',
        borderRadius: '8px',
        fontFamily: 'monospace'
      }}>
        <button 
          onClick={generateCastle} 
          disabled={isGenerating}
          style={{
            padding: '12px 24px',
            background: isGenerating ? '#666' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          {isGenerating ? 'Generating...' : 'Generate New Castle'}
        </button>
        <div style={{ marginTop: '15px', fontSize: '12px' }}>
          <p>🏰 <strong>Procedural Castle Generator</strong></p>
          <p>📐 Wave Function Collapse with Rotated Tiles</p>
          <p>🎮 Click and drag to orbit • Scroll to zoom</p>
          <p>🔄 All tiles are 1x1 units with 4 rotations</p>
        </div>
      </div>

      <Canvas camera={{ position: [20, 15, 20], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[15, 15, 10]} 
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        
        {castleData && <Castle castleData={castleData} />}
        
        {/* Ground plane */}
        <Box args={[25, 0.1, 25]} position={[0, -0.1, 0]}>
          <meshStandardMaterial color="#4A5D23" />
        </Box>
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={40}
        />
      </Canvas>
    </div>
  );
};

export default CastleGenerator;