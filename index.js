const mineflayer = require('mineflayer')
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const GoalFollow = goals.GoalFollow
const GoalBlock = goals.GoalBlock
const minecraftData = require('minecraft-data');
const { Vec3 } = require('vec3');
const fs = require('fs');

function getRandomUsername() {
  const list1 = [
    "Time", "Past", "Future", "Dev", "Fly", "Flying", "Soar", "Soaring", "Power", "Falling", "Fall",
    "Jump", "Cliff", "Mountain", "Rend", "Red", "Blue", "Green", "Yellow", "Gold", "Demon", "Demonic",
    "Panda", "Cat", "Kitty", "Kitten", "Zero", "Memory", "Trooper", "XX", "Bandit", "Fear", "Light",
    "Glow", "Tread", "Deep", "Deeper", "Deepest", "Mine", "Your", "Worst", "Enemy", "Hostile", "Force",
    "Video", "Game", "Donkey", "Mule", "Colt", "Cult", "Cultist", "Magnum", "Gun", "Assault", "Recon",
    "Trap", "Trapper", "Redeem", "Code", "Script", "Writer", "Near", "Close", "Open", "Cube", "Circle",
    "Geo", "Genome", "Germ", "Spaz", "Sped", "Skid", "Shot", "Echo", "Beta", "Alpha", "Gamma", "Omega",
    "Seal", "Squid", "Money", "Cash", "Lord", "King", "Ominous", "Flow", "Skull",
  ];
  const list2 = [
    "Duke", "Rest", "Fire", "Flame", "Morrow", "Break", "Breaker", "Numb", "Ice", "Cold", "Rotten", "Sick",
    "Sickly", "Janitor", "Camel", "Rooster", "Sand", "Desert", "Dessert", "Hurdle", "Racer", "Eraser",
    "Erase", "Big", "Small", "Short", "Tall", "Sith", "Bounty", "Hunter", "Cracked", "Broken", "Sad",
    "Happy", "Joy", "Joyful", "Crimson", "Destiny", "Deceit", "Lies", "Lie", "Honest", "Destined",
    "Bloxxer", "Hawk", "Eagle", "Hawker", "Walker", "Zombie", "Sarge", "Capt", "Captain", "Punch",
    "One", "Two", "Uno", "Slice", "Slash", "Melt", "Melted", "Melting", "Fell", "Wolf", "Hound",
    "Legacy", "Sharp", "Dead", "Mew", "Chuckle", "Bubba", "Bubble", "Sandwich", "Smasher", "Extreme",
    "Multi", "Universe", "Ultimate", "Death", "Ready", "Monkey", "Elevator", "Wrench", "Grease", "Head",
    "Theme", "Grand", "Cool", "Kid", "Boy", "Girl", "Vortex", "Paradox", "Omen",
  ];

  const getRandomElement = array => array[Math.floor(Math.random() * array.length)];

  const part1 = getRandomElement(list1);
  const part2 = getRandomElement(list2);
  const numbers = Math.floor(Math.random() * 10000); // Generate 4 random numbers

  return `${part1}${part2}${numbers}`;
}

function createBot() {
  const bot = mineflayer.createBot({
    host: 'play.blocksmc.com',
    port: 25565,
    username: getRandomUsername(),
    version: '1.8.9'
  });

  bot.loadPlugin(pathfinder)

  bot.once('login', () => {
    console.log(`Logged in as ${bot.username}`);
  });

  bot.once('spawn', () => {});

  bot.on('message', (jsonMsg) => {
    const message = jsonMsg.toString().trim();

    if (message.includes('/register <password> <password>')) {
      setTimeout(() => {
        bot.chat('/reg pass pass');

        setTimeout(() => {
          bot.setControlState('jump', true);
          setTimeout(() => {
            bot.setControlState('jump', false);
          }, 500);
        }, 2000);
      }, 2000);
    }

    if (message.includes('Check out these links:')) {
      bot.setQuickBarSlot(0);
      bot.activateItem(false);

      bot.once('windowOpen', (window) => {

        bot.clickWindow(14, 0, 0);

        setTimeout(() => {
          moveToSkyWarsNPC(bot);
          bot.setQuickBarSlot(7);
          bot.activateItem(false);
        }, 3000);
      });
    }
    
    if (message.includes("Could not connect to a default or fallback server, please try again later.")) {
        bot.end("Server function fail")
    }

    if (message.includes("Cages open in: 10 seconds!")) {
        const playersList = bot.players;

        // Write player names (except bot) to report.txt
        writePlayerNamesToFile(bot, playersList);

        bot.chat("/leave");

        setTimeout(() => {
            console.log("Starting new Game!");
            startNewGame(bot);
        }, 3000);
    }
    spinBot(bot);
  });

  bot.on('goal_reached', (goal) => {
    isPathfinding = false;
    setTimeout(() => {
        bot.setQuickBarSlot(2);
        clickNearestEntity(bot);
        bot.once('windowOpen', (window) => {
            bot.clickWindow(12, 0, 0);
        })
    }, 3000);
  });

  bot.on('messagestr', (messagestr) => {
    const message = messagestr.toString().trim();
    if (message.length > 0) {
      console.log(message);
    }
  });

  bot.on('error', err => console.error('Bot error:', err));
}

let isPathfinding = false; // Flag to track if pathfinder is active


function writePlayerNamesToFile(bot, playersList) {
    const botUsername = bot.username;
    const reportFile = 'report.txt';
    let reportData = '';

    for (const playerName in playersList) {
        if (playerName !== botUsername) {
            reportData += playerName + '\n';
        }
    }

    fs.writeFile(reportFile, reportData, (err) => {
        if (err) {
            console.error('Error writing report file:', err);
        } else {
            console.log(`Player names (except bot) written to ${reportFile}`);
        }
    });
}

function startNewGame(bot) {
    clickNearestEntity(bot);
    bot.once('windowOpen', (window) => {
        bot.clickWindow(11, 0, 0);
    });
}

function spinBot(bot) {
    const spinSpeed = 0.5; // Adjust the speed of rotation

    let yaw = 0; // Initial yaw angle

    setInterval(() => {
        if (!isPathfinding) {
            yaw += spinSpeed; // Increment yaw angle for continuous spinning
            bot.look(yaw, 0); // Set the bot's yaw (horizontal rotation)
        }
    }, 50); // Adjust the interval for smoother or faster spinning
}

function moveToSkyWarsNPC(bot) {
    isPathfinding = true;
    const mcData = require('minecraft-data')(bot.version)
    const movements = new Movements(bot, mcData)
    movements.scafoldingBlocks = []
    bot.pathfinder.setMovements(movements)

    const x = 358.500
    const y = 73
    const z = 516.500
    const goal = new GoalBlock(x, y, z)
    bot.pathfinder.setGoal(goal)
}

function clickNearestEntity(bot) {
    const entity = getNearestEntity(bot);
  
    if (entity) {
      bot.lookAt(entity.position.offset(0, entity.height, 0));
  
      bot.attack(entity);
  
      setTimeout(() => {
        console.log(`Clicked on entity: ${entity.displayName}`);
      }, 1000);
    } else {
      console.log('No entities nearby.');
    }
  }
  
  function getNearestEntity(bot) {
    const entity = bot.nearestEntity();
  
    return entity;
  }

createBot();