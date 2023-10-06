const express = require('express');
const sqlite3 = require('sqlite3');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;
const db = new sqlite3.Database('contacts.db');

// Create the contacts table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY,
      name TEXT,
      email TEXT
    )
  `);
});

app.use(bodyParser.json());

// Create a new contact
app.post('/contacts', (req, res) => {
  const { name, email } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required fields' });
  }

  const stmt = db.prepare('INSERT INTO contacts (name, email) VALUES (?, ?)');
  stmt.run(name, email, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create contact' });
    }

    res.status(201).json({ id: this.lastID, name, email });
  });

  stmt.finalize();
});

// Get all contacts
app.get('/contacts', (req, res) => {
  db.all('SELECT * FROM contacts', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve contacts' });
    }

    res.json(rows);
  });
});

// Get a specific contact by ID
app.get('/contacts/:id', (req, res) => {
  const id = req.params.id;
  db.get('SELECT * FROM contacts WHERE id = ?', id, (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to retrieve contact' });
    }

    if (!row) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(row);
  });
});

// Update a contact by ID
app.put('/contacts/:id', (req, res) => {
  const id = req.params.id;
  const { name, email } = req.body;

  db.run('UPDATE contacts SET name = ?, email = ? WHERE id = ?', [name, email, id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update contact' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ id, name, email });
  });
});

// Delete a contact by ID
app.delete('/contacts/:id', (req, res) => {
  const id = req.params.id;

  db.run('DELETE FROM contacts WHERE id = ?', id, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete contact' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
