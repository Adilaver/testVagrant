const readline = require('readline');
const chai = require('chai');
const assert = chai.assert;

/* It shows the node in the linked list containing information about a song and 
its references to the previous and next nodes. */
class SongNode {
  constructor(song) {
    this.song = song;
    this.prev = null;
    this.next = null;
  }
}

/*It shows the store that maintains the recently played songs for different users.*/
class RecentlyPlayedStore {
  constructor(capacity) {
    this.capacity = capacity;
    this.users = new Map();
    this.head = null; 
    this.tail = null; 
  }
 
  /* Adds a recently played song to the store for a specific user. */
  addRecentlyPlayedSong(song, user) {
    const newNode = new SongNode(song);

    if (this.users.has(user)) {
      const userSongs = this.users.get(user);
      const userSongNode = userSongs.get(song);
      if (userSongNode) {
        /* If the song is already in the user's recently played songs, 
        remove it and adjust the linked list pointers.*/
        this.removeSongNode(userSongNode);
      } else if (userSongs.size >= this.capacity) {
        /* If the user's recently played songs are at capacity, 
        remove the oldest song to make space*/
        const oldestSongNode = this.tail;
        this.removeSongNode(oldestSongNode);
        userSongs.delete(oldestSongNode.song);
      }
      newNode.next = this.head;
      this.head.prev = newNode;
    } else {
      /* If the user is not present in the store, create a new map to store their recently played songs.*/
      this.users.set(user, new Map());
      newNode.next = null;
      this.tail = newNode; 
    }
    newNode.prev = null;
    this.head = newNode;
    this.users.get(user).set(song, newNode);
  }

  /* Removes a song node from the doubly linked list and updates the list's pointers accordingly*/
  removeSongNode(songNode) {
    if (songNode === this.head) {
      this.head = songNode.next;
      if (this.head) {
        this.head.prev = null;
      }
    } else if (songNode === this.tail) {
      this.tail = songNode.prev;
      if (this.tail) {
        this.tail.next = null;
      }
    } else {
      songNode.prev.next = songNode.next;
      songNode.next.prev = songNode.prev;
    }
  }
  /*Retrieves the recently played songs for a specific user*/
  getRecentlyPlayedSongs(user) {
    const result = [];
    const userSongs = this.users.get(user);

    let current = this.head;
    while (current) {
      if (userSongs.has(current.song)) {
        result.push(current.song);
      }
      current = current.next;
    }
    return result;
  }
}
/*Utility function to prompt a question to the user using the readline interface and return a promise*/
function promptQuestion(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, resolve);
  });
}
/* Main function that runs the test scenarios*/
async function runTests() {
  const store = new RecentlyPlayedStore(3);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  let testUsers = [];
  let isTesting = true;

  while (isTesting) {
    const user = await promptQuestion(rl, "Enter the user name for test (or type 'exit' to start tests): ");
    if (user.toLowerCase() === 'exit') {
      isTesting = false;
    } else {
      const testUser = { user, songs: [] };
      testUsers.push(testUser);
      await addTestSongs(testUser);
    }
  }
  async function addTestSongs(testUser) {
    let isAdding = true;
    const songs = [];

    while (isAdding) {
      const song = await promptQuestion(rl, `Enter the song name for ${testUser.user} (or type 'exit' to add another user): `);
      if (song.toLowerCase() === 'exit') {
        isAdding = false;
      } else {
        songs.push(song);
      }
    }
    /*Adding the songs to the RecentlyPlayedStore in incorrect order (newest first)*/
    for (const song of songs) {
      store.addRecentlyPlayedSong(song, testUser.user);
      console.log(`Added song '${song}' for user '${testUser.user}'.`);
    }
    testUser.songs = songs;
  }
  for (const testUser of testUsers) {
    console.log(`\nTest for user '${testUser.user}':`);
    /*Get the recently played songs for the user*/
    const recentlyPlayedSongs = store.getRecentlyPlayedSongs(testUser.user);
    const expectedSongs = testUser.songs.slice(-3).reverse(); // Get the last three songs played for the user and reverse the order.

    try {
      assert.deepEqual(recentlyPlayedSongs, expectedSongs, `Test failed for user ${testUser.user}`);
      console.log('Test passed.');
    } catch (err) {
      console.error(err.message);
    }
    console.log(`Recently played songs for user '${testUser.user}':`, recentlyPlayedSongs);
  }
  rl.close();
}
/*Used to run the tests*/
runTests();
