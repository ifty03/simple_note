const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

/* all middleware */
app.use(cors());
app.use(express.json());

/* all apps */

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ldvxd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const notesCollection = client.db("notedb").collection("note");
    const productCollection = client.db("emajhondb").collection("products");

    /*get data from database */
    app.get("/notes", async (req, res) => {
      const query = {};
      const cursor = notesCollection.find(query);
      const notes = await cursor.toArray();

      res.send(notes);
    });
    /* post data in database */
    app.post("/notes", async (req, res) => {
      const newNote = req.body;
      const note = await notesCollection.insertOne(newNote);

      res.send(note);
    });
    /* update data  */
    app.put("/notes/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const update = req.body;
      const updateNote = {
        $set: update,
      };
      const result = await notesCollection.updateOne(
        filter,
        updateNote,
        options
      );
      res.send(result);
    });
    /* delete one note from database */
    app.delete("/notes/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: ObjectId(id) };
      const result = await notesCollection.deleteOne(query);
      res.send(result);
    });
    /* load products data from database */
    app.get("/products", async (req, res) => {
      const page = +req.query.page;
      console.log("this is page number", page);
      const query = {};
      const cursor = productCollection.find(query);
      const products = await cursor
        .skip(10 * page)
        .limit(10)
        .toArray();
      res.send(products);
    });
    /* how much product in my database */
    app.get("/productsCount", async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();

      res.json({ count });
    });
  } finally {
  }
};
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello ashiks World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
