const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose"); //aquiring mongodb
const _=require("lodash");


const app=express();

app.use(bodyParser.urlencoded({extended:true}));   //to use body-Parser
app.use(express.static("public"));   //to use the static files inside public folder


mongoose.connect("mongodb+srv://admin-deepanshi:NJneW5x54Q4cib0J@cluster0.fhmfn.mongodb.net/todolistDB"); //connecting mongodb

const itemsSchema = {           //creating a schema
  name: String
};

const Item= mongoose.model("Item",itemsSchema);  //creating model based on schema

const item1 =new Item({
  name: "Welcome to your todolist"
});

const item2 =new Item({
  name: "Hit the + to add item."
});

const item3 =new Item({
  name: "<--Hit this to delete an item."
});

const defaultItems=[item1, item2, item3];   //creating an array to insert in database

const listSchema={
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema)

app.set("view engine", "ejs"); //setting our app to use ejs

app.get("/",function(req,res){

  Item.find({}, function(err,founditems){
    if(founditems.length===0){
      Item.insertMany(defaultItems, function (err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully saved all items to Database.")
        }
      });
      res.redirect("/");
    }else{
      res.render("list",{ListTitle: "Today", newListItems:founditems});
    }

  });

});

app.get("/:customListName",function(req,res){

const customListName= _.capitalize(req.params.customListName);

List.findOne({name: customListName}, function(err,foundItem){
  if(!err){
    if(!foundItem){
      //create a new list
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/"+customListName);

    }else{
      //show an existing list
      res.render("list",{ListTitle: foundItem.name, newListItems:foundItem.items})
    }
  }
});

});


app.post("/",function(req,res){
  const itemName= req.body.newItem;
const listName =req.body.list;

  const item= new Item({
    name: itemName
  });

if(listName==="Today"){
  item.save();
res.redirect("/");
}else{
  List.findOne({name: listName}, function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  });
}

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName =req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId, function(err){
      if(err){
        console.log(err)
      }else{
        console.log("Successfully deleted");
      }
    });
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+ listName);
      }
    });
  }

});



app.get("/about",function(req,res){
  res.render("about");
})


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
  console.log("Server is working on port 3000");
});
