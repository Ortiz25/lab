import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import { getDate } from "./date.mjs";
import { getDay } from "./date.mjs";
import lodash from "lodash";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const _ = lodash();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//MONGOOSE SETUP
async function main() {
  await mongoose.connect(
    "mongodb+srv://admin-dell:m0t0m0t0@cluster0.sjzfs9g.mongodb.net/todolistDB"
  );
}
main().catch((err) => console.log(err));

// Mongoose Schema
const itemsSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema],
});
// const workItemsSchema = new mongoose.Schema({
//   name: String,
// });
// MONGOOSE MODEL AND COLLECTIONS
const List = mongoose.model("list", listSchema);
const Item = mongoose.model("item", itemsSchema);
// const WorkItem = mongoose.model("work", workItemsSchema);

//////////////////////////////////default list of items ///////////////////////////////////////////////////////
const item1 = new Item({
  name: "Welcome to your To Do List",
});
const item2 = new Item({
  name: "skip",
});
const item3 = new Item({
  name: "drive",
});
const item4 = new Item({
  name: "push-ups",
});
const defaultItems = [item1, item2, item3, item4];

/////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/", function (req, res) {
  Item.find((err, entries) => {
    if (entries.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(er);
        } else {
          console.log("default Items added successfully");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: entries });
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem.trim();
  const listName = req.body.list.trim();

  const newItem = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, found) {
      found.items.push(newItem);
      found.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedItem = req.body.checkbox.trim();
  const listName = req.body.listName.trim();
  console.log(req.body);
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItem, (err) => {
      if (!err) {
        console.log("Succesfully deleted");
        res.redirect("/");
      } else {
        console.log(err);
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItem } } },
      (err, founList) => {
        if (!err) {
          res.redirect("/" + listName);
        } else {
          console.log(err);
        }
      }
    );
  }
});

app.get("/:customListName", function (req, res) {
  const customListName = req.params.customListName;
  console.log(_.capitalize(customListName));
  List.findOne({ name: customListName }, (err, foundlist) => {
    if (!err) {
      if (!foundlist) {
        // create list

        const list = new List({
          name: customListName,
          items: defaultItems,
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        // show list
        res.render("list", {
          listTitle: foundlist.name,
          newListItems: foundlist.items,
        });
      }
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
