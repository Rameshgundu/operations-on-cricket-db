const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
const dbPath = path.join(__dirname, "cricketTeam.db");

app.use(express.json());
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB ERROR : ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

// get all players
app.get("/players/", async (request, response) => {
  const getPlayers = `
      SELECT 
         * 
      FROM
        cricket_team;`;
  const dbResponse = await db.all(getPlayers);
  function convert(player) {
    return {
      playerId: player.player_id,
      playerName: player.player_name,
      jerseyNumber: player.jersey_number,
      role: player.role,
    };
  }
  const playerDetails = dbResponse.map(convert);
  response.send(playerDetails);
});
// Add new player details
app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const insertNewPlayer = `
      INSERT INTO
         cricket_team(player_name, jersey_number, role)
      VALUES(
          '${playerName}',
          ${jerseyNumber},
          '${role}'
      ); `;
  await db.run(insertNewPlayer);
  response.send("Player Added to Team");
});
// get a particular player
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
      SELECT
       *
      FROM
        cricket_team
      WHERE 
        player_id = ${playerId};`;
  const dbResponse = await db.get(getPlayerQuery);
  const specificPlayer = {
    playerId: dbResponse.player_id,
    playerName: dbResponse.player_name,
    jerseyNumber: dbResponse.jersey_number,
    role: dbResponse.role,
  };
  response.send(specificPlayer);
  console.log(specificPlayer);
});

// Update Player Details
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const newPlayerDetails = request.body;
  const { playerName, jerseyNumber, role } = newPlayerDetails;
  const updateQuery = `
      UPDATE 
        cricket_team
      SET
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
      WHERE 
        player_id = ${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

/// delete player

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
      DELETE 
        FROM
      cricket_team
      WHERE
        player_id = ${playerId};    
    `;
  await db.run(deleteQuery);
  response.send("Player Removed");
});

module.exports = app;
