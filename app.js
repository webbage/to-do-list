//jshint eversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const PORT = process.env.PORT || 8080;

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("Public"));

mongoose.connect('mongodb://localhost:27017/toDB');

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Wellcome to your todoList!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item",
});

const defultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {

  Item.find({}, function(err, result) {
    if (result.length === 0) {
      Item.insertMany(defultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("defultItems add Succesfully");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newItem: result});
    }
  });
});

app.post("/", function(req, res) {
  const newItem = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: newItem
  });
if (listName === "Today"){
  item.save();
  res.redirect("/");
}else{
  List.findOne({name: listName}, function(err, foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+ listName)
  });
}

});

app.post("/delete", function(req, res) {
  const chakedBox = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(chakedBox, function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Done");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: chakedBox}}}, function(err, foundList){
      if(err){
        console.log(err);
      }else[
        res.redirect("/"+ listName)
      ]
    })
  }

});



app.get("/:customListName", function(req, res) {

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList) {
    if (err) {
      console.log(err);
    } else {
      if (foundList) {
res.render("list", { listTitle: foundList.name, newItem: foundList.items});
      } else {
        const list = new List({
          name: customListName,
          items: defultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }
    }
  });



});



app.listen(PORT, console.log(`Server started on port ${PORT}`));
