const express = require('express')
const mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
const app = express()
const port = 5000

// mongose schema 
// schema/blueprint => model/prototype => realData
const todoSchema = new mongoose.Schema({
  todo: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ["high", "low"]
  },
  isComplete: Boolean
});

const Todo = mongoose.model('Todo', todoSchema);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
})

const User = mongoose.model("User", userSchema)
// middlewear
app.use(express.json())

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://todo-users:zH4L4CquypwVAwh2@cluster0.mwxgags.mongodb.net/todoDB?retryWrites=true&w=majority&appName=Cluster0";



async function run() {
  try {
    await mongoose.connect(uri);
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // const todoDB = client.db("todoDB");
    // const todosCollections = todoDB.collection('todos')
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    app.get("/todos", async(req, res, next) => {
      console.log("i am middle function")
      console.log(req.headers)
      const token = req.headers.authorization;
      const privateKey = 'secret'
      const verifiedToken = jwt.verify(token,privateKey);
      console.log(verifiedToken)
      if(verifiedToken){
        next()
      }else{
        res.send("You are not authorized")
      } 
      
    } ,async (req, res) => {
      // const todos =await todosCollections.find({}).toArray();
      const todos = await Todo.find({});
      res.send(todos)
    })

    app.get("/todo/:todoId", async (req , res) => {
      const id = req.params.todoId
      // console.log(req.params)
      const todo = await Todo.findById(id)
      res.send(todo)
    })

    app.patch("/todo/:todoId", async (req, res) => {
      const id = req.params.todoId;
      const updatedData = req.body;
      const todo = await Todo.findByIdAndUpdate(id, updatedData, {
        new: true
      });
      res.send(todo)
    })
    app.delete("/todo/:todoId", async (req, res) => {
      const id = req.params.todoId;
      const todo = await Todo.findByIdAndDelete(id);
      res.send(todo)
    })

    app.post("/todo", async (req, res) => {
      const todoData = req.body;
      // const todo = await todosCollections.insertOne(todoData);

      // option 1
      // const todo = new Todo(todoData)
      // todo.save()

      // option 2
      const todo = await Todo.create(todoData)
      res.send(todo)
    })

    app.post("/register", async (req, res) => {
      const userData = req.body;
      const user = await User.create(userData);
      res.send(user)
    })

    app.post("/login", async(req, res) => {
      const {email, password} = req.body;
      const user = await User.findOne({
        email,
        password
      })
      if(user){
        const payload = {
          name: user.name,
          email: user.email
        }
        const privateKey = 'secret'
        const expirationTime = "1d"
        const accessToken = jwt.sign(payload, privateKey, {
          expiresIn: expirationTime
        })
        const userResponse = {
          message: "logged in successfully",
          data:{
           accessToken
          }
        }
        res.send(userResponse)
      }else{
        res.send("email or password incorret")
      }
    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})