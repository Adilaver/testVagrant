const readline = require('readline');

class app {
  constructor(song) {
    this.song = song;
    this.next = null;
  }
}

class RecentlyPlayedStore {
  constructor(capacity) {
    this.capacity = capacity;
    this.users = new Map();
  }

  addRecentlyPlayedSong(song, user) {
    if (!this.users.has(user)) {
      this.users.set(user, null);
    }

    let head = this.users.get(user);

    head = this.removeSongFromList(head, song);

    const newNode = new app(song);
    newNode.next = head;
    head = newNode;

    head = this.trimList(head);

    this.users.set(user, head);
  }

  removeSongFromList(head, song) {
    let dummy = new app();
    dummy.next = head;
    let prev = dummy;
    let current = head;

    while (current) {
      if (current.song === song) {
        prev.next = current.next;
        break;
      }
      prev = current;
      current = current.next;
    }

    return dummy.next;
  }

  trimList(head) {
    let dummy = new app();
    dummy.next = head;
    let prev = dummy;
    let current = head;

    while (current && current.next) {
      prev = current;
      current = current.next;
    }

    prev.next = null;
    return dummy.next;
  }

  getRecentlyPlayedSongs(user) {
    const result = [];
    let head = this.users.get(user);

    while (head) {
      result.push(head.song);
      head = head.next;
    }

    return result;
  }
}

// Function to handle user input and display the output
function handleUserInput() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const store = new RecentlyPlayedStore(3);
  const songsByUser = new Map();

  function addSong() {
    rl.question("Enter the song name (or type 'exit' to quit): ", (song) => {
      if (song.toLowerCase() === 'exit') {
        rl.close();
      } else {
        rl.question("Enter the user name: ", (user) => {
          store.addRecentlyPlayedSong(song, user);
          const songs = songsByUser.get(user) || [];
          songs.unshift(song);
          songsByUser.set(user, songs);
          addSong();
        });
      }
    });
  }

  rl.on('close', () => {
    displayResults();
  });

  function displayResults() {
    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl2.question("Enter the user name to see recently played songs (or type 'exit' to quit): ", (user) => {
      rl2.close();

      if (user.toLowerCase() === 'exit') {
        console.log('Exiting the program.');
        process.exit(0);
      } else {
        const songs = songsByUser.get(user) || [];
        console.log(`Recently played songs for ${user}:`, songs);
        displayResults();
      }
    });
  }

  addSong();
}

// Call the function to handle user input
handleUserInput();